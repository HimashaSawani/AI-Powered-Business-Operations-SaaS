<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use App\Models\AiCustomerScore;
use App\Models\AiInsight;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

use App\Services\AiService;

class AiController extends Controller
{
    protected AiService $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function churnOverview(Request $request)
    {
        $scores = AiCustomerScore::with('customer')
            ->orderBy('churn_risk_score', 'desc')
            ->get();

        $highRisk = $scores->where('risk_level', 'CRITICAL')->count() + $scores->where('risk_level', 'HIGH')->count();
        $mediumRisk = $scores->where('risk_level', 'MEDIUM')->count();
        $lowRisk = $scores->where('risk_level', 'LOW')->count();

        return response()->json([
            'summary' => [
                'total_monitored' => $scores->count(),
                'high_risk_count' => $highRisk,
                'medium_risk_count' => $mediumRisk,
                'low_risk_count' => $lowRisk,
            ],
            'scores' => $scores,
        ]);
    }

    public function productForecast(Request $request, $productId)
    {
        $product = Product::with(['category', 'supplier'])->findOrFail($productId);
        $recentSalesUnits = [4, 6, 5, 8, 7, 9, 8, 12, 10, 11, 9, 14, 13, 15];

        $forecast = $this->aiService->getSalesForecast($product, $recentSalesUnits);

        return response()->json($forecast);
    }


    public function insights(Request $request)
    {
        $insights = AiInsight::latest()->get();
        return response()->json($insights);
    }

    public function updateInsightStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:active,applied,dismissed',
        ]);

        $insight = AiInsight::findOrFail($id);
        $insight->status = $request->status;
        $insight->save();

        return response()->json($insight);
    }
}
