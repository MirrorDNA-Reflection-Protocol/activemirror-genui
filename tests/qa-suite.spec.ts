import { test, expect } from '@playwright/test';

test.describe('Active Mirror - E2E QA Suite', () => {

  test('Should pass Biometric Authentication on load', async ({ page }) => {
    await page.goto('/');
    
    // We will just wait for the final clearance state, as initial states may render too quickly.
    // Eventually it should grant clearance
    await expect(page.locator('text=CLEARANCE GRANTED: MD')).toBeVisible({ timeout: 5000 });

    // After auth is complete, the auth screen unmounts, revealing the dashboard.
    // Wait for the auth overlay to disappear
    await expect(page.locator('text=CLEARANCE GRANTED: MD')).toBeHidden({ timeout: 5000 });

    // Verify main UI is visible
    await expect(page.getByRole('heading', { name: 'Active Mirror' })).toBeVisible();
  });

  test('Should handle valid AI prompts and render cards', async ({ page }) => {
    await page.goto('/');
    
    // Wait for biometric auth to complete
    await expect(page.locator('text=CLEARANCE GRANTED: MD')).toBeHidden({ timeout: 10000 });

    // Wait for the biometric auth flow to finish OR bypass it
    const consentButton = page.locator('button', { hasText: 'I Consent' });
    
    // The consent button takes a few seconds to appear due to the animation
    await consentButton.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    
    if (await consentButton.isVisible()) {
      await consentButton.click();
    }
      const queryPrompt = page.getByPlaceholder('Ask anything...').first();
      await queryPrompt.fill('Give me a detailed overview of the system architecture');
      await queryPrompt.press('Enter');

    // After prompt submission, we should see the loader and then generated content
    await expect(page.locator('text=Establishing secure sovereign connection...')).toBeVisible();
    
    // The AI should respond and eventually the loader disappears
    await expect(page.locator('text=Establishing secure sovereign connection...')).toBeHidden({ timeout: 30000 });

    // Verify some surface content is rendered (the title)
    await expect(page.locator('h2')).toBeVisible({ timeout: 10000 });
  });

});
