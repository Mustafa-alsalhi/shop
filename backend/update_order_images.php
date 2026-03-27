<?php
// Script to update existing order items with product images
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\OrderItem;
use App\Models\Product;

echo "=== Updating Order Items with Product Images ===\n";

try {
    // Get all order items that don't have image_url but have product_id
    $orderItems = OrderItem::whereNull('image_url')->with('product')->get();
    
    echo "📊 Found " . $orderItems->count() . " order items to update\n";
    
    $updated = 0;
    foreach ($orderItems as $item) {
        if ($item->product && $item->product->image_url) {
            $item->image_url = $item->product->image_url;
            $item->save();
            $updated++;
            
            echo "✅ Updated: {$item->product_name} -> {$item->product->image_url}\n";
        } else {
            echo "⚠️  Skipped: {$item->product_name} (no product image)\n";
        }
    }
    
    echo "\n🎯 Update complete: {$updated} items updated\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
?>
