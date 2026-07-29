<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SellerReportController extends Controller
{
    /**
     * Get authenticated seller
     */
    private function getAuthenticatedSeller()
    {
        $user = auth()->user();
        if (!$user) {
            return null;
        }

        // If user is seller, get seller record
        if ($user->role === 'seller') {
            return Seller::where('user_id', $user->id)->first();
        }

        return null;
    }

    /**
     * Get KPIs for the seller
     */
    public function getKPIs()
    {
        try {
            $seller = $this->getAuthenticatedSeller();

            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            // Get seller's product IDs
            $sellerProductIds = Product::where('seller_id', $seller->id)->pluck('id');

            // Debug: Log seller product IDs
            \Log::info('Seller Product IDs:', $sellerProductIds->toArray());

            // Total Sales (net after commission - assuming 10% commission)
            // Include all non-cancelled orders
            $totalSales = OrderItem::whereIn('product_id', $sellerProductIds)
                ->whereHas('order', function ($query) {
                    $query->whereNotIn('status', ['cancelled', 'refunded']);
                })
                ->sum('total');

            \Log::info('Total Sales:', ['total' => $totalSales]);

            // Apply commission deduction (10%)
            $netSales = $totalSales * 0.90;

            // Completed Orders Count (include delivered and completed)
            $completedOrders = Order::whereHas('items', function ($query) use ($sellerProductIds) {
                $query->whereIn('product_id', $sellerProductIds);
            })
            ->whereIn('status', ['completed', 'delivered', 'shipped'])
            ->distinct()
            ->count();

            \Log::info('Completed Orders:', ['count' => $completedOrders]);

            // Active Products Count
            $activeProducts = Product::where('seller_id', $seller->id)
                ->where('is_active', true)
                ->count();

            \Log::info('Active Products:', ['count' => $activeProducts]);

            // Pending Orders Count
            $pendingOrders = Order::whereHas('items', function ($query) use ($sellerProductIds) {
                $query->whereIn('product_id', $sellerProductIds);
            })
            ->where('status', 'pending')
            ->distinct()
            ->count();

            \Log::info('Pending Orders:', ['count' => $pendingOrders]);

            // Total Revenue this month (include all non-cancelled orders)
            $monthlyRevenue = OrderItem::whereIn('product_id', $sellerProductIds)
                ->whereHas('order', function ($query) {
                    $query->whereNotIn('status', ['cancelled', 'refunded'])
                          ->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
                })
                ->sum('total');

            \Log::info('Monthly Revenue:', ['total' => $monthlyRevenue]);

            return response()->json([
                'total_sales' => round($netSales, 2),
                'completed_orders' => $completedOrders,
                'active_products' => $activeProducts,
                'pending_orders' => $pendingOrders,
                'monthly_revenue' => round($monthlyRevenue * 0.90, 2),
            ]);
        } catch (\Exception $e) {
            \Log::error('KPIs Error:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to fetch KPIs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sales trends data
     */
    public function getSalesTrends(Request $request)
    {
        try {
            $seller = $this->getAuthenticatedSeller();

            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            $period = $request->get('period', 'daily'); // daily, weekly, monthly
            $sellerProductIds = Product::where('seller_id', $seller->id)->pluck('id');

            \Log::info('Sales Trends - Period:', ['period' => $period]);
            \Log::info('Sales Trends - Product IDs:', $sellerProductIds->toArray());

            $query = OrderItem::whereIn('product_id', $sellerProductIds)
                ->whereHas('order', function ($query) {
                    $query->whereNotIn('status', ['cancelled', 'refunded']);
                })
                ->selectRaw('DATE(created_at) as date, SUM(total) as total')
                ->groupBy('date')
                ->orderBy('date');

            // Filter based on period
            switch ($period) {
                case 'daily':
                    $query->where('created_at', '>=', now()->subDays(30));
                    break;
                case 'weekly':
                    $query->where('created_at', '>=', now()->subWeeks(12));
                    break;
                case 'monthly':
                    $query->where('created_at', '>=', now()->subMonths(12));
                    break;
            }

            $salesData = $query->get();

            \Log::info('Sales Trends - Raw Data:', $salesData->toArray());

            // Apply commission deduction (10%)
            $salesData = $salesData->map(function ($item) {
                $item->total = round($item->total * 0.90, 2);
                return $item;
            });

            \Log::info('Sales Trends - Final Data:', $salesData->toArray());

            return response()->json($salesData);
        } catch (\Exception $e) {
            \Log::error('Sales Trends Error:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to fetch sales trends',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get top selling products
     */
    public function getTopSellingProducts(Request $request)
    {
        try {
            $seller = $this->getAuthenticatedSeller();

            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            $limit = $request->get('limit', 10);
            $sellerProductIds = Product::where('seller_id', $seller->id)->pluck('id');

            \Log::info('Top Products - Product IDs:', $sellerProductIds->toArray());

            $topProducts = OrderItem::whereIn('product_id', $sellerProductIds)
                ->whereHas('order', function ($query) {
                    $query->whereNotIn('status', ['cancelled', 'refunded']);
                })
                ->select('product_id', 'product_name', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(total) as total_revenue'))
                ->groupBy('product_id', 'product_name')
                ->orderBy('total_quantity', 'desc')
                ->limit($limit)
                ->get();

            \Log::info('Top Products - Raw Data:', $topProducts->toArray());

            // Apply commission deduction (10%)
            $topProducts = $topProducts->map(function ($product) {
                $product->total_revenue = round($product->total_revenue * 0.90, 2);
                return $product;
            });

            \Log::info('Top Products - Final Data:', $topProducts->toArray());

            return response()->json($topProducts);
        } catch (\Exception $e) {
            \Log::error('Top Products Error:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to fetch top selling products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock alerts
     */
    public function getLowStockAlerts(Request $request)
    {
        try {
            $seller = $this->getAuthenticatedSeller();

            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            $threshold = $request->get('threshold', 5);

            \Log::info('Low Stock - Threshold:', ['threshold' => $threshold]);

            $lowStockProducts = Product::where('seller_id', $seller->id)
                ->where('stock', '<=', $threshold)
                ->where('is_active', true)
                ->select('id', 'name', 'sku', 'stock', 'price', 'image_url')
                ->orderBy('stock', 'asc')
                ->get();

            \Log::info('Low Stock - Products:', $lowStockProducts->toArray());

            return response()->json($lowStockProducts);
        } catch (\Exception $e) {
            \Log::error('Low Stock Error:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to fetch low stock alerts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get comprehensive report data
     */
    public function getComprehensiveReport()
    {
        try {
            $seller = $this->getAuthenticatedSeller();
            
            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            $sellerProductIds = Product::where('seller_id', $seller->id)->pluck('id');

            // KPIs
            $totalSales = OrderItem::whereIn('product_id', $sellerProductIds)
                ->whereHas('order', function ($query) {
                    $query->where('status', 'completed');
                })
                ->sum('total');

            $netSales = $totalSales * 0.90;

            $completedOrders = Order::whereHas('items', function ($query) use ($sellerProductIds) {
                $query->whereIn('product_id', $sellerProductIds);
            })
            ->where('status', 'completed')
            ->distinct()
            ->count();

            $activeProducts = Product::where('seller_id', $seller->id)
                ->where('is_active', true)
                ->count();

            // Sales Trends (last 30 days)
            $salesTrends = OrderItem::whereIn('product_id', $sellerProductIds)
                ->whereHas('order', function ($query) {
                    $query->where('status', 'completed');
                })
                ->where('created_at', '>=', now()->subDays(30))
                ->selectRaw('DATE(created_at) as date, SUM(total) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    $item->total = round($item->total * 0.90, 2);
                    return $item;
                });

            // Top Selling Products
            $topProducts = OrderItem::whereIn('product_id', $sellerProductIds)
                ->whereHas('order', function ($query) {
                    $query->where('status', 'completed');
                })
                ->select('product_id', 'product_name', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(total) as total_revenue'))
                ->groupBy('product_id', 'product_name')
                ->orderBy('total_quantity', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($product) {
                    $product->total_revenue = round($product->total_revenue * 0.90, 2);
                    return $product;
                });

            // Low Stock Alerts
            $lowStockProducts = Product::where('seller_id', $seller->id)
                ->where('stock', '<=', 5)
                ->where('is_active', true)
                ->select('id', 'name', 'sku', 'stock', 'price', 'image_url')
                ->orderBy('stock', 'asc')
                ->get();

            return response()->json([
                'kpis' => [
                    'total_sales' => round($netSales, 2),
                    'completed_orders' => $completedOrders,
                    'active_products' => $activeProducts,
                ],
                'sales_trends' => $salesTrends,
                'top_products' => $topProducts,
                'low_stock' => $lowStockProducts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch comprehensive report',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
