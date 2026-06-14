import { expect, test } from "@playwright/test";

test.describe("MirrorProd India", () => {
  test("positions the route as micro-drama training and education, not AIndia or SanatanaTech", async ({ page }) => {
    await page.goto("/mirrorprod-india");

    await expect(page.getByRole("heading", { name: "Training videos people actually finish" })).toBeVisible();
    await expect(page.getByText("Micro-drama training", { exact: true })).toBeVisible();
    await expect(page.getByText("Customer education", { exact: true })).toBeVisible();
    await expect(page.getByText("Frontline enablement", { exact: true })).toBeVisible();
    await expect(page.getByText("Claim-checked", { exact: true })).toBeVisible();
    await expect(page.getByText("Micro-drama lesson plus educational material pack")).toBeVisible();
    await expect(page.getByText("SOP, product note, policy, deck, or voice note")).toBeVisible();

    const visibleText = await page.locator("body").innerText();
    expect(visibleText).not.toContain("AIndia");
    expect(visibleText).not.toContain("SanatanaTech");
    expect(visibleText).not.toContain("Sanātana");
  });

  test("keeps the mobile page readable without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 820 });
    await page.goto("/mirrorprod-india");

    await expect(page.getByRole("heading", { name: "Training videos people actually finish" })).toBeVisible();
    await expect(page.getByText("Micro-drama lesson plus educational material pack")).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  });
});
