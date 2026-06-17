"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { ImageDetail } from "@/lib/types";
import { labelFor, STATUS_STYLES } from "@/lib/model-labels";

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-neutral-900 text-neutral-500 border-neutral-700";
  return (
    <span className={`rounded border px-2 py-0.5 text-xs font-mono ${cls}`}>{status}</span>
  );
}

export default function ImagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [img, setImg] = useState<ImageDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/data/runs/all/images/${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setImg)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/" className="text-sm text-sky-400 hover:underline">← All receipts</Link>
        <p className="mt-8 text-neutral-500">No data for this receipt.</p>
      </main>
    );
  }

  if (!img) {
    return (
      <div className="flex h-screen items-center justify-center text-neutral-500">Loading…</div>
    );
  }

  const allFields = [
    "storeName","totalCost","purchaseDate","time","zipCode",
    "city","state","streetAddress","paymentMethod","last4cc",
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link href="/" className="text-sm text-sky-400 hover:underline">← All receipts</Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-white">
            {img.retailer} · {img.brand}
            {img.amount != null && <span className="text-neutral-400"> · ${img.amount.toFixed(2)}</span>}
          </h1>
          {img.purpose && (
            <span
              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                img.purpose === "RECTIFICATION"
                  ? "bg-purple-950 text-purple-300"
                  : "bg-teal-950 text-teal-300"
              }`}
            >
              {img.purpose}
            </span>
          )}
          <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
            {img.ocrProcessor}
          </span>
          <span className="text-xs text-neutral-600 font-mono">{img.id}</span>
        </div>
      </div>

      {/* Field Comparison */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-neutral-200">Field comparison</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500">
                <th className="px-4 py-3 w-40">Field</th>
                <th className="px-4 py-3">Payout truth</th>
                {Object.keys(img.models).map((model) => (
                  <th key={model} className="px-4 py-3">{labelFor(model)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFields.map((field) => {
                const truthVal = (img.truth as unknown as Record<string, string | null>)[field];
                return (
                  <tr key={field} className="border-t border-neutral-800">
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-400">{field}</td>
                    <td className="px-4 py-2.5 text-neutral-400">
                      {truthVal ?? <span className="text-neutral-700">—</span>}
                    </td>
                    {Object.entries(img.models).map(([model, result]) => {
                      const f = result.fields?.[field];
                      if (!f) return <td key={model} className="px-4 py-2.5 text-neutral-600">—</td>;
                      return (
                        <td key={model} className="px-4 py-2.5">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`rounded border px-2 py-0.5 text-xs font-mono inline-block ${
                                STATUS_STYLES[f.status] ?? "bg-neutral-900 text-neutral-500 border-neutral-700"
                              }`}
                            >
                              {f.value ?? "—"}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
          {["match","mismatch","missing","no-truth"].map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`inline-block h-3 w-3 rounded border ${STATUS_STYLES[s]}`} />
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* Model metrics */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-neutral-200">Metrics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(img.models).map(([model, result]) => (
            <div key={model} className="rounded-lg border border-neutral-800 p-4 space-y-2">
              <div className="font-medium text-neutral-200">{labelFor(model)}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-400">
                <span>Latency</span>
                <span>{result.isNull ? "—" : `${(result.metrics.latencyMs / 1000).toFixed(1)}s`}</span>
                <span>Cost</span>
                <span>${result.metrics.totalUsd.toFixed(4)}</span>
                <span>Input tokens</span>
                <span>{result.metrics.inputTokens.toLocaleString()}</span>
                <span>Output tokens</span>
                <span>{result.metrics.outputTokens.toLocaleString()}</span>
                {(result.metrics.reasoningTokens ?? 0) > 0 && (
                  <>
                    <span>Reasoning tokens</span>
                    <span className="text-purple-400">{result.metrics.reasoningTokens?.toLocaleString()}</span>
                  </>
                )}
              </div>
              {result.flags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.entries(result.flags).map(([k, v]) =>
                    v === true ? (
                      <span key={k} className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs text-neutral-300">
                        {k}
                      </span>
                    ) : null
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Line Items comparison */}
      {Object.values(img.models).some((m) => m.lineItems?.length > 0) && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-neutral-200">Line items</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(img.models).map(([model, result]) => (
              <div key={model} className="rounded-lg border border-neutral-800 overflow-hidden">
                <div className="border-b border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400">
                  {labelFor(model)}
                </div>
                {result.lineItems?.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500">
                        <th className="px-3 py-2 text-left">Item</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.lineItems.map((li, i) => (
                        <tr key={i} className="border-t border-neutral-800/60">
                          <td className="px-3 py-2 text-neutral-300 max-w-xs truncate" title={li.text}>
                            {li.text}
                          </td>
                          <td className="px-3 py-2 text-right text-neutral-500">{li.quantity}</td>
                          <td className="px-3 py-2 text-right text-neutral-300">
                            {li.totalSpend != null ? `$${li.totalSpend.toFixed(2)}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-4 py-3 text-xs text-neutral-600">no line items</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Raw text comparison */}
      {Object.values(img.models).some((m) => m.rawText) && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-neutral-200">Raw text</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(img.models).map(([model, result]) => (
              <div key={model} className="rounded-lg border border-neutral-800 overflow-hidden">
                <div className="border-b border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400">
                  {labelFor(model)}
                </div>
                <pre className="px-4 py-3 text-xs text-neutral-400 whitespace-pre-wrap font-mono overflow-x-auto max-h-64 overflow-y-auto">
                  {result.rawText ?? <span className="text-neutral-600 italic">no raw text</span>}
                </pre>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
