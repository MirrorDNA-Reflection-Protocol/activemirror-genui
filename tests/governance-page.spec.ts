import { expect, test } from '@playwright/test';

test.describe('Governance route', () => {
  test('shows the route, controls, receipts, and bounded references', async ({ page }) => {
    await page.goto('/governance');

    await expect(page.getByRole('heading', { name: 'AI result is not enough. Show the route.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The route is the product control.' })).toBeVisible();
    await expect(page.getByText('what source supported it')).toBeVisible();

    for (const label of ['Route', 'Source', 'Consent', 'Approvals', 'Receipts']) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }

    await expect(page.getByText('not a claim of legal certification or formal framework certification')).toBeVisible();
    await expect(page.getByText(/do not mean Active Mirror or AIndia is certified/)).toBeVisible();

    await expect(page.getByRole('link', { name: 'India Digital Personal Data Protection Act, 2023' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Digital Personal Data Protection Rules, 2025' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'NIST AI Risk Management Framework 1.0' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Model Context Protocol specification' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'C2PA technical specification' })).toBeVisible();
  });
});
