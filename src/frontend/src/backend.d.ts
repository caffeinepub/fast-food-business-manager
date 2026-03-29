import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderItem {
    name: string;
    quantity: bigint;
    unitPrice: bigint;
}
export interface Client {
    name: string;
    createdAt: bigint;
    email: string;
    address: string;
    notes: string;
    phone: string;
}
export interface Order {
    status: OrderStatus;
    total: bigint;
    clientId: bigint;
    createdAt: bigint;
    items: Array<OrderItem>;
}
export interface DashboardStats {
    clientCount: bigint;
    totalExpenses: bigint;
    totalPurchases: bigint;
    orderCount: bigint;
    totalRevenue: bigint;
    netProfit: bigint;
    transactionCount: bigint;
}
export interface Transaction {
    date: bigint;
    notes: string;
    category: string;
    txType: TransactionType;
    amount: bigint;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum TransactionType {
    expense = "expense",
    income = "income",
    purchase = "purchase"
}
export interface backendInterface {
    createClient(name: string, phone: string, email: string, address: string, notes: string): Promise<bigint>;
    createOrder(clientId: bigint, items: Array<OrderItem>, total: bigint): Promise<bigint>;
    createTransaction(txType: TransactionType, category: string, amount: bigint, notes: string): Promise<bigint>;
    deleteClient(id: bigint): Promise<void>;
    deleteOrder(id: bigint): Promise<void>;
    deleteTransaction(id: bigint): Promise<void>;
    getAllClients(): Promise<Array<Client>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getClient(id: bigint): Promise<Client>;
    getDashboardStats(): Promise<DashboardStats>;
    getOrder(id: bigint): Promise<Order>;
    getOrdersByClient(clientId: bigint): Promise<Array<Order>>;
    getTransaction(id: bigint): Promise<Transaction>;
    getTransactionsByType(txType: TransactionType): Promise<Array<Transaction>>;
    updateClient(id: bigint, client: Client): Promise<void>;
    updateOrder(id: bigint, order: Order): Promise<void>;
    updateTransaction(id: bigint, transaction: Transaction): Promise<void>;
}
