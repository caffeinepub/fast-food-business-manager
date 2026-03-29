import {
  Clock,
  DollarSign,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { OrderStatus } from "../backend.d";
import StatCard from "../components/StatCard";
import { useClients, useDashboardStats, useOrders } from "../hooks/useQueries";
import { formatCurrency, formatDate } from "../lib/format";

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    [OrderStatus.pending]: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    [OrderStatus.inProgress]: {
      label: "In Progress",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    [OrderStatus.completed]: {
      label: "Completed",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    [OrderStatus.cancelled]: {
      label: "Cancelled",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };
  const { label, className } = map[status] ?? map[OrderStatus.pending];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: clients = [] } = useClients();
  const { data: orders = [] } = useOrders();

  const recentClients = clients.slice(-5).reverse();
  const recentOrders = orders.slice(-5).reverse();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div data-ocid="dashboard.page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={statsLoading ? "—" : formatCurrency(stats?.totalRevenue ?? 0n)}
          delta="+12.5% this month"
          deltaPositive
          icon={<TrendingUp size={20} className="text-green-600" />}
          iconBg="bg-green-50"
        />
        <StatCard
          title="Total Expenses"
          value={
            statsLoading ? "—" : formatCurrency(stats?.totalExpenses ?? 0n)
          }
          delta="+4.2% this month"
          deltaPositive={false}
          icon={<TrendingDown size={20} className="text-red-500" />}
          iconBg="bg-red-50"
        />
        <StatCard
          title="Net Profit"
          value={statsLoading ? "—" : formatCurrency(stats?.netProfit ?? 0n)}
          delta="+8.1% this month"
          deltaPositive
          icon={<DollarSign size={20} className="text-primary" />}
          iconBg="bg-orange-50"
        />
        <StatCard
          title="Active Orders"
          value={statsLoading ? "—" : String(stats?.orderCount ?? 0n)}
          delta={`${stats?.clientCount ?? 0n} clients`}
          deltaPositive
          icon={<ShoppingBag size={20} className="text-blue-600" />}
          iconBg="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-lg border border-border shadow-card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Recent Clients
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {clients.length} total
            </span>
          </div>
          <div
            className="divide-y divide-border"
            data-ocid="dashboard.clients.list"
          >
            {recentClients.length === 0 ? (
              <div
                className="px-5 py-8 text-center text-muted-foreground text-sm"
                data-ocid="dashboard.clients.empty_state"
              >
                No clients yet
              </div>
            ) : (
              recentClients.map((client, i) => (
                <div
                  key={`${client.name}-${String(client.createdAt)}`}
                  className="px-5 py-3 flex items-center justify-between"
                  data-ocid={`dashboard.clients.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {client.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {client.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(client.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Recent Orders
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {orders.length} total
            </span>
          </div>
          <div
            className="divide-y divide-border"
            data-ocid="dashboard.orders.list"
          >
            {recentOrders.length === 0 ? (
              <div
                className="px-5 py-8 text-center text-muted-foreground text-sm"
                data-ocid="dashboard.orders.empty_state"
              >
                No orders yet
              </div>
            ) : (
              recentOrders.map((order, i) => (
                <div
                  key={`${String(order.createdAt)}-${String(order.clientId)}`}
                  className="px-5 py-3 flex items-center justify-between"
                  data-ocid={`dashboard.orders.item.${i + 1}`}
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Order #{orders.length - i}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(order.total)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
