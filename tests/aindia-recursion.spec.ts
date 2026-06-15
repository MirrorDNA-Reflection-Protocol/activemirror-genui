import { expect, test } from '@playwright/test';

type AIndiaRail = {
  title: string;
  status: string;
  observed: string;
  useInAIndia: string;
};

test.describe('AIndia recursion contract', () => {
  test('positions the public page as answer-engine first with Chetana as a rail', async ({ page, request }) => {
    await page.goto('/aindia');
    await expect(page.getByRole('heading', { name: /पूछो\. कुछ भी\./ })).toBeVisible();
    await expect(page.getByText('Jawab source ke saath. Aapki bhasha mein.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nonlinear thinking in. Disciplined next step out.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'One assistant. Many rails. One reflective turn.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Learns from receipts. Does not mutate itself.' })).toBeVisible();
    await expect(page.getByText('No silent training.')).toBeVisible();
    await expect(page.getByText('No public claim without receipt.')).toBeVisible();
    await expect(page.getByText('Why this is not another chatbot')).toBeVisible();
    await expect(page.locator('#languages')).toContainText('Hinglish');
    await expect(page.locator('#languages')).toContainText('ગુજરાતી');
    await expect(page.locator('#languages')).toContainText('اردو');
    await expect(page.locator('#languages')).toContainText('অসমীয়া');
    await expect(page.getByText('Chetana is a rail, not the product.')).toBeVisible();
    await expect(page.getByText('copy-only')).toHaveCount(0);

    await page.getByTestId('aindia-message-action').click({ force: true });
    await expect(page.getByText('Message padh liya.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Risk check' })).toBeVisible();
    await page.getByText('Kaise check hua?').click();
    const glyphState = page.getByLabel('AIndia reflective glyph state');
    await expect(glyphState).toContainText('Reflect');
    await expect(glyphState).toContainText('Risk');
    await expect(glyphState).toContainText('Consent');
    await page.getByRole('button', { name: 'Show receipt' }).click();
    await expect(page.getByRole('dialog', { name: 'Trust receipts' })).toBeVisible();
    await expect(page.getByText('No cloud call in this demo')).toBeVisible();
    await expect(page.getByText('Public-safe demo receipt')).toBeVisible();
    await page.getByRole('dialog', { name: 'Trust receipts' }).getByRole('button', { name: 'Close trust receipts' }).click();
    await expect(page.getByRole('heading', { name: 'AIndia checks what this phone can do before promising where AI runs.' })).toBeVisible();
    await expect(page.getByText('not callable from the PWA')).toBeVisible();
    await expect(page.getByText('never claim background WhatsApp access')).toBeVisible();

    const manifest = await request.get('/api/aindia/manifest');
    expect(manifest.status()).toBe(200);
    const manifestBody = await manifest.json();
    expect(manifestBody.name).toBe('AIndia Answers');
    expect(manifestBody.description).toContain('answers with source');

    const glyphs = await request.get('/api/aindia/glyphs');
    expect(glyphs.status()).toBe(200);
    const glyphBody = await glyphs.json();
    expect(glyphBody.protocol).toBe('aindia-glyph-grammar-v1');
    expect(glyphBody.stance).toBe('reflection_over_prediction');
    expect(glyphBody.boundary).toContain('not raw private chat');
    expect(glyphBody.glyphs.map((glyph: { id: string }) => glyph.id)).toContain('reflect');
    expect(glyphBody.glyphs.map((glyph: { id: string }) => glyph.id)).toContain('consent');
    expect(glyphBody.reflectiveTurn.reflectionEngine.publicLine).toBe('Nonlinear thinking in. Disciplined next step out.');
    expect(glyphBody.reflectiveTurn.reflectionEngine.humanAuthority).toContain('Paul is the human authority');
    expect(glyphBody.mirrorGraph.mirrorGraphId).toBe('mirrorgraph:aindia:glyph-grammar:v1');
  });

  test('keeps live-runtime claims bounded to verified rails', async ({ request }) => {
    const response = await request.get('/api/aindia/recursion');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.protocol).toBe('aindia-recursion-harness-v1');
    expect(body.updated).toBe(body.macAbsorption.verifiedAt.slice(0, 10));
    expect(body.macAbsorption.localModels).toContain('hf.co/mradermacher/sarvam-translate-i1-GGUF:Q4_K_M');
    expect(body.macAbsorption.activeConstraint).toContain('refresh model, phone-mesh, API, and browser checks');
    expect(body.selfLearning.boundary.mode).toBe('receipt_driven_not_self_mutating');
    expect(body.selfLearning.boundary.cannotDo).toContain('deploy or restart production from the learning loop');
    expect(body.selfLearning.receipt.schemaVersion).toBe('aindia.self_learning_recursion.v1');
    expect(body.selfLearning.receipt.promotionRule).toContain('source receipt');
    expect(body.selfLearning.promotionGates).toContain('deploy_gate_for_production');
    expect(body.selfLearning.signals.map((signal: { class: string }) => signal.class)).toEqual(
      expect.arrayContaining(['learning', 'hypothesis', 'risk', 'opportunity', 'ignore']),
    );

    const evidence = body.macAbsorption.evidence.join(' ');
    expect(evidence).toContain('127.0.0.1:11434');
    expect(evidence).toContain('phone-mesh /health');
    expect(evidence).toContain('mac-ollama, Pixel, and OnePlus inference backends are false');

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

  test('keeps aggregate API metadata tied to the verified recursion snapshot', async ({ request }) => {
    const recursionResponse = await request.get('/api/aindia/recursion');
    expect(recursionResponse.status()).toBe(200);
    const recursionBody = await recursionResponse.json();
    const verifiedDate = recursionBody.macAbsorption.verifiedAt.slice(0, 10);
    const endpoints = ['/api/aindia/contracts', '/api/aindia/sovereignty', '/api/aindia/glyphs', '/api/aindia/learning'];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.updated).toBe(verifiedDate);

      if (endpoint === '/api/aindia/glyphs') {
        expect(body.protocol).toBe('aindia-glyph-grammar-v1');
        expect(body.reflectiveTurn.ownedLayer).toContain('wrapper, harness, gates');
        expect(body.mirrorGraph.nodes.length).toBeGreaterThan(0);
        continue;
      }

      if (endpoint === '/api/aindia/learning') {
        expect(body.protocol).toBe('aindia-self-learning-recursion-v1');
        expect(body.boundary.publicLine).toBe('Learns from receipts. Does not mutate itself.');
        expect(body.boundary.cannotDo).toContain('train on private user content without explicit consent');
        expect(body.promotionGates).toContain('lint_typecheck_build_passed');
        expect(body.receipt.boundary).toBe('receipt_driven_not_self_mutating');
        continue;
      }

      const recursion = body.sovereignty?.recursion ?? body.recursion;
      const verifiedAt = recursion.macAbsorption.verifiedAt;
      expect(verifiedAt.slice(0, 10)).toBe(verifiedDate);

      const evidence = recursion.macAbsorption.evidence.join(' ');
      expect(evidence).toContain('phone-mesh /health');
      expect(evidence).toContain('mac-ollama, Pixel, and OnePlus inference backends are false');
      expect(recursion.macAbsorption.activeConstraint).toContain('refresh model, phone-mesh, API, and browser checks');

      if (endpoint === '/api/aindia/contracts') {
        expect(body.reflectiveTurn.productRule).toContain('one simple assistant');
        expect(body.reflectiveTurn.ownedLayer).toContain('wrapper, harness, gates');
        expect(body.glyphGrammar.mirrorGraph.nodes.length).toBeGreaterThan(0);
        expect(body.sovereignty.recursion.selfLearning.boundary.mode).toBe('receipt_driven_not_self_mutating');
      }
    }
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
