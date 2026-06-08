import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.describe('Active Mirror public GenUI', () => {
  test('front door exposes MirrorKernel as a redacted trust runtime surface', async ({ page }) => {
    await page.goto('/?qa=1');

    const kernel = page.getByTestId('mirrorkernel-proof');
    await expect(kernel).toBeVisible();
    await expect(kernel).toContainText('MirrorKernel');
    await expect(kernel).toContainText('Trust by Design control layer');
    await expect(kernel).toContainText('proposer only');
    await expect(page.getByText('/Users/mirror-pro')).toHaveCount(0);

    const response = await page.request.get('/api/mirror/kernel');
    expect(response.ok()).toBeTruthy();
    const status = await response.json();
    expect(status.name).toBe('MirrorKernel');
    expect(status.privacyBoundary).toContain('redacted');
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

    await expect(page.getByText('Generated Workspace')).toBeVisible({ timeout: 30_000 });
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
