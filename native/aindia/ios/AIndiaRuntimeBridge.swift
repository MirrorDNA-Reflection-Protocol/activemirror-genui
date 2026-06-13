import CryptoKit
import Foundation

enum AIndiaInputKind: String, Codable {
    case voice
    case photo
    case message
    case document
    case sourceQuery = "source-query"
    case action
}

enum AIndiaRiskClass: String, Codable {
    case normal
    case money
    case identity
    case document
    case device
    case account
    case child
    case unknown
}

struct AIndiaConsentEnvelope: Codable {
    let purpose: String
    let dataClasses: [String]
    let localOnly: Bool
    let mayUpload: Bool
    let retention: String
    let userApproved: Bool
}

struct AIndiaPayloadRef: Codable {
    let storage: String
    let uri: String
    let sha256: String?
}

struct AIndiaRuntimeEnvelope: Codable {
    let envelopeVersion: String
    let requestId: String
    let target: String
    let inputKind: AIndiaInputKind
    let hookId: String
    let languageCode: String
    let riskClass: AIndiaRiskClass
    let consent: AIndiaConsentEnvelope
    let payloadRef: AIndiaPayloadRef
    let requiredGates: [String]
}

struct AIndiaCapabilityReport: Codable {
    let target: String
    let foundationModels: Bool
    let speech: Bool
    let visionText: Bool
    let translation: Bool
    let appIntents: Bool
    let localStorage: Bool
    let notes: [String]
}

enum AIndiaRuntimeBridgeError: Error {
    case invalidConsent(String)
    case invalidPayloadRef(String)
}

enum AIndiaRuntimeBridge {
    private static let blockedUriPrefixes = ["javascript:", "data:", "http:", "https:"]
    private static let allowedUriPrefixes = ["aindia://", "memory://", "indexeddb://", "opfs://", "native://", "provider://"]

    static func buildEnvelope(
        inputKind: AIndiaInputKind,
        hookId: String,
        languageCode: String,
        riskClass: AIndiaRiskClass,
        consent: AIndiaConsentEnvelope,
        payloadRef: AIndiaPayloadRef
    ) throws -> AIndiaRuntimeEnvelope {
        guard (5...240).contains(consent.purpose.trimmingCharacters(in: .whitespacesAndNewlines).count) else {
            throw AIndiaRuntimeBridgeError.invalidConsent("Consent purpose must be specific.")
        }
        guard !consent.dataClasses.isEmpty && consent.dataClasses.count <= 12 else {
            throw AIndiaRuntimeBridgeError.invalidConsent("Consent must declare 1-12 data classes.")
        }
        guard !(consent.localOnly && consent.mayUpload) else {
            throw AIndiaRuntimeBridgeError.invalidConsent("Consent cannot be both localOnly and mayUpload.")
        }
        guard !consent.mayUpload || consent.userApproved else {
            throw AIndiaRuntimeBridgeError.invalidConsent("Upload-capable routes require explicit user approval.")
        }
        guard !blockedUriPrefixes.contains(where: { payloadRef.uri.lowercased().hasPrefix($0) }) else {
            throw AIndiaRuntimeBridgeError.invalidPayloadRef("Payload URI uses a blocked scheme.")
        }
        guard allowedUriPrefixes.contains(where: { payloadRef.uri.lowercased().hasPrefix($0) }) else {
            throw AIndiaRuntimeBridgeError.invalidPayloadRef("Payload URI must use an AIndia-local or provider scheme.")
        }
        if payloadRef.storage == "provider" {
            guard consent.mayUpload && !consent.localOnly else {
                throw AIndiaRuntimeBridgeError.invalidConsent("Provider payloads require upload consent and cannot be localOnly.")
            }
        }

        var gates: [String] = ["language_detected", "safety_checked"]

        if consent.mayUpload {
            gates.append("cloud_route_allowed")
        }

        if riskClass != .normal || inputKind == .action {
            gates.append("human_approved")
        }

        if riskClass != .normal {
            gates.append("receipt_written")
        }

        return AIndiaRuntimeEnvelope(
            envelopeVersion: "aindia-runtime-v1",
            requestId: UUID().uuidString,
            target: "ios",
            inputKind: inputKind,
            hookId: hookId,
            languageCode: languageCode,
            riskClass: riskClass,
            consent: consent,
            payloadRef: payloadRef,
            requiredGates: Array(NSOrderedSet(array: gates)) as? [String] ?? gates
        )
    }

    static func sha256(_ data: Data) -> String {
        SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    }

    static func defaultCapabilityReport() -> AIndiaCapabilityReport {
        AIndiaCapabilityReport(
            target: "ios",
            foundationModels: false,
            speech: true,
            visionText: true,
            translation: false,
            appIntents: false,
            localStorage: true,
            notes: [
                "Replace defaults with runtime checks for Foundation Models availability, Speech, Vision, Translation, and App Intents.",
                "Do not promise Foundation Models on devices without Apple Intelligence support.",
                "No App Intent may bypass AIndia human approval gates."
            ]
        )
    }
}
