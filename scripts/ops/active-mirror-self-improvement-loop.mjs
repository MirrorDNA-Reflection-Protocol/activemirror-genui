#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, "output");
const receiptPath = path.join(outputDir, "active-mirror-self-improvement-loop-latest.json");
const reportPath = path.join(outputDir, "active-mirror-self-improvement-loop-latest.md");
const target = argValue("--target") || process.env.ACTIVEMIRROR_LOOP_TARGET || "local";
const level = argValue("--level") || process.env.ACTIVEMIRROR_LOOP_LEVEL || "smoke";
const includeBrowser = hasArg("--browser") || process.env.ACTIVEMIRROR_LOOP_BROWSER === "1";
const baseUrl = argValue("--url") || process.env.ACTIVEMIRROR_LOOP_BASE_URL || (target === "public" ? "https://www.activemirror.ai" : "http://127.0.0.1:3456");
const failFast = !hasArg("--no-fail-fast");
const generatedAt = new Date().toISOString();
const timeoutMs = Number(process.env.ACTIVEMIRROR_LOOP_COMMAND_TIMEOUT_MS || 1_200_000);

const requiredFiles = [
  "package.json",
  "scripts/ops/healthcheck.sh",
  "scripts/ops/browser-canary.mjs",
  "scripts/ops/active-mirror-ml-loop-registry.mjs",
  "tests/qa-suite.spec.ts",
  "tests/body-receipt-signature.spec.ts",
];

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function hasArg(name) {
  return process.argv.includes(name);
}

function tail(value, max = 4000) {
  const text = String(value || "");
  return text.length > max ? text.slice(text.length - max) : text;
}

function runCommand(id, command, args, options = {}) {
  const startedAt = Date.now();
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: { ...process.env, ...(options.env || {}) },
    encoding: "utf8",
    timeout: options.timeout ?? timeoutMs,
    maxBuffer: options.maxBuffer ?? 80 * 1024 * 1024,
  });
  return {
    id,
    kind: "command",
    command: [command, ...args].join(" "),
    ok: result.status === 0,
    exit_code: result.status,
    signal: result.signal || "",
    duration_ms: Date.now() - startedAt,
    stdout_tail: tail(result.stdout),
    stderr_tail: tail(result.stderr),
    error: result.error ? result.error.message : "",
  };
}

function requiredFileStep() {
  const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(repoRoot, file)));
  return {
    id: "required_files",
    kind: "preflight",
    ok: missing.length === 0,
    required_files: requiredFiles,
    missing,
  };
}

function packageScriptStep() {
  const requiredScripts = ["lint", "typecheck", "build", "ops:health", "ops:browser-canary", "ml:loops"];
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const missing = requiredScripts.filter((script) => !pkg.scripts?.[script]);
  return {
    id: "package_scripts",
    kind: "preflight",
    ok: missing.length === 0,
    required_scripts: requiredScripts,
    missing,
  };
}

function firstFailure(steps) {
  return steps.find((step) => !step.ok && step.required_for_pass !== false) || null;
}

function nextSliceFor(failure) {
  if (!failure) return "No patch slice. All enforced gates passed.";
  if (failure.id === "required_files") return `Restore missing files: ${failure.missing.join(", ")}`;
  if (failure.id === "package_scripts") return `Restore missing package scripts: ${failure.missing.join(", ")}`;
  if (failure.id === "lint") return "Patch the first ESLint failure only.";
  if (failure.id === "typecheck") return "Patch the first TypeScript contract failure only.";
  if (failure.id === "build") return "Patch the first production build failure only.";
  if (failure.id === "ml_loop_registry") return "Patch the first failing ML loop signal only.";
  if (failure.id === "ops_health") return "Patch the first public/local product health contract failure only.";
  if (failure.id === "browser_canary") return "Patch the first browser-rendered canary failure only.";
  return `Patch failing step ${failure.id} only.`;
}

