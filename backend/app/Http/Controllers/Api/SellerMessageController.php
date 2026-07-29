<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SellerMessageController extends Controller
{
    /**
     * Get authenticated seller
     */
    private function getAuthenticatedSeller()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                \Log::error('No authenticated user found');
                return null;
            }

            \Log::info('Authenticated user:', [
                'user_id' => $user->id,
                'role' => $user->role,
                'email' => $user->email
            ]);

            // If user is seller, get seller record
            if ($user->role === 'seller') {
                $seller = Seller::where('user_id', $user->id)->first();
                if (!$seller) {
                    \Log::error('Seller record not found for user', ['user_id' => $user->id]);
                }
                return $seller;
            }

            \Log::error('User is not a seller', ['user_id' => $user->id, 'role' => $user->role]);
            return null;
        } catch (\Exception $e) {
            \Log::error('Exception in getAuthenticatedSeller:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Get all conversations for the current seller
     */
    public function index()
    {
        try {
            $seller = $this->getAuthenticatedSeller();

            if (!$seller) {
                \Log::error('Seller not found in getAuthenticatedSeller');
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            \Log::info('Seller found:', ['seller_id' => $seller->id, 'user_id' => $seller->user_id]);

            // Get all messages where seller is involved (as sender or receiver)
            $conversations = Message::where(function ($query) use ($seller) {
                $query->where('sender_id', $seller->user_id)
                      ->orWhere('receiver_id', $seller->user_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

            \Log::info('Total messages found:', ['count' => $conversations->count()]);

            // Group by the other user in the conversation
            $groupedConversations = $conversations->groupBy(function ($message) use ($seller) {
                if ($message->sender_id === $seller->user_id) {
                    return $message->receiver_id;
                } else {
                    return $message->sender_id;
                }
            });

            \Log::info('Grouped conversations:', ['count' => $groupedConversations->count()]);

            $result = [];
            foreach ($groupedConversations as $customerId => $messages) {
                // Skip if the customer ID is the seller's own user_id
                if ($customerId == $seller->user_id) {
                    continue;
                }

                $customer = User::find($customerId);
                if ($customer) {
                    $lastMessage = $messages->first();
                    $unreadCount = $messages->where('receiver_id', $seller->user_id)
                        ->where('is_read', false)
                        ->count();

                    $result[] = [
                        'user_id' => $customer->id,
                        'name' => $customer->name,
                        'email' => $customer->email,
                        'phone' => $customer->phone ?? null,
                        'address' => $customer->address ?? null,
                        'city' => $customer->city ?? null,
                        'last_message' => $lastMessage ? $lastMessage->message : '',
                        'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
                        'unread_count' => $unreadCount,
                    ];
                }
            }

            \Log::info('Returning conversations result:', ['count' => count($result)]);

            return response()->json($result);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch conversations:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to fetch conversations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get messages between seller and customer
     */
    public function show($customerId)
    {
        try {
            $seller = $this->getAuthenticatedSeller();

            if (!$seller) {
                \Log::error('Seller not found in show method');
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            \Log::info('Fetching messages for seller and customer:', [
                'seller_id' => $seller->id,
                'seller_user_id' => $seller->user_id,
                'customer_id' => $customerId
            ]);

            // Mark messages as read
            Message::where('sender_id', $customerId)
                ->where('receiver_id', $seller->user_id)
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);

            // Get messages between seller and customer (simple query based on sender_id and receiver_id)
            $messages = Message::where(function ($query) use ($customerId, $seller) {
                $query->where(function ($q) use ($customerId, $seller) {
                    $q->where('sender_id', $customerId)
                      ->where('receiver_id', $seller->user_id);
                })->orWhere(function ($q) use ($customerId, $seller) {
                    $q->where('sender_id', $seller->user_id)
                      ->where('receiver_id', $customerId);
                });
            })
            ->orderBy('created_at', 'asc')
            ->get();

            \Log::info('Messages found:', ['count' => $messages->count()]);

            // Update seller_id for messages that don't have it
            foreach ($messages as $message) {
                if (!$message->seller_id) {
                    $message->seller_id = $seller->id;
                    $message->save();
                }
            }

            return response()->json($messages);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch messages:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to fetch messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a message from seller to customer
     */
    public function store(Request $request)
    {
        try {
            $seller = $this->getAuthenticatedSeller();

            if (!$seller) {
                \Log::error('Seller not found in store method');
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            \Log::info('Creating message from seller:', [
                'seller_id' => $seller->id,
                'seller_user_id' => $seller->user_id,
                'receiver_id' => $request->receiver_id,
                'message' => $request->message
            ]);

            // Validate receiver exists
            $receiver = User::find($request->receiver_id);
            if (!$receiver) {
                \Log::error('Receiver not found:', ['receiver_id' => $request->receiver_id]);
                return response()->json([
                    'message' => 'Receiver not found'
                ], 404);
            }

            $request->validate([
                'receiver_id' => 'required',
                'message' => 'required|string|max:5000',
            ]);

            \Log::info('About to create message with data:', [
                'sender_id' => $seller->user_id,
                'receiver_id' => $request->receiver_id,
                'seller_id' => $seller->id,
                'message' => $request->message,
            ]);

            $message = Message::create([
                'sender_id' => $seller->user_id,
                'receiver_id' => $request->receiver_id,
                'seller_id' => $seller->id,
                'message' => $request->message,
                'is_read' => false,
            ]);

            \Log::info('Message created successfully:', ['message_id' => $message->id]);

            // Load relationships
            $message->load(['sender', 'receiver', 'seller']);

            return response()->json($message, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to send message:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to send message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unread message count for seller
     */
    public function unreadCount()
    {
        try {
            $seller = $this->getAuthenticatedSeller();

            if (!$seller) {
                \Log::error('Seller not found in unreadCount method');
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            $count = Message::where('receiver_id', $seller->user_id)
                ->where('is_read', false)
                ->count();

            \Log::info('Unread count for seller:', ['seller_id' => $seller->id, 'count' => $count]);

            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            \Log::error('Failed to get unread count:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to get unread count',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark messages as read
     */
    public function markAsRead($customerId)
    {
        try {
            $seller = $this->getAuthenticatedSeller();

            if (!$seller) {
                \Log::error('Seller not found in markAsRead method');
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            Message::where('sender_id', $customerId)
                ->where('receiver_id', $seller->user_id)
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);

            \Log::info('Messages marked as read for seller:', ['seller_id' => $seller->id, 'customer_id' => $customerId]);

            return response()->json(['message' => 'Messages marked as read']);
        } catch (\Exception $e) {
            \Log::error('Failed to mark messages as read:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to mark messages as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
