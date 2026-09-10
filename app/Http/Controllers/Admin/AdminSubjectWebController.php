<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubjectWebController extends Controller
{
    public function index(): Response
    {
        $subjects = Subject::withCount(['topics', 'questions'])
            ->orderBy('order_index')
            ->get();

        return Inertia::render('admin/subjects/index', [
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:subjects,name',
            'slug' => 'nullable|string|max:100|unique:subjects,slug',
            'icon_key' => 'nullable|string|max:50',
            'order_index' => 'nullable|integer',
        ]);

        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);
        $orderIndex = $validated['order_index'] ?? ((Subject::max('order_index') ?? 0) + 1);

        Subject::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'icon_key' => $validated['icon_key'] ?? 'BookOpen',
            'order_index' => $orderIndex,
        ]);

        return redirect()->route('admin.subjects.index')->with('success', 'Subject created successfully.');
    }

    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('subjects', 'name')->ignore($subject->id)],
            'slug' => ['nullable', 'string', 'max:100', Rule::unique('subjects', 'slug')->ignore($subject->id)],
            'icon_key' => 'nullable|string|max:50',
            'order_index' => 'nullable|integer',
        ]);

        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);

        $subject->update([
            'name' => $validated['name'],
            'slug' => $slug,
            'icon_key' => $validated['icon_key'] ?? $subject->icon_key,
            'order_index' => $validated['order_index'] ?? $subject->order_index,
        ]);

        return redirect()->route('admin.subjects.index')->with('success', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $questionCount = $subject->questions()->count();

        if ($questionCount > 0) {
            return redirect()->route('admin.subjects.index')->with('error', "Cannot delete subject: {$questionCount} questions are linked to this subject. Please reassign or delete questions first.");
        }

        $subject->delete();

        return redirect()->route('admin.subjects.index')->with('success', 'Subject deleted successfully.');
    }
}
