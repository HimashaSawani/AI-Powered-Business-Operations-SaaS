import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabKey } from './components/Sidebar';
import { ArchitectureModal } from './components/ArchitectureModal';
import { DashboardView } from './views/DashboardView';
import { InventoryView } from './views/InventoryView';
import { SalesPosView } from './views/SalesPosView';
import { CrmView } from './views/CrmView';
import { HelpdeskView } from './views/HelpdeskView';
import { AiIntelligenceView } from './views/AiIntelligenceView';
import { AuditLogView } from './views/AuditLogView';
import { 
  initialOrganizations, 
  demoUsers, 
  initialProducts, 
  initialCustomers, 
  initialOrders, 
  initialTickets, 
  initialInsights, 
  initialMovements,
  initialAuditLogs,
  initialNotifications
} from './mockData';
import { 
  Customer, 
  Product, 
  Order, 
  Ticket, 
  AiInsight, 
  InventoryMovement, 
  User, 
  Organization, 
  MovementType,
  AuditLogEntry,
  SystemNotification
} from './types';

export function App() {
  // Platform Tenant & Persona State
  const [organizations] = useState<Organization[]>(initialOrganizations);
  const [currentOrg, setCurrentOrg] = useState<Organization>(initialOrganizations[0]);
  const [users] = useState<User[]>(demoUsers);
  const [currentUser, setCurrentUser] = useState<User>(demoUsers[2]); // Marcus Chen (Operations Manager) by default

  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Business Entities State (Inter-Connected Nervous System)
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [movements, setMovements] = useState<InventoryMovement[]>(initialMovements);
  const [insights, setInsights] = useState<AiInsight[]>(initialInsights);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);

  // Cross-Module Notification Toast State
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'alert' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 1. Cross-Module Atomic Order Placement Handler
  const handlePlaceOrder = (payload: {
    customer_id: number;
    items: { product_id: number; quantity: number; unit_price: number }[];
    tax_rate: number;
    payment_method: string;
    notes?: string;
  }) => {
    for (const item of payload.items) {
      const prod = products.find((p) => p.id === item.product_id);
      if (!prod || prod.current_stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient inventory for ${prod?.name || 'Product'}. Transaction rolled back.`,
        };
      }
    }

    const subtotal = payload.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const taxAmount = Math.round(subtotal * payload.tax_rate * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const targetCustomer = customers.find((c) => c.id === payload.customer_id);

    const newOrder: Order = {
      id: Date.now(),
      organization_id: currentOrg.id,
      customer_id: payload.customer_id,
      customer: targetCustomer,
      user_id: currentUser.id,
      order_number: orderNumber,
      status: 'completed',
      subtotal,
      tax_amount: taxAmount,
      discount_amount: 0.0,
      total_amount: totalAmount,
      payment_status: 'paid',
      notes: payload.notes,
      items: payload.items.map((i) => ({
        product_id: i.product_id,
        product: products.find((p) => p.id === i.product_id),
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.unit_price * i.quantity,
      })),
      created_at: new Date().toISOString(),
    };

    const newMovements: InventoryMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const purchasedItem = payload.items.find((i) => i.product_id === prod.id);
      if (purchasedItem) {
        const newStock = prod.current_stock - purchasedItem.quantity;
        const newStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 
          newStock <= 0 ? 'out_of_stock' : (newStock <= prod.reorder_level ? 'low_stock' : 'in_stock');

        newMovements.push({
          id: movements.length + newMovements.length + 101,
          organization_id: currentOrg.id,
          product_id: prod.id,
          product: { name: prod.name, sku: prod.sku },
          type: 'SALE',
          quantity: -purchasedItem.quantity,
          balance_after: newStock,
          reference_type: 'Order',
          reference_id: orderNumber,
          notes: `POS order ${orderNumber} dispatch for ${targetCustomer?.name || 'Customer'}`,
          created_at: new Date().toISOString(),
        });

        return {
          ...prod,
          current_stock: newStock,
          status: newStatus,
        };
      }
      return prod;
    });

    const updatedCustomers = customers.map((c) => {
      if (c.id === payload.customer_id) {
        const newOrderCount = c.total_orders + 1;
        const newLtv = c.lifetime_value + totalAmount;
        const newHealth = Math.min(100, (c.health_score || 85) + 3);

        return {
          ...c,
          total_orders: newOrderCount,
          lifetime_value: newLtv,
          last_order_at: new Date().toISOString(),
          health_score: newHealth,
          status: 'active' as const,
        };
      }
      return c;
    });

    // Create Audit Log Entry
    const newAudit: AuditLogEntry = {
      id: auditLogs.length + 1,
      organization_id: currentOrg.id,
      user_name: currentUser.name,
      action: 'order_create',
      entity_type: 'Order',
      entity_id: orderNumber,
      summary: `Atomic order checkout executed: $${totalAmount.toFixed(2)} via ${payload.payment_method}`,
      new_values: { total: totalAmount, items: payload.items.length },
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };

    setOrders([newOrder, ...orders]);
    setProducts(updatedProducts);
    setMovements([...newMovements, ...movements]);
    setCustomers(updatedCustomers);
    setAuditLogs([newAudit, ...auditLogs]);

    showToast(
      'Atomic Transaction Committed!',
      `Order ${orderNumber} placed ($${totalAmount.toFixed(2)}). Stock reduced & movement #SALE logged.`
    );

    return { success: true };
  };

  // 2. Inventory Movement Handler
  const handleRecordMovement = (productId: number, type: MovementType, quantity: number, notes: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    const newStock = targetProduct.current_stock + quantity;
    if (newStock < 0) {
      showToast('Movement Rejected', 'Inventory adjustment cannot result in negative stock.', 'alert');
      return;
    }

    const newStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 
      newStock <= 0 ? 'out_of_stock' : (newStock <= targetProduct.reorder_level ? 'low_stock' : 'in_stock');

    const newMovement: InventoryMovement = {
      id: movements.length + 101,
      organization_id: currentOrg.id,
      product_id: productId,
      product: { name: targetProduct.name, sku: targetProduct.sku },
      type,
      quantity,
      balance_after: newStock,
      reference_type: 'ManualAudit',
      reference_id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      notes,
      created_at: new Date().toISOString(),
    };

    // Create Audit Log
    const newAudit: AuditLogEntry = {
      id: auditLogs.length + 1,
      organization_id: currentOrg.id,
      user_name: currentUser.name,
      action: 'inventory_adjust',
      entity_type: 'Product',
      entity_id: targetProduct.sku,
      summary: `Stock adjusted: ${targetProduct.name} (${quantity > 0 ? `+${quantity}` : quantity} units). New balance: ${newStock}`,
      old_values: { stock: targetProduct.current_stock },
      new_values: { stock: newStock },
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };

    setProducts(
      products.map((p) => (p.id === productId ? { ...p, current_stock: newStock, status: newStatus } : p))
    );
    setMovements([newMovement, ...movements]);
    setAuditLogs([newAudit, ...auditLogs]);

    showToast(
      'Inventory Movement Recorded',
      `${type} of ${quantity > 0 ? `+${quantity}` : quantity} units for ${targetProduct.name}. New balance: ${newStock}.`
    );
  };

  // 3. New Product Catalog Handler
  const handleCreateProduct = (newProd: Partial<Product>) => {
    const product: Product = {
      id: Date.now(),
      organization_id: currentOrg.id,
      sku: newProd.sku || 'SKU-000',
      name: newProd.name || 'New Item',
      price: newProd.price || 19.99,
      cost: newProd.cost || 9.50,
      current_stock: newProd.current_stock || 10,
      reorder_level: newProd.reorder_level || 5,
      status: (newProd.current_stock || 0) <= (newProd.reorder_level || 5) ? 'low_stock' : 'in_stock',
    };

    setProducts([...products, product]);
    showToast('Product Created', `Product ${product.name} (${product.sku}) added to catalog.`);
  };

  // 4. CRM Handlers
  const handleCreateCustomer = (cust: Partial<Customer>) => {
    const newCustomer: Customer = {
      id: Date.now(),
      organization_id: currentOrg.id,
      name: cust.name || 'New Customer',
      email: cust.email || 'customer@example.com',
      company: cust.company || 'Enterprise',
      phone: cust.phone || '',
      status: 'active',
      health_score: 85,
      lifetime_value: 0.0,
      total_orders: 0,
      timeline: [
        { time: 'Today', title: 'Account Onboarded', desc: 'Customer account registered in CRM', icon: 'check', color: 'emerald' }
      ]
    };

    setCustomers([newCustomer, ...customers]);
    showToast('Customer Created', `Account for ${newCustomer.name} created.`);
  };

  const handleAddNote = (customerId: number, _content: string) => {
    showToast('Account Note Logged', `Internal note added for customer #${customerId}.`);
  };

  // 5. Helpdesk Handlers
  const handleReplyTicket = (ticketId: number, message: string, newStatus?: string) => {
    setTickets(
      tickets.map((t) => {
        if (t.id === ticketId) {
          const updatedMessages = [
            ...(t.messages || []),
            {
              id: Date.now(),
              ticket_id: ticketId,
              sender_type: 'staff' as const,
              sender_name: currentUser.name,
              message,
              created_at: new Date().toISOString(),
            },
          ];
          return {
            ...t,
            status: (newStatus as any) || t.status,
            messages: updatedMessages,
          };
        }
        return t;
      })
    );

    showToast('Reply Sent', `Message dispatched on Ticket #${ticketId}. Status updated.`);
  };

  const handleCreateTicket = (data: {
    customer_id: number;
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    message: string;
  }) => {
    const customer = customers.find((c) => c.id === data.customer_id);
    const newTicket: Ticket = {
      id: Date.now(),
      organization_id: currentOrg.id,
      customer_id: data.customer_id,
      customer,
      ticket_number: `TCK-${Math.floor(2000 + Math.random() * 8000)}`,
      subject: data.subject,
      priority: data.priority,
      category: data.category,
      status: 'open',
      sentiment: (data.message.toLowerCase().includes('charged') || data.message.toLowerCase().includes('broken')) ? 'negative' : 'neutral',
      ai_confidence: 0.94,
      assigned_team: data.category === 'Billing' ? 'Billing & Payments Team' : 'Technical Support Team',
      messages: [
        {
          id: Date.now(),
          ticket_id: Date.now(),
          sender_type: 'customer',
          sender_name: customer?.name || 'Customer',
          message: data.message,
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
    };

    setTickets([newTicket, ...tickets]);
    showToast('Ticket Opened', `Support inquiry ${newTicket.ticket_number} logged & auto-classified by AI.`);
  };

  // 6. AI Insights Handlers
  const handleApplyInsight = (id: string | number) => {
    setInsights(
      insights.map((ins) => (ins.id === id ? { ...ins, status: 'applied' } : ins))
    );
    showToast(
      'AI Recommendation Applied',
      'Action item executed. Automated notification sent to operations dispatch.'
    );
  };

  const handleDismissInsight = (id: string | number) => {
    setInsights(
      insights.map((ins) => (ins.id === id ? { ...ins, status: 'dismissed' } : ins))
    );
    showToast('Recommendation Dismissed', 'Insight removed from executive feed.');
  };

  // 7. Notification Mark Read Handler
  const handleMarkNotificationRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  // Filtered collections for global search
  const filteredProducts = searchQuery
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  const filteredCustomers = searchQuery
    ? customers.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : customers;

  const filteredTickets = searchQuery
    ? tickets.filter((t) => t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()))
    : tickets;

  // Metrics Count
  const lowStockCount = products.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock').length;
  const criticalChurnCount = customers.filter((c) => (c.health_score && c.health_score < 45) || (c.latest_ai_score && c.latest_ai_score.risk_level === 'CRITICAL')).length;
  const openTicketsCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const activeInsightsCount = insights.filter((i) => i.status === 'active').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Platform Header with Notification Bell & Global Search */}
      <Header
        currentOrg={currentOrg}
        organizations={organizations}
        onSelectOrg={(org) => {
          setCurrentOrg(org);
          showToast('Tenant Switched', `Active organization scope changed to ${org.name}.`);
        }}
        currentUser={currentUser}
        users={users}
        onSelectUser={(u) => {
          setCurrentUser(u);
          showToast('Persona Switched', `Active user is now ${u.name} (${u.role}).`);
        }}
        lowStockCount={lowStockCount}
        criticalChurnCount={criticalChurnCount}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenArchModal={() => setIsArchModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={currentUser.role}
          counts={{
            lowStock: lowStockCount,
            openTickets: openTicketsCount,
            atRiskCustomers: criticalChurnCount,
            activeInsights: activeInsightsCount,
            auditLogsCount: auditLogs.length,
          }}
        />

        {/* View Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                customers={filteredCustomers}
                products={filteredProducts}
                orders={orders}
                tickets={filteredTickets}
                insights={insights}
                movements={movements}
                onApplyInsight={handleApplyInsight}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                products={filteredProducts}
                movements={movements}
                onRecordMovement={handleRecordMovement}
                onCreateProduct={handleCreateProduct}
              />
            )}

            {activeTab === 'sales' && (
              <SalesPosView
                customers={filteredCustomers}
                products={filteredProducts}
                orders={orders}
                onPlaceOrder={handlePlaceOrder}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'crm' && (
              <CrmView
                customers={filteredCustomers}
                onCreateCustomer={handleCreateCustomer}
                onAddNote={handleAddNote}
              />
            )}

            {activeTab === 'helpdesk' && (
              <HelpdeskView
                tickets={filteredTickets}
                customers={filteredCustomers}
                onReplyTicket={handleReplyTicket}
                onCreateTicket={handleCreateTicket}
              />
            )}

            {activeTab === 'ai' && (
              <AiIntelligenceView
                customers={filteredCustomers}
                products={filteredProducts}
                insights={insights}
                onApplyInsight={handleApplyInsight}
                onDismissInsight={handleDismissInsight}
              />
            )}

            {activeTab === 'audit' && (
              <AuditLogView logs={auditLogs} />
            )}
          </div>
        </main>
      </div>

      {/* Architecture Nervous System Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* Dynamic Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl shadow-indigo-950/60 text-xs animate-in slide-in-from-bottom-5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              toastMessage.type === 'alert'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            ✓
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-white">{toastMessage.title}</h4>
            <p className="text-slate-300 max-w-xs">{toastMessage.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
