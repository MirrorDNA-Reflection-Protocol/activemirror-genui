#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, "output");
const receiptPath = path.join(outputDir, "active-mirror-ml-loop-registry-latest.json");
const reportPath = path.join(outputDir, "active-mirror-ml-loop-registry-latest.md");
const generatedAt = new Date().toISOString();

const localFiles = {
  packageJson: "package.json",
  browserCanary: "scripts/ops/browser-canary.mjs",
  healthcheck: "scripts/ops/healthcheck.sh",
  deployHetzner: "scripts/ops/deploy-hetzner.sh",
  watchdog: "scripts/ops/activemirror-genui-watchdog.sh",
  playwrightConfig: "playwright.config.ts",
  qaSuite: "tests/qa-suite.spec.ts",
  signatureTest: "tests/body-receipt-signature.spec.ts",
};

const loops = [
  {
    id: "public_surface_canary",
    family: "route_classifier",
    purpose: "Verify root, /mirror, trust, compare, glass, intake, and public API route contracts.",
    signals: ["healthcheck", "browserCanary", "qaSuite"],
    gate: "200 is not enough; buyer-facing markers and API schemas must be present.",
  },
  {
    id: "service_worker_controller",
    family: "browser_state_detector",
    purpose: "Detect whether the public app is actually service-worker controlled in browser state.",
    signals: ["browserCanary"],
    gate: "HTTP sw.js is not green unless browser control is observed.",
  },
  {
    id: "stream_contract_evaluator",
    family: "protocol_classifier",
    purpose: "Verify /api/mirror/stream emits generated workspace envelopes.",
    signals: ["healthcheck", "qaSuite"],
    gate: "A chat endpoint is not acceptable without workspace stream envelopes.",
  },
  {
    id: "proof_ledger_consistency",
    family: "consistency_checker",
    purpose: "Compare proof ledger, chain head, body receipt, contracts, and runtime proof panels.",
    signals: ["healthcheck", "qaSuite", "signatureTest"],
    gate: "Proof panels must reflect public-safe signed/system receipts.",
  },
  {
    id: "body_receipt_signature",
    family: "cryptographic_verifier",
    purpose: "Verify public body receipt signature payload and key metadata.",
    signals: ["signatureTest"],
    gate: "Public body state cannot be claimed without signature validation.",
  },
  {
    id: "local_operator_policy",
    family: "policy_classifier",
    purpose: "Ensure local operator compiles approved context and rejects private material.",
    signals: ["qaSuite", "healthcheck"],
    gate: "Private vault ingest remains private-body-only.",
  },
  {
    id: "private_path_leak_detector",
    family: "safety_classifier",
    purpose: "Detect local paths, private file names, and operator internals in the public UI.",
    signals: ["browserCanary", "qaSuite"],
    gate: "No /Users/mirror-pro or private body paths can appear publicly.",
  },
  {
    id: "front_door_relevance_ranker",
    family: "ranking_model",
    purpose: "Rank homepage claims by buyer clarity, proof artifact visibility, and actionability.",
    signals: ["healthcheck", "browserCanary"],
    gate: "Homepage must show the work, not a generic AI landing page.",
  },
  {
    id: "mirror_route_workflow_gate",
    family: "interaction_model",
    purpose: "Verify /mirror opens the Work OS stage with memory, route, runtime, and approval controls.",
    signals: ["browserCanary", "qaSuite"],
    gate: "The product route must be usable, not just reachable.",
  },
  {
    id: "manifest_pwa_loop",
    family: "pwa_contract_checker",
    purpose: "Check manifest, icons, service worker registration, and install-surface consistency.",
    signals: ["browserCanary"],
    gate: "PWA claims require manifest and service worker proof.",
  },
  {
    id: "model_health_drift_loop",
    family: "time_series_monitor",
    purpose: "Watch /api/mirror/model-health for active order, sensitive route flags, and drift.",
    signals: ["healthcheck"],
    gate: "Model routing health must be public-safe and current.",
  },
  {
    id: "ratchet_regression_loop",
    family: "regression_detector",
    purpose: "Track MirrorRatchet coverage and fail when frontier failure coverage regresses.",
    signals: ["healthcheck"],
    gate: "Reliability proof must not move backward silently.",
  },
  {
    id: "lead_quality_loop",
    family: "text_classifier",
    purpose: "Classify leads into priority, fit, and follow-up packets without leaking private assumptions.",
    signals: ["qaSuite"],
    gate: "Lead response packets must be deterministic and boundary-aware.",
  },
  {
    id: "deployment_parity_loop",
    family: "canary_classifier",
    purpose: "Compare build, local app, public app, browser proof, and deploy scripts before sharing.",
    signals: ["packageJson", "healthcheck", "browserCanary", "deployHetzner"],
    gate: "Local green cannot imply public green.",
  },
  {
    id: "watchdog_uptime_loop",
    family: "uptime_anomaly_detector",
    purpose: "Check watchdog coverage and ensure uptime proof is not just systemctl active.",
    signals: ["watchdog", "healthcheck"],
    gate: "A running process is not enough; the product contract must pass.",
  },
  {
    id: "copy_promise_guard",
    family: "claim_classifier",
    purpose: "Detect unsupported public claims and generic AI copy that outruns proof.",
    signals: ["healthcheck", "browserCanary"],
    gate: "No public claim without a route, receipt, or artifact backing it.",
  },
  {
    id: "accessibility_smoke_loop",
    family: "ui_quality_classifier",
    purpose: "Queue visual and accessibility checks for buttons, forms, routes, and mobile layout.",
    signals: ["browserCanary", "qaSuite"],
    gate: "Primary workflows must remain keyboard/click usable.",
  },
  {
    id: "api_schema_loop",
    family: "schema_validator",
    purpose: "Verify public API endpoints expose expected schema/version markers.",
    signals: ["healthcheck"],
    gate: "API shape drift requires a receipt before shipping.",
  },
  {
    id: "feedback_to_test_loop",
    family: "active_learning_sampler",
    purpose: "Turn user feedback into a failing canary or Playwright assertion before another redesign.",
    signals: ["qaSuite", "browserCanary"],
    gate: "Feedback becomes a test before becoming a redesign.",
  },
  {
    id: "repair_priority_ranker",
    family: "cost_impact_ranker",
    purpose: "Rank the next fix by public risk, proof severity, and verification cost.",
    signals: ["healthcheck", "browserCanary", "qaSuite"],
    gate: "Patch the smallest highest-impact failing slice first.",
  },
];

