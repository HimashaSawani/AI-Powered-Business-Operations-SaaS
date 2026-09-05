export type UserRole = 'super_admin' | 'owner' | 'manager' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  current_organization_id?: number;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  plan: string;
  status: string;
}

export interface CustomerTimelineEvent {
  time: string;
  title: string;
  desc: string;
  icon?: string;
  color?: string;
}

export interface CustomerHealthFactors {
  recency: number;
  purchase_frequency: number;
  revenue: number;
  support: number;
  engagement: number;
  refunds?: number;
}

export interface Customer {
  id: number;
  organization_id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'at_risk' | 'churned' | 'lead';
  health_score?: number;
  health_factors?: CustomerHealthFactors;
  timeline?: CustomerTimelineEvent[];
  lifetime_value: number;
  total_orders: number;
  last_order_at?: string;
  latest_ai_score?: AiCustomerScore;
}

export interface CustomerNote {
  id: number;
  customer_id: number;
  user_id?: number;
  user?: { name: string; avatar?: string };
  content: string;
  created_at: string;
}

export interface Product {
  id: number;
  organization_id: number;
  category_id?: number;
  supplier_id?: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  current_stock: number;
  reorder_level: number;
  safety_stock?: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  category?: { id: number; name: string };
  supplier?: { id: number; name: string; lead_time_days: number };
}

export type MovementType = 'PURCHASE' | 'SALE' | 'RETURN' | 'DAMAGE' | 'ADJUSTMENT' | 'TRANSFER';

export interface InventoryMovement {
  id: number;
  organization_id: number;
  product_id: number;
  product?: { name: string; sku: string };
  user_id?: number;
  user?: { name: string };
  type: MovementType;
  quantity: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  organization_id: number;
  customer_id: number;
  customer?: Customer;
  user_id?: number;
  order_number: string;
  status: 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  items?: OrderItem[];
  payments?: Payment[];
  created_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  transaction_reference: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id?: number;
  user?: { name: string; avatar?: string };
  sender_type: 'staff' | 'customer';
  sender_name: string;
  message: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  organization_id: number;
  customer_id: number;
  customer?: Customer;
  assigned_user_id?: number;
  assigned_user?: User;
  assigned_team?: string;
  ticket_number: string;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sentiment?: 'negative' | 'neutral' | 'positive';
  ai_confidence?: number;
  category: string;
  messages?: TicketMessage[];
  created_at: string;
}

export interface AiCustomerScore {
  id?: number;
  customer_id: number;
  churn_risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  key_drivers: string[];
  suggested_action: string;
  calculated_at: string;
}

export interface AiInsight {
  id: number | string;
  organization_id?: number;
  insight_code?: string;
  category: 'INVENTORY' | 'CUSTOMER_RETENTION' | 'HELPDESK' | 'REVENUE';
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'OPPORTUNITY';
  impact_metric: string;
  recommended_action: string;
  status: 'active' | 'dismissed' | 'applied';
  confidence_score: number;
  created_at?: string;
}

export interface ModelBenchmarkMetric {
  model_name: string;
  mae: number;
  rmse: number;
  mape: number;
  projected_30d_demand: number;
  is_best_fit: boolean;
}

export interface AuditLogEntry {
  id: number;
  organization_id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  summary: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface SystemNotification {
  id: number;
  organization_id: number;
  type: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string | null;
  created_at: string;
}
