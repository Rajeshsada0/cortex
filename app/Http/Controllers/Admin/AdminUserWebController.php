<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserWebController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $query = User::withCount(['testSessions', 'questionAttempts']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
            ],
            'current_user_id' => $request->user()->id,
        ]);
    }

    public function toggleAdmin(Request $request, User $user): RedirectResponse
    {
        // Guard against removing own admin privilege
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot revoke your own administrator privileges.');
        }

        $user->update([
            'is_admin' => ! $user->is_admin,
        ]);

        $status = $user->is_admin ? 'granted' : 'revoked';

        return back()->with('success', "Administrator status {$status} for {$user->name}.");
    }
}
