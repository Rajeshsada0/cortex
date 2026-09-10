<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->is_admin) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthorized. Administrator privileges are required to access this resource.',
                ], 403);
            }

            return redirect()->route('dashboard')->with('error', 'Access restricted to administrators.');
        }

        return $next($request);
    }
}
