<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Announcements;

class UserAnnouncements extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'announcement_id', 'is_read'];

     public function announcement()
    {
        return $this->belongsTo(Announcements::class);
    }
}
