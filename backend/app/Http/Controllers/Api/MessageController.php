<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    // Get all conversations for the current user
    public function index()
    {
        $user = Auth::user();

        // If user is admin, get all conversations in the system
        if ($user->role === 'admin') {
            $conversations = Message::orderBy('created_at', 'desc')
                ->get()
                ->groupBy(function ($message) {
                    // Group by the sender (customer) to show all customer conversations
                    return $message->sender_id;
                });
        } else {
            // For sellers, get only their conversations
            $conversations = Message::where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->groupBy(function ($message) use ($user) {
                    // Group by the other user in the conversation
                    return $message->sender_id === $user->id
                        ? $message->receiver_id
                        : $message->sender_id;
                });
        }

        $result = [];
        foreach ($conversations as $otherUserId => $messages) {
            $otherUser = User::find($otherUserId);
            if ($otherUser) {
                $lastMessage = $messages->first();
                $unreadCount = $messages->where('receiver_id', $user->id)->where('is_read', false)->count();

                \Log::info('Conversation user data:', [
                    'user_id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'email' => $otherUser->email,
                    'phone' => $otherUser->phone,
                    'address' => $otherUser->address,
                    'city' => $otherUser->city,
                ]);

                $result[] = [
                    'user_id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'email' => $otherUser->email,
                    'phone' => $otherUser->phone ?? null,
                    'address' => $otherUser->address ?? null,
                    'city' => $otherUser->city ?? null,
                    'last_message' => $lastMessage->message,
                    'last_message_time' => $lastMessage->created_at,
                    'unread_count' => $unreadCount,
                ];
            }
        }

        \Log::info('Conversations result:', $result);
        return response()->json($result);
    }

    // Get messages between current user and another user
    public function show($userId)
    {
        $currentUser = Auth::user();
        
        // Mark messages as read
        Message::where('sender_id', $userId)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        // Get messages between the two users
        $messages = Message::between($currentUser->id, $userId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Send a message
    public function store(Request $request)
    {
        $receiverId = $request->receiver_id;

        // Check if receiver_id is a seller_id (not a user_id)
        $seller = \App\Models\Seller::find($receiverId);
        if ($seller) {
            // This is a seller, check if they have a user_id
            if ($seller->user_id) {
                $receiverId = $seller->user_id;
            } else {
                // Seller doesn't have a user_id yet, create a user for them
                $user = \App\Models\User::firstOrCreate(
                    ['email' => 'seller_' . $seller->id . '@temp.com'],
                    [
                        'name' => $seller->store_name ?? 'Seller ' . $seller->id,
                        'password' => bcrypt('temp_password_' . $seller->id),
                        'role' => 'seller',
                    ]
                );
                // Link the seller to this user
                $seller->user_id = $user->id;
                $seller->save();
                $receiverId = $user->id;
            }
        }

        // Validate that receiver_id exists in users table
        $request->merge(['receiver_id' => $receiverId]);
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string|max:5000',
        ]);

        \Log::info('Creating message:', [
            'sender_id' => Auth::id(),
            'receiver_id' => $receiverId,
            'original_receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $receiverId,
            'message' => $request->message,
            'is_read' => false,
        ]);

        \Log::info('Message created:', ['message_id' => $message->id]);

        // Load relationships
        $message->load(['sender', 'receiver']);

        return response()->json($message, 201);
    }

    // Get unread message count
    public function unreadCount()
    {
        $user = Auth::user();
        $count = Message::where('receiver_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    // Mark messages as read
    public function markAsRead($userId)
    {
        $currentUser = Auth::user();
        
        Message::where('sender_id', $userId)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'Messages marked as read']);
    }
}
