"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RunIndex, ImageIndex } from "@/lib/types";
import { labelFor } from "@/lib/model-labels";

function pct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

function fmt$(n: number) {
  return "$" + n.toFixed(4);
}

function AccuracyBar({ rate }: { rate: number }) {
  const color = rate >= 0.95 ? "bg-emerald-500" : rate >= 0.85 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded bg-neutral-800">
      <div className={`${color} h-full`} style={{ width: `${rate * 100}%` }} />
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<RunIndex | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/runs.json")
      .then((r) => r.json())
      .then((runs) => {
        const run = runs.runs?.[0];
        if (run) fetch(`/data/runs/${run.id}/index.json`).then((r) => r.json()).then(setData);
      });
  }, []);

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center text-neutral-500">
        Loading…
      </div>
    );
  }

  const allFields = [...(data.scalarFields || []), ...(data.positionalFields || [])];

  // Filter images
  let images = data.images;
  if (filter === "disagreements") images = images.filter((i) => i.disagreementCount > 0);
  else if (filter === "nulls") images = images.filter((i) => i.nullCount > 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">OCR Eval Viewer</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {data.batchLabel} · {data.images.length} receipts · {data.models.length} models · generated{" "}
          {new Date(data.generatedAt).toLocaleString()}
        </p>
      </div>

      {/* Model Scorecard */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-neutral-200">Model scorecard</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500">
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Scalar accuracy</th>
                <th className="px-4 py-3">Avg latency</th>
                <th className="px-4 py-3">Max latency</th>
                <th className="px-4 py-3">Avg $/img</th>
                <th className="px-4 py-3">$/300k mo</th>
                <th className="px-4 py-3">Null responses</th>
              </tr>
            </thead>
            <tbody>
              {data.models.map((model) => {
                const sc = data.scorecard[model];
                if (!sc) return null;
                return (
                  <tr key={model} className="border-t border-neutral-800 hover:bg-neutral-900/50">
                    <td className="px-4 py-3 font-medium text-neutral-200">{labelFor(model)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          sc.scalarAccuracy >= 0.95
                            ? "text-emerald-400"
                            : sc.scalarAccuracy >= 0.85
                            ? "text-amber-400"
                            : "text-red-400"
                        }
                      >
                        {pct(sc.scalarAccuracy)}
                      </span>
                      <span className="ml-1.5 text-neutral-500 text-xs">
                        ({sc.scalarOk}/{sc.scalarN})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      {(sc.avgLatencyMs / 1000).toFixed(1)}s
                    </td>
                    <td className="px-4 py-3 text-neutral-500">—</td>
                    <td className="px-4 py-3 text-emerald-400">{fmt$(sc.avgCostUsd)}</td>
                    <td className="px-4 py-3 text-neutral-300">
                      ${Math.round(sc.projectedMonthlyUsd).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {sc.nullResponses > 0 ? (
                        <span className="text-red-400">{sc.nullResponses}</span>
                      ) : (
                        <span className="text-neutral-600">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Per-field agreement */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-neutral-200">Per-field agreement</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500">
                <th className="px-4 py-3">Field</th>
                {data.models.map((m) => (
                  <th key={m} className="px-4 py-3">{labelFor(m)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFields.map((field) => (
                <tr key={field} className="border-t border-neutral-800 hover:bg-neutral-900/50">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-400">{field}</td>
                  {data.models.map((model) => {
                    const fm = data.fieldMatrix?.[field]?.[model];
                    if (!fm || fm.n === 0)
                      return <td key={model} className="px-4 py-3 text-neutral-600">—</td>;
                    return (
                      <td key={model} className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={
                                fm.rate >= 0.95
                                  ? "text-emerald-400"
                                  : fm.rate >= 0.85
                                  ? "text-amber-400"
                                  : "text-red-400"
                              }
                            >
                              {pct(fm.rate)}
                            </span>
                            <span className="text-xs text-neutral-600">
                              {fm.ok}/{fm.n}
                            </span>
                          </div>
                          <AccuracyBar rate={fm.rate} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Receipt Grid */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-neutral-200">
            Receipts{" "}
            <span className="text-neutral-500 font-normal">({images.length})</span>
          </h2>
          <div className="flex gap-2">
            {(["all", "disagreements", "nulls"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f === "all" ? null : f)}
                className={`rounded px-3 py-1 text-xs border ${
                  (filter ?? "all") === f
                    ? "border-sky-500 bg-sky-950 text-sky-200"
                    : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                }`}
              >
                {f === "all" ? "All" : f === "disagreements" ? "Disagreements" : "Null responses"}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500">
                <th className="px-4 py-3">Retailer</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">OCR</th>
                <th className="px-4 py-3">Disagreements</th>
                <th className="px-4 py-3">Nulls</th>
              </tr>
            </thead>
            <tbody>
              {images.slice(0, 200).map((img: ImageIndex) => (
                <tr key={img.id} className="border-t border-neutral-800 hover:bg-neutral-900/50">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/image/${img.id}`}
                      className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      {img.retailer}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-400">{img.brand}</td>
                  <td className="px-4 py-2.5 text-neutral-300">
                    {img.amount != null ? `$${img.amount.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {img.purpose && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                          img.purpose === "RECTIFICATION"
                            ? "bg-purple-950 text-purple-300"
                            : "bg-teal-950 text-teal-300"
                        }`}
                      >
                        {img.purpose}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs text-neutral-400">
                      {img.ocrProcessor}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {img.disagreementCount > 0 ? (
                      <span className="font-medium text-red-400">{img.disagreementCount}</span>
                    ) : (
                      <span className="text-neutral-600">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {img.nullCount > 0 ? (
                      <span className="text-amber-400">{img.nullCount}</span>
                    ) : (
                      <span className="text-neutral-600">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {images.length > 200 && (
            <div className="border-t border-neutral-800 px-4 py-3 text-xs text-neutral-500">
              Showing 200 of {images.length} receipts
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
