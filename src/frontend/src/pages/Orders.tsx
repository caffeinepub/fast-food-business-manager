import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MinusCircle,
  Pencil,
  Plus,
  PlusCircle,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type OrderItem, OrderStatus } from "../backend.d";
import Modal from "../components/Modal";
import {
  useClients,
  useCreateOrder,
  useDeleteOrder,
  useOrders,
  useUpdateOrder,
} from "../hooks/useQueries";
import type { Order } from "../hooks/useQueries";
import { formatCurrency, formatDate } from "../lib/format";

function StatusBadge({ status }: { status: OrderStatus }) {
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

interface ItemRow {
  id: string;
  name: string;
  quantity: string;
  unitPrice: string;
}

const emptyItem = (): ItemRow => ({
  id: crypto.randomUUID(),
  name: "",
  quantity: "1",
  unitPrice: "",
});

const STATUS_OPTIONS = [
  { value: OrderStatus.pending, label: "Pending" },
  { value: OrderStatus.inProgress, label: "In Progress" },
  { value: OrderStatus.completed, label: "Completed" },
  { value: OrderStatus.cancelled, label: "Cancelled" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: OrderStatus.pending, label: "Pending" },
  { value: OrderStatus.inProgress, label: "In Progress" },
  { value: OrderStatus.completed, label: "Completed" },
  { value: OrderStatus.cancelled, label: "Cancelled" },
];

export default function Orders() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: clients = [] } = useClients();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.pending);
  const [items, setItems] = useState<ItemRow[]>([emptyItem()]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const total = items.reduce((sum, it) => {
    const qty = Number.parseFloat(it.quantity) || 0;
    const price = Number.parseFloat(it.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  function openAdd() {
    setClientId("");
    setStatus(OrderStatus.pending);
    setItems([emptyItem()]);
    setEditIndex(null);
    setModalOpen(true);
  }

  function openEdit(order: Order, index: number) {
    setClientId(String(order.clientId));
    setStatus(order.status);
    setItems(
      order.items.map((it) => ({
        id: crypto.randomUUID(),
        name: it.name,
        quantity: String(it.quantity),
        unitPrice: String(Number(it.unitPrice) / 100),
      })),
    );
    setEditIndex(index);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) return;
    const orderItems: OrderItem[] = items
      .filter((it) => it.name.trim())
      .map((it) => ({
        name: it.name,
        quantity: BigInt(Math.round(Number.parseFloat(it.quantity) || 1)),
        unitPrice: BigInt(
          Math.round((Number.parseFloat(it.unitPrice) || 0) * 100),
        ),
      }));
    const totalCents = BigInt(Math.round(total * 100));
    try {
      if (editIndex !== null) {
        const existing = orders[editIndex];
        await updateOrder.mutateAsync({
          id: BigInt(editIndex),
          order: {
            ...existing,
            clientId: BigInt(clientId),
            items: orderItems,
            total: totalCents,
            status,
          },
        });
        toast.success("Order updated");
      } else {
        await createOrder.mutateAsync({
          clientId: BigInt(clientId),
          items: orderItems,
          total: totalCents,
        });
        toast.success("Order created");
      }
      setModalOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete(index: number) {
    try {
      await deleteOrder.mutateAsync(BigInt(index));
      toast.success("Order deleted");
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to delete");
    }
  }

  function updateItem(index: number, field: keyof ItemRow, value: string) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );
  }

  function clientName(id: bigint) {
    const c = clients[Number(id)];
    return c ? c.name : `Client #${id}`;
  }

  return (
    <div data-ocid="orders.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {orders.length} total orders
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="orders.add.primary_button"
          className="gap-2"
        >
          <Plus size={16} /> New Order
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        {FILTER_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            data-ocid="orders.filter.tab"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div
            className="py-16 text-center text-muted-foreground"
            data-ocid="orders.loading_state"
          >
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center" data-ocid="orders.empty_state">
            <ShoppingBag
              size={40}
              className="mx-auto text-muted-foreground/40 mb-3"
            />
            <p className="text-muted-foreground text-sm">No orders found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  #
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  Items
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                  Date
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order, i) => (
                <tr
                  key={`${String(order.createdAt)}-${String(order.clientId)}`}
                  className="hover:bg-muted/30 transition-colors"
                  data-ocid={`orders.item.${i + 1}`}
                >
                  <td className="px-5 py-3 font-medium text-muted-foreground">
                    #{i + 1}
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">
                    {clientName(order.clientId)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-5 py-3 font-semibold text-foreground">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(order, i)}
                        data-ocid={`orders.edit_button.${i + 1}`}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(i)}
                        data-ocid={`orders.delete_button.${i + 1}`}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editIndex !== null ? "Edit Order" : "New Order"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger data-ocid="orders.client.select">
                  <SelectValue placeholder="Select client…" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c, i) => (
                    <SelectItem key={`${c.name}-${c.phone}`} value={String(i)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editIndex !== null && (
              <div>
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as OrderStatus)}
                >
                  <SelectTrigger data-ocid="orders.status.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Items</Label>
              <button
                type="button"
                onClick={() => setItems((p) => [...p, emptyItem()])}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                data-ocid="orders.add.secondary_button"
              >
                <PlusCircle size={14} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-1">
                <span className="col-span-6">Name</span>
                <span className="col-span-2">Qty</span>
                <span className="col-span-3">Unit Price ($)</span>
                <span className="col-span-1" />
              </div>
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <Input
                    className="col-span-6"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                    data-ocid="orders.item_name.input"
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    data-ocid="orders.item_qty.input"
                  />
                  <Input
                    className="col-span-3"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                    data-ocid="orders.item_price.input"
                  />
                  <button
                    type="button"
                    onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                    disabled={items.length === 1}
                    className="col-span-1 flex items-center justify-center text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                  >
                    <MinusCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-medium text-muted-foreground">
              Order Total
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(BigInt(Math.round(total * 100)))}
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-1"
              data-ocid="orders.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createOrder.isPending || updateOrder.isPending}
              data-ocid="orders.submit_button"
            >
              {editIndex !== null ? "Save Changes" : "Create Order"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Delete Order"
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to delete this order?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              className="flex-1"
              data-ocid="orders.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmDelete !== null && handleDelete(confirmDelete)
              }
              className="flex-1"
              disabled={deleteOrder.isPending}
              data-ocid="orders.delete.confirm_button"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
