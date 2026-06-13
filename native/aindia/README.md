# AIndia Native Wrappers

The web/PWA shell owns the public product surface. Native wrappers expose OS-native capabilities to the same AIndia runtime contract.

Runtime spine:

```text
bootloader -> hooks -> harness -> wrappers
```

## Android First

Target file:

- `android/AIndiaRuntimeBridge.kt`

Native rails to probe:

- SpeechRecognizer or platform speech API
- ML Kit OCR
- ML Kit GenAI / AICore / Gemini Nano where supported
- LiteRT-LM model packs
- Android share intents
- Native sandbox storage

Acceptance:

- The wrapper emits `aindia-runtime-v1` envelopes.
- The wrapper reports capabilities before promising offline AI.
- Payment, identity, account, upload, send, and device actions return to the harness for approval.
- Local receipts are written for risky checks.

## iOS Next

Target file:

- `ios/AIndiaRuntimeBridge.swift`

Native rails to probe:

- Foundation Models availability
- Speech and SpeechAnalyzer
- Vision text recognition
- Translation
- App Intents
- App sandbox storage

Acceptance:

- The wrapper emits `aindia-runtime-v1` envelopes.
- Foundation Models are advertised only on Apple Intelligence-capable devices.
- No App Intent bypasses the AIndia harness.
- Sensitive actions require approval and receipt.

## Provider Switchboard

Provider wrappers must behave like native wrappers: expose capability, receive an envelope, return a result, and never bypass gates.

Initial provider targets:

- Sarvam
- Bhashini
- Perplexity/Sonar
- OpenAI
- Gemini
- Anthropic

Upload rule:

```text
No upload without purpose + data classes + user approval + receipt.
```
