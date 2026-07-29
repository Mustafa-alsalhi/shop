<?php

namespace App\Services;

class DeliveryService
{
    /**
     * Calculate delivery fee based on Haversine formula
     *
     * @param float|null $customerLat
     * @param float|null $customerLng
     * @param float|null $sellerLat
     * @param float|null $sellerLng
     * @return array
     */
    public static function calculateFee($customerLat, $customerLng, $sellerLat, $sellerLng)
    {
        $baseFee = env('BASE_DELIVERY_FEE', 15);
        $baseDistance = env('BASE_DISTANCE', 5);
        $pricePerKm = env('PRICE_PER_KM', 2);

        if (!$customerLat || !$customerLng || !$sellerLat || !$sellerLng) {
            // Missing coordinates, fallback to default base fee
            return [
                'distance_km' => 0,
                'fee' => $baseFee
            ];
        }

        $earthRadius = 6371; // km

        $latDelta = deg2rad($sellerLat - $customerLat);
        $lonDelta = deg2rad($sellerLng - $customerLng);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($customerLat)) * cos(deg2rad($sellerLat)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        $fee = $baseFee;
        if ($distance > $baseDistance) {
            $extraDistance = ceil($distance - $baseDistance);
            $fee += ($extraDistance * $pricePerKm);
        }

        return [
            'distance_km' => round($distance, 1),
            'fee' => $fee
        ];
    }
}
