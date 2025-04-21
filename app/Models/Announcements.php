<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User; // ✅ Import the User model

class Announcements extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'content', 'date', 'created_by'];


    protected $casts = [
        'date' => 'datetime:Y-m-d\TH:i:sP',
    ];

    public function users()
{
    return $this->belongsToMany(User::class, 'user_announcements')
        ->withPivot('is_read')
        ->withTimestamps();
}
}
