<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use App\Services\InventoryService;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\AdjustStockRequest;

class ProductController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index(Request $request)
    {
        $query = Product::with(['category', 'supplier']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('sku', 'like', "%{$term}%");
            });
        }

        $products = $query->orderBy('status', 'desc')->paginate(30);

        return response()->json([
            'products' => $products,
            'categories' => Category::all(),
            'suppliers' => Supplier::all(),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        $product = Product::create($validated);
        $product->refreshStockStatus();

        // Initial inventory movement log
        if ($product->current_stock > 0) {
            $this->inventoryService->recordMovement(
                $product->id,
                'ADJUSTMENT',
                $product->current_stock,
                $product->organization_id,
                $request->user()->id ?? null,
                'InitialStock',
                (string) $product->id,
                'Initial stock entered upon catalog creation'
            );
        }

        return response()->json($product->load(['category', 'supplier']), 201);
    }

    public function adjustStock(AdjustStockRequest $request, $id)
    {
        $validated = $request->validated();


        $product = Product::findOrFail($id);

        // Tenant isolation
        $orgId = $request->user()->current_organization_id;
        if ($product->organization_id !== $orgId) {
            return response()->json(['message' => 'Forbidden. This product does not belong to your organization.'], 403);
        }

        try {
            $movement = $this->inventoryService->recordMovement(
                $product->id,
                $request->type,
                (int) $request->quantity,
                $product->organization_id,
                $request->user()->id ?? null,
                'ManualAdjustment',
                null,
                $request->notes
            );

            return response()->json([
                'product'  => $product->fresh(['category', 'supplier']),
                'movement' => $movement,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Inventory adjustment rejected.',
                'details' => $e->getMessage(),
            ], 422);
        }
    }

    public function movements(Request $request)
    {
        $query = InventoryMovement::with(['product', 'user'])->latest();

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->paginate(25));
    }
}
