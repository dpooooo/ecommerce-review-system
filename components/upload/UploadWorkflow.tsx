"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud
} from "lucide-react";
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
    timeGrain: string;
    periodStart: string;
    periodEnd: string;
  };
  file: {
    id: string;
    originalName: string;
    reportType: string;
    rowCount: number;
    columnCount: number;
    parseStatus: string;
    parseError?: string | null;
  };
  rawColumns: string[];
  preview: Array<Record<string, unknown>>;
  mapping: MappingItem[];
  detectedReportType?: string;
  standardTemplate?: {
    reportType: string;
    timeGrain: string;
    name: string;
    directImport: boolean;
  } | null;
  detection?: {
    reportType: string;
    confidence: number;
    matchedFields: number;
  };
};

const reportTypes = [
  { value: "shop", label: "店铺经营数据", description: "店铺整体经营指标" },
  { value: "product", label: "商品数据", description: "SPU / SKU 商品表现" },
  { value: "promotion", label: "推广汇总数据", description: "店铺推广整体表现" },
  { value: "promotion_plan", label: "推广计划数据", description: "推广计划明细" },
  { value: "promotion_audience", label: "推广人群数据", description: "推广人群明细" },
  { value: "traffic_source", label: "流量来源数据", description: "渠道流量表现" },
  { value: "user_profile", label: "用户画像数据", description: "用户画像维度表现" }
];

const periodTypes = [
  { value: "current", label: "当前周期" },
  { value: "previous", label: "对比周期" },
  { value: "history", label: "历史数据" }
];

const timeGrains = [
  { value: "daily", label: "日数据", description: "每行填写一个数据日期，适合长期沉淀数据库。" },
  { value: "monthly", label: "月数据", description: "每行填写一个统计月份，系统自动按月汇总。" },
  { value: "period", label: "周期汇总", description: "每行填写开始和结束日期，适合活动或复盘周期。" }
];

const timeGrainsByReportType: Record<string, string[]> = {
  shop: ["daily", "monthly", "period"],
  product: ["daily", "monthly", "period"],
  promotion: ["daily", "monthly", "period"],
  promotion_plan: ["daily", "monthly", "period"],
  promotion_audience: ["daily", "monthly", "period"],
  traffic_source: ["monthly", "period"],
  user_profile: ["monthly", "period"]
};

const standardFieldsByType: Record<string, string[]> = {
  shop: ["traffic", "gmv", "gsv", "orders", "conversionRate", "aov", "refundAmount", "refundRate"],
  promotion: ["spend", "impressions", "clicks", "ctr", "cpc", "promoGmv", "orders", "traffic", "roi"],
  product: ["productId", "productName", "traffic", "gmv", "gsv", "orders", "conversionRate", "aov", "refundAmount", "refundRate", "stock", "searchImpressions"],
  traffic_source: ["channel", "source1", "source2", "source3", "visitors", "buyers", "conversionRate", "revenue", "uvValue"],
  user_profile: ["userType", "dimension", "dimensionValue", "visitors", "buyers", "orders", "gmv", "aov", "conversionRate"],
  promotion_plan: ["planId", "planName", "spend", "revenue", "orders", "roi", "conversionRate", "impressions", "clicks", "ctr", "cpc"],
  promotion_audience: ["planId", "unitId", "audienceId", "audienceName", "spend", "revenue", "orders", "roi", "conversionRate", "impressions", "clicks", "ctr", "cpc"]
};

