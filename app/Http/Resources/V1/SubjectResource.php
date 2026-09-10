<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'icon_key' => $this->icon_key,
            'order_index' => $this->order_index,
            'topics_count' => $this->topics_count ?? $this->topics()->count(),
            'questions_count' => $this->questions_count ?? $this->questions()->count(),
            'topics' => $this->whenLoaded('topics', fn () => $this->topics->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'high_yield_priority' => $t->high_yield_priority,
            ])),
        ];
    }
}
