import { expect, test } from "@playwright/test";
import {
  aindiaDeviceCapabilityPassport,
  getAIndiaCapability,
} from "../src/lib/aindia/deviceCapabilityPassport";

test.describe("AIndia device capability passport", () => {
  test("keeps support labels honest and copy-safe", () => {
    expect(aindiaDeviceCapabilityPassport.schema).toBe("aindia-device-capability-passport-v1");
    expect(aindiaDeviceCapabilityPassport.capabilities).toHaveLength(6);
    expect(aindiaDeviceCapabilityPassport.copyBoundary).toContain("honest capability checks");

    const pwa = getAIndiaCapability("pwa-offline-shell");
    expect(pwa.supportStatus).toBe("mvp-ready");
    expect(pwa.cannotPromise).toContain("Full offline LLM on every phone");

    const android = getAIndiaCapability("android-mlkit-aicore");
    expect(android.copySafeStatus).toContain("Supported Android devices only");
    expect(android.cannotPromise).toContain("GrapheneOS AICore availability");

    const ios = getAIndiaCapability("ios-foundation-models");
    expect(ios.copySafeStatus).toContain("not callable from the PWA");

    const browser = getAIndiaCapability("browser-webgpu-webnn");
    expect(browser.supportStatus).toBe("limited-browser-support");
    expect(browser.mustCheck).toContain("navigator.gpu");

    const fallback = getAIndiaCapability("sarvam-bhashini-server-fallback");
    expect(fallback.copySafeStatus).toContain("user approves upload");

    const share = getAIndiaCapability("whatsapp-share-intent");
    expect(share.supportStatus).toBe("roadmap");
    expect(share.cannotPromise).toContain("Reading WhatsApp in the background");
  });

  test("keeps the share roadmap user-initiated and phased", () => {
    expect(aindiaDeviceCapabilityPassport.shareTargetRoadmap.map((item) => item.phase)).toEqual([
      "now",
      "next",
      "native-wrapper",
      "native-wrapper",
      "future",
    ]);

    const shareTarget = aindiaDeviceCapabilityPassport.shareTargetRoadmap.find(
      (item) => item.id === "whatsapp-share-intent",
    );
    expect(shareTarget?.copySafeLabel).toContain("when you choose");
    expect(shareTarget?.consentBoundary).toContain("never claim background WhatsApp access");
  });
});