const standardFieldMeta: Record<string, { label: string; description: string }> = {
  traffic: { label: "访客数", description: "进入店铺、商品或广告带来的访问人数/UV。" },
  gmv: { label: "GMV", description: "成交总金额，通常未扣除退款。" },
  gsv: { label: "GSV", description: "实销金额，一般为 GMV 扣除退款后的金额。" },
  orders: { label: "订单数", description: "成交订单数量。" },
  conversionRate: { label: "转化率", description: "成交人数或订单数相对访客/点击的比例。" },
  aov: { label: "客单价", description: "平均每笔订单金额。" },
  refundAmount: { label: "退款金额", description: "统计周期内产生的退款金额。" },
  refundRate: { label: "退款率", description: "退款金额或退款订单占成交的比例。" },
  spend: { label: "推广花费", description: "广告、推广计划或人群消耗金额。" },
  impressions: { label: "展现数", description: "广告或内容被展示的次数。" },
  clicks: { label: "点击数", description: "广告或内容被点击的次数。" },
  ctr: { label: "点击率", description: "点击数 / 展现数。" },
  cpc: { label: "平均点击成本", description: "推广花费 / 点击数。" },
  promoGmv: { label: "推广成交金额", description: "由推广带来的成交金额。" },
  roi: { label: "ROI", description: "成交金额 / 推广花费。" },
  productId: { label: "商品ID", description: "商品、SPU 或 SKU 的唯一编号。" },
  productName: { label: "商品名称", description: "商品展示名称。" },
  stock: { label: "库存", description: "当前商品库存数量。" },
  searchImpressions: { label: "搜索曝光数", description: "商品在搜索场景中的曝光次数。" },
  channel: { label: "流量渠道", description: "流量来源的大类，例如搜索、推荐、付费等。" },
  source1: { label: "一级来源", description: "平台报表中的一级流量来源。" },
  source2: { label: "二级来源", description: "平台报表中的二级流量来源。" },
  source3: { label: "三级来源", description: "平台报表中的三级流量来源。" },
  visitors: { label: "访客数", description: "该渠道或画像维度下的访问人数/UV。" },
  buyers: { label: "买家数", description: "产生购买行为的人数。" },
  revenue: { label: "成交金额", description: "计划、人群、渠道或画像维度贡献的成交金额。" },
  uvValue: { label: "UV价值", description: "成交金额 / 访客数。" },
  userType: { label: "用户类型", description: "新客、老客、成交用户等人群类型。" },
  dimension: { label: "画像维度", description: "年龄、性别、地域、消费层级等画像分类。" },
  dimensionValue: { label: "画像值", description: "某个画像维度下的具体取值。" },
  planId: { label: "计划ID", description: "推广计划的唯一编号。" },
  planName: { label: "计划名称", description: "推广计划名称。" },
  unitId: { label: "单元ID", description: "推广单元的唯一编号。" },
  audienceId: { label: "人群ID", description: "推广人群的唯一编号。" },
  audienceName: { label: "人群名称", description: "推广人群名称。" }
};

function standardFieldLabel(field: string) {
  const meta = standardFieldMeta[field];
  return meta ? `${meta.label} · ${field}` : field;
}

