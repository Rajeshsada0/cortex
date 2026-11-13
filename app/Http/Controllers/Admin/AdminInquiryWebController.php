<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportInquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminInquiryWebController extends Controller
{
    /**
     * Display all candidate support inquiries.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $category = $request->query('category');
        $priority = $request->query('priority');
        $search = $request->query('search');

        $query = SupportInquiry::with('user:id,name,email,active_pathway')
            ->latest();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($priority && $priority !== 'all') {
            $query->where('priority', $priority);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('ticket_number', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $inquiries = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => SupportInquiry::count(),
            'pending' => SupportInquiry::where('status', 'pending')->count(),
            'in_progress' => SupportInquiry::where('status', 'in_progress')->count(),
            'resolved' => SupportInquiry::where('status', 'resolved')->count(),
            'urgent' => SupportInquiry::where('priority', 'urgent')->where('status', '!=', 'resolved')->count(),
            'errata_count' => SupportInquiry::where('category', 'Clinical Question Query')->count(),
        ];

        return Inertia::render('admin/inquiries/index', [
            'inquiries' => $inquiries,
            'stats' => $stats,
            'filters' => [
                'status' => $status ?? 'all',
                'category' => $category ?? 'all',
                'priority' => $priority ?? 'all',
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * Store a new ticket directly from the faculty console.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:150',
            'category' => 'required|string|max:100',
            'priority' => 'required|in:low,normal,high,urgent',
            'message' => 'required|string|min:5|max:3000',
            'status' => 'required|in:pending,in_progress,resolved',
            'assigned_to' => 'nullable|string|max:100',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $inquiry = SupportInquiry::create([
            ...$validated,
            'ticket_number' => 'MED-' . strtoupper(substr(uniqid(), -5)),
        ]);

        return redirect()->back()->with('success', "Ticket {$inquiry->ticket_number} created successfully.");
    }

    /**
     * Update inquiry resolution status, priority, faculty reply, and notes.
     */
    public function updateStatus(Request $request, SupportInquiry $inquiry): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,resolved',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'reply' => 'nullable|string|max:3000',
            'assigned_to' => 'nullable|string|max:100',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        if (! empty($validated['reply']) && empty($inquiry->replied_at)) {
            $validated['replied_at'] = now();
        }

        $inquiry->update($validated);

        return redirect()->back()->with('success', "Ticket {$inquiry->ticket_number} updated.");
    }

    /**
     * Export all inquiries to CSV format.
     */
    public function export(Request $request): StreamedResponse
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=cortex_support_tickets_' . date('Y-m-d') . '.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Ticket ID', 'Candidate Name', 'Email', 'Category', 'Priority', 'Status', 'Message', 'Reply', 'Created At']);

            SupportInquiry::chunk(100, function ($rows) use ($handle) {
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $row->ticket_number ?? ('#' . $row->id),
                        $row->name,
                        $row->email,
                        $row->category,
                        strtoupper($row->priority ?? 'NORMAL'),
                        strtoupper($row->status),
                        $row->message,
                        $row->reply ?? '',
                        $row->created_at?->toIso8601String(),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Delete an inquiry.
     */
    public function destroy(SupportInquiry $inquiry): RedirectResponse
    {
        $inquiry->delete();

        return redirect()->back()->with('success', 'Inquiry deleted successfully.');
    }
}
