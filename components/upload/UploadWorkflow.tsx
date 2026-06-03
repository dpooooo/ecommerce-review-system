"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { Card } from "@/components/common/Card";

type Shop = {
  id: string;
  name: string;
  platform: string;
};

type MappingItem = {
  originalField: string;
  standardField: string;
};

type UploadResult = {
  batch: {
    id: string;
    status: string;
    periodType: string;
    periodStart: string;
    periodEnd: string;
  };
  file: {
    id: string;
    originalName: string;
    rowCount: number;
    columnCount: number;
    parseStatus: string;
    parseError?: string | null;
  };
  rawColumns: string[];
  preview: Array<Record<string, unknown>>;
  mapping: MappingItem[];
};

const reportTypes = [
  { value: "shop", label: "店铺数据" },
  { value: "product", label: "商品数据" },
  { value: "promotion", label: "推广数据" },
  { value: "traffic_source", label: "流量来源" },
  { value: "user_profile", label: "用户画像" },
  { value: "promotion_plan", label: "推广计划" },
  { value: "promotion_audience", label: "推广人群" }
];

const periodTypes = [
  { value: "current", label: "本期数据" },
  { value: "previous", label: "同期数据" },
  { value: "history", label: "历史数据" }
];

const standardFieldsByType: Record<string, string[]> = {
  shop: ["traffic", "gmv", "gsv", "orders", "conversionRate", "aov", "refundAmount", "refundRate"],
  promotion: ["spend", "impressions", "clicks", "ctr", "cpc", "promoGmv", "orders", "traffic", "roi"],
  product: ["productId", "productName", "traffic", "gmv", "gsv", "orders", "conversionRate", "aov", "refundAmount", "refundRate", "stock", "searchImpressions"],
  traffic_source: ["channel", "source1", "source2", "source3", "visitors", "buyers", "conversionRate", "revenue", "uvValue"],
  user_profile: ["userType", "dimension", "dimensionValue", "visitors", "buyers", "orders", "gmv", "aov", "conversionRate"],
  promotion_plan: ["planId", "planName", "spend", "revenue", "orders", "roi", "conversionRate", "impressions", "clicks", "ctr", "cpc"],
  promotion_audience: ["planId", "unitId", "audienceId", "audienceName", "spend", "revenue", "orders", "roi", "conversionRate", "impressions", "clicks", "ctr", "cpc"]
};