function today(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function dateOnly(value: string) {
  return value.slice(0, 10);
}

export function UploadWorkflow() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [platform, setPlatform] = useState("TMALL");
  const [uploadMode, setUploadMode] = useState<"template" | "raw">("template");
  const [reportType, setReportType] = useState("shop");
  const [timeGrain, setTimeGrain] = useState("daily");
  const [periodType, setPeriodType] = useState("current");
  const [periodStart, setPeriodStart] = useState(today(-30));
  const [periodEnd, setPeriodEnd] = useState(today());
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [mapping, setMapping] = useState<MappingItem[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "uploaded" | "importing" | "imported" | "error">("idle");
  const [message, setMessage] = useState("");

  const activeReportType = uploadResult?.detectedReportType || reportType;
  const activeReportLabel = reportTypes.find((item) => item.value === activeReportType)?.label || activeReportType;
  const availableTimeGrains = timeGrainsByReportType[reportType] || ["period"];
  const activeTimeGrain = uploadResult?.standardTemplate?.timeGrain || uploadResult?.batch.timeGrain || timeGrain;
  const activeTimeGrainLabel = timeGrains.find((item) => item.value === activeTimeGrain)?.label || activeTimeGrain;
  const standardFields = useMemo(() => standardFieldsByType[activeReportType] || [], [activeReportType]);
  const isStandardTemplate = Boolean(uploadResult?.standardTemplate?.directImport);

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

  useEffect(() => {
    const grains = timeGrainsByReportType[reportType] || ["period"];
    if (!grains.includes(timeGrain)) setTimeGrain(grains[0]);
  }, [reportType, timeGrain]);

  function resetUpload(nextMode?: "template" | "raw") {
    if (nextMode) {
      setUploadMode(nextMode);
      setReportType((current) => {
        if (nextMode === "raw") return "auto";
        return current === "auto" ? "shop" : current;
      });
    }
    setFile(null);
    setUploadResult(null);
    setMapping([]);
    setStatus("idle");
    setMessage("");
  }

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
    setMessage("正在上传并校验文件...");
    const form = new FormData();
    form.set("shopId", shopId);
    form.set("platform", platform);
    form.set("reportType", reportType);
    form.set("periodType", periodType);
    form.set("timeGrain", uploadMode === "template" ? timeGrain : "period");
    form.set("periodStart", periodStart);
    form.set("periodEnd", periodEnd);
    form.set("file", file);

    const response = await fetch("/api/uploads", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) {
      setStatus("error");
      const details = Array.isArray(data.validationErrors) ? ` ${data.validationErrors.join(" ")}` : "";
      setMessage(`${data.error || "上传失败，请检查文件格式。"}${details}`);
      return;
    }

    setUploadResult(data);
    setMapping(data.mapping || []);
    setReportType(data.detectedReportType || reportType);
    setTimeGrain(data.standardTemplate?.timeGrain || data.batch.timeGrain || timeGrain);
    setPeriodStart(dateOnly(data.batch.periodStart));
    setPeriodEnd(dateOnly(data.batch.periodEnd));
    setStatus("uploaded");
    setMessage(
      data.standardTemplate
        ? `已识别为“${data.standardTemplate.name}”，统计周期已自动读取，可直接确认入库。`
        : `已确定数据类型为“${reportTypes.find((item) => item.value === data.detectedReportType)?.label || data.detectedReportType}”，请确认字段映射后入库。`
    );
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
      setMessage(data.error || "入库失败，请检查数据内容。");
      return;
    }
    setStatus("imported");
    setMessage(
      `入库完成：${data.target} 写入 ${data.importedRows} 行。${data.replacedBatches ? ` 已替换 ${data.replacedBatches} 个相同周期的旧批次。` : ""}`
    );
  }

  function updateMapping(originalField: string, standardField: string) {
    setMapping((items) => items.map((item) => (item.originalField === originalField ? { ...item, standardField } : item)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">数据上传</h1>
          <p className="mt-1 text-sm text-slate-500">推荐使用标准模板，系统会自动识别数据类型和统计周期，无需手工映射字段。</p>
        </div>
        {status === "imported" ? (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={16} />
            已入库
          </div>
        ) : null}
      </div>

      <div className="flex w-fit rounded-md border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => resetUpload("template")}
          className={`h-9 rounded px-4 text-sm font-medium ${uploadMode === "template" ? "bg-brand-600 text-white" : "text-slate-600"}`}
        >
          标准模板上传
        </button>
        <button
          type="button"
          onClick={() => resetUpload("raw")}
          className={`h-9 rounded px-4 text-sm font-medium ${uploadMode === "raw" ? "bg-brand-600 text-white" : "text-slate-600"}`}
        >
          平台原始报表
        </button>
      </div>

      {uploadMode === "template" ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">1. 选择并下载标准模板</h2>
            <p className="mt-1 text-sm text-slate-500">先选择数据粒度。日数据填写“数据日期”，月数据填写“统计月份”，周期汇总填写开始和结束日期。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeGrains
              .filter((item) => availableTimeGrains.includes(item.value))
              .map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setTimeGrain(item.value);
                    resetUpload();
                  }}
                  className={`rounded-md border px-3 py-2 text-left text-sm ${timeGrain === item.value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"}`}
                  title={item.description}
                >
                  {item.label}
                </button>
              ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {reportTypes.map((item) => (
              <div
                key={item.value}
                className={`min-h-24 border p-4 text-left ${reportType === item.value ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setReportType(item.value);
                    resetUpload();
                  }}
                  className="block w-full text-left"
                >
                  <div className="font-medium text-slate-950">{item.label}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.description}</div>
                </button>
                <a
                  href={`/api/upload-templates/${item.value}?timeGrain=${(timeGrainsByReportType[item.value] || ["period"]).includes(timeGrain) ? timeGrain : (timeGrainsByReportType[item.value] || ["period"])[0]}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600"
                >
                  <Download size={14} />
                  下载 CSV 模板
                </a>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="border-l-2 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          平台原始报表会尝试自动识别字段；无法确定的字段需要在上传后手工确认。
        </div>
      )}

      <Card className="p-5">
        <form onSubmit={upload} className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
            <span className="text-sm font-medium text-slate-700">数据类型</span>
            <div className="relative mt-1">
              <select
                value={reportType}
                onChange={(event) => setReportType(event.target.value)}
                className="h-10 w-full appearance-none rounded-md border border-slate-200 px-3 pr-8 text-sm"
              >
                {uploadMode === "raw" ? <option value="auto">自动识别</option> : null}
                {reportTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-3 text-slate-400" size={16} />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">数据用途</span>
            <select value={periodType} onChange={(event) => setPeriodType(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
              {periodTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          {uploadMode === "raw" ? (
            <>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">周期开始</span>
                <input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">周期结束</span>
                <input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
            </>
          ) : null}

          <label className={uploadMode === "raw" ? "block md:col-span-2" : "block md:col-span-4"}>
            <span className="text-sm font-medium text-slate-700">上传文件</span>
            <div className="mt-1 flex h-10 items-center gap-3 rounded-md border border-slate-200 px-3 text-sm">
              <FileSpreadsheet size={16} className="text-brand-600" />
              <span className="flex-1 truncate text-slate-600">{file?.name || "支持 .xlsx / .xls / .csv"}</span>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={onFileChange} className="w-48 text-sm" />
            </div>
          </label>

          <button disabled={status === "uploading"} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 text-sm font-medium text-white disabled:opacity-60 md:col-span-4">
            {status === "uploading" ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            上传并校验
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div>
                <h2 className="font-semibold text-slate-950">{isStandardTemplate ? "标准模板校验通过" : "字段映射确认"}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {uploadResult.file.originalName} · {uploadResult.file.rowCount} 行 · {activeReportLabel} · {activeTimeGrainLabel} · {dateOnly(uploadResult.batch.periodStart)} 至 {dateOnly(uploadResult.batch.periodEnd)}
                </p>
                {isStandardTemplate ? (
                  <p className="mt-2 text-sm text-emerald-700">字段、必填项和统计周期已校验，可直接写入数据库。</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">
                    已匹配 {uploadResult.detection?.matchedFields || 0} 个特征字段，置信度 {((uploadResult.detection?.confidence || 0) * 100).toFixed(0)}%
                  </p>
                )}
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

            {!isStandardTemplate ? (
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {mapping.map((item) => {
                  const selectedMeta = standardFieldMeta[item.standardField];
                  return (
                    <div key={item.originalField} className="rounded-md border border-slate-200 p-3">
                      <div className="mb-2 text-sm font-medium text-slate-900">{item.originalField}</div>
                      <select value={item.standardField} onChange={(event) => updateMapping(item.originalField, event.target.value)} className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm">
                        <option value="">不入库</option>
                        {standardFields.map((field) => <option key={field} value={field}>{standardFieldLabel(field)}</option>)}
                      </select>
                      <div className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                        {selectedMeta ? (
                          <>
                            <span className="font-medium text-slate-700">{selectedMeta.label}</span>
                            <span className="text-slate-400"> · {item.standardField}</span>
                            <div>{selectedMeta.description}</div>
                          </>
                        ) : (
                          <span>该字段不会写入标准指标表。</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
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
