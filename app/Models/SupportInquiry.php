<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportInquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ticket_number',
        'name',
        'email',
        'category',
        'priority',
        'message',
        'reply',
        'replied_at',
        'assigned_to',
        'status',
        'admin_notes',
    ];

    protected $casts = [
        'replied_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function ($inquiry) {
            if (empty($inquiry->ticket_number)) {
                $inquiry->ticket_number = 'MED-' . strtoupper(substr(uniqid(), -5));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
