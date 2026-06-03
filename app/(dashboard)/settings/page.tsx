import { Card } from "@/components/common/Card";

export default function SettingsPage() {
  const items = ["用户信息", "店铺管理", "字段映射配置", "指标口径配置", "四象限阈值配置", "用户权限管理"];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-950">系统设置</h1>
      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => <Card key={item} className="p-5"><h2 className="font-semibold text-slate-950">{item}</h2><p className="mt-2 text-sm text-slate-500">支持后续按团队和平台扩展。</p></Card>)}
      </div>
    </div>
  );
}
