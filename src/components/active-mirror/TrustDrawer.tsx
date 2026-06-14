"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown, FileCheck2, ShieldCheck, X } from "lucide-react";
import { trustReceiptRows, type TrustReceipt, type TrustReceiptField } from "@/lib/trust/receipts";
import styles from "./TrustDrawer.module.css";

export type TrustDrawerProps = {
  receipts: TrustReceipt[];
  triggerLabel?: string;
  title?: string;
  description?: string;
  emptyMessage?: string;
};

const TONE_LABELS: Record<NonNullable<TrustReceiptField["tone"]>, string> = {
  safe: "safe",
  verify: "verify",
  risky: "risk",
  blocked: "blocked",
  neutral: "receipt",
};

export default function TrustDrawer({
  receipts,
  triggerLabel = "Show trust receipt",
  title = "Trust receipts",
  description = "Human-readable routing, source, risk, consent, and audit state for this answer.",
  emptyMessage = "No trust receipt is attached yet.",
}: TrustDrawerProps) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen(true)}
      >
        <FileCheck2 aria-hidden="true" size={17} />
        {triggerLabel}
      </button>

      {open && (
        <>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Close trust receipts"
            onClick={() => setOpen(false)}
          />
          <aside id={drawerId} className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby={`${drawerId}-title`}>
            <header className={styles.header}>
              <div>
                <p className={styles.eyebrow}>Governed answer</p>
                <h2 id={`${drawerId}-title`} className={styles.title}>
                  {title}
                </h2>
                <p className={styles.description}>{description}</p>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close trust receipts"
                onClick={() => setOpen(false)}
              >
                <X aria-hidden="true" size={18} />
              </button>
            </header>

            <div className={styles.content}>
              {receipts.length === 0 ? (
                <p className={styles.empty}>{emptyMessage}</p>
              ) : (
                receipts.map((receipt, index) => (
                  <ReceiptDetails key={receipt.id} receipt={receipt} defaultOpen={receipt.defaultOpen ?? index === 0} />
                ))
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function ReceiptDetails({ receipt, defaultOpen }: { receipt: TrustReceipt; defaultOpen: boolean }) {
  const tone = receipt.risk.state;

  return (
    <details className={styles.receipt} open={defaultOpen}>
      <summary className={styles.summary}>
        <div>
          <h3 className={styles.summaryTitle}>
            <ShieldCheck aria-hidden="true" size={17} />
            {receipt.title}
            <span className={`${styles.statusPill} ${styles[tone]}`}>{TONE_LABELS[tone]}</span>
          </h3>
          <p className={styles.summaryText}>{receipt.summary}</p>
        </div>
        <ChevronDown className={styles.chevron} aria-hidden="true" size={18} />
      </summary>

      <dl className={styles.rows}>
        {trustReceiptRows(receipt).map((row) => (
          <ReceiptRow key={row.label} row={row} />
        ))}
      </dl>
    </details>
  );
}

function ReceiptRow({ row }: { row: TrustReceiptField }) {
  const tone = row.tone ?? "neutral";

  return (
    <div className={styles.row}>
      <dt className={styles.label}>{row.label}</dt>
      <dd className={styles.value}>
        <span className={`${styles.statusPill} ${styles[tone]}`}>{TONE_LABELS[tone]}</span>{" "}
        {typeof row.value === "string" && row.label === "Receipt" ? <code>{row.value}</code> : row.value}
      </dd>
    </div>
  );
}