function today(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function UploadWorkflow() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [platform, setPlatform] = useState("TMALL");
  const [reportType, setReportType] = useState("shop");
  const [periodType, setPeriodType] = useState("current");
  const [periodStart, setPeriodStart] = useState(today(-30));
  const [periodEnd, setPeriodEnd] = useState(today());
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [mapping, setMapping] = useState<MappingItem[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "uploaded" | "importing" | "imported" | "error">("idle");
  const [message, setMessage] = useState("");

  const standardFields = useMemo(() => standardFieldsByType[reportType] || [], [reportType]);

  useEffect(() => {
    fetch("/api/shops")
      .then((response) => (response.ok ? response.json() : { shops: [] }))
      .then((data) => {
        const nextShops = Array.isArray(data.shops) ? data.shops : [];
        setShops(nextShops);
        if (nextShops[0]) {
          setShopId(nextShops[0].id);
          setPlatform(nextShops[0].platform);
        }
      })
      .catch(() => setShops([]));
  }, []);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    setUploadResult(null);
    setMapping([]);
    setStatus("idle");
    setMessage("");
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setStatus("error");
      setMessage("请选择要上传的 Excel 或 CSV 文件。");
      return;
    }
    setStatus("uploading");
    setMessage("正在上传并解析文件...");
    const form = new FormData();
    form.set("shopId", shopId);
    form.set("platform", platform);
    form.set("reportType", reportType);
    form.set("periodType", periodType);
    form.set("periodStart", periodStart);
    form.set("periodEnd", periodEnd);
    form.set("file", file);

    const response = await fetch("/api/uploads", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "上传失败，请检查文件格式。");
      return;
    }
    setUploadResult(data);
    setMapping(data.mapping || []);
    setStatus("uploaded");
    setMessage("文件解析完成，请确认字段映射后入库。");
  }

  async function confirmImport() {
    if (!uploadResult) return;
    setStatus("importing");
    setMessage("正在清洗数据并写入标准指标表...");
    const response = await fetch(`/api/uploads/${uploadResult.batch.id}/confirm-import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mapping })
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "入库失败，请检查字段映射。");
      return;
    }
    setStatus("imported");
    setMessage(`入库完成：${data.target} 写入 ${data.importedRows} 行。`);
  }

  function updateMapping(originalField: string, standardField: string) {
    setMapping((items) => items.map((item) => (item.originalField === originalField ? { ...item, standardField } : item)));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">数据上传</h1>
          <p className="mt-1 text-sm text-slate-500">上传文件后确认字段映射，系统会清洗数据并写入 PostgreSQL 标准指标表。</p>
        </div>
        {status === "imported" ? (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={16} />
            已入库
          </div>
        ) : null}
      </div>

      <Card className="p-5">
        <form onSubmit={upload} className="grid grid-cols-4 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">店铺</span>
            <select value={shopId} onChange={(event) => setShopId(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
              {shops.length ? shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>) : <option value="">默认店铺</option>}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">平台</span>
            <select value={platform} onChange={(event) => setPlatform(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
              <option>TMALL</option>
              <option>JD</option>
              <option>DOUYIN</option>
              <option>PDD</option>
              <option>OTHER</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">报表类型</span>
            <select value={reportType} onChange={(event) => setReportType(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
              {reportTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">上传模式</span>
            <select value={periodType} onChange={(event) => setPeriodType(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
              {periodTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">周期开始</span>
            <input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">周期结束</span>
            <input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
          </label>
          <label className="col-span-2 block">
            <span className="text-sm font-medium text-slate-700">上传文件</span>
            <div className="mt-1 flex h-10 items-center gap-3 rounded-md border border-slate-200 px-3 text-sm">
              <FileSpreadsheet size={16} className="text-brand-600" />
              <span className="flex-1 truncate text-slate-600">{file?.name || "支持 .xlsx / .xls / .csv"}</span>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={onFileChange} className="w-48 text-sm" />
            </div>
          </label>
          <label className="col-span-4 flex h-36 items-center justify-center rounded-lg border border-dashed border-brand-300 bg-brand-50 text-brand-700">
            <div className="text-center">
              <UploadCloud className="mx-auto" size={30} />
              <div className="mt-2 text-sm font-medium">{file ? file.name : "选择文件后点击上传并解析"}</div>
            </div>
          </label>
          <button disabled={status === "uploading"} className="col-span-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 text-sm font-medium text-white disabled:opacity-60">
            {status === "uploading" ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            上传并解析
          </button>
        </form>
      </Card>

      {message ? (
        <div className={status === "error" ? "rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" : "rounded-md bg-brand-50 px-4 py-3 text-sm text-brand-700"}>
          {message}
        </div>
      ) : null}

      {uploadResult ? (
        <>
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-950">字段预览与映射确认</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {uploadResult.file.originalName} · {uploadResult.file.rowCount} 行 · {uploadResult.file.columnCount} 列
                </p>
              </div>
              <button
                onClick={confirmImport}
                disabled={status === "importing" || status === "imported"}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white disabled:opacity-60"
              >
                {status === "importing" ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                确认入库
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {mapping.map((item) => (
                <div key={item.originalField} className="rounded-md border border-slate-200 p-3">
                  <div className="mb-2 text-sm font-medium text-slate-900">{item.originalField}</div>
                  <select value={item.standardField} onChange={(event) => updateMapping(item.originalField, event.target.value)} className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm">
                    <option value="">不入库</option>
                    {standardFields.map((field) => <option key={field} value={field}>{field}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold text-slate-950">数据预览</h2>
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    {uploadResult.rawColumns.slice(0, 12).map((column) => <th key={column} className="whitespace-nowrap px-3 py-2">{column}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {uploadResult.preview.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {uploadResult.rawColumns.slice(0, 12).map((column) => (
                        <td key={column} className="max-w-48 truncate whitespace-nowrap px-3 py-2 text-slate-700">{String(row[column] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
