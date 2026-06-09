"use client";

import { useMemo, useState } from "react";
import { trackSiteEvent } from "@/lib/siteAnalytics";

type IntakeState = "idle" | "sending" | "ready" | "error";

function fallbackMailto(form: Record<string, string>) {
  const subject = encodeURIComponent("Active Mirror 72-hour proof sprint request");
  const body = encodeURIComponent([
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Company: ${form.company}`,
    `Sensitivity: ${form.sensitivity}`,
    `Infrastructure: ${form.infrastructure}`,
    `Timeline: ${form.timeline}`,
    `Decision role: ${form.decisionRole}`,
    `Proof target: ${form.proofTarget}`,
    "",
    form.useCase,
  ].join("\n"));
  return `mailto:paul@activemirror.ai?subject=${subject}&body=${body}`;
}

export default function IntakeForm() {
  const [state, setState] = useState<IntakeState>("idle");
  const [error, setError] = useState("");
  const [mailto, setMailto] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    sensitivity: "public-safe first",
    infrastructure: "not sure yet",
    timeline: "this month",
    decisionRole: "I can sponsor or approve it",
    proofTarget: "",
    useCase: "",
  });

  const proofLine = useMemo(() => {
    if (state === "ready") return "Request captured. We review scoped workflows for fit before any follow-up.";
    if (state === "error") return "Capture did not complete. Open the prepared email instead.";
    return "No files uploaded. No account access, device access, or external send starts from this form.";
  }, [state]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");
    trackSiteEvent({
      event: "intake_submit",
      target: "lead_form",
      meta: {
        sensitivity: form.sensitivity,
        infrastructure: form.infrastructure,
        timeline: form.timeline,
        decisionRole: form.decisionRole,
        hasCompany: Boolean(form.company),
        hasProofTarget: Boolean(form.proofTarget.trim()),
        useCaseLengthBucket: form.useCase.length < 120 ? "short" : form.useCase.length < 500 ? "medium" : "long",
      },
    });
    const useCase = [
      form.useCase,
      "",
      `Sensitivity: ${form.sensitivity}`,
      `Infrastructure: ${form.infrastructure}`,
      `Timeline: ${form.timeline}`,
      `Decision role: ${form.decisionRole}`,
      `Proof target: ${form.proofTarget}`,
    ].join("\n");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, useCase }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Lead capture failed");
      setMailto(payload.mailto || fallbackMailto(form));
      setState("ready");
      trackSiteEvent({
        event: "intake_ready",
        target: "lead_form",
        meta: {
          sensitivity: form.sensitivity,
          infrastructure: form.infrastructure,
          timeline: form.timeline,
          decisionRole: form.decisionRole,
          deliveryStatus: payload.deliveryStatus,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lead capture failed");
      setMailto(fallbackMailto(form));
      setState("error");
      trackSiteEvent({
        event: "intake_error",
        target: "lead_form",
        meta: {
          sensitivity: form.sensitivity,
          infrastructure: form.infrastructure,
          timeline: form.timeline,
          decisionRole: form.decisionRole,
        },
      });
    }
  }

  function update(key: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
    };
  }

  return (
    <form className="intake" onSubmit={submit}>
      <div className="intake__grid">
        <label>
          <span>Name</span>
          <input value={form.name} onChange={update("name")} required />
        </label>
        <label>
          <span>Work email</span>
          <input type="email" value={form.email} onChange={update("email")} required />
        </label>
        <label>
          <span>Organization</span>
          <input value={form.company} onChange={update("company")} />
        </label>
        <label>
          <span>How sensitive is it?</span>
          <select value={form.sensitivity} onChange={update("sensitivity")}>
            <option>public-safe first</option>
            <option>private files involved</option>
            <option>regulated or confidential</option>
            <option>local-only required</option>
          </select>
        </label>
        <label>
          <span>Where should it run?</span>
          <select value={form.infrastructure} onChange={update("infrastructure")}>
            <option>not sure yet</option>
            <option>their cloud</option>
            <option>their on-prem/local machines</option>
            <option>Active Mirror managed pilot</option>
          </select>
        </label>
        <label>
          <span>When do you need it?</span>
          <select value={form.timeline} onChange={update("timeline")}>
            <option>this month</option>
            <option>this quarter</option>
            <option>researching</option>
            <option>urgent production issue</option>
          </select>
        </label>
        <label>
          <span>Who can move this forward?</span>
          <select value={form.decisionRole} onChange={update("decisionRole")}>
            <option>I can sponsor or approve it</option>
            <option>I can recommend it internally</option>
            <option>I am researching options</option>
            <option>I need help defining the owner</option>
          </select>
        </label>
      </div>
      <label className="intake__use">
        <span>What business workflow should Active Mirror help with?</span>
        <textarea
          value={form.useCase}
          onChange={update("useCase")}
          placeholder="Example: We need to prove a vendor decision before a board meeting, using public sources first and private files only after approval."
          required
        />
      </label>
      <label className="intake__use">
        <span>What would make the 72-hour proof worth paying attention to?</span>
        <textarea
          value={form.proofTarget}
          onChange={update("proofTarget")}
          placeholder="Example: a board-ready evidence workspace with source gaps, approval steps, and a deploy-or-don't recommendation."
        />
      </label>
      <div className="intake__proof" role="status" aria-live="polite">
        <span>⟡</span>
        <b>{proofLine}</b>
      </div>
      {error ? <div className="intake__error">{error}</div> : null}
      <div className="intake__actions">
        <button className="btn btn--primary btn--lg" data-analytics="intake_prepare_request" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Submitting..." : "Submit workflow"}
        </button>
        {mailto ? <a className="btn btn--ghost btn--lg" data-analytics="intake_open_email" href={mailto}>Open prepared email</a> : null}
      </div>
    </form>
  );
}
