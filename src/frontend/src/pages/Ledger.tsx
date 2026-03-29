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
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TransactionType } from "../backend.d";
import Modal from "../components/Modal";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "../hooks/useQueries";
import type { Transaction } from "../hooks/useQueries";
import { formatCurrency, formatDate } from "../lib/format";

const TYPE_CONFIG: Record<
  TransactionType,
  {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    colorClass: string;
    badgeClass: string;
  }
> = {
  [TransactionType.income]: {
    label: "Income",
    icon: TrendingUp,
    colorClass: "text-green-600",
    badgeClass: "bg-green-50 text-green-700 border-green-200",
  },
  [TransactionType.expense]: {
    label: "Expense",
    icon: TrendingDown,
    colorClass: "text-destructive",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  [TransactionType.purchase]: {
    label: "Purchase",
    icon: ShoppingCart,
    colorClass: "text-blue-600",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

const emptyForm = {
  txType: TransactionType.income as TransactionType,
  category: "",
  amount: "",
  notes: "",
  date: new Date().toISOString().split("T")[0],
};

export default function Ledger() {
  const { data: transactions = [], isLoading } = useTransactions();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categorySearch, setCategorySearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== "all" && tx.txType !== typeFilter) return false;
    if (
      categorySearch &&
      !tx.category.toLowerCase().includes(categorySearch.toLowerCase())
    )
      return false;
    if (dateFrom) {
      const txMs = Number(tx.date) / 1_000_000;
      if (txMs < new Date(dateFrom).getTime()) return false;
    }
    if (dateTo) {
      const txMs = Number(tx.date) / 1_000_000;
      if (txMs > new Date(dateTo).getTime() + 86400000) return false;
    }
    return true;
  });

  const totalIncome = filtered
    .filter((t) => t.txType === TransactionType.income)
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filtered
    .filter((t) => t.txType !== TransactionType.income)
    .reduce((s, t) => s + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpense;

  function openAdd() {
    setForm(emptyForm);
    setEditIndex(null);
    setModalOpen(true);
  }

  function openEdit(tx: Transaction, index: number) {
    const ms = Number(tx.date) / 1_000_000;
    const dateStr = new Date(ms).toISOString().split("T")[0];
    setForm({
      txType: tx.txType,
      category: tx.category,
      amount: String(Number(tx.amount) / 100),
      notes: tx.notes,
      date: dateStr,
    });
    setEditIndex(index);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountCents = BigInt(
      Math.round(Number.parseFloat(form.amount || "0") * 100),
    );
    const dateNs = BigInt(new Date(form.date).getTime()) * 1_000_000n;
    try {
      if (editIndex !== null) {
        const existing = transactions[editIndex];
        await updateTx.mutateAsync({
          id: BigInt(editIndex),
          transaction: {
            ...existing,
            txType: form.txType,
            category: form.category,
            amount: amountCents,
            notes: form.notes,
            date: dateNs,
          },
        });
        toast.success("Transaction updated");
      } else {
        await createTx.mutateAsync({
          txType: form.txType,
          category: form.category,
          amount: amountCents,
          notes: form.notes,
        });
        toast.success("Transaction added");
      }
      setModalOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete(index: number) {
    try {
      await deleteTx.mutateAsync(BigInt(index));
      toast.success("Transaction deleted");
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div data-ocid="ledger.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Financial Ledger
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {transactions.length} transactions
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="ledger.add.primary_button"
          className="gap-2"
        >
          <Plus size={16} /> Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-card rounded-lg border border-border shadow-card p-4">
          <div className="text-xs text-muted-foreground mb-1">
            Filtered Income
          </div>
          <div className="text-lg font-bold text-green-600">
            +{formatCurrency(BigInt(Math.round(totalIncome)))}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border shadow-card p-4">
          <div className="text-xs text-muted-foreground mb-1">
            Filtered Outgoing
          </div>
          <div className="text-lg font-bold text-destructive">
            -{formatCurrency(BigInt(Math.round(totalExpense)))}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border shadow-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Net Profit</div>
          <div
            className={`text-lg font-bold ${netProfit >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            {netProfit >= 0 ? "+" : ""}
            {formatCurrency(BigInt(Math.round(netProfit)))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs mb-1 block">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger
                className="h-9"
                data-ocid="ledger.type_filter.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={TransactionType.income}>Income</SelectItem>
                <SelectItem value={TransactionType.expense}>Expense</SelectItem>
                <SelectItem value={TransactionType.purchase}>
                  Purchase
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Category</Label>
            <Input
              placeholder="Search category…"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="h-9"
              data-ocid="ledger.category.search_input"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9"
              data-ocid="ledger.date_from.input"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9"
              data-ocid="ledger.date_to.input"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div
            className="py-16 text-center text-muted-foreground"
            data-ocid="ledger.loading_state"
          >
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center" data-ocid="ledger.empty_state">
            <BookOpen
              size={40}
              className="mx-auto text-muted-foreground/40 mb-3"
            />
            <p className="text-muted-foreground text-sm">
              No transactions found
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Category
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  Notes
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Amount
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((tx, i) => {
                const cfg = TYPE_CONFIG[tx.txType];
                const Icon = cfg.icon;
                const isIncome = tx.txType === TransactionType.income;
                return (
                  <tr
                    key={`${String(tx.date)}-${tx.category}-${String(tx.amount)}`}
                    className="hover:bg-muted/30 transition-colors"
                    data-ocid={`ledger.item.${i + 1}`}
                  >
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.badgeClass}`}
                      >
                        <Icon size={11} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {tx.category}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                      {tx.notes || "—"}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-semibold ${
                        isIncome ? "text-green-600" : "text-destructive"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(tx, i)}
                          data-ocid={`ledger.edit_button.${i + 1}`}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(i)}
                          data-ocid={`ledger.delete_button.${i + 1}`}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editIndex !== null ? "Edit Transaction" : "Add Transaction"}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type *</Label>
              <Select
                value={form.txType}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, txType: v as TransactionType }))
                }
              >
                <SelectTrigger data-ocid="ledger.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransactionType.income}>Income</SelectItem>
                  <SelectItem value={TransactionType.expense}>
                    Expense
                  </SelectItem>
                  <SelectItem value={TransactionType.purchase}>
                    Purchase
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tx-category">Category *</Label>
              <Input
                id="tx-category"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                placeholder="e.g. Ingredients, Rent"
                required
                data-ocid="ledger.category.input"
              />
            </div>
            <div>
              <Label htmlFor="tx-amount">Amount ($) *</Label>
              <Input
                id="tx-amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="0.00"
                required
                data-ocid="ledger.amount.input"
              />
            </div>
            <div>
              <Label htmlFor="tx-date">Date</Label>
              <Input
                id="tx-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="ledger.date.input"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="tx-notes">Notes</Label>
              <Textarea
                id="tx-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Optional notes…"
                rows={2}
                data-ocid="ledger.notes.textarea"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-1"
              data-ocid="ledger.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createTx.isPending || updateTx.isPending}
              data-ocid="ledger.submit_button"
            >
              {editIndex !== null ? "Save Changes" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Delete Transaction"
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Delete this transaction? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              className="flex-1"
              data-ocid="ledger.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmDelete !== null && handleDelete(confirmDelete)
              }
              className="flex-1"
              disabled={deleteTx.isPending}
              data-ocid="ledger.delete.confirm_button"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
