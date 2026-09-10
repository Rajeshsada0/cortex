<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNoteBookmark extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'user_notes_bookmarks';

    protected $fillable = [
        'user_id',
        'question_id',
        'folder_id',
        'is_bookmarked',
        'note_content',
    ];

    protected $casts = [
        'is_bookmarked' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(LibraryFolder::class, 'folder_id');
    }
}
