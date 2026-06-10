#!/usr/bin/env node
import { chromium } from "playwright";

process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY || "1";

const baseUrl = (process.argv[2] || process.env.ACTIVEMIRROR_BROWSER_CANARY_URL || "http://127.0.0.1:3456").replace(/\/$/, "");
const screenshotPath = process.env.ACTIVEMIRROR_BROWSER_CANARY_SCREENSHOT || "/tmp/activemirror-browser-canary.png";
const serviceWorkerTimeoutMs = Number(process.env.ACTIVEMIRROR_BROWSER_CANARY_SW_TIMEOUT_MS || 180_000);

function fail(receipt) {
  console.error(JSON.stringify({ ...receipt, status: "failed" }, null, 2));
  process.exit(1);
}

async function serviceWorkerSnapshot(page) {
  return page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) {
      return { supported: false, controller: false, registrations: [] };
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    return {
      supported: true,
      controller: Boolean(navigator.serviceWorker.controller),
      registrations: registrations.map((registration) => ({
        scope: registration.scope,
        active: Boolean(registration.active),
        installing: Boolean(registration.installing),
        waiting: Boolean(registration.waiting),
      })),
    };
  });
}

async function waitForServiceWorkerControl(page, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let snapshot = await serviceWorkerSnapshot(page);

  while (Date.now() < deadline) {
    if (snapshot.controller) return snapshot;
    if (snapshot.registrations.some((registration) => registration.active)) {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
    }
    await page.waitForTimeout(2_000);
    snapshot = await serviceWorkerSnapshot(page);
  }

  return snapshot;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  serviceWorkers: "allow",
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();

const receipt = {
  schemaVersion: "active_mirror.browser_canary.v1",
  generatedAt: new Date().toISOString(),
  baseUrl,
  screenshot: screenshotPath,
  checks: {
    root: false,
    landingFrontDoor: false,
    landingStatic: false,
    mirrorRoute: false,
    identityControls: false,
    reliabilityChecks: false,
    localOperatorControls: false,
    noPrivatePathLeak: false,
    serviceWorkerControlled: false,
  },
  serviceWorker: null,
};

try {
  await page.goto(`${baseUrl}/?qa=canary`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  receipt.checks.root = page.url().startsWith(baseUrl);

  await page.waitForSelector("[data-testid=front-door-panel]", { timeout: 15_000 });
  const landing = await page.evaluate(() => ({
    frontDoor: document.body.innerText.includes("Bring one AI workflow. Leave with a reviewable workspace.") &&
      document.body.innerText.includes("What should happen first?") &&
      document.body.innerText.includes("Try the public workspace") &&
      document.body.innerText.includes("Scope a real workflow") &&
      Boolean(document.querySelector("[data-testid=front-door-panel]")),
    hasInput: Boolean(document.querySelector("textarea, input")),
    sprintHref: document.querySelector('a[href="/intake?focus=pilot"]')?.getAttribute("href") || "",
    workspaceHref: document.querySelector('a[href="/mirror"]')?.getAttribute("href") || "",
    privatePathLeak: document.body.innerText.includes("/Users/mirror-pro"),
  }));
  receipt.checks.landingFrontDoor = landing.frontDoor && landing.sprintHref === "/intake?focus=pilot" && landing.workspaceHref === "/mirror";
  receipt.checks.landingStatic = !landing.hasInput;

  await page.goto(`${baseUrl}/mirror?qa=canary`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  receipt.checks.mirrorRoute = page.url().startsWith(`${baseUrl}/mirror`);
  await page.waitForSelector("[data-testid=work-os-stage]", { timeout: 15_000 });
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await page.click("[data-testid=runtime-btn]");
  await page.waitForSelector("[data-testid=mirrorkernel-proof]", { timeout: 15_000 });
  await page.waitForSelector("[data-testid=mirror-ratchet-proof]", { timeout: 15_000 });
  await page.waitForSelector("[data-testid=local-operator-contract]", { timeout: 15_000 });
  await page.screenshot({ path: screenshotPath, fullPage: true, timeout: 60_000 });

  const rendered = await page.evaluate(() => ({
    identityControls: document.body.innerText.includes("Identity controls"),
    reliabilityChecks: document.body.innerText.includes("Reliability checks"),
    localOperatorControls: document.body.innerText.includes("Local operator") &&
      document.body.innerText.includes("/api/mirror/local-operator"),
    privatePathLeak: document.body.innerText.includes("/Users/mirror-pro"),
  }));
  receipt.checks.identityControls = rendered.identityControls;
  receipt.checks.reliabilityChecks = rendered.reliabilityChecks;
  receipt.checks.localOperatorControls = rendered.localOperatorControls;
  receipt.checks.noPrivatePathLeak = !landing.privatePathLeak && !rendered.privatePathLeak;

  receipt.serviceWorker = await waitForServiceWorkerControl(page, serviceWorkerTimeoutMs);
  receipt.checks.serviceWorkerControlled = Boolean(receipt.serviceWorker.controller);

  await browser.close();

  const failedCheck = Object.entries(receipt.checks).find(([, passed]) => !passed);
  if (failedCheck) {
    fail({ ...receipt, failedCheck: failedCheck[0] });
  }

  console.log(JSON.stringify({ ...receipt, status: "passed" }, null, 2));
} catch (error) {
  await browser.close();
  fail({
    ...receipt,
    error: error instanceof Error ? error.message : String(error),
  });
}
