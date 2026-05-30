"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Send, Building, Mail, User, FileText } from "lucide-react";

export default function LeadCaptureCard() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
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
          Request received
        </h4>
        <p className="text-xs text-green-600 mt-1">
          [DEMO] In production, this would be sent to the Active Mirror team.
        </p>
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
        <InputRow icon={User} placeholder="Name" />
        <InputRow icon={Mail} placeholder="Work email" type="email" />
        <InputRow icon={Building} placeholder="Company" />
        <InputRow icon={FileText} placeholder="Brief use case" />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setSubmitted(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          Book Demo
        </button>
        <button
          onClick={() => setSubmitted(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          Send Brief
        </button>
      </div>

      <p className="text-[10px] text-gray-400 mt-3 text-center">
        Your data is not stored in this demo. No cookies, no tracking.
      </p>
    </div>
  );
}

function InputRow({
  icon: Icon,
  placeholder,
  type = "text",
}: {
  icon: typeof User;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white rounded-lg border border-gray-150 px-3 py-2.5">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <input
        type={type}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
        aria-label={placeholder}
      />
    </div>
  );
}
