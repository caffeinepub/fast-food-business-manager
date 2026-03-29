import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Bell, Settings } from "lucide-react";
import { useState } from "react";
import Sidebar, { type Page } from "./components/Sidebar";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Ledger from "./pages/Ledger";
import Orders from "./pages/Orders";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Welcome back 👋",
  clients: "Client Management",
  orders: "Order Tracking",
  ledger: "Financial Ledger",
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const pageComponents: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard />,
    clients: <Clients />,
    orders: <Orders />,
    ledger: <Ledger />,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex-1 flex flex-col ml-60">
        <header className="sticky top-0 z-10 bg-card border-b border-border px-6 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {PAGE_TITLES[currentPage]}
            </h2>
            <p className="text-xs text-muted-foreground">
              QuickBite Manager — Fast Food Business Suite
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <Settings size={18} />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold ml-1">
              Q
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{pageComponents[currentPage]}</main>

        <footer className="px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster richColors />
    </QueryClientProvider>
  );
}
