<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppRating;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminRatingWebController extends Controller
{
    /**
     * Display all candidate ratings and reviews with summary breakdown.
     */
    public function index(Request $request): Response
    {
        $ratingFilter = $request->query('rating');

        $query = AppRating::with('user:id,name,email,active_pathway')
            ->latest();

        if ($ratingFilter && is_numeric($ratingFilter)) {
            $query->where('rating', (int) $ratingFilter);
        }

        $ratings = $query->paginate(15)->withQueryString();

        $total = AppRating::count();
        $average = $total > 0 ? round((float) AppRating::avg('rating'), 1) : 5.0;

        $stats = [
            'total' => $total,
            'average' => $average,
            'stars_5' => AppRating::where('rating', 5)->count(),
            'stars_4' => AppRating::where('rating', 4)->count(),
            'stars_3' => AppRating::where('rating', 3)->count(),
            'stars_2' => AppRating::where('rating', 2)->count(),
            'stars_1' => AppRating::where('rating', 1)->count(),
        ];

        return Inertia::render('admin/ratings/index', [
            'ratings' => $ratings,
            'stats' => $stats,
            'ratingFilter' => $ratingFilter ?? 'all',
        ]);
    }

    /**
     * Delete a review.
     */
    public function destroy(AppRating $rating): RedirectResponse
    {
        $rating->delete();

        return redirect()->back()->with('success', 'Candidate rating removed.');
    }
}