function fileProbe(filePath) {
  const absolute = path.join(repoRoot, filePath);
  try {
    const stat = fs.statSync(absolute);
    const text = stat.isFile() ? fs.readFileSync(absolute, "utf8") : "";
    return {
      ok: true,
      file: filePath,
      mtime: stat.mtime.toISOString(),
      age_ms: Math.round(Date.now() - stat.mtimeMs),
      bytes: stat.size,
      text,
    };
  } catch (error) {
    return { ok: false, file: filePath, error: error.message, text: "" };
  }
}

function packageScripts() {
  const pkg = fileProbe("package.json");
  if (!pkg.ok) return {};
  try {
    return JSON.parse(pkg.text).scripts || {};
  } catch {
    return {};
  }
}

function commandAvailable(command, args = ["--version"]) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: "utf8", timeout: 15_000 });
  return {
    command: [command, ...args].join(" "),
    ok: result.status === 0,
    stdout: String(result.stdout || "").trim().slice(0, 300),
    stderr: String(result.stderr || "").trim().slice(0, 300),
  };
}

function markersFor(loop, probes, scripts) {
  const text = loop.signals.map((name) => probes[name]?.text || "").join("\n");
  const markers = [];
  if (/serviceWorker|getRegistrations|sw\.js/i.test(text)) markers.push("service-worker");
  if (/api\/mirror\/stream|surfaceUpdate|beginRendering|dataModelUpdate/i.test(text)) markers.push("stream-contract");
  if (/body-receipt|ed25519|signature/i.test(text)) markers.push("signed-body-receipt");
  if (/local-operator|private_body_required|raw_vault_read/i.test(text)) markers.push("local-operator-boundary");
  if (/\/Users\/mirror-pro|privatePathLeak/i.test(text)) markers.push("private-path-check");
  if (/data-testid|work-os-stage|conversation-margin/i.test(text)) markers.push("rendered-workflow");
  if (scripts["ops:browser-canary"]) markers.push("browser-canary-script");
  if (scripts["ops:health"]) markers.push("health-script");
  return markers;
}

