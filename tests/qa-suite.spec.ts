import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.describe('Active Mirror public GenUI', () => {
  test('front door exposes MirrorKernel as a redacted trust runtime surface', async ({ page }) => {
    await page.goto('/?qa=1');

    const kernel = page.getByTestId('mirrorkernel-proof');
    await expect(kernel).toBeVisible();
    await expect(kernel).toContainText('MirrorKernel');
    await expect(kernel).toContainText('Contextual memory actualization');
    await expect(kernel).toContainText('proposer only');
    await expect(kernel).toContainText('consent-gated');
    await expect(kernel).toContainText('Doctrine: accuracy without fabrication');
    await expect(kernel).toContainText('Canonical runtime');
    const ratchet = page.getByTestId('mirror-ratchet-proof');
    await expect(ratchet).toBeVisible();
    await expect(ratchet).toContainText('MirrorRatchet');
    await expect(ratchet).toContainText('frontier-model failure modes');
    await expect(ratchet).toContainText('Covers: fabricated certainty');
    await expect(ratchet).toContainText('Portable proof ledger');
    await expect(ratchet).toContainText('Confessional self-transparency');
    const sovereignContracts = page.getByTestId('mirror-sovereign-contracts');
    await expect(sovereignContracts).toBeVisible();
    await expect(sovereignContracts).toContainText('Self critique');
    await expect(sovereignContracts).toContainText('Revocation cascade');
    await expect(sovereignContracts).toContainText('Identity continuity');
    await expect(sovereignContracts).toContainText('Export proof ledger');
    await expect(page.getByText('/Users/mirror-pro')).toHaveCount(0);

    const response = await page.request.get('/api/mirror/kernel');
    expect(response.ok()).toBeTruthy();
    const status = await response.json();
    expect(status.name).toBe('MirrorKernel');
    expect(status.version).toBe('2026.06.08-mirrorkernel-sovereign-contracts-v4');
    expect(status.epistemicMode.runtimeLayer).toBe('canonical_verifier');
    expect(status.truthfulUtilityPolicy.principle).toBe('accuracy_without_fabrication');
    expect(status.actualization.productWedge).toContain('without giving it all of me');
    expect(status.bodyReceipt.version).toBe('2026.06.08-body-receipt-bridge-v1');
    expect(status.doctrine).toContain('Accuracy without fabrication: blocked or unverified routes return facts, assumptions, unknowns, source gaps, and the next safe step.');
    expect(status.doctrine).toContain('A public body receipt is proof of sanitized sync only; it does not grant private action authority.');
    expect(status.controlPlane.some((item: { label: string }) => item.label === 'Accuracy mode')).toBeTruthy();
    expect(status.controlPlane.some((item: { label: string }) => item.label === 'Canonical promotion')).toBeTruthy();
    expect(status.controlPlane.some((item: { label: string }) => item.label === 'Self critique')).toBeTruthy();
    expect(status.controlPlane.some((item: { label: string }) => item.label === 'Revocation cascade')).toBeTruthy();
    expect(status.controlPlane.some((item: { label: string }) => item.label === 'Identity continuity')).toBeTruthy();
    expect(status.critique.events.length).toBeGreaterThanOrEqual(4);
    expect(status.revocation.events.length).toBeGreaterThanOrEqual(4);
    expect(status.identityContinuity.privateUserContinuityScore).toBeNull();
    expect(status.privacyBoundary).toContain('redacted');

    const systemResponse = await page.request.get('/api/mirror/system');
    expect(systemResponse.ok()).toBeTruthy();
    const systemStatus = await systemResponse.json();
    expect(systemStatus.localSupervisor).toBe('2026.06.08-local-supervisor-canonical-accuracy-v2');

    const ratchetResponse = await page.request.get('/api/mirror/ratchet');
    expect(ratchetResponse.ok()).toBeTruthy();
    const ratchetStatus = await ratchetResponse.json();
    expect(ratchetStatus.version).toBe('2026.06.08-mirror-ratchet-v3');
    expect(ratchetStatus.targetPasses).toBe(1000);
    expect(ratchetStatus.frontierFailureCoverage.covered).toContain('fabricated certainty');
    expect(ratchetStatus.frontierFailureCoverage.covered).toContain('vendor-owned proof ledger');
    expect(ratchetStatus.frontierFailureCoverage.covered).toContain('revocation cascade opacity');
    expect(ratchetStatus.frontierFailureCoverage.covered).toContain('hidden system failure stream');
    expect(ratchetStatus.frontierFailureCoverage.queued).toContain('model-swap identity drift');
    expect(ratchetStatus.claimBoundary).toContain('not a claim of superior raw model IQ');

    const ledgerResponse = await page.request.get('/api/mirror/proof-ledger');
    expect(ledgerResponse.ok()).toBeTruthy();
    const ledger = await ledgerResponse.json();
    expect(ledger.version).toBe('2026.06.08-proof-ledger-v1');
    expect(ledger.owner).toBe('user');
    expect(ledger.chainHead).toMatch(/^sha256:/);
    expect(ledger.entries.length).toBeGreaterThanOrEqual(9);
    expect(ledger.entries.at(-1).hash).toBe(ledger.chainHead);
    expect(ledger.entries.some((entry: { id: string }) => entry.id === 'critique.system_self_transparency')).toBeTruthy();
    expect(ledger.entries.some((entry: { id: string }) => entry.id === 'revocation.public_cascade_contract')).toBeTruthy();
    expect(ledger.entries.some((entry: { id: string }) => entry.id === 'identity.public_doctrine_vector')).toBeTruthy();

    const markdownLedgerResponse = await page.request.get('/api/mirror/proof-ledger?format=markdown');
    expect(markdownLedgerResponse.ok()).toBeTruthy();
    const markdownLedger = await markdownLedgerResponse.text();
    expect(markdownLedger).toContain('Active Mirror Public-Safe Proof Ledger');
    expect(markdownLedger).toContain('Chain head: sha256:');

    const critiqueResponse = await page.request.get('/api/mirror/critique');
    expect(critiqueResponse.ok()).toBeTruthy();
    const critique = await critiqueResponse.json();
    expect(critique.version).toBe('2026.06.08-decision-critique-v1');
    expect(critique.coveredFailureClass).toBe('hidden system failure stream');
    expect(critique.events.some((event: { systemAdmission: string }) => event.systemAdmission.includes('body_unavailable'))).toBeTruthy();

    const critiqueNdjsonResponse = await page.request.get('/api/mirror/critique?format=ndjson');
    expect(critiqueNdjsonResponse.ok()).toBeTruthy();
    const critiqueNdjson = await critiqueNdjsonResponse.text();
    expect(critiqueNdjson).toContain('critique.body_unavailable');

    const revocationResponse = await page.request.get('/api/mirror/revocation-cascade');
    expect(revocationResponse.ok()).toBeTruthy();
    const revocation = await revocationResponse.json();
    expect(revocation.version).toBe('2026.06.08-revocation-cascade-v1');
    expect(revocation.coveredFailureClass).toBe('revocation cascade opacity');
    expect(revocation.privateEnforcement).toBe('body_required');

    const identityResponse = await page.request.get('/api/mirror/identity-continuity');
    expect(identityResponse.ok()).toBeTruthy();
    const identity = await identityResponse.json();
    expect(identity.version).toBe('2026.06.08-identity-continuity-v1');
    expect(identity.privateUserContinuityScore).toBeNull();
    expect(identity.crossModelDiff.requiredReceipt).toBe('signed_model_swap_identity_receipt');
  });

  test('body receipt bridge is public-readable and write-gated by default', async ({ page }) => {
    const bodyReceiptResponse = await page.request.get('/api/mirror/body-receipt');
    expect(bodyReceiptResponse.ok()).toBeTruthy();
    const bodyReceipt = await bodyReceiptResponse.json();
    expect(bodyReceipt.version).toBe('2026.06.08-body-receipt-bridge-v1');
    expect(bodyReceipt.status).toBe('missing');
    expect(bodyReceipt.note).toContain('No accepted public body receipt');

    const postResponse = await page.request.post('/api/mirror/body-receipt', {
      data: {
        schemaVersion: 'active_mirror.body_public_receipt.v1',
        receiptId: 'am-body-test-20260608T171438Z',
        issuedAt: '2026-06-08T17:14:38Z',
        bodyState: 'online',
        sourceState: 'public_safe_sync',
      },
    });
    expect(postResponse.status()).toBe(503);
    const postBody = await postResponse.json();
    expect(postBody.status).toBe('sync_not_configured');
  });

  test('front door route requires a real target before generation', async ({ page }) => {
    await page.goto('/?qa=1');

    await page.getByRole('button', { name: /Research or prove/i }).click();
    await page.getByRole('button', { name: /Generate surface/i }).click();

    await expect(page.getByText(/Add the actual target first/i)).toBeVisible();
    await expect(page.getByText('Generated Workspace', { exact: true })).toHaveCount(0);
  });

  test('official demo route opens a product workspace without private setup leakage', async ({ page }) => {
    await page.goto('/?qa=1');

    await page.getByTestId('qa-test-strip').getByRole('button', { name: 'Demo', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Official Product Demo Workspace' }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Demo Control Room' }).first()).toBeVisible();
    await expect(page.getByText('First Useful Artifact', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Official Demo One-Pager' }).first()).toBeVisible();
    await expect(page.getByText('Proof + Next Step').first()).toBeVisible();
    await expect(page.getByText('Downloadable Export Pack', { exact: true })).toHaveCount(0);
    await expect(page.getByText(/private implementation/i)).toHaveCount(0);
    await expect(page.getByText(/plumbing/i)).toHaveCount(0);
  });

  test('local supervisor route gates frontier model as proposer only', async ({ page }) => {
    await page.goto('/?qa=1');

    const textarea = page.locator('textarea').first();
    await textarea.fill('Wrap and gate a local deterministic model that manages the frontier model in Active Mirror with doctrine, provenance, approvals, and receipts.');
    await textarea.press('Enter');

    await expect(page.getByRole('heading', { name: 'Governed GenUI Workbench' }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Local Supervisor Route', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Local Gate Contract', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('frontier_proposer').first()).toBeVisible();
    await expect(page.getByText('proposer_only').first()).toBeVisible();
    await expect(page.getByText('Probabilistic output cannot promote facts').first()).toBeVisible();
    await expect(page.getByText('Blocked routes must not dead-end').first()).toBeVisible();
  });

  test('ux feedback opens repair workspace instead of generic filler', async ({ page }) => {
    await page.goto('/?qa=1');

    const textarea = page.locator('textarea').first();
    await textarea.fill('this looks difficult to use');
    await textarea.press('Enter');

    await expect(page.getByRole('heading', { name: 'UX Repair Workspace' }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Usability Fix Board' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'UX Repair One-Pager' }).first()).toBeVisible();
    await expect(page.getByText('Proof + Next Step').first()).toBeVisible();
    await expect(page.getByText('Request desk')).toHaveCount(0);
    await expect(page.getByText('Working surface')).toHaveCount(0);
  });

  test('build prompt opens client intake builder instead of official demo', async ({ page }) => {
    await page.goto('/?qa=1');

    const textarea = page.locator('textarea').first();
    await textarea.fill('Build me a client intake workspace for a boutique AI consulting firm. It should collect goals, files, approvals, and produce a 72-hour demo scope.');
    await textarea.press('Enter');

    await expect(page.getByRole('heading', { name: 'Client Intake Workspace' }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Intake Form Builder' }).first()).toBeVisible();
    await expect(page.getByText('Client Intake Pack', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Handoff pack', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Official Product Demo Workspace' })).toHaveCount(0);
  });

  test('scattered prompt opens finish mode with one artifact and parked ideas', async ({ page }) => {
    await page.goto('/?qa=1');

    const textarea = page.locator('textarea').first();
    await textarea.fill('I have too many Active Mirror ideas and I am scattered. Help me finish one useful artifact now, park the rest, and give me the next action.');
    await textarea.press('Enter');

    await expect(page.getByRole('heading', { name: 'Finish Mode Workspace' }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Finish Board' }).first()).toBeVisible();
    await expect(page.getByText('Finished Artifact', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Parked ideas', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Live Workspace Preview' })).toHaveCount(0);
  });

  test('public-sector proof prompt opens evidence desk without generated scores', async ({ page }) => {
    await page.goto('/?qa=1');

    const textarea = page.locator('textarea').first();
    await textarea.fill('Prepare a GCC public-sector AI evidence brief. Compare digital identity and service-delivery programs, separate facts from assumptions and unknowns, and show a procurement-ready next step.');
    await textarea.press('Enter');

    await expect(page.getByRole('heading', { name: 'Public-Sector Evidence Desk' }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Evidence Desk' }).first()).toBeVisible();
    await expect(page.getByText('Evidence Brief', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Facts', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Assumptions', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Unknowns', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Generated Signal Map', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Demand signal')).toHaveCount(0);
  });

  test('generates a spec workspace and downloads the pack', async ({ page }) => {
    await page.goto('/?qa=1');

    await expect(page.getByRole('heading', { name: 'Active Mirror', exact: true })).toBeVisible();
    await expect(page.getByTestId('qa-test-strip')).toBeVisible();

    await page.getByTestId('qa-test-strip').getByRole('button', { name: 'Spec', exact: true }).click();

    await expect(page.getByText('Generated Workspace', { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Working Spec', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Working Demo Spec' }).first()).toBeVisible();
    await expect(page.getByText('Proof + Next Step').first()).toBeVisible();
    await expect(page.getByText('Capability Dock', { exact: true })).toHaveCount(0);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download pack/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/active-mirror-workspace-pack/i);

    const path = await download.path();
    expect(path).toBeTruthy();
    const content = await readFile(path as string, 'utf8');
    expect(content).toContain('Active Mirror Workspace Pack');
    expect(content).toContain('Working Demo Spec');
  });

  test('typed research prompt opens source and chart lanes', async ({ page }) => {
    await page.goto('/?qa=1');

    const textarea = page.locator('textarea').first();
    await textarea.fill('Research generated UI browser OS trends and show a chart with source assumptions.');
    await textarea.press('Enter');

    await expect(page.getByRole('heading', { name: 'Research Browser Workspace' }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Evidence Brief', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Generated Signal Map', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Proof + Next Step').first()).toBeVisible();
  });

  test('mobile front door uses compact capture flow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 820 });
    await page.goto('/?qa=1');

    await expect(page.getByTestId('mobile-front-door')).toBeVisible();
    await expect(page.getByTestId('desktop-front-door')).toBeHidden();
    await expect(page.getByText('Pocket capture')).toBeVisible();
    await expect(page.getByTestId('mobile-trust-strip')).toBeVisible();

    await page.getByTestId('mobile-route-research-prove').click();
    await page.getByRole('button', { name: /Generate surface/i }).click();
    await expect(page.getByText(/Add the actual target first/i)).toBeVisible();
    await expect(page.getByText('Generated Workspace', { exact: true })).toHaveCount(0);
  });

  test('mobile viewport keeps generated workspace readable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 820 });
    await page.goto('/?qa=1');

    const textarea = page.locator('textarea').first();
    await textarea.fill('Create an automation that watches my website and emails me if it breaks.');
    await textarea.press('Enter');

    const workspaceChrome = page.getByText('Generated Workspace', { exact: true });
    await expect(workspaceChrome).toBeVisible({ timeout: 30_000 });
    await workspaceChrome.scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: /active:\/\/generated\/automation-builder-workspace/i }).first()).toBeVisible();
    await expect(page.getByText('First Useful Artifact', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Proof + Next Step').first()).toBeVisible();
    await expect(page.getByText('Capability Dock', { exact: true })).toHaveCount(0);
  });

  test('mobile finish mode shows the generated surface, not only the chat receipt', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 820 });
    await page.goto('/?qa=1');

    const textarea = page.locator('textarea').first();
    await textarea.fill('I have too many Active Mirror ideas and I am scattered. Help me finish one useful artifact now, park the rest, and give me the next action.');
    await textarea.press('Enter');

    await expect(page.getByRole('heading', { name: 'Finish Mode Workspace' }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Finish Board' }).first()).toBeVisible();
    await expect(page.getByText('Parked ideas', { exact: true }).first()).toBeVisible();
  });
});
