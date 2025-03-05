<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Remittance extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_start',
        'date_end',
        'total_sales',
        'cash_breakdown',
        'total_cash',
        'expenses',
        'total_expenses',
        'remaining_cash',
    ];


    protected $casts = [
    
        'expenses' => 'array',
    ];
}