function assessLoop(loop, probes, scripts) {
  const missing = loop.signals.filter((name) => !probes[name]?.ok);
  const markers = markersFor(loop, probes, scripts);
  const hasEnoughSignal = markers.length > 0;
  const riskScore = missing.length * 25 + (hasEnoughSignal ? 0 : 15);
  return {
    id: loop.id,
    family: loop.family,
    purpose: loop.purpose,
    gate: loop.gate,
    signals: loop.signals,
    ok: missing.length === 0 && hasEnoughSignal,
    risk_score: riskScore,
    missing,
    markers,
  };
}

function nextExperiment(results) {
  const failing = results.filter((item) => !item.ok).sort((a, b) => b.risk_score - a.risk_score)[0];
  if (!failing) return "No failing loop. Next experiment is to run self:loop:public against the live URL and compare receipts.";
  if (failing.missing.length) return `Restore missing signal files for ${failing.id}: ${failing.missing.join(", ")}`;
  return `Add an explicit signal marker/test for ${failing.id}.`;
}

function renderMarkdown(receipt) {
  const lines = [
    "# Active Mirror ML Loop Registry",
    "",
    `- Status: ${receipt.status.toUpperCase()}`,
    `- Generated: ${receipt.generated_at}`,
    `- Loops: ${receipt.summary.loops}`,
    `- Failing loops: ${receipt.summary.failing}`,
    `- Next experiment: ${receipt.next_experiment}`,
    "",
    "| Loop | Family | Status | Risk | Markers |",
    "| --- | --- | --- | ---: | --- |",
  ];
  for (const loop of receipt.loops) {
    lines.push(`| ${loop.id} | ${loop.family} | ${loop.ok ? "PASS" : "FAIL"} | ${loop.risk_score} | ${loop.markers.join(", ")} |`);
  }
  lines.push("", "## Mutation Policy", "");
  lines.push("These loops classify, rank, queue, and gate. They do not deploy, restart production, train models, or write private memory.");
  return `${lines.join("\n")}\n`;
}

function run() {
  fs.mkdirSync(outputDir, { recursive: true });
  const probes = Object.fromEntries(Object.entries(localFiles).map(([name, file]) => [name, fileProbe(file)]));
  const scripts = packageScripts();
  const tools = {
    node: commandAvailable("node"),
    npm: commandAvailable("npm"),
  };
  const results = loops.map((loop) => assessLoop(loop, probes, scripts));
  const failing = results.filter((item) => !item.ok);
  const receipt = {
    schema_version: "active_mirror.ml_loop_registry.v1",
    generated_at: generatedAt,
    status: failing.length ? "fail" : "pass",
    summary: {
      loops: results.length,
      failing: failing.length,
      highest_risk: results.slice().sort((a, b) => b.risk_score - a.risk_score).slice(0, 5).map((item) => ({
        id: item.id,
        risk_score: item.risk_score,
      })),
    },
    next_experiment: nextExperiment(results),
    tools,
    scripts: Object.keys(scripts).sort(),
    files: Object.fromEntries(Object.entries(probes).map(([name, probe]) => [name, {
      ok: probe.ok,
      file: probe.file,
      mtime: probe.mtime,
      bytes: probe.bytes,
      error: probe.error,
    }])),
    loops: results,
  };
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  fs.writeFileSync(reportPath, renderMarkdown(receipt));
  console.log(JSON.stringify({
    status: receipt.status,
    summary: receipt.summary,
    next_experiment: receipt.next_experiment,
    receipt: receiptPath,
    report: reportPath,
  }, null, 2));
  if (receipt.status !== "pass") process.exit(1);
}

run();
