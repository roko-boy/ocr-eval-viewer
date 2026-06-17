export type FieldStatus = "match" | "mismatch" | "missing" | "no-truth" | "unscoreable";

export interface FieldResult {
  value: string | null;
  status: FieldStatus;
}

export interface ModelMetrics {
  latencyMs: number;
  totalUsd: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens?: number;
}

export interface LineItem {
  text: string;
  quantity: number;
  unitPrice: number | null;
  totalSpend: number | null;
}

export interface ModelResult {
  isNull: boolean;
  error: string | null;
  source: string;
  metrics: ModelMetrics;
  fields: Record<string, FieldResult>;
  lineItems: LineItem[];
  rawText: string | null;
  flags: {
    isReceipt: boolean | null;
    isDigital: boolean | null;
    isScreen: boolean | null;
    isEbt: boolean | null;
  };
}

export interface ImageIndex {
  id: string;
  retailer: string;
  brand: string;
  amount: number | null;
  purpose: string | null;
  ocrProcessor: string;
  disagreementCount: number;
  nullCount: number;
  problems: Record<string, unknown>;
}

export interface TruthFields {
  storeName: string | null;
  totalCost: string | null;
  purchaseDate: string | null;
  time: string | null;
  zipCode: string | null;
  city: string | null;
  state: string | null;
  streetAddress: string | null;
  paymentMethod: string | null;
  last4cc: string | null;
}

export interface ImageDetail extends ImageIndex {
  url: string | null;
  truth: TruthFields;
  models: Record<string, ModelResult>;
  lineItemTruth: Array<{ text: string; price: number; quantity: number; totalSpend: number }> | null;
}

export interface ScorecardEntry {
  scalarOk: number;
  scalarN: number;
  scalarAccuracy: number;
  avgLatencyMs: number;
  avgCostUsd: number;
  projectedMonthlyUsd: number;
  nullResponses: number;
  attempts: number;
}

export interface RunIndex {
  run: string;
  runLabel: string;
  generatedAt: string;
  batchLabel: string;
  models: string[];
  scalarFields: string[];
  positionalFields: string[];
  scorecard: Record<string, ScorecardEntry>;
  modelHistory: Array<{
    model: string;
    label: string;
    order: number;
    scalarOk: number;
    scalarN: number;
    scalarAccuracy: number;
    errorCount: number;
    attempts: number;
  }>;
  lineItemAgg: Record<string, unknown>;
  fieldMatrix: Record<string, Record<string, { ok: number; n: number; rate: number }>>;
  images: ImageIndex[];
}
