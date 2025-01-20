<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'branch_id',
        'description',
        'quantity',
        'price',
        'image',
        'category',
    ];

    public function user()
{
     return $this->belongsTo(User::class);
}
}
