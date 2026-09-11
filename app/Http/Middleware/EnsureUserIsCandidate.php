<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCandidate
{
    /**
     * Handle an incoming request.
     *
     * Ensure administrators cannot access the candidate examination portal.
     * Administrators are redirected to the Faculty & Content Admin console.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->is_admin) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Administrators cannot access the candidate examination portal. Please use the Faculty & Content Admin console.',
                ], 403);
            }

            return redirect()->route('admin.dashboard')->with('info', 'Administrators have access only to the Faculty & Content Admin portal.');
        }

        return $next($request);
    }
}
