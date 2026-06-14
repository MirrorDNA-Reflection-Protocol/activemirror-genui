import { expect, test, type Page } from '@playwright/test';

async function openSheet(page: Page, buttonTestId: string, sheetTestId: string) {
  const button = page.getByTestId(buttonTestId);
  await expect(button).toBeVisible();
  await expect(async () => {
    await button.click();
    await expect(page.getByTestId(sheetTestId)).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 10_000 });
}

test.describe('Active Mirror work OS front door', () => {
  test('front door is the margin-stage Work OS, not the old GenUI dashboard', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    await expect(page.getByText('Active Mirror').first()).toBeVisible();
    await expect(page.getByTestId('conversation-margin')).toBeVisible();
    await expect(page.getByTestId('work-os-stage')).toBeVisible();
    await expect(page.getByText('What are we making?')).toBeVisible();
    await expect(page.getByText("Tell me the goal. I'll ask only what I need")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Build a vendor evidence workspace' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Import sample context/i })).toBeVisible();
    await expect(page.getByTestId('solution-path')).toContainText('solution path · a deliverable by step 10');
    await expect(page.getByTestId('route-btn')).toContainText('selecting');
    await expect(page.getByTestId('memory-btn')).toContainText('memory · ephemeral');
    await expect(page.getByTestId('memory-mode')).toContainText('Memory mode: ephemeral');
    await expect(page.getByTestId('runtime-btn')).toContainText('controls');
    await expect(page.getByText('Say what you need. Active Mirror makes the workspace.')).toHaveCount(0);
    await expect(page.getByText('Generated Workspace', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Ask SWFI')).toHaveCount(0);
    await expect(page.getByText('SWFI')).toHaveCount(0);
    await expect(page.getByText('/Users/mirror-pro')).toHaveCount(0);

    await page.getByTestId('seed-import').click();
    await expect(page.getByTestId('seed-import')).toContainText('Sample context loaded for this run');
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('active_mirror.mirrorseed.sample'))).toBeNull();

    await openSheet(page, 'memory-btn', 'memory-sheet');
    await expect(page.getByText('Ephemeral scratch')).toBeVisible();
    await expect(page.getByText('The public sample is not written to localStorage or saved memory.')).toBeVisible();
  });

  test('controls sheet binds the live review contracts behind one tap', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    await openSheet(page, 'runtime-btn', 'runtime-sheet');
    await expect(page.getByText('GET /api/mirror/contracts')).toBeVisible();
    await expect(page.getByTestId('mirrorkernel-proof')).toContainText('Identity controls');
    await expect(page.getByTestId('mirror-ratchet-proof')).toContainText('Reliability checks');
    await expect(page.getByText('Evidence export')).toBeVisible();
    await expect(page.getByText('Removal effects')).toBeVisible();
    await expect(page.getByText('Continuity score')).toBeVisible();
    await expect(page.getByText('Decision critique')).toBeVisible();
    await expect(page.getByText('Local operator')).toBeVisible();

    const kernelResponse = await page.request.get('/api/mirror/kernel');
    expect(kernelResponse.ok()).toBeTruthy();
    const kernel = await kernelResponse.json();
    expect(kernel.name).toBe('MirrorKernel');
    expect(kernel.version).toBe('2026.06.09-mirrorkernel-identity-score-v6');
    expect(kernel.epistemicMode.runtimeLayer).toBe('canonical_verifier');

    const contractsResponse = await page.request.get('/api/mirror/contracts');
    expect(contractsResponse.ok()).toBeTruthy();
    const contracts = await contractsResponse.json();
    expect(contracts.schemaVersion).toBe('active_mirror.contract_registry.v1');
    expect(contracts.contracts.map((contract: { id: string }) => contract.id)).toEqual([
      'proof_ledger_export',
      'revocation_cascade',
      'identity_continuity_measure',
      'decision_critique_stream',
      'local_operator_packet',
    ]);
  });

  test('local operator compiles approved context and rejects private material', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    await openSheet(page, 'runtime-btn', 'runtime-sheet');
    await page.getByTestId('local-operator-contract').click();
    await expect(page.getByTestId('operator-sheet')).toBeVisible();
    await expect(page.getByTestId('local-operator-proof')).toContainText('deterministic policy');
    await expect(page.getByText('private vault ingest · private body required')).toBeVisible();
    await expect(page.getByText('No source, no fact')).toBeVisible();
    await expect(page.getByText('Unapproved private note · approval required')).toBeVisible();

    const getResponse = await page.request.get('/api/mirror/local-operator');
    expect(getResponse.ok()).toBeTruthy();
    const status = await getResponse.json();
    expect(status.privateVaultIngest).toBe('private_body_required');
    expect(status.samplePacket.state).toBe('compiled_public_safe');
    expect(status.samplePacket.taskPacket.didNotRun).toContain('raw_vault_read');
    expect(status.samplePacket.records.selected.map((record: { id: string }) => record.id)).toContain('doctrine.no_source_no_fact');
    expect(status.samplePacket.records.rejected.map((record: { id: string }) => record.id)).toContain('draft.private_note');

    const payload = {
      prompt: 'Build a vendor evidence workspace with proof before recommendation.',
      records: [
        {
          id: 'rule.no_source',
          kind: 'rule',
          title: 'No source, no fact',
          text: 'Unsupported claims stay assumptions until verified.',
          source: 'public contract',
          privacyClass: 'public_safe',
          canonicalStatus: 'canonical',
          trainEligibility: 'runtime_only',
          approved: true,
          tags: ['vendor', 'proof'],
        },
      ],
    };
    const first = await page.request.post('/api/mirror/local-operator', { data: payload });
    const second = await page.request.post('/api/mirror/local-operator', { data: payload });
    expect(first.ok()).toBeTruthy();
    expect(second.ok()).toBeTruthy();
    const firstPacket = await first.json();
    const secondPacket = await second.json();
    expect(firstPacket.receipt.packetHash).toBe(secondPacket.receipt.packetHash);
    expect(firstPacket.receipt.deterministic).toBe(true);

    const rejected = await page.request.post('/api/mirror/local-operator', {
      data: {
        prompt: 'Use this private file.',
        records: [{ title: 'Private path', text: '/Users/mirror-pro/.env contains a token' }],
      },
    });
    expect(rejected.status()).toBe(400);
    await expect(page.getByText('/Users/mirror-pro')).toHaveCount(0);
  });

  test('starter prompt creates one evolving artifact on the stage with evidence and a gated next action', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    await page.getByRole('button', { name: 'Build a vendor evidence workspace' }).click();

    await expect(page.getByTestId('workpiece')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('workpiece').locator('.work__title')).toHaveText('Vendor evidence workspace');
    await expect(page.getByTestId('workpiece').locator('.block__h').filter({ hasText: 'Source route' })).toBeVisible();
    await expect(page.getByTestId('workpiece').locator('.block__h').filter({ hasText: 'Approval gates' })).toBeVisible();
    await expect(page.getByTestId('workpiece').getByText('source_gap until opened or attached')).toBeVisible();
    await expect(page.getByTestId('conversation-margin')).toContainText('you');
    await expect(page.getByTestId('conversation-margin')).toContainText('Active Mirror');
    await expect(page.getByTestId('solution-path')).toContainText('delivered');
    await expect(page.getByRole('button', { name: /evidence/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Approve source route — needs approval/i })).toBeVisible();
    await expect(page.getByTestId('proof-sprint-handoff')).toContainText('Need this working for your team?');
    await expect(page.getByTestId('proof-sprint-handoff')).toContainText('No prompt or artifact text is sent in the link.');
    await expect(page.getByTestId('proof-sprint-handoff').getByRole('link', { name: /Apply for a 72-hour sprint/i })).toHaveAttribute('href', '/intake?focus=workspace-proof');

    await page.getByRole('button', { name: /Approve source route — needs approval/i }).click();
    await expect(page.getByTestId('ledger-sheet')).toBeVisible();
    await expect(page.getByText('GET /api/mirror/proof-ledger')).toBeVisible();
    await expect(page.getByText('ProofLedgerEntry')).toBeVisible();
  });

  test('typed sensitive prompt routes away from the hosted-model path honestly', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    const textarea = page.locator('#cap-input');
    await textarea.fill('Draft a private saved-context plan that must stay local only.');
    await textarea.press('Enter');

    await expect(page.getByTestId('workpiece').getByText('Working plan')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('route-btn')).toContainText('local · gated');
    await expect(page.getByText('Private runtime state is unavailable')).toBeVisible();
    await expect(page.getByText('Generated Workspace', { exact: true })).toHaveCount(0);
  });

  test('route chip opens policy rather than pretending everything is local', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    await openSheet(page, 'route-btn', 'routing-sheet');
    await expect(page.getByText('GET /api/mirror/model-health')).toBeVisible();
    await expect(page.getByText('provider health')).toBeVisible();
    await expect(page.getByTestId('model-provider-openai')).toContainText('OpenAI');
    await expect(page.getByTestId('model-provider-openai')).toContainText('primary public workhorse');
    await expect(page.getByTestId('model-provider-anthropic')).toContainText('Anthropic');
    await expect(page.getByTestId('model-provider-anthropic')).toContainText('wired quality');
    await expect(page.getByTestId('model-provider-anthropic')).toContainText(/disabled|not configured/);
    await expect(page.getByTestId('model-provider-gemini')).toContainText('Gemini');
    await expect(page.getByTestId('model-provider-gemini')).toContainText(/disabled|not configured/);
    await expect(page.getByTestId('model-provider-local')).toContainText('Local gated route');
    await expect(page.getByText('media and design lanes')).toBeVisible();
    await expect(page.getByTestId('media-lane-gemini-media')).toContainText('Gemini media');
    await expect(page.getByTestId('media-lane-gemini-media')).toContainText('gated');
    await expect(page.getByTestId('media-lane-gemini-media')).toContainText('Media generation is not a text-model fallback');
    await expect(page.getByTestId('media-lane-figma-design')).toContainText('Figma design');
    await expect(page.getByTestId('media-lane-figma-design')).toContainText('available');
    await expect(page.getByText('Sensitive work stays on')).toBeVisible();
    await expect(page.getByText('Never claim')).toHaveCount(0);
  });

  test('model health endpoint exposes provider status without secrets', async ({ request }) => {
    const response = await request.get('/api/mirror/model-health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.schemaVersion).toBe('active_mirror.model_health.v1');
    expect(body.claimBoundary).toContain('No secrets');
    expect(body.sensitiveRoute).toBe('local · gated');
    expect(body.providers.map((provider: { id: string }) => provider.id)).toEqual(['openai', 'anthropic', 'gemini', 'local']);
    expect(body.providers.find((provider: { id: string }) => provider.id === 'anthropic').wired).toBe(true);
    expect(body.providers.find((provider: { id: string }) => provider.id === 'anthropic').enabled).toBe(false);
    expect(body.providers.find((provider: { id: string }) => provider.id === 'gemini').enabled).toBe(false);
    expect(JSON.stringify(body)).not.toContain('API_KEY');
    expect(JSON.stringify(body)).not.toContain('/Users/mirror-pro');
  });

  test('app route redirects to the canonical Work OS front door', async ({ page }) => {
    await page.goto('/app');

    await expect(page).toHaveURL(/\/mirror$/);
    await expect(page.getByTestId('work-os-stage')).toBeVisible();
    await expect(page.getByText('What are we making?')).toBeVisible();
  });

  test('public landing is a plain business front door with no model call', async ({ page }) => {
    const modelCalls: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/mirror/') || url.includes('/api/lead')) {
        modelCalls.push(url);
      }
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: /You ask\.\s+Active Mirror checks\./i })).toBeVisible();
    await expect(page.locator('.eyebrow').first()).toContainText('Trust by Design');
    await expect(page.getByText(/Most AI gives an answer\. Active Mirror checks/)).toBeVisible();
    await expect(page.getByLabel('Choose your Active Mirror route')).toContainText('What do you need checked?');
    await expect(page.getByLabel('Choose your Active Mirror route')).toContainText('Open AIndia');
    await expect(page.getByLabel('Choose your Active Mirror route')).toContainText('Try workspace');
    await expect(page.getByText('All the familiar AI work, wrapped with checks.')).toBeVisible();
    await expect(page.getByLabel('Familiar AI abilities')).toContainText('images');
    await expect(page.getByLabel('Familiar AI abilities')).toContainText('audio');
    await expect(page.getByLabel('Familiar AI abilities')).toContainText('automations');
    await expect(page.getByText(/Made in India/).first()).toBeVisible();
    await expect(page.locator('#brief')).toContainText('Send data-sharing request to Vendor A');
    await expect(page.locator('#brief')).toContainText('nothing runs yet');
    await expect(page.locator('#walkthrough')).toContainText('20-second walkthrough');
    await expect(page.locator('video.proof-video')).toHaveAttribute('poster', '/media/show-the-work-poster.jpg');
    await expect(page.locator('video.proof-video source')).toHaveAttribute('src', '/media/show-the-work.mp4');
    await expect(page.getByRole('link', { name: /Open AIndia/i }).first()).toHaveAttribute('href', '/aindia');
    await expect(page.getByRole('link', { name: /Try workspace/i }).first()).toHaveAttribute('href', '/mirror');
    await expect(page.getByRole('heading', { name: /No pitch theatre\. A useful proof or a clear no\./i })).toBeVisible();
    await expect(page.getByText('A no-nonsense fit decision')).toBeVisible();
    await expect(page.getByText('Working workspace')).toBeVisible();
    await expect(page.getByText('Truth that reflects.')).toBeVisible();
    await expect(page.getByText('Order that holds.')).toBeVisible();
    await expect(page.getByText('Intelligence that remembers.')).toBeVisible();
    await expect(page.getByRole('heading', { name: /The proof tells you what architecture the work deserves\./i })).toBeVisible();
    await expect(page.locator('#control-map')).toContainText('Active Mirror Control Map');
    await expect(page.locator('#control-map')).toContainText(/local runtime, cloud AI, human review, and proof record/i);
    await expect(page.locator('#control-map').getByRole('link', { name: /Map my AI architecture/i })).toHaveAttribute('href', '/intake?focus=architecture');
    await expect(page.locator('.wk').filter({ hasText: /^Teams$/ })).toBeVisible();
    await expect(page.locator('.wk').filter({ hasText: /^Companies$/ })).toBeVisible();
    await expect(page.locator('.wk').filter({ hasText: /^Public sector$/ })).toBeVisible();
    await expect(page.locator('.wk').filter({ hasText: /^National programs$/ })).toBeVisible();
    await expect(page.locator('#where')).toContainText('All-India language lanes');
    await expect(page.locator('#where')).toContainText('Hinglish');
    await expect(page.locator('#where')).toContainText('Assamese');
    await expect(page.locator('#where')).toContainText('Urdu');
    await expect(page.locator('#where')).toContainText('Santhali');
    await expect(page.getByRole('heading', { name: /Pick the result you want first\./i })).toBeVisible();
    await expect(page.locator('#route').getByRole('link', { name: /See proof sprint sample/i })).toHaveAttribute('href', '/proof-sprint');
    await expect(page.locator('#route').getByRole('link', { name: /Review boundary/i })).toHaveAttribute('href', '/trust');
    await expect(page.locator('#route').getByRole('link', { name: /Public evidence examples/i })).toHaveAttribute('href', '/glass');
    await expect(page.locator('main.amr > section')).toHaveCount(10);
    const aboveFoldActions = await page.locator('header a, header button, nav a, nav button').evaluateAll((elements) =>
      elements.filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.top < window.innerHeight;
      }).length
    );
    expect(aboveFoldActions).toBeLessThanOrEqual(14);
    await expect(page.getByText('MirrorGate')).toHaveCount(0);
    await expect(page.getByText('Chetana')).toHaveCount(0);
    await expect(page.getByText('MirrorProd')).toHaveCount(0);
    await expect(page.getByText('body_unavailable')).toHaveCount(0);
    await expect(page.locator('textarea, input')).toHaveCount(0);
    expect(modelCalls).toEqual([]);
  });

  test('public landing stays compressed on mobile without horizontal clipping', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 820 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /You ask\.\s+Active Mirror checks\./i })).toBeVisible();
    await expect(page.locator('.eyebrow').first()).toContainText('Trust by Design');
    await expect(page.getByText(/Reflection happens inside the system/)).toBeVisible();
    await expect(page.getByLabel('Choose your Active Mirror route')).toContainText('Open AIndia');
    await expect(page.locator('#brief')).toBeVisible();
    await expect(page.locator('#walkthrough video')).toBeVisible();
    await expect(page.locator('#control-map')).toContainText('Active Mirror Control Map');
    await expect(page.locator('#where')).toContainText('All-India language lanes');
    await expect(page.locator('#where')).toContainText('Hinglish');
    await expect(page.getByRole('link', { name: /Open AIndia/i }).first()).toBeVisible();
    await expect(page.locator('#work-with-us')).toContainText('72-hour proof sprint');

    const mobileMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const panel = document.querySelector('#brief')?.getBoundingClientRect();
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        panelWidth: panel?.width || 0,
      };
    });
    expect(mobileMetrics.scrollWidth).toBeLessThanOrEqual(mobileMetrics.clientWidth + 1);
    expect(mobileMetrics.panelWidth).toBeLessThanOrEqual(mobileMetrics.clientWidth);
  });

  test('public telemetry captures funnel events without private text', async ({ page }) => {
    const events: unknown[] = [];

    await page.route('**/api/analytics', async (route) => {
      const data = route.request().postData();
      if (data) events.push(JSON.parse(data));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"stored":false}' });
    });

    await page.goto('/?utm_source=qa');
    await expect.poll(() => events.some((event) => {
      const record = event as { event?: string; target?: string };
      return record.event === 'page_view' && record.target === 'public_site';
    })).toBeTruthy();

    await page.getByLabel('Choose your Active Mirror route').getByRole('link', { name: /Open AIndia/i }).click();
    await expect(page).toHaveURL(/\/aindia/);
    await expect.poll(() => events.some((event) => {
      const record = event as { event?: string; target?: string };
      return record.event === 'cta_click' && record.target === 'frontdoor_primary';
    })).toBeTruthy();

    const raw = JSON.stringify(events);
    expect(raw).toContain('utm_source');
    expect(raw).not.toContain('Draft a private');
    expect(raw).not.toContain('saved-context plan');
  });

  test('public trust, proof sprint, compare, glass, and intake routes expose review boundaries', async ({ page }) => {
    await page.goto('/trust');
    await expect(page.getByRole('heading', { name: /Useful AI work without silent access/i })).toBeVisible();
    await expect(page.getByText('Private files', { exact: true })).toBeVisible();
    await expect(page.getByText('ask first', { exact: true }).first()).toBeVisible();

    await page.goto('/proof-sprint');
    await expect(page.getByRole('heading', { name: /Send one messy AI workflow/i })).toBeVisible();
    await expect(page.getByText('Fit check')).toBeVisible();
    await expect(page.locator('.comparetable__row').filter({ hasText: 'Create the first working surface' })).toBeVisible();
    await expect(page.getByText(/deploy or don't/i).first()).toBeVisible();
    await expect(page.getByText('public or sanitized inputs only')).toBeVisible();
    await expect(page.getByRole('link', { name: /Submit workflow/i })).toHaveAttribute('href', /\/intake\?focus=pilot/);

    await page.goto('/compare');
    await expect(page.getByRole('heading', { name: /A chatbot gives an answer/i })).toBeVisible();
    await expect(page.locator('.comparetable__row').filter({ hasText: 'Active Mirror' })).toBeVisible();
    await expect(page.getByText('Builds the workspace')).toBeVisible();

    await page.goto('/glass');
    await expect(page.getByRole('heading', { name: /Inspect the work/i })).toBeVisible();
    await expect(page.getByText('Evidence record sample')).toBeVisible();
    await expect(page.getByRole('link', { name: /Download sample/i })).toHaveAttribute('href', '/api/mirror/proof-ledger?format=markdown');

    await page.goto('/intake');
    await expect(page.getByRole('heading', { name: /workflow that needs better AI control/i })).toBeVisible();
    await expect(page.getByLabel('How sensitive is it?')).toBeVisible();
    await expect(page.getByLabel('Where should it run?')).toBeVisible();
    await expect(page.getByLabel('Who can move this forward?')).toBeVisible();
    await expect(page.getByLabel('Where does current AI fail?')).toBeVisible();
    await expect(page.getByLabel('What may we use first?')).toBeVisible();
    await expect(page.getByLabel('First useful deliverable')).toBeVisible();
    await expect(page.getByLabel('What would make the 72-hour proof worth paying attention to?')).toBeVisible();
    await expect(page.getByText('No files uploaded.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit workflow' })).toBeVisible();

    await page.goto('/intake?focus=architecture');
    await expect(page.getByRole('heading', { name: /local, cloud, and human-review boundary/i })).toBeVisible();
    await expect(page.getByTestId('intake-focus')).toContainText('Hybrid AI architecture review');
    await expect(page.getByTestId('intake-focus')).toContainText('which data must stay local');
    await expect(page.getByLabel('First useful deliverable')).toContainText('AI control map');

    await page.goto('/intake?focus=workspace-proof');
    await expect(page.getByTestId('intake-focus')).toContainText('From the workspace preview');
    await expect(page.getByTestId('intake-focus')).toContainText('We do not receive the prompt or artifact from the preview unless you choose to paste it.');
    await expect(page.getByLabel('What business workflow should Active Mirror help with?')).toHaveAttribute('placeholder', /I generated a vendor evidence workspace/);
  });

  test('intake success returns a buyer-safe follow-up packet', async ({ page }) => {
    await page.route('**/api/lead', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          captured: true,
          captureId: 'amlead_test_1234',
          deliveryStatus: 'capture_only',
          qualification: {
            grade: 'priority',
            score: 92,
          },
          mailto: 'mailto:paul@activemirror.ai?subject=Active%20Mirror%20workflow%20request%20-%20Example%20Corp&body=Hi%20Paul%2C%0A%0AI%20want%20Active%20Mirror%20to%20look%20at%20this%20workflow.',
          followUp: {
            responseWindow: 'same_day',
            buyerStatus: 'Captured. We review the workflow and reply with the first scope question.',
            proofSurface: 'reviewable evidence workspace',
            riskBoundary: 'No private files, account access, device access, or external sends before explicit approval. First-pass input boundary: Public or sanitized inputs only.',
            scopeQuestions: [
              'Can we confirm the first deliverable is Evidence workspace?',
              'What exactly may we use in the first 72 hours: Public or sanitized inputs only?',
              'Who approves the result before it is reused, shared, or sent?',
            ],
          },
        }),
      });
    });

    await page.goto('/intake?focus=workspace-proof');
    await page.getByLabel('Name').fill('Asha Rao');
    await page.getByLabel('Work email').fill('asha@examplecorp.com');
    await page.getByLabel('Where does current AI fail?').selectOption('Sources and gaps are unclear');
    await page.getByLabel('What may we use first?').selectOption('Public or sanitized inputs only');
    await page.getByLabel('First useful deliverable').selectOption('Evidence workspace');
    await page.getByLabel('What business workflow should Active Mirror help with?').fill('We generated a vendor evidence workspace and need it adapted for a real procurement review.');
    await page.getByLabel('What would make the 72-hour proof worth paying attention to?').fill('A decision-ready export with source gaps and approvals visible.');
    await page.getByRole('button', { name: 'Submit workflow' }).click();

    await expect(page.getByTestId('intake-followup')).toContainText('reviewable evidence workspace');
    await expect(page.getByTestId('intake-followup')).toContainText('Can we confirm the first deliverable is Evidence workspace?');
    await expect(page.getByTestId('intake-followup')).toContainText('Reference: amlead_test_1234');
    await expect(page.getByTestId('intake-followup')).toContainText('No private files');
    await expect(page.getByRole('link', { name: 'Open ready-to-send email' })).toHaveAttribute('href', /mailto:paul@activemirror\.ai/);
    await expect(page.getByRole('link', { name: 'Open ready-to-send email' })).toHaveAttribute('href', /body=/);
    await expect(page.getByText('subject and workflow request already filled')).toBeVisible();
  });

  test('local ops funnel shows the conversion dashboard', async ({ page }) => {
    await page.goto('/ops/funnel?days=7');

    await expect(page.getByRole('heading', { name: 'Funnel dashboard' })).toBeVisible();
    await expect(page.getByText('Revenue front door')).toBeVisible();
    await expect(page.getByText('72h sprint clicks')).toBeVisible();
    await expect(page.getByText('Captured leads', { exact: true })).toBeVisible();
    await expect(page.getByText('Workspace leads')).toBeVisible();
    await expect(page.getByText('Qualified leads')).toBeVisible();
    await expect(page.getByText('Next adjustment')).toBeVisible();
    await expect(page.getByText('Intake focus')).toBeVisible();
    await expect(page.getByText('Where current AI fails')).toBeVisible();
    await expect(page.getByText('Allowed first inputs')).toBeVisible();
    await expect(page.getByText('Requested deliverables')).toBeVisible();
    await expect(page.getByText('Recent leads')).toBeVisible();
  });

  test('about route uses the same static site surface without live generation', async ({ page }) => {
    const modelCalls: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/mirror/') || url.includes('/api/lead')) {
        modelCalls.push(url);
      }
    });

    await page.goto('/about');

    await expect(page.getByRole('heading', { name: /You ask\.\s+Active Mirror checks\./i })).toBeVisible();
    await expect(page.locator('.eyebrow').first()).toContainText('Trust by Design');
    await expect(page.getByText(/Most AI gives an answer\. Active Mirror checks/)).toBeVisible();
    await expect(page.locator('#brief')).toContainText('Send data-sharing request to Vendor A');
    await expect(page.getByRole('link', { name: /Open AIndia/i }).first()).toHaveAttribute('href', '/aindia');
    await expect(page.locator('textarea, input')).toHaveCount(0);
    expect(modelCalls).toEqual([]);
  });

  test('mobile hides the conversation margin and keeps the deliverable first', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 820 });
    await page.goto('/mirror?qa=1');

    await expect(page.getByTestId('conversation-margin')).toBeHidden();
    await expect(page.getByTestId('work-os-stage')).toBeVisible();
    await expect(page.getByTestId('mobile-control-strip')).toBeVisible();
    await expect(page.getByTestId('mobile-control-strip')).toContainText('ephemeral');
    await expect(page.getByText('What are we making?')).toBeVisible();

    await page.getByRole('button', { name: 'Build a vendor evidence workspace' }).click();

    await expect(page.getByTestId('workpiece')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('workpiece-title')).toHaveText('Vendor evidence workspace');
    await page.getByTestId('workpiece').getByRole('button', { name: /evidence/i }).click();
    await expect(page.getByTestId('ledger-sheet')).toBeVisible();
  });
});
