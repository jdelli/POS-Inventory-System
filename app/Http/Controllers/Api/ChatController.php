<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Chat;

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

        // Broadcast the message
        broadcast(new \App\Events\MessageSent($chat))->toOthers();

        return response()->json(['message' => 'Message sent successfully']);
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
