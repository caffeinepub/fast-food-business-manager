import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Search, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Modal from "../components/Modal";
import {
  useClients,
  useCreateClient,
  useDeleteClient,
  useOrders,
  useUpdateClient,
} from "../hooks/useQueries";
import type { Client } from "../hooks/useQueries";
import { formatCurrency, formatDate } from "../lib/format";

const emptyForm = { name: "", phone: "", email: "", address: "", notes: "" };

export default function Clients() {
  const { data: clients = [], isLoading } = useClients();
  const { data: orders = [] } = useOrders();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [viewClient, setViewClient] = useState<{
    client: Client;
    index: number;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  function openAdd() {
    setForm(emptyForm);
    setEditIndex(null);
    setModalOpen(true);
  }

  function openEdit(client: Client, index: number) {
    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      notes: client.notes,
    });
    setEditIndex(index);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      if (editIndex !== null) {
        const existing = clients[editIndex];
        await updateClient.mutateAsync({
          id: BigInt(editIndex),
          client: { ...existing, ...form },
        });
        toast.success("Client updated");
      } else {
        await createClient.mutateAsync(form);
        toast.success("Client added");
      }
      setModalOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete(index: number) {
    try {
      await deleteClient.mutateAsync(BigInt(index));
      toast.success("Client deleted");
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to delete");
    }
  }

  const clientOrders = (index: number) =>
    orders.filter((o) => Number(o.clientId) === index);

  return (
    <div data-ocid="clients.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {clients.length} total clients
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="clients.add.primary_button"
          className="gap-2"
        >
          <Plus size={16} /> Add Client
        </Button>
      </div>

      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search clients by name, email, or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-ocid="clients.search_input"
        />
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div
            className="py-16 text-center text-muted-foreground"
            data-ocid="clients.loading_state"
          >
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center" data-ocid="clients.empty_state">
            <User size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No clients found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                  Phone
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                  Joined
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((client, i) => (
                <tr
                  key={`${client.name}-${client.phone}`}
                  className="hover:bg-muted/30 transition-colors"
                  data-ocid={`clients.item.${i + 1}`}
                >
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setViewClient({ client, index: i })}
                      className="flex items-center gap-3 hover:text-primary transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">
                        {client.name}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">
                    {client.email}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">
                    {client.phone}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatDate(client.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(client, i)}
                        data-ocid={`clients.edit_button.${i + 1}`}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(i)}
                        data-ocid={`clients.delete_button.${i + 1}`}
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
        title={editIndex !== null ? "Edit Client" : "Add New Client"}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="client-name">Full Name *</Label>
              <Input
                id="client-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="John Doe"
                required
                data-ocid="clients.name.input"
              />
            </div>
            <div>
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="555-1234"
                data-ocid="clients.phone.input"
              />
            </div>
            <div>
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="john@example.com"
                data-ocid="clients.email.input"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="client-address">Address</Label>
              <Input
                id="client-address"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="123 Main St"
                data-ocid="clients.address.input"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="client-notes">Notes</Label>
              <Textarea
                id="client-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Any additional notes…"
                rows={3}
                data-ocid="clients.notes.textarea"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-1"
              data-ocid="clients.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createClient.isPending || updateClient.isPending}
              data-ocid="clients.submit_button"
            >
              {editIndex !== null ? "Save Changes" : "Add Client"}
            </Button>
          </div>
        </form>
      </Modal>

      {viewClient && (
        <Modal
          isOpen={!!viewClient}
          onClose={() => setViewClient(null)}
          title={viewClient.client.name}
          size="lg"
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-medium">
                  {viewClient.client.email || "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                <span className="font-medium">
                  {viewClient.client.phone || "—"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Address:</span>{" "}
                <span className="font-medium">
                  {viewClient.client.address || "—"}
                </span>
              </div>
              {viewClient.client.notes && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Notes:</span>{" "}
                  <span className="font-medium">{viewClient.client.notes}</span>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Order History ({clientOrders(viewClient.index).length})
              </h4>
              {clientOrders(viewClient.index).length === 0 ? (
                <p className="text-muted-foreground text-sm">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {clientOrders(viewClient.index).map((o) => (
                    <div
                      key={`${String(o.createdAt)}-${String(o.total)}`}
                      className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2 text-sm"
                    >
                      <span className="text-muted-foreground">
                        {formatDate(o.createdAt)}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(o.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Delete Client"
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to delete this client? This action cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              className="flex-1"
              data-ocid="clients.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmDelete !== null && handleDelete(confirmDelete)
              }
              className="flex-1"
              disabled={deleteClient.isPending}
              data-ocid="clients.delete.confirm_button"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
