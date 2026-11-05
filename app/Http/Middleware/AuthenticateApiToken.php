<?php

namespace App\Http\Middleware;

use App\Models\PersonalAccessToken;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    /**
     * Handle an incoming request and resolve authenticated user from Bearer token if provided.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if ($token) {
            $tokenRecord = PersonalAccessToken::where('token', $token)->with('user')->first();

            if ($tokenRecord && $tokenRecord->user) {
                // Update last used timestamp
                $tokenRecord->updateQuietly(['last_used_at' => now()]);

                $user = $tokenRecord->user;
                $request->setUserResolver(fn () => $user);
                Auth::setUser($user);
            }
        }

        return $next($request);
    }
}
