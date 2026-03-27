<?php
// Test script to check product images directly in database
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\OrderItem;

echo "=== Testing Product Images ===\n";

try {
    // Check products with images
    $products = Product::take(5)->get(['id', 'name', 'image_url']);
    echo "📊 Found " . $products->count() . " products\n";
    
    foreach ($products as $product) {
        echo "Product ID: {$product->id}\n";
        echo "Name: {$product->name}\n";
        echo "Image URL: " . ($product->image_url ?: 'NULL') . "\n";
        echo "---\n";
    }
    
    // Check order items with images
    $orderItems = OrderItem::with('product')->take(5)->get();
    echo "\n📦 Order Items with Images:\n";
    
    foreach ($orderItems as $item) {
        echo "Order Item ID: {$item->id}\n";
        echo "Product Name: {$item->product_name}\n";
        echo "Item Image URL: " . ($item->image_url ?: 'NULL') . "\n";
        echo "Product Image URL: " . ($item->product->image_url ?: 'NULL') . "\n";
        echo "---\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
?>
