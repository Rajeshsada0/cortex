<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SupportInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportInquiryController extends Controller
{
    /**
     * Store a new candidate support inquiry or feedback message.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:120',
            'email' => 'nullable|email|max:150',
            'category' => 'required|string|max:100',
            'message' => 'required|string|min:5|max:3000',
        ]);

        $user = $request->user();

        $inquiry = SupportInquiry::create([
            'user_id' => $user?->id,
            'name' => $validated['name'] ?? $user?->name ?? 'Candidate Doctor',
            'email' => $validated['email'] ?? $user?->email ?? 'doctor@cortex.med',
            'category' => $validated['category'],
            'message' => $validated['message'],
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully! Our clinical helpdesk will review your inquiry within 24 hours.',
            'inquiry' => $inquiry,
        ], 201);
    }
}
