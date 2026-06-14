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
    aindiaRoute: false,
    governanceRoute: false,
    trustManifest: false,
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

  await page.waitForSelector(".amr .h-display", { timeout: 15_000 });
  const landing = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const compactText = bodyText.replace(/\s+/g, " ");
    const normalizedText = bodyText.toLowerCase();
    return {
      frontDoor: compactText.includes("You ask. Active Mirror checks.") &&
        compactText.includes("Most AI gives an answer. Active Mirror checks") &&
        Boolean(document.querySelector('[aria-label="Choose your Active Mirror route"]')) &&
        compactText.includes("Check a message, form, or photo.") &&
        compactText.includes("Turn AI work into something reviewable.") &&
        compactText.includes("No silent upload") &&
        compactText.includes("Sources and gaps shown") &&
        compactText.includes("All the familiar AI work, wrapped with checks.") &&
        compactText.includes("Open AIndia") &&
        compactText.includes("Bring one workflow") &&
        normalizedText.includes("20-second walkthrough") &&
        compactText.includes("Get the thing, not a chat transcript.") &&
        normalizedText.includes("active mirror control map") &&
        compactText.includes("Map my AI architecture") &&
        compactText.includes("Pick the result you want first.") &&
        normalizedText.includes("send data-sharing request to vendor a") &&
        Boolean(document.querySelector('video source[src="/media/show-the-work.mp4"]')) &&
        document.querySelector("video.proof-video")?.getAttribute("poster") === "/media/show-the-work-poster.jpg" &&
        Boolean(document.querySelector(".amr #brief")),
      hasInput: Boolean(document.querySelector("textarea, input")),
      aindiaHref: document.querySelector('a[href="/aindia"]')?.getAttribute("href") || "",
      sprintHref: document.querySelector('a[href="/intake?focus=pilot"]')?.getAttribute("href") || "",
      workspaceHref: document.querySelector('a[href="/mirror"]')?.getAttribute("href") || "",
      proofArtifact: Boolean(document.querySelector(".amr #brief")),
      privatePathLeak: bodyText.includes("/Users/mirror-pro"),
    };
  });
  receipt.checks.landingFrontDoor = landing.frontDoor &&
    landing.proofArtifact &&
    landing.aindiaHref === "/aindia" &&
    landing.sprintHref === "/intake?focus=pilot" &&
    landing.workspaceHref === "/mirror";
  receipt.checks.landingStatic = !landing.hasInput;

  const manifestResponse = await context.request.get(`${baseUrl}/.well-known/active-mirror.json`);
  if (manifestResponse.ok()) {
    const manifest = await manifestResponse.json();
    receipt.checks.trustManifest = manifest?.brand?.name === "Active Mirror" &&
      manifest?.products?.some((product) => product.name === "AIndia" && /voice-first, picture-first/.test(product.description || "")) &&
      manifest?.proofEndpoints?.some((endpoint) => endpoint.url === "https://activemirror.ai/api/aindia/contracts");
  }

  await page.goto(`${baseUrl}/aindia?qa=canary`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForSelector("main", { timeout: 15_000 });
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await page.getByTestId("aindia-message-action").click({ force: true });
  await page.waitForFunction(() => document.body.innerText.includes("Message padh liya."), null, { timeout: 15_000 });
  await page.getByText("Kaise check hua?").click();
  await page.getByRole("button", { name: "Show receipt" }).click();
  await page.getByRole("dialog", { name: "Trust receipts" }).waitFor({ timeout: 15_000 });
  const aindia = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const compactText = bodyText.replace(/\s+/g, " ");
    return {
      route: compactText.includes("Jawab source ke saath. Aapki bhasha mein.") &&
        compactText.includes("Trust receipts") &&
        compactText.includes("No cloud call in this demo") &&
        compactText.includes("Device passport") &&
        compactText.includes("फ़ोटो भेजो") &&
        compactText.includes("मैसेज भेजो") &&
        compactText.includes("Local supervisor, Sarvam language rail"),
      privatePathLeak: bodyText.includes("/Users/mirror-pro"),
    };
  });
  receipt.checks.aindiaRoute = aindia.route;

  await page.goto(`${baseUrl}/governance?qa=canary`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForSelector("main", { timeout: 15_000 });
  const governance = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const compactText = bodyText.replace(/\s+/g, " ");
    return {
      route: compactText.includes("AI result is not enough. Show the route.") &&
        compactText.includes("The route is the product control.") &&
        compactText.includes("Five things a buyer should inspect.") &&
        compactText.includes("Open AIndia") &&
        compactText.includes("Inspect contracts"),
      privatePathLeak: bodyText.includes("/Users/mirror-pro"),
    };
  });
  receipt.checks.governanceRoute = governance.route;

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
  receipt.checks.noPrivatePathLeak = !landing.privatePathLeak && !aindia.privatePathLeak && !governance.privatePathLeak && !rendered.privatePathLeak;

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
