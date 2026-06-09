"use client";

import { useEffect, useMemo, useState } from "react";
import { trackSiteEvent } from "@/lib/siteAnalytics";

type IntakeState = "idle" | "sending" | "ready" | "error";
type IntakeFocus = "general" | "pilot" | "challenge" | "deployment" | "private-context" | "review" | "platform" | "workspace-proof";

const FOCUS_COPY: Record<IntakeFocus, {
  eyebrow: string;
  title: string;
  body: string;
  useCasePlaceholder: string;
  proofPlaceholder: string;
}> = {
  general: {
    eyebrow: "Scoped intake",
    title: "Start with the workflow, not a generic AI request.",
    body: "Tell us what should become reviewable work. We use this to decide whether a 72-hour proof sprint is a fit.",
    useCasePlaceholder: "Example: We need to prove a vendor decision before a board meeting, using public sources first and private files only after approval.",
    proofPlaceholder: "Example: a board-ready evidence workspace with source gaps, approval steps, and a deploy-or-don't recommendation.",
  },
  pilot: {
    eyebrow: "72-hour proof sprint",
    title: "Send one workflow you actually care about.",
    body: "We qualify the workflow first. If it fits, the sprint produces a working proof, not a slide-only demo.",
    useCasePlaceholder: "Example: We need a reviewable vendor selection workspace for our team, with source gaps, approvals, and a final recommendation.",
    proofPlaceholder: "Example: a working workspace our team can inspect, run through one real decision, and decide whether to deploy.",
  },
  challenge: {
    eyebrow: "Challenge workflow",
    title: "Bring the task your current AI cannot safely finish.",
    body: "The best fit is a messy but concrete workflow where evidence, approvals, or handoff quality matter.",
    useCasePlaceholder: "Example: Current chat tools can draft the memo, but they lose source state and approval steps before it is ready for leadership.",
    proofPlaceholder: "Example: one completed workflow with visible source gaps, owner approval, and an export another person can review.",
  },
  deployment: {
    eyebrow: "Repeatable workflow",
    title: "Map the repeatable work you want controlled.",
    body: "This is for teams that need the same AI-assisted workflow to run again with memory, approvals, and proof boundaries.",
    useCasePlaceholder: "Example: We need a repeatable client intake workflow that produces a reviewed brief, file checklist, and next-action owner.",
    proofPlaceholder: "Example: one repeatable workspace with intake fields, approval states, and an operational handoff.",
  },
  "private-context": {
    eyebrow: "Private-context review",
    title: "Define what must stay gated.",
    body: "Use this path when private files, saved context, or local-only execution matter. The public form still asks for scope, not private data.",
    useCasePlaceholder: "Example: We need to use private internal docs only after approval, then produce a public-safe evidence brief with source gaps separated.",
    proofPlaceholder: "Example: a working proof that shows private access gates, source states, and what never left the approved boundary.",
  },
  review: {
    eyebrow: "AI review lane",
    title: "Show where human review must happen.",
    body: "This path is for workflows where the model can help, but the final action needs visible review before it affects customers, staff, or citizens.",
    useCasePlaceholder: "Example: We need model-assisted case triage, but every recommendation needs a review state, evidence note, and escalation path.",
    proofPlaceholder: "Example: a reviewable workspace with human approval points and a record of what the AI did not decide.",
  },
  platform: {
    eyebrow: "Platform build",
    title: "Scope the system around the workflow.",
    body: "Use this when you are thinking beyond one demo and need routing, memory, permissions, and operational handoff.",
    useCasePlaceholder: "Example: We need a governed AI workspace layer around several internal workflows, with permissions, memory, and deployment boundaries.",
    proofPlaceholder: "Example: one deployable proof plus the control requirements for the larger platform.",
  },
  "workspace-proof": {
    eyebrow: "From the workspace preview",
    title: "Turn the generated workspace into a proof sprint.",
    body: "We do not receive the prompt or artifact from the preview unless you choose to paste it. Send the workflow, owner, proof target, and deployment boundary.",
    useCasePlaceholder: "Example: I generated a vendor evidence workspace and want it adapted for our vendor review process with approved sources, owner approvals, and a deploy/no-deploy decision.",
    proofPlaceholder: "Example: the generated workspace works on our real workflow, shows source gaps and approvals, and gives leadership a decision-ready export.",
  },
};

function normalizeFocus(value?: string): IntakeFocus {
  const focus = value || "general";
  return focus in FOCUS_COPY ? (focus as IntakeFocus) : "general";
}

function fallbackMailto(form: Record<string, string>) {
  const subject = encodeURIComponent("Active Mirror 72-hour proof sprint request");
  const body = encodeURIComponent([
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Company: ${form.company}`,
    `Focus: ${form.focus}`,
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

export default function IntakeForm({ initialFocus = "general" }: { initialFocus?: string }) {
  const intakeFocus = normalizeFocus(initialFocus);
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
    focus: intakeFocus,
    proofTarget: "",
    useCase: "",
  });

  useEffect(() => {
    trackSiteEvent({ event: "intake_focus_loaded", target: form.focus });
  }, [form.focus]);

  const focusCopy = FOCUS_COPY[form.focus] || FOCUS_COPY.general;

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
        focus: form.focus,
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
      `Focus: ${form.focus}`,
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
          focus: form.focus,
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
          focus: form.focus,
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
      <div className="intake__context" data-testid="intake-focus">
        <div className="intake__eyebrow">{focusCopy.eyebrow}</div>
        <h2>{focusCopy.title}</h2>
        <p>{focusCopy.body}</p>
      </div>
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
          placeholder={focusCopy.useCasePlaceholder}
          required
        />
      </label>
      <label className="intake__use">
        <span>What would make the 72-hour proof worth paying attention to?</span>
        <textarea
          value={form.proofTarget}
          onChange={update("proofTarget")}
          placeholder={focusCopy.proofPlaceholder}
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
