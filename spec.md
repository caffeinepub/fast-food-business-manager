# Fast Food Business Manager

## Current State
New project. Empty Motoko backend and blank React frontend.

## Requested Changes (Diff)

### Add
- **Client Management**: CRUD for clients (name, phone, email, address, notes). Each client has an associated order history.
- **Order Tracking**: Create/edit/delete orders linked to clients. Orders contain line items (item name, quantity, unit price). Orders have a status (pending, in-progress, completed, cancelled) and a timestamp.
- **Ledger / Bookkeeping**: Financial transactions with type (income, expense, purchase), category, amount, date, and notes. Income auto-generated when an order is marked complete.
- **Dashboard**: Summary cards for total revenue, total expenses, net profit, number of clients, number of orders. Recent orders list.
- **Transaction Log**: Full list of financial entries with filtering by date range, category, and type.
- **Filtering and Search**: Text search on clients and orders. Date/category/type filter on transactions.
- **Sample data**: Pre-populate with a few clients, orders, and transactions so the app feels alive on first load.

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Motoko backend:
   - Client type: id, name, phone, email, address, notes, createdAt
   - Order type: id, clientId, items (array of {name, qty, unitPrice}), status, total, createdAt, completedAt
   - Transaction type: id, txType (income/expense/purchase), category, amount, date, notes, orderId (optional)
   - CRUD operations for each entity
   - Query: getDashboardStats (aggregate revenue, expenses, profit, counts)
   - Query: getTransactions with optional filters
   - Query: getOrdersByClient
2. Frontend pages:
   - Dashboard (default landing)
   - Clients list + client detail/modal
   - Orders list + order form modal
   - Ledger/Transaction log with filters
3. Navigation: sidebar with icons for each section
