import { expect, test } from '@playwright/test';

type AIndiaRail = {
  title: string;
  status: string;
  observed: string;
  useInAIndia: string;
};

test.describe('AIndia recursion contract', () => {
  test('keeps live-runtime claims bounded to verified rails', async ({ request }) => {
    const response = await request.get('/api/aindia/recursion');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.protocol).toBe('aindia-recursion-harness-v1');
    expect(body.updated).toBe(body.macAbsorption.verifiedAt.slice(0, 10));
    expect(body.macAbsorption.localModels).toContain('hf.co/mradermacher/sarvam-translate-i1-GGUF:Q4_K_M');
    expect(body.macAbsorption.activeConstraint).toContain('refresh model, phone-mesh, API, and browser checks');

    const evidence = body.macAbsorption.evidence.join(' ');
    expect(evidence).toContain('127.0.0.1:11434');
    expect(evidence).toContain('phone-mesh /health');
    expect(evidence).toContain('Pixel and OnePlus inference backends are false');

    const rails = new Map<string, AIndiaRail>(
      body.macAbsorption.rails.map((rail: AIndiaRail) => [rail.title, rail]),
    );
    expect(rails.get('Mac Ollama')?.status).toBe('ready');
    expect(rails.get('Phone mesh')?.status).toBe('partial');
    expect(rails.get('Google AICore on this body')?.status).toBe('blocked');
    expect(rails.get('Google AICore on this body')?.useInAIndia).toContain('supported-device Android wrapper candidate');

    const phoneMeshScenario = body.scenarios.find((scenario: { id: string }) => scenario.id === 'phone-mesh-first');
    expect(phoneMeshScenario.failureMode).toContain('Current phone backends are unreachable');
    expect(phoneMeshScenario.absorb).toContain('GrapheneOS-safe');
  });

  test('claim guard requires receipts for current product-state claims', async ({ request }) => {
    const unsupported = await request.post('/api/aindia/claim-guard', {
      data: { claim: 'AIndia phone mesh is live today.' },
    });
    expect(unsupported.status()).toBe(200);
    const unsupportedBody = await unsupported.json();
    expect(unsupportedBody.result.kind).toBe('current_fact');
    expect(unsupportedBody.result.status).toBe('needs_source');

    const absolute = await request.post('/api/aindia/claim-guard', {
      data: { claim: 'AIndia is hallucination-free.' },
    });
    expect(absolute.status()).toBe(200);
    const absoluteBody = await absolute.json();
    expect(absoluteBody.result.status).toBe('block');
  });

  test('claim guard fails closed on non-object or spoofed request bodies', async ({ request }) => {
    const nonObject = await request.post('/api/aindia/claim-guard', {
      headers: { 'content-type': 'application/json' },
      data: '{bad-json',
    });
    expect(nonObject.status()).toBe(400);
    const nonObjectBody = await nonObject.json();
    expect(nonObjectBody.error).toBe('JSON body must be an object.');

    const wrongContentType = await request.post('/api/aindia/claim-guard', {
      headers: { 'content-type': 'text/plain' },
      data: 'claim=AIndia is live',
    });
    expect(wrongContentType.status()).toBe(415);

    const spoofedReceipt = await request.post('/api/aindia/claim-guard', {
      data: {
        claim: 'The founder relay API is implemented.',
        implementedReceipt: 'true',
      },
    });
    expect(spoofedReceipt.status()).toBe(200);
    const spoofedReceiptBody = await spoofedReceipt.json();
    expect(spoofedReceiptBody.result.status).toBe('needs_source');

    const oversized = await request.post('/api/aindia/claim-guard', {
      data: { claim: 'A'.repeat(5_000) },
    });
    expect(oversized.status()).toBe(413);
  });

  test('founder relay requires explicit consent and a valid email before relay mailto', async ({ request }) => {
    const invalidEmail = await request.post('/api/aindia/founder-relay', {
      data: {
        message: 'I need help understanding AIndia.',
        email: 'paul-at-example',
        consentToRelay: true,
      },
    });
    expect(invalidEmail.status()).toBe(400);

    const noConsent = await request.post('/api/aindia/founder-relay', {
      data: {
        message: 'I need help understanding AIndia.',
        email: 'reader@example.com',
        consentToRelay: false,
      },
    });
    expect(noConsent.status()).toBe(200);
    const noConsentBody = await noConsent.json();
    expect(noConsentBody.canRelay).toBe(false);
    expect(noConsentBody.mailto).toBe('');

    const consented = await request.post('/api/aindia/founder-relay', {
      data: {
        message: 'I need help understanding AIndia.',
        email: 'reader@example.com',
        consentToRelay: true,
      },
    });
    expect(consented.status()).toBe(200);
    const consentedBody = await consented.json();
    expect(consentedBody.canRelay).toBe(true);
    expect(consentedBody.mailto).toContain('mailto:paul@activemirror.ai');
  });
});
