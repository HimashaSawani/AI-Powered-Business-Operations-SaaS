<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\InventoryMovement;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\AiCustomerScore;
use App\Models\AiInsight;
use App\Models\AuditLog;
use App\Models\SystemNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Organizations
        $org1 = Organization::create([
            'name' => 'Apex Dynamics Ltd',
            'slug' => 'apex-dynamics',
            'plan' => 'Enterprise',
            'status' => 'active',
            'settings' => ['currency' => 'USD', 'tax_rate' => 0.10],
        ]);

        $org2 = Organization::create([
            'name' => 'Nova Retail Co',
            'slug' => 'nova-retail',
            'plan' => 'Pro',
            'status' => 'active',
            'settings' => ['currency' => 'USD', 'tax_rate' => 0.08],
        ]);

        // 2. Users with Roles
        $superAdmin = User::create([
            'name' => 'Alexander Vance',
            'email' => 'admin@opsmind.ai',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'current_organization_id' => $org1->id,
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        ]);

        $owner = User::create([
            'name' => 'Elena Rostova',
            'email' => 'owner@apexdynamics.com',
            'password' => Hash::make('password123'),
            'role' => 'owner',
            'current_organization_id' => $org1->id,
            'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        ]);

        $manager = User::create([
            'name' => 'Marcus Chen',
            'email' => 'manager@apexdynamics.com',
            'password' => Hash::make('password123'),
            'role' => 'manager',
            'current_organization_id' => $org1->id,
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        ]);

        $staff = User::create([
            'name' => 'Sarah Jenkins',
            'email' => 'staff@apexdynamics.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
            'current_organization_id' => $org1->id,
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        ]);

        $org1->users()->attach([
            $superAdmin->id => ['role' => 'super_admin'],
            $owner->id => ['role' => 'owner'],
            $manager->id => ['role' => 'manager'],
            $staff->id => ['role' => 'staff'],
        ]);

        // 3. Categories & Suppliers
        $catElectronics = Category::create(['organization_id' => $org1->id, 'name' => 'Electronics & Peripherals', 'slug' => 'electronics']);
        $catAudio = Category::create(['organization_id' => $org1->id, 'name' => 'Audio & Accessories', 'slug' => 'audio']);
        $catOffice = Category::create(['organization_id' => $org1->id, 'name' => 'Office Workstations', 'slug' => 'workstations']);

        $supLogitech = Supplier::create(['organization_id' => $org1->id, 'name' => 'Pacific Hardware Corp', 'email' => 'orders@pacifichw.com', 'phone' => '+1 (555) 234-5678', 'lead_time_days' => 5]);
        $supAudio = Supplier::create(['organization_id' => $org1->id, 'name' => 'Sonic Sound Distro', 'email' => 'rep@sonicsound.io', 'phone' => '+1 (555) 876-5432', 'lead_time_days' => 8]);

        // 4. Products (Including Wireless Mouse WM-001)
        $mouse = Product::create([
            'organization_id' => $org1->id,
            'category_id' => $catElectronics->id,
            'supplier_id' => $supLogitech->id,
            'sku' => 'WM-001',
            'name' => 'Wireless Mouse Pro Ergonomic',
            'description' => 'Precision dual-mode 2.4GHz and Bluetooth wireless laser mouse with silent click switches.',
            'price' => 25.00,
            'cost' => 12.00,
            'current_stock' => 18,
            'reorder_level' => 20,
            'status' => 'low_stock',
        ]);

        $keyboard = Product::create([
            'organization_id' => $org1->id,
            'category_id' => $catElectronics->id,
            'supplier_id' => $supLogitech->id,
            'sku' => 'KB-102',
            'name' => 'Mechanical Tactile Keyboard',
            'description' => 'Compact 75% hot-swappable mechanical keyboard with RGB backlighting.',
            'price' => 40.00,
            'cost' => 19.50,
            'current_stock' => 42,
            'reorder_level' => 15,
            'status' => 'in_stock',
        ]);

        $headset = Product::create([
            'organization_id' => $org1->id,
            'category_id' => $catAudio->id,
            'supplier_id' => $supAudio->id,
            'sku' => 'HS-300',
            'name' => 'Active Noise-Cancelling Headset',
            'description' => 'Studio-grade over-ear wireless headset with 40-hour battery life.',
            'price' => 89.00,
            'cost' => 42.00,
            'current_stock' => 8,
            'reorder_level' => 10,
            'status' => 'low_stock',
        ]);

        $monitor = Product::create([
            'organization_id' => $org1->id,
            'category_id' => $catOffice->id,
            'supplier_id' => $supLogitech->id,
            'sku' => 'MN-404',
            'name' => 'UltraWide 34" 4K Monitor',
            'description' => 'IPS curved display with 144Hz refresh rate and USB-C 90W power delivery.',
            'price' => 450.00,
            'cost' => 280.00,
            'current_stock' => 14,
            'reorder_level' => 5,
            'status' => 'in_stock',
        ]);

        // 5. Movements
        InventoryMovement::create([
            'organization_id' => $org1->id,
            'product_id' => $mouse->id,
            'user_id' => $manager->id,
            'type' => 'PURCHASE',
            'quantity' => 25,
            'balance_after' => 25,
            'reference_type' => 'PO',
            'reference_id' => 'PO-8821',
            'notes' => 'Bulk inbound restock shipment received from Pacific Hardware Corp',
        ]);

        InventoryMovement::create([
            'organization_id' => $org1->id,
            'product_id' => $mouse->id,
            'user_id' => $staff->id,
            'type' => 'SALE',
            'quantity' => -7,
            'balance_after' => 18,
            'reference_type' => 'Order',
            'reference_id' => 'ORD-501',
            'notes' => 'Customer Order dispatch (triggers LOW STOCK warning)',
        ]);

        // 6. Customers: Including Sarah Williams (Section 12) & John Miller (Section 15)
        $sarah = Customer::create([
            'organization_id' => $org1->id,
            'name' => 'Sarah Williams',
            'email' => 'sarah.williams@apexenterprise.com',
            'phone' => '+1 (555) 438-9021',
            'company' => 'Apex Enterprise Solutions',
            'status' => 'active',
            'lifetime_value' => 4820.00,
            'total_orders' => 18,
            'last_order_at' => now()->subDays(7),
            'health_score' => 86,
            'health_factors' => [
                'recency' => 85,
                'purchase_frequency' => 90,
                'revenue' => 92,
                'support' => 65,
                'engagement' => 80,
                'refunds' => 95,
            ],
            'timeline' => [
                ['time' => 'Today 10:15 AM', 'title' => 'Purchased $240', 'desc' => 'Hardware peripherals batch (Order #ORD-5082)', 'icon' => 'shopping-cart', 'color' => 'emerald'],
                ['time' => 'Today 11:30 AM', 'title' => 'Opened support ticket', 'desc' => 'Ticket #2048: Charge inquiry automatically classified as Billing', 'icon' => 'life-buoy', 'color' => 'indigo'],
                ['time' => 'Today 01:15 PM', 'title' => 'Ticket resolved', 'desc' => 'Duplicate charge verified and credited back by Billing Team', 'icon' => 'check-circle', 'color' => 'emerald'],
                ['time' => 'Today 02:45 PM', 'title' => 'Received email', 'desc' => 'Dispatched satisfaction survey & VIP loyalty credit', 'icon' => 'mail', 'color' => 'purple'],
                ['time' => 'Today 03:00 PM', 'title' => 'AI health score updated', 'desc' => 'Customer health recalculated to 86% 🟢 HEALTHY', 'icon' => 'sparkles', 'color' => 'emerald'],
            ],
        ]);

        $john = Customer::create([
            'organization_id' => $org1->id,
            'name' => 'John Miller',
            'email' => 'john.miller@orbitalsystems.io',
            'phone' => '+1 (555) 892-3311',
            'company' => 'Orbital Systems Inc',
            'status' => 'at_risk',
            'lifetime_value' => 310.00,
            'total_orders' => 2,
            'last_order_at' => now()->subDays(65),
            'health_score' => 32,
            'health_factors' => [
                'recency' => 25,
                'purchase_frequency' => 30,
                'revenue' => 70,
                'support' => 20,
                'engagement' => 15,
                'refunds' => 40,
            ],
            'timeline' => [
                ['time' => '65 days ago', 'title' => 'Placed second order', 'desc' => 'Ordered basic mouse ($45)', 'icon' => 'shopping-cart', 'color' => 'slate'],
                ['time' => '40 days ago', 'title' => 'Filed complaint ticket', 'desc' => 'Unresolved delivery complaint', 'icon' => 'alert-triangle', 'color' => 'rose'],
                ['time' => 'Today', 'title' => 'AI Churn Escalation', 'desc' => 'Health score dropped to 32% 🔴 AT RISK', 'icon' => 'alert-circle', 'color' => 'rose'],
            ],
        ]);

        $custDavid = Customer::create([
            'organization_id' => $org1->id,
            'name' => 'David Sterling',
            'email' => 'david.sterling@acmecorp.com',
            'phone' => '+1 (555) 742-9911',
            'company' => 'Acme Corporation',
            'status' => 'active',
            'lifetime_value' => 1840.00,
            'total_orders' => 6,
            'last_order_at' => now()->subDays(3),
            'health_score' => 88,
        ]);

        // 7. Orders
        $order1 = Order::create([
            'organization_id' => $org1->id,
            'customer_id' => $sarah->id,
            'user_id' => $staff->id,
            'order_number' => 'ORD-5082',
            'status' => 'completed',
            'subtotal' => 218.00,
            'tax_amount' => 22.00,
            'discount_amount' => 0.00,
            'total_amount' => 240.00,
            'payment_status' => 'paid',
            'notes' => 'Sarah Williams hardware peripherals order ($240)',
        ]);

        OrderItem::create(['order_id' => $order1->id, 'product_id' => $mouse->id, 'quantity' => 4, 'unit_price' => 25.00, 'subtotal' => 100.00]);
        OrderItem::create(['order_id' => $order1->id, 'product_id' => $keyboard->id, 'quantity' => 2, 'unit_price' => 40.00, 'subtotal' => 80.00]);

        Payment::create([
            'organization_id' => $org1->id,
            'order_id' => $order1->id,
            'transaction_reference' => 'TXN-508291',
            'amount' => 240.00,
            'payment_method' => 'credit_card',
            'status' => 'successful',
        ]);

        // 8. Helpdesk Tickets: Including Ticket #2048 (Section 13 & 14)
        $ticket2048 = Ticket::create([
            'organization_id' => $org1->id,
            'customer_id' => $sarah->id,
            'assigned_user_id' => $staff->id,
            'assigned_team' => 'Billing Team',
            'ticket_number' => 'TCK-2048',
            'subject' => 'I was charged twice for my order.',
            'status' => 'resolved',
            'priority' => 'high',
            'sentiment' => 'negative',
            'ai_confidence' => 0.94,
            'category' => 'Billing',
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket2048->id,
            'sender_type' => 'customer',
            'sender_name' => 'Sarah Williams',
            'message' => 'I was charged twice for my order #ORD-5082 ($240.00). Please verify your merchant statement and reverse the duplicate payment.',
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket2048->id,
            'user_id' => $staff->id,
            'sender_type' => 'staff',
            'sender_name' => 'Sarah Jenkins',
            'message' => 'Hello Sarah, our billing team has confirmed the duplicate charge and issued an immediate $240 reversal back to your credit card.',
        ]);

        // 9. AI Scores
        AiCustomerScore::create([
            'organization_id' => $org1->id,
            'customer_id' => $sarah->id,
            'churn_risk_score' => 0.08,
            'risk_level' => 'LOW',
            'key_drivers' => ['18 lifetime orders with high monetary spend ($4,820)', 'Purchased in last 7 days', 'Ticket #2048 promptly resolved'],
            'suggested_action' => 'Maintain VIP priority support status and offer exclusive hardware preview.',
            'calculated_at' => now(),
        ]);

        AiCustomerScore::create([
            'organization_id' => $org1->id,
            'customer_id' => $john->id,
            'churn_risk_score' => 0.82,
            'risk_level' => 'CRITICAL',
            'key_drivers' => ['65 days since purchase', 'Low order frequency (2)', 'Health score collapsed to 32%'],
            'suggested_action' => 'Trigger outbound manager outreach and send 25% re-engagement incentive coupon.',
            'calculated_at' => now(),
        ]);

        // 10. AI Business Insights (Matching Section 19 Requirements)
        AiInsight::create([
            'organization_id' => $org1->id,
            'insight_code' => 'INS-REV-001',
            'category' => 'REVENUE',
            'title' => 'Revenue Surge Trend',
            'description' => 'Revenue increased 18% this month driven by strong corporate workstation expansions.',
            'severity' => 'OPPORTUNITY',
            'impact_metric' => '+18% MoM Surge',
            'recommended_action' => 'Increase supplier replenishment buffers for high-margin peripheral hardware.',
            'status' => 'active',
            'confidence_score' => 0.95,
        ]);

        AiInsight::create([
            'organization_id' => $org1->id,
            'insight_code' => 'INS-INV-002',
            'category' => 'INVENTORY',
            'title' => 'Critical Stock Outbreak Horizon',
            'description' => '12 products are expected to reach critical stock levels within 14 days based on 30-day velocity.',
            'severity' => 'CRITICAL',
            'impact_metric' => '12 SKUs at Risk',
            'recommended_action' => 'Draft automated purchase orders to primary suppliers with lead time buffer.',
            'status' => 'active',
            'confidence_score' => 0.94,
        ]);

        AiInsight::create([
            'organization_id' => $org1->id,
            'insight_code' => 'INS-CRM-003',
            'category' => 'CUSTOMER_RETENTION',
            'title' => 'Elevated High-Value Churn Exposure',
            'description' => '8 high-value customers have elevated churn probability due to support friction or extended purchase dormancy.',
            'severity' => 'CRITICAL',
            'impact_metric' => '8 High-LTV Accounts',
            'recommended_action' => 'Launch VIP proactive customer success outreach sequence.',
            'status' => 'active',
            'confidence_score' => 0.91,
        ]);

        AiInsight::create([
            'organization_id' => $org1->id,
            'insight_code' => 'INS-HLP-004',
            'category' => 'HELPDESK',
            'title' => 'Billing Ticket Surge Alert',
            'description' => 'Billing tickets increased 27% this week following the payment gateway migration.',
            'severity' => 'WARNING',
            'impact_metric' => '+27% Billing Tickets',
            'recommended_action' => 'Audit stripe webhook retries and auto-route to Billing & Payments Team.',
            'status' => 'active',
            'confidence_score' => 0.92,
        ]);

        AiInsight::create([
            'organization_id' => $org1->id,
            'insight_code' => 'INS-BKT-005',
            'category' => 'REVENUE',
            'title' => 'Market Basket Association Rule',
            'description' => 'Customers who purchase keyboards have a high probability of purchasing a mouse within 30 days (84% lift).',
            'severity' => 'OPPORTUNITY',
            'impact_metric' => '84% Association Lift',
            'recommended_action' => 'Activate 10% Workstation Bundle promotional package in POS checkout.',
            'status' => 'active',
            'confidence_score' => 0.93,
        ]);

        // 11. Audit Logs (Matching Section 29)
        AuditLog::create([
            'organization_id' => $org1->id,
            'user_id' => $owner->id,
            'user_name' => 'John',
            'action' => 'price_change',
            'entity_type' => 'Product',
            'entity_id' => (string) $mouse->id,
            'summary' => 'Admin changed product price: Wireless Mouse ($50.00 -> $45.00)',
            'old_values' => ['price' => 50.00],
            'new_values' => ['price' => 45.00],
            'ip_address' => '192.168.1.104',
        ]);

        AuditLog::create([
            'organization_id' => $org1->id,
            'user_id' => $manager->id,
            'user_name' => 'Marcus Chen',
            'action' => 'inventory_adjust',
            'entity_type' => 'Product',
            'entity_id' => (string) $keyboard->id,
            'summary' => 'Inventory adjusted: Mechanical Keyboard (+20 units received)',
            'old_values' => ['stock' => 22],
            'new_values' => ['stock' => 42],
            'ip_address' => '192.168.1.115',
        ]);

        AuditLog::create([
            'organization_id' => $org1->id,
            'user_id' => $owner->id,
            'user_name' => 'Elena Rostova',
            'action' => 'role_change',
            'entity_type' => 'User',
            'entity_id' => (string) $manager->id,
            'summary' => 'Permission changed: Marcus Chen assigned Operations Manager role',
            'old_values' => ['role' => 'staff'],
            'new_values' => ['role' => 'manager'],
            'ip_address' => '192.168.1.100',
        ]);

        // 12. System Notifications (Matching Section 24)
        SystemNotification::create([
            'organization_id' => $org1->id,
            'type' => 'inventory_alert',
            'severity' => 'warning',
            'title' => '⚠️ Inventory Alert: Wireless Mouse',
            'message' => 'Current Stock: 12, Predicted Demand: 72, Recommended Order: 80 units.',
            'data' => ['sku' => 'WM-001', 'stock' => 12, 'reorder' => 80],
        ]);

        SystemNotification::create([
            'organization_id' => $org1->id,
            'type' => 'billing_surge',
            'severity' => 'warning',
            'title' => '🎫 Billing Inquiry Influx',
            'message' => 'Duplicate billing charge tickets increased 27% this week.',
            'data' => ['growth_pct' => 27],
        ]);

        SystemNotification::create([
            'organization_id' => $org1->id,
            'type' => 'churn_warning',
            'severity' => 'critical',
            'title' => '🔴 High Churn Risk: John Miller',
            'message' => 'Customer health score dropped to 32% (At Risk). Immediate intervention recommended.',
            'data' => ['customer_id' => $john->id, 'health_score' => 32],
        ]);
    }
}
