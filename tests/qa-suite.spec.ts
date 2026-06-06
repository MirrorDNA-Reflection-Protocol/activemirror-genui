import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.describe('Active Mirror public GenUI', () => {
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
});
