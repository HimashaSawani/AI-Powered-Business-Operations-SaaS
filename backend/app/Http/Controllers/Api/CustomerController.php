<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerNote;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::with(['latestAiScore', 'tickets' => function ($q) {
            $q->whereIn('status', ['open', 'in_progress']);
        }]);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('company', 'like', "%{$term}%");
            });
        }

        $customers = $query->latest('total_orders')->paginate(20);

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,at_risk,churned,lead',
        ]);

        $customer = Customer::create($validated);

        return response()->json($customer, 201);
    }

    public function show(Request $request, $id)
    {
        $customer = Customer::with([
            'orders.items.product',
            'tickets.messages',
            'notes.user',
            'latestAiScore',
        ])->findOrFail($id);

        // Tenant isolation: customer must belong to authenticated user's organization
        $orgId = $request->user()->current_organization_id;
        if ($customer->organization_id !== $orgId) {
            return response()->json(['message' => 'Forbidden. This customer does not belong to your organization.'], 403);
        }

        return response()->json($customer);
    }

    public function addNote(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $customer = Customer::findOrFail($id);

        $note = CustomerNote::create([
            'organization_id' => $customer->organization_id,
            'customer_id' => $customer->id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        return response()->json($note->load('user'), 201);
    }
}
