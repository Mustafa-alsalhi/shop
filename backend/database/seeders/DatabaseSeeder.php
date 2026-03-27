<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create admin user
        \App\Models\User::create([
            'name' => 'Admin User',
            'email' => 'admin@shophub.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Create regular user
        \App\Models\User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        // Create categories
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Electronic devices and accessories'],
            ['name' => 'Clothing', 'slug' => 'clothing', 'description' => 'Fashion and apparel'],
            ['name' => 'Books', 'slug' => 'books', 'description' => 'Books and educational materials'],
            ['name' => 'Home & Garden', 'slug' => 'home-garden', 'description' => 'Home and garden supplies'],
            ['name' => 'Sports', 'slug' => 'sports', 'description' => 'Sports equipment and accessories'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create($category);
        }

        // Create products
        $electronicsCategory = \App\Models\Category::where('slug', 'electronics')->first();
        $clothingCategory = \App\Models\Category::where('slug', 'clothing')->first();

        $products = [
            [
                'name' => 'Wireless Headphones',
                'slug' => 'wireless-headphones',
                'description' => 'Premium wireless headphones with noise cancellation',
                'price' => 199.99,
                'compare_at_price' => 299.99,
                'sku' => 'WH-001',
                'image_url' => 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Wireless+Headphones',
                'images' => json_encode([
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=Wireless+Headphones+1',
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=Wireless+Headphones+2',
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=Wireless+Headphones+3',
                ]),
                'category_id' => $electronicsCategory->id,
                'is_active' => true,
                'is_featured' => true,
                'stock' => 50,
                'rating' => 4.5,
                'reviews_count' => 128,
            ],
            [
                'name' => 'Smart Watch',
                'slug' => 'smart-watch',
                'description' => 'Advanced smartwatch with health tracking',
                'price' => 299.99,
                'compare_at_price' => 399.99,
                'sku' => 'SW-001',
                'image_url' => 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Smart+Watch',
                'images' => json_encode([
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=Smart+Watch+1',
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=Smart+Watch+2',
                ]),
                'category_id' => $electronicsCategory->id,
                'is_active' => true,
                'is_featured' => true,
                'stock' => 30,
                'rating' => 4.7,
                'reviews_count' => 89,
            ],
            [
                'name' => 'Laptop Pro',
                'slug' => 'laptop-pro',
                'description' => 'High-performance laptop for professionals',
                'price' => 1299.99,
                'compare_at_price' => 1599.99,
                'sku' => 'LP-001',
                'image_url' => 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Laptop+Pro',
                'images' => json_encode([
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=Laptop+Pro+1',
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=Laptop+Pro+2',
                ]),
                'category_id' => $electronicsCategory->id,
                'is_active' => true,
                'is_featured' => false,
                'stock' => 15,
                'rating' => 4.8,
                'reviews_count' => 56,
            ],
            [
                'name' => 'Cotton T-Shirt',
                'slug' => 'cotton-t-shirt',
                'description' => 'Comfortable 100% cotton t-shirt',
                'price' => 29.99,
                'compare_at_price' => 39.99,
                'sku' => 'TS-001',
                'image_url' => 'https://via.placeholder.com/400x400/000000/FFFFFF?text=T-Shirt',
                'images' => json_encode([
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=T-Shirt+1',
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=T-Shirt+2',
                ]),
                'category_id' => $clothingCategory->id,
                'is_active' => true,
                'is_featured' => false,
                'stock' => 100,
                'rating' => 4.2,
                'reviews_count' => 34,
            ],
            [
                'name' => 'Denim Jeans',
                'slug' => 'denim-jeans',
                'description' => 'Classic fit denim jeans',
                'price' => 79.99,
                'compare_at_price' => 99.99,
                'sku' => 'DJ-001',
                'image_url' => 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Denim+Jeans',
                'images' => json_encode([
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=Denim+Jeans+1',
                    'https://via.placeholder.com/400x400/000000/FFFFFF?text=Denim+Jeans+2',
                ]),
                'category_id' => $clothingCategory->id,
                'is_active' => true,
                'is_featured' => false,
                'stock' => 75,
                'rating' => 4.4,
                'reviews_count' => 67,
            ],
        ];

        foreach ($products as $productData) {
            $product = \App\Models\Product::create($productData);
            
            // Add variants for some products
            if ($product->slug === 'wireless-headphones') {
                $variant = \App\Models\ProductVariant::create([
                    'product_id' => $product->id,
                    'name' => 'Color',
                    'is_active' => true,
                ]);
                
                \App\Models\VariantOption::create([
                    'product_variant_id' => $variant->id,
                    'name' => 'Black',
                    'price' => null,
                ]);
                
                \App\Models\VariantOption::create([
                    'product_variant_id' => $variant->id,
                    'name' => 'White',
                    'price' => null,
                ]);
                
                \App\Models\VariantOption::create([
                    'product_variant_id' => $variant->id,
                    'name' => 'Blue',
                    'price' => 10.00,
                ]);
            }
            
            if ($product->slug === 'cotton-t-shirt') {
                $variant = \App\Models\ProductVariant::create([
                    'product_id' => $product->id,
                    'name' => 'Size',
                    'is_active' => true,
                ]);
                
                \App\Models\VariantOption::create([
                    'product_variant_id' => $variant->id,
                    'name' => 'S',
                    'price' => null,
                ]);
                
                \App\Models\VariantOption::create([
                    'product_variant_id' => $variant->id,
                    'name' => 'M',
                    'price' => null,
                ]);
                
                \App\Models\VariantOption::create([
                    'product_variant_id' => $variant->id,
                    'name' => 'L',
                    'price' => null,
                ]);
                
                \App\Models\VariantOption::create([
                    'product_variant_id' => $variant->id,
                    'name' => 'XL',
                    'price' => 5.00,
                ]);
            }
        }
    }
}
