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
        'branch_id',
        'total_sales',
        'cash_breakdown',
        'total_cash',
        'expenses',
        'total_expenses',
        'remaining_cash',
        'online_payments',
        'status',
    ];


    protected $casts = [
    
        'expenses' => 'array',
    ];
}
