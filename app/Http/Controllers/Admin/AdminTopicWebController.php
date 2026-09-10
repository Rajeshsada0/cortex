<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Subtopic;
use App\Models\Topic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminTopicWebController extends Controller
{
    public function index(Request $request): Response
    {
        $subjectId = $request->query('subject_id');

        $query = Topic::with(['subject:id,name,slug', 'subtopics:id,topic_id,name'])
            ->withCount('questions');

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        $topics = $query->orderBy('subject_id')
            ->orderByDesc('high_yield_priority')
            ->orderBy('name')
            ->get();

        $subjects = Subject::orderBy('order_index')->get(['id', 'name']);

        return Inertia::render('admin/topics/index', [
            'topics' => $topics,
            'subjects' => $subjects,
            'selected_subject_id' => $subjectId ? (int) $subjectId : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:150',
            'slug' => 'nullable|string|max:150',
            'high_yield_priority' => 'nullable|integer|min:1|max:5',
        ]);

        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);

        Topic::create([
            'subject_id' => $validated['subject_id'],
            'name' => $validated['name'],
            'slug' => $slug,
            'high_yield_priority' => $validated['high_yield_priority'] ?? 3,
        ]);

        return redirect()->route('admin.topics.index', ['subject_id' => $validated['subject_id']])
            ->with('success', 'Topic created successfully.');
    }

    public function update(Request $request, Topic $topic): RedirectResponse
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:150',
            'slug' => 'nullable|string|max:150',
            'high_yield_priority' => 'nullable|integer|min:1|max:5',
        ]);

        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);

        $topic->update([
            'subject_id' => $validated['subject_id'],
            'name' => $validated['name'],
            'slug' => $slug,
            'high_yield_priority' => $validated['high_yield_priority'] ?? $topic->high_yield_priority,
        ]);

        return redirect()->route('admin.topics.index', ['subject_id' => $topic->subject_id])
            ->with('success', 'Topic updated successfully.');
    }

    public function destroy(Topic $topic): RedirectResponse
    {
        $subjectId = $topic->subject_id;
        $questionCount = $topic->questions()->count();

        if ($questionCount > 0) {
            return redirect()->route('admin.topics.index', ['subject_id' => $subjectId])
                ->with('error', "Cannot delete topic: {$questionCount} questions are linked to this topic.");
        }

        $topic->delete();

        return redirect()->route('admin.topics.index', ['subject_id' => $subjectId])
            ->with('success', 'Topic deleted successfully.');
    }

    public function storeSubtopic(Request $request, Topic $topic): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
        ]);

        $topic->subtopics()->create([
            'name' => $validated['name'],
        ]);

        return redirect()->route('admin.topics.index', ['subject_id' => $topic->subject_id])
            ->with('success', 'Subtopic added successfully.');
    }

    public function destroySubtopic(Subtopic $subtopic): RedirectResponse
    {
        $topic = $subtopic->topic;
        $questionCount = $subtopic->questions()->count();

        if ($questionCount > 0) {
            return redirect()->route('admin.topics.index', ['subject_id' => $topic->subject_id])
                ->with('error', "Cannot delete subtopic: {$questionCount} questions are linked to this subtopic.");
        }

        $subtopic->delete();

        return redirect()->route('admin.topics.index', ['subject_id' => $topic->subject_id])
            ->with('success', 'Subtopic deleted successfully.');
    }
}
