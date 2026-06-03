import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.describe('Active Mirror public GenUI', () => {
  test('generates a spec workspace and downloads the pack', async ({ page }) => {
    await page.goto('/?qa=1');

    await expect(page.getByRole('heading', { name: 'Active Mirror' })).toBeVisible();
    await expect(page.getByTestId('qa-test-strip')).toBeVisible();

    await page.getByRole('button', { name: 'Spec' }).click();

    await expect(page.getByText('Generated Workspace')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Capability Dock')).toBeVisible();
    await expect(page.getByText('Downloadable Spec', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Working Demo Spec' }).first()).toBeVisible();

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
    await expect(page.getByText('Browser Source', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Chart Surface', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Generated Signal Map', { exact: true }).first()).toBeVisible();
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
    await expect(page.getByText('Capability Dock', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Automation Builder', { exact: true }).first()).toBeVisible();
  });
});
