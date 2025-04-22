<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\ChatNotification;


class ChatController extends Controller
{
    public function sendMessage(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $chat = Chat::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        // Create a notification for the receiver
        ChatNotification::create([
            'user_id' => $request->receiver_id,
            'chat_id' => $chat->id,
            'is_read' => false,
        ]);



        // Broadcast the message
        broadcast(new \App\Events\MessageSent($chat))->toOthers();

        return response()->json(['message' => 'Message sent successfully']);
    }


    public function getNotifications()
    {
        $notifications = auth()->user()->notifications()->with('chat.sender')->where('is_read', false)->get();

        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $notification = ChatNotification::findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function getTotalUnreadMessages(Request $request)
{
    $userId = $request->user()->id;
    $totalUnread = ChatNotification::where('user_id', $userId)
        ->where('is_read', false) // Assuming you have an `is_read` column
        ->count();

    return response()->json(['total' => $totalUnread]);
}





    public function getMessages($userId)
    {
        $messages = Chat::where(function ($query) use ($userId) {
            $query->where('sender_id', auth()->id())
                  ->where('receiver_id', $userId);
        })->orWhere(function ($query) use ($userId) {
            $query->where('sender_id', $userId)
                  ->where('receiver_id', auth()->id());
        })->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }
    
}
