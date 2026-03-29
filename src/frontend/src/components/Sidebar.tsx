import {
  BookOpen,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Zap,
} from "lucide-react";

export type Page = "dashboard" | "clients" | "orders" | "ledger";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: {
  id: Page;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clients", label: "Clients", icon: Users },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "ledger", label: "Ledger", icon: BookOpen },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-20"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.15 0.045 240) 0%, oklch(0.19 0.06 235) 100%)",
      }}
    >
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">
            QuickBite
          </div>
          <div className="text-sidebar-foreground/60 text-xs">Manager</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 py-2 text-sidebar-foreground/40 text-[11px] font-semibold uppercase tracking-wider mb-1">
          Main Menu
        </div>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.link`}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : ""} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-sidebar-foreground/30 text-[11px]">
          © {new Date().getFullYear()} QuickBite Manager
        </p>
      </div>
    </aside>
  );
}
