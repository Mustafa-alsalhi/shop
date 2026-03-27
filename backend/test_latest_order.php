<?php
// Test script to check the latest created order
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;

echo "=== Testing Latest Created Order ===\n";

try {
    // Get the most recently created order
    $latestOrder = Order::with(['items.product'])
        ->orderBy('created_at', 'desc')
        ->first();
    
    if (!$latestOrder) {
        echo "❌ No orders found\n";
        exit;
    }
    
    echo "📦 Latest Order Details:\n";
    echo "Order ID: {$latestOrder->id}\n";
    echo "Order Number: {$latestOrder->order_number}\n";
    echo "Created: {$latestOrder->created_at}\n";
    echo "User ID: {$latestOrder->user_id}\n";
    echo "Total Amount: {$latestOrder->total_amount}\n";
    
    echo "\n🖼️ Order Items:\n";
    foreach ($latestOrder->items as $index => $item) {
        echo "Item " . ($index + 1) . ":\n";
        echo "  Product Name: {$item->product_name}\n";
        echo "  Product ID: {$item->product_id}\n";
        echo "  Item Image URL: " . ($item->image_url ?: 'NULL') . "\n";
        echo "  Product Image URL: " . ($item->product->image_url ?: 'NULL') . "\n";
        echo "  Quantity: {$item->quantity}\n";
        echo "  Price: {$item->price}\n";
        echo "  Total: {$item->total}\n";
        echo "---\n";
    }
    
    // Test API response format
    echo "\n🔄 Testing API Response Format:\n";
    
    // Transform like the API does
    $transformedItems = $latestOrder->items->map(function ($item) {
        if (!$item->image_url && $item->product) {
            $item->image_url = $item->product->image_url;
        }
        
        if ($item->image_url && str_starts_with($item->image_url, '/')) {
            $item->image_url = url($item->image_url);
        }
        
        return $item;
    });
    
    foreach ($transformedItems as $index => $item) {
        echo "Transformed Item " . ($index + 1) . ":\n";
        echo "  Product Name: {$item->product_name}\n";
        echo "  Final Image URL: {$item->image_url}\n";
        echo "---\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Complete ===\n";
?>
