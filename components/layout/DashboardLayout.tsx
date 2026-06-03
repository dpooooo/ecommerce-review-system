import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Topbar />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
