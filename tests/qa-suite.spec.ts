import { expect, test } from '@playwright/test';

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

    await page.getByTestId('memory-btn').click();
    await expect(page.getByTestId('memory-sheet')).toBeVisible();
    await expect(page.getByText('Ephemeral scratch')).toBeVisible();
    await expect(page.getByText('The public sample is not written to localStorage or saved memory.')).toBeVisible();
  });

  test('controls sheet binds the live review contracts behind one tap', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    await page.getByTestId('runtime-btn').click();
    await expect(page.getByTestId('runtime-sheet')).toBeVisible();
    await expect(page.getByText('GET /api/mirror/contracts')).toBeVisible();
    await expect(page.getByTestId('mirrorkernel-proof')).toContainText('Identity controls');
    await expect(page.getByTestId('mirror-ratchet-proof')).toContainText('Reliability checks');
    await expect(page.getByText('Evidence export')).toBeVisible();
    await expect(page.getByText('Removal effects')).toBeVisible();
    await expect(page.getByText('Continuity score')).toBeVisible();
    await expect(page.getByText('Decision critique')).toBeVisible();

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
    ]);
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

    await page.getByTestId('route-btn').click();
    await expect(page.getByTestId('routing-sheet')).toBeVisible();
    await expect(page.getByText('The model is routed to the best available lane for the job.')).toBeVisible();
    await expect(page.getByText('gemini · flash')).toBeVisible();
    await expect(page.getByText('claude · sonnet/opus')).toBeVisible();
    await expect(page.getByText('local · ollama')).toBeVisible();
    await expect(page.getByText('Never claim')).toHaveCount(0);
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

    await expect(page.getByRole('heading', { name: /Turn one important AI workflow into a reviewable workspace/i })).toBeVisible();
    await expect(page.locator('header').getByText('72-hour proof sprint')).toBeVisible();
    await expect(page.getByTestId('front-door-panel')).toContainText('I need to make a decision');
    await expect(page.getByTestId('front-door-panel')).toContainText('I need to use sensitive context');
    await expect(page.getByRole('link', { name: /Start a decision brief/i })).toHaveAttribute('href', /\/mirror\?prompt=/);
    await expect(page.getByRole('link', { name: /Apply for a 72-hour sprint/i }).first()).toHaveAttribute('href', '/intake?focus=pilot');
    await expect(page.getByText('Give us one workflow your current AI cannot safely finish.')).toBeVisible();
    await expect(page.getByRole('heading', { name: /No pitch theatre/i })).toBeVisible();
    await expect(page.getByText('A working proof on your workflow')).toBeVisible();
    await expect(page.getByText("A clear deploy-or-don't plan")).toBeVisible();
    await expect(page.locator('.usecase__label').filter({ hasText: /^People$/ })).toBeVisible();
    await expect(page.locator('.usecase__label').filter({ hasText: /^Companies$/ })).toBeVisible();
    await expect(page.locator('.usecase__label').filter({ hasText: /^Governments$/ })).toBeVisible();
    await expect(page.locator('.usecase__label').filter({ hasText: /^Countries$/ })).toBeVisible();
    await expect(page.getByText('Not a smarter chat box. A way to make AI work usable.')).toBeVisible();
    await expect(page.locator('#proof').getByRole('link', { name: /Review boundary/i })).toHaveAttribute('href', '/trust');
    await expect(page.locator('#proof').getByRole('link', { name: /Public evidence examples/i })).toHaveAttribute('href', '/glass');
    await expect(page.getByText('MirrorGate')).toHaveCount(0);
    await expect(page.getByText('Chetana')).toHaveCount(0);
    await expect(page.getByText('MirrorProd')).toHaveCount(0);
    await expect(page.getByText('body_unavailable')).toHaveCount(0);
    await expect(page.locator('textarea, input')).toHaveCount(0);
    expect(modelCalls).toEqual([]);
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

    await page.getByRole('link', { name: /Apply for a 72-hour sprint/i }).first().click();
    await expect(page).toHaveURL(/\/intake\?focus=pilot/);
    await expect.poll(() => events.some((event) => {
      const record = event as { event?: string; target?: string };
      return record.event === 'cta_click' && record.target === 'hero_72h_sprint';
    })).toBeTruthy();

    const raw = JSON.stringify(events);
    expect(raw).toContain('utm_source');
    expect(raw).not.toContain('Draft a private');
    expect(raw).not.toContain('saved-context plan');
  });

  test('public trust, compare, glass, and intake routes expose review boundaries', async ({ page }) => {
    await page.goto('/trust');
    await expect(page.getByRole('heading', { name: /Useful AI work without silent access/i })).toBeVisible();
    await expect(page.getByText('Private files', { exact: true })).toBeVisible();
    await expect(page.getByText('ask first', { exact: true }).first()).toBeVisible();

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
    await expect(page.getByLabel('What would make the 72-hour proof worth paying attention to?')).toBeVisible();
    await expect(page.getByText('No files uploaded.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit workflow' })).toBeVisible();

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
          deliveryStatus: 'capture_only',
          mailto: 'mailto:paul@activemirror.ai?subject=Active%20Mirror%20test',
          followUp: {
            responseWindow: 'same_day',
            buyerStatus: 'Captured. We review the workflow and reply with the first scope question.',
            proofSurface: 'reviewable evidence workspace',
            riskBoundary: 'No private files, account access, device access, or external sends before explicit approval.',
            scopeQuestions: [
              'Who owns approval for the first proof?',
              'What source, file, or system boundary is allowed in the first 72 hours?',
              'What result would make this worth deploying or rejecting?',
            ],
          },
        }),
      });
    });

    await page.goto('/intake?focus=workspace-proof');
    await page.getByLabel('Name').fill('Asha Rao');
    await page.getByLabel('Work email').fill('asha@examplecorp.com');
    await page.getByLabel('What business workflow should Active Mirror help with?').fill('We generated a vendor evidence workspace and need it adapted for a real procurement review.');
    await page.getByLabel('What would make the 72-hour proof worth paying attention to?').fill('A decision-ready export with source gaps and approvals visible.');
    await page.getByRole('button', { name: 'Submit workflow' }).click();

    await expect(page.getByTestId('intake-followup')).toContainText('reviewable evidence workspace');
    await expect(page.getByTestId('intake-followup')).toContainText('Who owns approval for the first proof?');
    await expect(page.getByTestId('intake-followup')).toContainText('No private files');
    await expect(page.getByRole('link', { name: 'Open prepared email' })).toHaveAttribute('href', /mailto:paul@activemirror\.ai/);
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

    await expect(page.getByRole('heading', { name: /Turn one important AI workflow into a reviewable workspace/i })).toBeVisible();
    await expect(page.getByTestId('front-door-panel')).toContainText('What do you need to get done?');
    await expect(page.getByRole('link', { name: /Try the workspace/i }).first()).toHaveAttribute('href', '/mirror');
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

    const textarea = page.locator('#cap-input');
    await textarea.fill('Create an automation checklist for watching my website.');
    await textarea.press('Enter');

    await expect(page.getByTestId('workpiece').getByText('Working plan')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('workpiece')).toBeVisible();
    await page.getByTestId('workpiece').getByRole('button', { name: /evidence/i }).click();
    await expect(page.getByTestId('ledger-sheet')).toBeVisible();
  });
});
