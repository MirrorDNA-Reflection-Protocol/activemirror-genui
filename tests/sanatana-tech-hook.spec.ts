import { expect, test } from "@playwright/test";
import { buildMirrorSystemPrompt } from "../src/lib/mirror/systemPrompt";
import { createLocalSupervisorDecision } from "../src/lib/mirror/localSupervisor";
import { compileLocalOperatorPacket, sampleLocalOperatorPayload } from "../src/lib/mirror/localOperator";
import { getSanatanaTechHookStatus } from "../src/lib/mirror/sanatanaTechHook";

test.describe("SanatanaTech doctrine hook", () => {
  test("injects the compact doctrine hook into the system prompt", () => {
    const prompt = buildMirrorSystemPrompt(3, { includePrivate: false });

    expect(prompt).toContain("SANATANA_TECH_DOCTRINE_HOOK");
    expect(prompt).toContain("Truth that reflects. Order that holds. Intelligence that remembers.");
    expect(prompt).toContain("canonical_tokens=truth_that_reflects,order_that_holds,intelligence_that_remembers");
    expect(prompt).toContain("truth_before_response");
    expect(prompt).toContain("order_before_scale");
    expect(prompt).toContain("memory_without_surveillance");
    expect(prompt).toContain("local_policy_before_frontier_prediction");
    expect(prompt).toContain("improvement_loop=observe_receipts");
    expect(prompt).toContain("self_improvement_boundary=receipt_driven_not_self_mutating");
    expect(prompt).toContain("reflection_engine_founder_formula=polymath + ADHD + AI = reflection engine");
    expect(prompt).toContain("reflection_engine_founder_mirror_doctrine=Paul is the Mirror");
    expect(prompt).toContain("reflection_engine_public_line=Nonlinear thinking in. Disciplined next step out.");
    expect(prompt).toContain("reflection_engine_tokens=nonlinear_capture,polymath_synthesis,disciplined_next_step,reflection_over_prediction,founder_led_mirror");
    expect(prompt).toContain("brand_marks=Trust by Design:ethos_and_public_promise");
    expect(prompt).toContain("marketing_language=Trust by Design:primary ethos");
    expect(prompt).toContain("AM:REFLECTION_ENGINE");
    expect(prompt).toContain("AM:BRAND_MARKS");
    expect(prompt).not.toContain("/Users/mirror-pro/MirrorDNA-Vault");
  });

  test("binds the hook to deterministic supervisor policy", () => {
    const decision = createLocalSupervisorDecision("Create a Hindi training video pack from this SOP.");

    expect(decision.doctrineHook.id).toBe("sanatana_tech_doctrine_hook");
    expect(decision.doctrineHook.state).toBe("hooked_public_safe");
    expect(decision.contextPolicy).toContain("sanatana_hook_least_context_before_model");
    expect(decision.contextPolicy).toContain("reflection_engine_nonlinear_capture_allowed");
    expect(decision.toolPolicy).toContain("sanatana_hook_local_policy_before_prediction");
    expect(decision.toolPolicy).toContain("reflection_engine_prediction_stays_proposer_only");
    expect(decision.storagePolicy).toContain("sanatana_hook_receipt_before_durable_claim");
    expect(decision.storagePolicy).toContain("reflection_engine_no_silent_profile_from_attention_signal");
    expect(decision.outputPolicy).toContain("sanatana_hook_humility_when_unknown");
    expect(decision.outputPolicy).toContain("reflection_engine_disciplined_next_step");
  });

  test("embeds the hook in local operator packets with richer gates", () => {
    const compiled = compileLocalOperatorPacket(sampleLocalOperatorPayload());

    expect(compiled.ok).toBe(true);
    if (!compiled.ok) throw new Error(compiled.error);

    expect(compiled.packet.doctrineHook).toMatchObject(getSanatanaTechHookStatus());
    expect(compiled.packet.doctrineHook.canonicalTagline).toBe(
      "Truth that reflects. Order that holds. Intelligence that remembers.",
    );
    expect(compiled.packet.doctrineHook.canonicalTokens).toEqual([
      "truth_that_reflects",
      "order_that_holds",
      "intelligence_that_remembers",
    ]);
    expect(compiled.packet.doctrineHook.vaultRefs).toContain("AMOS://Protocol/SanatanaTech/v1");
    expect(compiled.packet.doctrineHook.vaultDirectives).toContain("education_interface");
    expect(compiled.packet.doctrineHook.truthSlots).toContain("source_gaps");
    expect(compiled.packet.doctrineHook.sentinels).toContain("fake_execution_claim");
    expect(compiled.packet.doctrineHook.outcomeModes).toContain("teach");
    expect(compiled.packet.doctrineHook.literacyModes).toContain("voice_first");
    expect(compiled.packet.doctrineHook.improvementLoop).toContain("compare_yesterday_baseline");
    expect(compiled.packet.doctrineHook.selfImprovementBoundary).toBe("receipt_driven_not_self_mutating");
    expect(compiled.packet.doctrineHook.reflectionEngineFormula.publicLine).toBe(
      "Nonlinear thinking in. Disciplined next step out.",
    );
    expect(compiled.packet.doctrineHook.reflectionEngineFormula.founderMirrorDoctrine).toBe("Paul is the Mirror");
    expect(compiled.packet.doctrineHook.reflectionEngineFormula.boundary).toContain("must not impersonate him");
    expect(compiled.packet.doctrineHook.reflectionEngineFormula.boundary).toContain("not a gimmick");
    expect(compiled.packet.doctrineHook.reflectionEngineTokens).toContain("reflection_over_prediction");
    expect(compiled.packet.doctrineHook.reflectionEngineTokens).toContain("founder_led_mirror");
    expect(compiled.packet.doctrineHook.brandMarks.map((item) => item.mark)).toEqual([
      "Trust by Design",
      "Active Mirror",
      "MirrorDNA",
    ]);
    expect(compiled.packet.doctrineHook.trademarkBoundary).toBe("brand_marks_preserved_registration_not_asserted");
    expect(compiled.packet.doctrineHook.marketingLanguage.map((item) => item.line)).toContain("Founder-led reflection");
    expect(compiled.packet.doctrineHook.marketingLanguage.map((item) => item.line)).toContain("India's reflective AI layer");
  });

  test("exposes only public-safe hook status through the system endpoint", async ({ request }) => {
    const response = await request.get("/api/mirror/system");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.doctrineHook.id).toBe("sanatana_tech_doctrine_hook");
    expect(body.doctrineHook.canonicalTagline).toBe(
      "Truth that reflects. Order that holds. Intelligence that remembers.",
    );
    expect(body.doctrineHook.canonicalTokens).toEqual([
      "truth_that_reflects",
      "order_that_holds",
      "intelligence_that_remembers",
    ]);
    expect(body.doctrineHook.rawDoctrine).toBe("withheld_private_body");
    expect(body.doctrineHook.reflectionEngineFormula.founderFormula).toBe("polymath + ADHD + AI = reflection engine");
    expect(body.doctrineHook.reflectionEngineFormula.founderMirrorDoctrine).toBe("Paul is the Mirror");
    expect(body.doctrineHook.brandMarks.map((item: { mark: string }) => item.mark)).toContain("MirrorDNA");
    expect(body.doctrineHook.marketingLanguage.map((item: { line: string }) => item.line)).toContain(
      "Reflection over prediction",
    );
    expect(body.doctrineHook.injectionPoints).toEqual([
      "system_prompt",
      "local_supervisor",
      "local_operator_packet",
    ]);
    expect(JSON.stringify(body)).not.toContain("/Users/mirror-pro");
  });
});
