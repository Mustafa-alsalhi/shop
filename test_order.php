<?php
// Test script to check database connection and order creation
require_once 'backend/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\User;

echo "=== Testing Database Connection ===\n";

try {
    // Test database connection
    $connection = DB::connection();
    echo "✅ Database connection successful\n";
    
    // Test if orders table exists
    $tables = DB::select('SHOW TABLES');
    $ordersTableExists = false;
    foreach ($tables as $table) {
        foreach ($table as $key => $value) {
            if ($value === 'orders') {
                $ordersTableExists = true;
                break 2;
            }
        }
    }
    
    if ($ordersTableExists) {
        echo "✅ Orders table exists\n";
    } else {
        echo "❌ Orders table does not exist\n";
    }
    
    // Check existing orders
    $orderCount = DB::table('orders')->count();
    echo "📊 Current orders count: $orderCount\n";
    
    // Check users
    $userCount = DB::table('users')->count();
    echo "👥 Current users count: $userCount\n";
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
?>
