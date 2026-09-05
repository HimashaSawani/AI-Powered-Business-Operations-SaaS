<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use App\Events\OrderCreated;
use App\Events\TicketCreated;
use App\Events\InventoryLow;
use App\Listeners\UpdateCustomerMetrics;
use App\Listeners\SendInventoryAlert;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Ticket;
use App\Policies\CustomerPolicy;
use App\Policies\OrderPolicy;
use App\Policies\TicketPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * Section 32:
     * - Registers Event ↔ Listener bindings
     * - Registers Model Policies for tenant-isolation authorization
     */
    public function boot(): void
    {
        // ── Section 32: Event → Listener bindings ────────────────────────────

        // When an order is created, update the customer's metrics (LTV, order count)
        Event::listen(OrderCreated::class, UpdateCustomerMetrics::class);

        // When inventory falls below reorder level, create a system notification alert
        Event::listen(InventoryLow::class, SendInventoryAlert::class);

        // ── Section 32: Model Policies ────────────────────────────────────────
        // These enforce tenant isolation — users can only access their org's data

        Gate::policy(Customer::class, CustomerPolicy::class);
        Gate::policy(Order::class,    OrderPolicy::class);
        Gate::policy(Ticket::class,   TicketPolicy::class);
    }
}
