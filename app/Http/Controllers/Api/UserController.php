<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Broadcast;

class UserController extends Controller
{
    public function index(): JsonResponse
{
    $users = User::where('id', '!=', auth()->id())
        ->get(['id', 'name', 'usertype', 'is_online']);

    return response()->json($users);
}



    public function current(Request $request): JsonResponse
{
    $user = $request->user(); // or auth()->user()

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'usertype' => $user->usertype,
    ]);
}


}
