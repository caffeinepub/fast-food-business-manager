import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import List "mo:core/List";

actor {
  // Transaction Types
  type TransactionType = {
    #income;
    #expense;
    #purchase;
  };

  module TransactionType {
    public func toText(txType : TransactionType) : Text {
      switch (txType) {
        case (#income) { "Income" };
        case (#expense) { "Expense" };
        case (#purchase) { "Purchase" };
      };
    };
  };

  // Transaction Record
  type Transaction = {
    txType : TransactionType;
    category : Text;
    amount : Int;
    date : Int;
    notes : Text;
  };

  // Order Status
  type OrderStatus = {
    #pending;
    #inProgress;
    #completed;
    #cancelled;
  };

  module OrderStatus {
    public func toText(status : OrderStatus) : Text {
      switch (status) {
        case (#pending) { "Pending" };
        case (#inProgress) { "In Progress" };
        case (#completed) { "Completed" };
        case (#cancelled) { "Cancelled" };
      };
    };
  };

  // Order Item
  type OrderItem = {
    name : Text;
    quantity : Int;
    unitPrice : Int;
  };

  // Order Record
  type Order = {
    clientId : Nat;
    items : [OrderItem];
    total : Int;
    status : OrderStatus;
    createdAt : Int;
  };

  // Client Record
  type Client = {
    name : Text;
    phone : Text;
    email : Text;
    address : Text;
    notes : Text;
    createdAt : Int;
  };

  // Dashboard Stats
  type DashboardStats = {
    totalRevenue : Int;
    totalExpenses : Int;
    totalPurchases : Int;
    netProfit : Int;
    clientCount : Nat;
    orderCount : Nat;
    transactionCount : Nat;
  };

  // Persistent Storage
  let transactionsMap = Map.empty<Nat, Transaction>();
  let ordersMap = Map.empty<Nat, Order>();
  let clientsMap = Map.empty<Nat, Client>();

  var nextTransactionId = 1;
  var nextOrderId = 1;
  var nextClientId = 1;

  // Helper function to get current timestamp
  func getCurrentTimestamp() : Int {
    Time.now();
  };

  // Client CRUD Operations
  public shared ({ caller }) func createClient(name : Text, phone : Text, email : Text, address : Text, notes : Text) : async Nat {
    let client : Client = {
      name;
      phone;
      email;
      address;
      notes;
      createdAt = getCurrentTimestamp();
    };
    clientsMap.add(nextClientId, client);
    let clientId = nextClientId;
    nextClientId += 1;
    clientId;
  };

  public query ({ caller }) func getClient(id : Nat) : async Client {
    switch (clientsMap.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?client) { client };
    };
  };

  public shared ({ caller }) func updateClient(id : Nat, client : Client) : async () {
    if (not clientsMap.containsKey(id)) {
      Runtime.trap("Client not found");
    };
    clientsMap.add(id, client);
  };

  public shared ({ caller }) func deleteClient(id : Nat) : async () {
    if (not clientsMap.containsKey(id)) {
      Runtime.trap("Client not found");
    };
    clientsMap.remove(id);
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    clientsMap.values().toArray();
  };

  // Order CRUD Operations
  public shared ({ caller }) func createOrder(clientId : Nat, items : [OrderItem], total : Int) : async Nat {
    if (not clientsMap.containsKey(clientId)) {
      Runtime.trap("Client not found");
    };
    let order : Order = {
      clientId;
      items;
      total;
      status = #pending;
      createdAt = getCurrentTimestamp();
    };
    ordersMap.add(nextOrderId, order);
    let orderId = nextOrderId;
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getOrder(id : Nat) : async Order {
    switch (ordersMap.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public shared ({ caller }) func updateOrder(id : Nat, order : Order) : async () {
    if (not ordersMap.containsKey(id)) {
      Runtime.trap("Order not found");
    };
    ordersMap.add(id, order);
  };

  public shared ({ caller }) func deleteOrder(id : Nat) : async () {
    if (not ordersMap.containsKey(id)) {
      Runtime.trap("Order not found");
    };
    ordersMap.remove(id);
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    ordersMap.values().toArray();
  };

  // Transaction CRUD Operations
  public shared ({ caller }) func createTransaction(txType : TransactionType, category : Text, amount : Int, notes : Text) : async Nat {
    let transaction : Transaction = {
      txType;
      category;
      amount;
      date = getCurrentTimestamp();
      notes;
    };
    transactionsMap.add(nextTransactionId, transaction);
    let transactionId = nextTransactionId;
    nextTransactionId += 1;
    transactionId;
  };

  public query ({ caller }) func getTransaction(id : Nat) : async Transaction {
    switch (transactionsMap.get(id)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?transaction) { transaction };
    };
  };

  public shared ({ caller }) func updateTransaction(id : Nat, transaction : Transaction) : async () {
    if (not transactionsMap.containsKey(id)) {
      Runtime.trap("Transaction not found");
    };
    transactionsMap.add(id, transaction);
  };

  public shared ({ caller }) func deleteTransaction(id : Nat) : async () {
    if (not transactionsMap.containsKey(id)) {
      Runtime.trap("Transaction not found");
    };
    transactionsMap.remove(id);
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    transactionsMap.values().toArray();
  };

  // Query Orders by Client ID
  public query ({ caller }) func getOrdersByClient(clientId : Nat) : async [Order] {
    ordersMap.values().filter(func(order) { order.clientId == clientId }).toArray();
  };

  // Query Transactions by Type
  public query ({ caller }) func getTransactionsByType(txType : TransactionType) : async [Transaction] {
    transactionsMap.values().filter(func(transaction) { transaction.txType == txType }).toArray();
  };

  // Dashboard Stats
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    var totalRevenue : Int = 0;
    var totalExpenses : Int = 0;
    var totalPurchases : Int = 0;

    for (transaction in transactionsMap.values()) {
      switch (transaction.txType) {
        case (#income) { totalRevenue += transaction.amount };
        case (#expense) { totalExpenses += transaction.amount };
        case (#purchase) { totalPurchases += transaction.amount };
      };
    };

    {
      totalRevenue;
      totalExpenses;
      totalPurchases;
      netProfit = totalRevenue - (totalExpenses + totalPurchases);
      clientCount = clientsMap.size();
      orderCount = ordersMap.size();
      transactionCount = transactionsMap.size();
    };
  };
};
