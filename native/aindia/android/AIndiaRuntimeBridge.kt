package ai.activemirror.aindia

import java.security.MessageDigest
import java.util.UUID

enum class AIndiaInputKind {
    VOICE,
    PHOTO,
    MESSAGE,
    DOCUMENT,
    SOURCE_QUERY,
    ACTION
}

enum class AIndiaRiskClass {
    NORMAL,
    MONEY,
    IDENTITY,
    DOCUMENT,
    DEVICE,
    ACCOUNT,
    CHILD,
    UNKNOWN
}

data class AIndiaConsentEnvelope(
    val purpose: String,
    val dataClasses: List<String>,
    val localOnly: Boolean,
    val mayUpload: Boolean,
    val retention: String,
    val userApproved: Boolean
)

data class AIndiaPayloadRef(
    val storage: String,
    val uri: String,
    val sha256: String? = null
)

data class AIndiaRuntimeEnvelope(
    val envelopeVersion: String = "aindia-runtime-v1",
    val requestId: String = UUID.randomUUID().toString(),
    val target: String = "android",
    val inputKind: AIndiaInputKind,
    val hookId: String,
    val languageCode: String,
    val riskClass: AIndiaRiskClass,
    val consent: AIndiaConsentEnvelope,
    val payloadRef: AIndiaPayloadRef,
    val requiredGates: List<String>
)

data class AIndiaCapabilityReport(
    val target: String = "android",
    val speechRecognizer: Boolean,
    val mlKitOcr: Boolean,
    val mlKitGenAi: Boolean,
    val aiCoreGeminiNano: Boolean,
    val liteRtLm: Boolean,
    val shareIntent: Boolean,
    val localStorage: Boolean,
    val notes: List<String>
)

object AIndiaRuntimeBridge {
    private val blockedUriPrefixes = listOf("javascript:", "data:", "http:", "https:")
    private val allowedUriPrefixes = listOf("aindia://", "memory://", "indexeddb://", "opfs://", "native://", "provider://")

    fun buildEnvelope(
        inputKind: AIndiaInputKind,
        hookId: String,
        languageCode: String,
        riskClass: AIndiaRiskClass,
        consent: AIndiaConsentEnvelope,
        payloadRef: AIndiaPayloadRef
    ): AIndiaRuntimeEnvelope {
        require(consent.purpose.trim().length in 5..240) { "Consent purpose must be specific." }
        require(consent.dataClasses.isNotEmpty() && consent.dataClasses.size <= 12) { "Consent must declare 1-12 data classes." }
        require(!(consent.localOnly && consent.mayUpload)) { "Consent cannot be both localOnly and mayUpload." }
        require(!consent.mayUpload || consent.userApproved) { "Upload-capable routes require explicit user approval." }
        require(blockedUriPrefixes.none { payloadRef.uri.startsWith(it, ignoreCase = true) }) { "Payload URI uses a blocked scheme." }
        require(allowedUriPrefixes.any { payloadRef.uri.startsWith(it, ignoreCase = true) }) { "Payload URI must use an AIndia-local or provider scheme." }
        if (payloadRef.storage == "provider") {
            require(consent.mayUpload && !consent.localOnly) { "Provider payloads require upload consent and cannot be localOnly." }
        }

        val gates = linkedSetOf("language_detected", "safety_checked")
        if (consent.mayUpload) gates.add("cloud_route_allowed")
        if (riskClass != AIndiaRiskClass.NORMAL) gates.add("human_approved")
        if (inputKind == AIndiaInputKind.ACTION) gates.add("human_approved")
        if (riskClass != AIndiaRiskClass.NORMAL) gates.add("receipt_written")

        return AIndiaRuntimeEnvelope(
            inputKind = inputKind,
            hookId = hookId,
            languageCode = languageCode,
            riskClass = riskClass,
            consent = consent,
            payloadRef = payloadRef,
            requiredGates = gates.toList()
        )
    }

    fun sha256(bytes: ByteArray): String {
        return MessageDigest
            .getInstance("SHA-256")
            .digest(bytes)
            .joinToString("") { "%02x".format(it) }
    }

    fun defaultCapabilityReport(): AIndiaCapabilityReport {
        return AIndiaCapabilityReport(
            speechRecognizer = false,
            mlKitOcr = false,
            mlKitGenAi = false,
            aiCoreGeminiNano = false,
            liteRtLm = false,
            shareIntent = true,
            localStorage = true,
            notes = listOf(
                "Replace defaults with runtime probes for ML Kit GenAI, AICore, OCR, SpeechRecognizer, and LiteRT-LM.",
                "Do not promise local LLM capability until device_model_checked passes.",
                "All money, identity, account, send, upload, and device actions must return to the harness before execution."
            )
        )
    }
}
