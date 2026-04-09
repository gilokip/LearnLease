import { Outlet }    from "react-router-dom";
import Sidebar       from "./Sidebar";
import Header        from "./Header";
import { useUIStore } from "@store/uiStore";
import { cn }        from "@utils/cn";

export default function DashboardLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <Sidebar />
      <div
        className={cn(
          "flex flex-col flex-1 overflow-hidden transition-all duration-300 min-w-0",
          sidebarCollapsed ? "ml-[68px]" : "ml-[248px]"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
