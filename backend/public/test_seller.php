<?php 
require __DIR__."/../vendor/autoload.php"; 
$app = require_once __DIR__."/../bootstrap/app.php"; 
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class); 
$response = $kernel->handle(Illuminate\Http\Request::capture()); 

$seller = \App\Models\Seller::first();
echo json_encode($seller);
?>