function renderMarkdown(receipt) {
  const lines = [
    "# Active Mirror Self-Improvement Loop",
    "",
    `- Status: ${receipt.status.toUpperCase()}`,
    `- Target: ${receipt.target}`,
    `- Level: ${receipt.level}`,
    `- Base URL: ${receipt.base_url}`,
    `- Browser proof: ${receipt.include_browser ? "yes" : "no"}`,
    `- Generated: ${receipt.generated_at}`,
    `- Next slice: ${receipt.next_slice}`,
    "",
    "| Step | Status | Duration |",
    "| --- | --- | ---: |",
  ];
  for (const step of receipt.steps) {
    lines.push(`| ${step.id} | ${step.ok ? "PASS" : "FAIL"} | ${step.duration_ms ? `${(step.duration_ms / 1000).toFixed(1)}s` : ""} |`);
  }
  if (receipt.failures.length) {
    const failure = receipt.failures[0];
    lines.push("", "## First Failure", "");
    lines.push(`- Step: \`${failure.id}\``);
    if (failure.command) lines.push(`- Command: \`${failure.command}\``);
    if (failure.stderr_tail) lines.push("", "```text", failure.stderr_tail.slice(-1800), "```");
    if (failure.stdout_tail) lines.push("", "```text", failure.stdout_tail.slice(-1800), "```");
  }
  lines.push("", "## Loop Law", "");
  lines.push("Patch only the first failing slice. Rerun this loop. Do not share a public proof claim unless this receipt is PASS.");
  return `${lines.join("\n")}\n`;
}

function run() {
  fs.mkdirSync(outputDir, { recursive: true });
  const steps = [];
  steps.push(requiredFileStep());
  steps.push(packageScriptStep());
  steps.push(runCommand("git_status", "git", ["status", "--short", "--branch"], { timeout: 60_000 }));
  steps.push(runCommand("node_version", "node", ["--version"], { timeout: 30_000 }));
  steps.push(runCommand("npm_version", "npm", ["--version"], { timeout: 30_000 }));

  let failure = firstFailure(steps);
  if (!failure || !failFast) steps.push(runCommand("lint", "npm", ["run", "lint"], { timeout: 600_000 }));
  failure = firstFailure(steps);
  if (!failure || !failFast) steps.push(runCommand("typecheck", "npm", ["run", "typecheck"], { timeout: 600_000 }));
  failure = firstFailure(steps);
  if (!failure || !failFast) steps.push(runCommand("build", "npm", ["run", "build"], { timeout: 1_200_000 }));
  failure = firstFailure(steps);
  if (!failure || !failFast) steps.push(runCommand("ml_loop_registry", "npm", ["run", "ml:loops"], { timeout: 300_000 }));
  failure = firstFailure(steps);
  if ((!failure || !failFast) && target === "public") {
    steps.push(runCommand("ops_health", "npm", ["run", "ops:health", "--", baseUrl], { timeout: 300_000 }));
  }
  failure = firstFailure(steps);
  if ((!failure || !failFast) && includeBrowser) {
    steps.push(runCommand("browser_canary", "npm", ["run", "ops:browser-canary", "--", baseUrl], {
      env: {
        ACTIVEMIRROR_BROWSER_CANARY_URL: baseUrl,
        ACTIVEMIRROR_BROWSER_CANARY_SCREENSHOT: path.join(outputDir, "active-mirror-browser-canary-latest.png"),
      },
      timeout: 300_000,
    }));
  }

  const failures = steps.filter((step) => !step.ok && step.required_for_pass !== false);
  const receipt = {
    schema_version: "active_mirror.self_improvement_loop.v1",
    generated_at: generatedAt,
    target,
    level,
    base_url: baseUrl,
    include_browser: includeBrowser,
    fail_fast: failFast,
    status: failures.length ? "fail" : "pass",
    summary: {
      steps: steps.length,
      failures: failures.length,
    },
    invariant: "No public proof claim without a PASS receipt. Patch only the first failing slice, then rerun.",
    next_slice: nextSliceFor(failures[0]),
    steps,
    failures,
  };
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  fs.writeFileSync(reportPath, renderMarkdown(receipt));
  console.log(JSON.stringify({
    status: receipt.status,
    target,
    level,
    base_url: baseUrl,
    include_browser: includeBrowser,
    summary: receipt.summary,
    next_slice: receipt.next_slice,
    receipt: receiptPath,
    report: reportPath,
  }, null, 2));
  if (failures.length) process.exit(1);
}

run();
