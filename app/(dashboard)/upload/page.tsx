import { UploadCloud } from "lucide-react";
import { Card } from "@/components/common/Card";

const fields = ["日期", "访客数", "GMV", "订单数", "退款金额", "推广花费", "ROI"];

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">数据上传</h1>
        <p className="mt-1 text-sm text-slate-500">支持 xlsx、xls、csv，完成字段识别、映射确认和标准化入库。</p>
      </div>
      <Card className="p-5">
        <form action="/api/uploads" method="post" encType="multipart/form-data" className="grid grid-cols-4 gap-4">
          <select name="shopId" className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option value="demo-shop-1">天猫旗舰店</option></select>
          <select name="platform" className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option>TMALL</option><option>JD</option><option>DOUYIN</option><option>PDD</option></select>
          <select name="reportType" className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option value="shop">店铺数据</option><option value="product">商品数据</option><option value="promotion">推广数据</option></select>
          <select name="periodType" className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option value="current">本期数据</option><option value="previous">同期数据</option><option value="history">历史数据</option></select>
          <label className="col-span-4 flex h-56 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-brand-300 bg-brand-50 text-brand-700">
            <UploadCloud size={34} />
            <span className="mt-3 text-sm font-medium">选择或拖拽 Excel / CSV 文件</span>
            <input name="file" type="file" accept=".xlsx,.xls,.csv" className="hidden" />
          </label>
          <button className="col-span-4 h-10 rounded-md bg-brand-600 text-sm font-medium text-white">上传并解析</button>
        </form>
      </Card>
      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-slate-950">字段预览与映射确认</h2>
        <div className="grid grid-cols-3 gap-3">
          {fields.map((field) => (
            <div key={field} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm">
              <span>{field}</span>
              <span className="text-brand-700">已识别</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
