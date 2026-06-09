import { expect, test } from '@playwright/test';

test.describe('Active Mirror work OS front door', () => {
  test('front door is the margin-stage Work OS, not the old GenUI dashboard', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    await expect(page.getByText('Active Mirror').first()).toBeVisible();
    await expect(page.getByTestId('conversation-margin')).toBeVisible();
    await expect(page.getByTestId('work-os-stage')).toBeVisible();
    await expect(page.getByText('What are we making?')).toBeVisible();
    await expect(page.getByText("Tell me the goal. I'll ask only what I need")).toBeVisible();
    await expect(page.getByRole('button', { name: "Outline a deck for next week's meeting" })).toBeVisible();
    await expect(page.getByTestId('solution-path')).toContainText('solution path · a deliverable by step 10');
    await expect(page.getByTestId('route-btn')).toContainText('selecting');
    await expect(page.getByTestId('runtime-btn')).toContainText('runtime');
    await expect(page.getByText('Say what you need. Active Mirror makes the workspace.')).toHaveCount(0);
    await expect(page.getByText('Generated Workspace', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Ask SWFI')).toHaveCount(0);
    await expect(page.getByText('SWFI')).toHaveCount(0);
    await expect(page.getByText('/Users/mirror-pro')).toHaveCount(0);
  });

  test('runtime sheet binds the live proof contracts behind one tap', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    await page.getByTestId('runtime-btn').click();
    await expect(page.getByTestId('runtime-sheet')).toBeVisible();
    await expect(page.getByText('GET /api/mirror/contracts')).toBeVisible();
    await expect(page.getByTestId('mirrorkernel-proof')).toContainText('MirrorKernel');
    await expect(page.getByTestId('mirror-ratchet-proof')).toContainText('Trust ratchet');
    await expect(page.getByText('Receipt-chain export')).toBeVisible();
    await expect(page.getByText('Revocation cascade')).toBeVisible();
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

  test('starter prompt creates one evolving artifact on the stage with proof and a gated next action', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    await page.getByRole('button', { name: "Outline a deck for next week's meeting" }).click();

    await expect(page.getByText('Meeting deck outline')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('workpiece')).toBeVisible();
    await expect(page.getByText('Slides')).toBeVisible();
    await expect(page.getByText('The ask and next steps')).toBeVisible();
    await expect(page.getByTestId('conversation-margin')).toContainText('you');
    await expect(page.getByTestId('conversation-margin')).toContainText('Active Mirror');
    await expect(page.getByTestId('solution-path')).toContainText('delivered');
    await expect(page.getByRole('button', { name: /proof/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export the outline — needs approval/i })).toBeVisible();

    await page.getByRole('button', { name: /Export the outline — needs approval/i }).click();
    await expect(page.getByTestId('ledger-sheet')).toBeVisible();
    await expect(page.getByText('GET /api/mirror/proof-ledger')).toBeVisible();
    await expect(page.getByText('ProofLedgerEntry')).toBeVisible();
  });

  test('typed sensitive prompt routes away from default frontier path honestly', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    const textarea = page.locator('#cap-input');
    await textarea.fill('Draft a private vault plan that must stay local only.');
    await textarea.press('Enter');

    await expect(page.getByTestId('workpiece').getByText('Working plan')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('route-btn')).toContainText('local · gated');
    await expect(page.getByText('body_unavailable')).toBeVisible();
    await expect(page.getByText('Generated Workspace', { exact: true })).toHaveCount(0);
  });

  test('route chip opens policy rather than pretending everything is local', async ({ page }) => {
    await page.goto('/mirror?qa=1');

    await page.getByTestId('route-btn').click();
    await expect(page.getByTestId('routing-sheet')).toBeVisible();
    await expect(page.getByText('Intelligence is rented; identity is local.')).toBeVisible();
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

  test('public landing is the Claude site with a static teaser and product CTA', async ({ page }) => {
    const modelCalls: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/mirror/') || url.includes('/api/lead')) {
        modelCalls.push(url);
      }
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Not another model/i })).toBeVisible();
    await expect(page.getByText('TRUST BY DESIGN™ · SOVEREIGN AI RUNTIME')).toBeVisible();
    await expect(page.getByTestId('site-teaser-console')).toContainText('read-only');
    await expect(page.getByTestId('site-teaser-console')).toContainText('Vendor evidence workspace');
    await expect(page.getByTestId('site-teaser-console')).toContainText('receiptRequired');
    await expect(page.getByRole('link', { name: /Open Active Mirror/i }).first()).toHaveAttribute('href', '/mirror');
    await expect(page.getByText('Portable identity before memory.')).toBeVisible();
    await expect(page.getByRole('link', { name: /Create your seed/i })).toHaveAttribute(
      'href',
      'https://id.activemirror.ai/docs/identity.html#generator',
    );
    await expect(page.getByText("Five laws we don't break.")).toBeVisible();
    await expect(page.getByText('There must be one sacred thing')).toBeVisible();
    await expect(page.locator('textarea, input')).toHaveCount(0);
    expect(modelCalls).toEqual([]);
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

    await expect(page.getByRole('heading', { name: /Not another model/i })).toBeVisible();
    await expect(page.getByTestId('site-teaser-console')).toContainText('no model call');
    await expect(page.getByRole('link', { name: /Open Active Mirror/i }).first()).toHaveAttribute('href', '/mirror');
    await expect(page.locator('textarea, input')).toHaveCount(0);
    expect(modelCalls).toEqual([]);
  });

  test('mobile hides the conversation margin and keeps the deliverable first', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 820 });
    await page.goto('/mirror?qa=1');

    await expect(page.getByTestId('conversation-margin')).toBeHidden();
    await expect(page.getByTestId('work-os-stage')).toBeVisible();
    await expect(page.getByText('What are we making?')).toBeVisible();

    const textarea = page.locator('#cap-input');
    await textarea.fill('Create an automation checklist for watching my website.');
    await textarea.press('Enter');

    await expect(page.getByTestId('workpiece').getByText('Working plan')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('workpiece')).toBeVisible();
    await page.getByRole('button', { name: /proof/i }).click();
    await expect(page.getByTestId('ledger-sheet')).toBeVisible();
  });
});
