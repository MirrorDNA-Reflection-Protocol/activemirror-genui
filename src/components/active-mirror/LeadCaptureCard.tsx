"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Send, Building, Mail, User, FileText } from "lucide-react";

export default function LeadCaptureCard() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "fallback" | "error">("idle");
  const [mailto, setMailto] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    useCase: "",
  });

  const submitLead = async () => {
    setStatus("sending");
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Lead request failed");
      setMailto(result.mailto || "");
      setStatus(result.delivered ? "sent" : "fallback");
    } catch {
      const subject = encodeURIComponent("Active Mirror access request");
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\nUse case: ${form.useCase}`
      );
      setMailto(`mailto:paul@activemirror.ai?subject=${subject}&body=${body}`);
      setStatus("error");
    }
  };

  if (status === "sent" || status === "fallback" || status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-green-200 bg-green-50/60 p-5 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <Send className="w-5 h-5 text-green-600" />
        </div>
        <h4 className="text-sm font-semibold text-green-800">
          {status === "sent" ? "Request sent" : "Brief generated"}
        </h4>
        <p className="text-xs text-green-600 mt-1">
          {status === "sent"
            ? "Your request was sent to paul@activemirror.ai."
            : "Email delivery is not configured for this runtime. Open the generated email to send it to paul@activemirror.ai."}
        </p>
        {mailto && (
          <a
            href={mailto}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-green-700 px-3 py-2 text-xs font-medium text-white hover:bg-green-800"
          >
            Open email
          </a>
        )}
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-5">
      <h4 className="text-sm font-semibold text-gray-900 mb-1">
        Ready to explore further?
      </h4>
      <p className="text-xs text-gray-500 mb-4">
        Leave your details and we&apos;ll prepare a tailored walkthrough.
      </p>

      <div className="space-y-2.5">
        <InputRow icon={User} placeholder="Name" value={form.name} onChange={value => setForm(prev => ({ ...prev, name: value }))} />
        <InputRow icon={Mail} placeholder="Work email" type="email" value={form.email} onChange={value => setForm(prev => ({ ...prev, email: value }))} />
        <InputRow icon={Building} placeholder="Company" value={form.company} onChange={value => setForm(prev => ({ ...prev, company: value }))} />
        <InputRow icon={FileText} placeholder="Brief use case" value={form.useCase} onChange={value => setForm(prev => ({ ...prev, useCase: value }))} />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={submitLead}
          disabled={status === "sending"}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          {status === "sending" ? "Sending" : "Join Waitlist"}
        </button>
        <button
          onClick={submitLead}
          disabled={status === "sending"}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          Send Brief
        </button>
      </div>

      <p className="text-[10px] text-gray-400 mt-3 text-center">
        Sent only for this access request. No tracking list.
      </p>
    </div>
  );
}

function InputRow({
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  icon: typeof User;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white rounded-lg border border-gray-150 px-3 py-2.5">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
        aria-label={placeholder}
      />
    </div>
  );
}
