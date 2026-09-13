<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $session->title ?? 'Exam Report' }} | Performance Scorecard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0066FF;
            --primary-dark: #004ecc;
            --text-main: #0F172A;
            --text-muted: #64748B;
            --border: #E2E8F0;
            --bg-subtle: #F8FAFC;
            --correct: #10B981;
            --wrong: #EF4444;
            --wrong-bg: #FEF2F2;
            --correct-bg: #ECFDF5;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            color: var(--text-main);
            background-color: #F1F5F9;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
        }

        .action-bar {
            position: sticky;
            top: 0;
            z-index: 50;
            background: #FFFFFF;
            border-bottom: 1px solid var(--border);
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.15s ease;
            border: none;
        }

        .btn-primary {
            background: var(--primary);
            color: #FFFFFF;
        }

        .btn-primary:hover {
            background: var(--primary-dark);
        }

        .btn-secondary {
            background: #FFFFFF;
            color: var(--text-main);
            border: 1px solid var(--border);
        }

        .btn-secondary:hover {
            background: var(--bg-subtle);
        }

        .report-sheet {
            max-width: 900px;
            margin: 28px auto 60px auto;
            background: #FFFFFF;
            padding: 48px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            border: 1px solid var(--border);
        }

        /* Header */
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0F172A;
            padding-bottom: 20px;
            margin-bottom: 28px;
        }

        .brand-title {
            font-size: 24px;
            font-weight: 800;
            color: var(--text-main);
            letter-spacing: -0.5px;
        }

        .brand-subtitle {
            font-size: 11px;
            font-weight: 700;
            color: var(--primary);
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .meta-group {
            text-align: right;
            font-size: 12px;
            color: var(--text-muted);
        }

        .meta-group strong {
            color: var(--text-main);
        }

        /* Score Ring / Hero block */
        .score-hero {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: linear-gradient(135deg, #0A1E34 0%, #173859 100%);
            color: #FFFFFF;
            border-radius: 14px;
            padding: 28px 36px;
            margin-bottom: 28px;
        }

        .score-hero-left h1 {
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 4px;
        }

        .score-hero-left p {
            font-size: 13px;
            color: #94A3B8;
        }

        .score-badge-pills {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }

        .pill {
            display: inline-block;
            background: rgba(255,255,255,0.12);
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
        }

        .score-ring {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: conic-gradient(#10B981 {{ $stats['accuracy'] }}%, rgba(255,255,255,0.15) 0);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.2);
            flex-shrink: 0;
        }

        .score-ring-inner {
            width: 82px;
            height: 82px;
            border-radius: 50%;
            background: #0A1E34;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .score-pct {
            font-size: 20px;
            font-weight: 800;
            color: #FFFFFF;
            line-height: 1;
        }

        .score-pct-label {
            font-size: 9px;
            font-weight: 700;
            color: #94A3B8;
            text-transform: uppercase;
            margin-top: 2px;
        }

        /* Metrics grid */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 32px;
        }

        .metric-card {
            background: var(--bg-subtle);
            border: 1px solid var(--border);
            padding: 14px 16px;
            border-radius: 10px;
            text-align: center;
        }

        .metric-val {
            font-size: 22px;
            font-weight: 800;
            color: var(--text-main);
            line-height: 1.1;
        }

        .metric-label {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-top: 4px;
        }

        .color-correct { color: var(--correct); }
        .color-wrong { color: var(--wrong); }
        .color-primary { color: var(--primary); }

        /* Section Title */
        .section-title {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-main);
            border-bottom: 2px solid var(--border);
            padding-bottom: 6px;
            margin-bottom: 16px;
        }

        /* Table */
        .table-wrap {
            margin-bottom: 32px;
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }

        th {
            background: var(--bg-subtle);
            color: var(--text-muted);
            font-weight: 700;
            text-align: left;
            padding: 8px 12px;
            border: 1px solid var(--border);
            text-transform: uppercase;
            font-size: 10px;
        }

        td {
            padding: 8px 12px;
            border: 1px solid var(--border);
            color: var(--text-main);
        }

        tr:nth-child(even) {
            background: #FAFAFA;
        }

        /* Detailed Question Review */
        .question-block {
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 18px 20px;
            margin-bottom: 16px;
            background: #FFFFFF;
            page-break-inside: avoid;
        }

        .question-block.is-correct {
            border-left: 4px solid var(--correct);
        }

        .question-block.is-wrong {
            border-left: 4px solid var(--wrong);
        }

        .q-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
        }

        .q-num {
            font-size: 12px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        .q-status {
            font-size: 11px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 4px;
        }

        .status-correct {
            background: var(--correct-bg);
            color: var(--correct);
        }

        .status-wrong {
            background: var(--wrong-bg);
            color: var(--wrong);
        }

        .status-unanswered {
            background: #F1F5F9;
            color: #64748B;
        }

        .q-stem {
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 12px;
            font-weight: 500;
        }

        .q-options-grid {
            display: grid;
            gap: 6px;
            margin-bottom: 12px;
        }

        .q-opt {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
            background: var(--bg-subtle);
            border: 1px solid var(--border);
        }

        .q-opt.chosen-wrong {
            background: var(--wrong-bg);
            border-color: var(--wrong);
            color: #991B1B;
            font-weight: 600;
        }

        .q-opt.correct-opt {
            background: var(--correct-bg);
            border-color: var(--correct);
            color: #065F46;
            font-weight: 600;
        }

        .q-opt-key {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 4px;
            background: rgba(0,0,0,0.06);
            font-weight: 700;
            font-size: 10px;
        }

        .q-rationale {
            background: #F8FAFC;
            border-left: 3px solid var(--primary);
            padding: 10px 14px;
            border-radius: 0 6px 6px 0;
            font-size: 11.5px;
            color: #334155;
            line-height: 1.5;
        }

        .q-rationale strong {
            color: var(--primary-dark);
            display: block;
            margin-bottom: 2px;
        }

        .footer-note {
            margin-top: 36px;
            text-align: center;
            font-size: 11px;
            color: var(--text-muted);
            border-top: 1px solid var(--border);
            padding-top: 16px;
        }

        @media print {
            body {
                background: #FFFFFF;
                color: #000000;
            }

            .action-bar {
                display: none !important;
            }

            .report-sheet {
                box-shadow: none;
                border: none;
                margin: 0;
                padding: 0;
                max-width: 100%;
            }

            .score-hero {
                background: #0F172A !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .question-block {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>

    <!-- Sticky action bar with print button -->
    <div class="action-bar">
        <div style="display: flex; align-items: center; gap: 12px;">
            <a href="javascript:history.back()" class="btn btn-secondary">
                ← Back to Results
            </a>
            <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">
                {{ $session->title ?? 'Exam Report' }}
            </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
            <button onclick="window.print()" class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download / Print PDF Report
            </button>
        </div>
    </div>

    <div class="report-sheet">
        <!-- Header -->
        <div class="report-header">
            <div>
                <div class="brand-subtitle">Official Postgraduate Entrance Performance Scorecard</div>
                <div class="brand-title">Cortex Medical Examination Council</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                    Benchmarked Against National Examination Blueprints (MECEE-PG • NEET-PG • USMLE)
                </div>
            </div>
            <div class="meta-group">
                <div>Candidate: <strong>{{ $session->user->name ?? 'Candidate' }}</strong></div>
                <div>Session ID: <code style="font-family: 'JetBrains Mono', monospace;">{{ substr($session->id, 0, 13) }}...</code></div>
                <div>Date: <strong>{{ $session->completed_at ? \Carbon\Carbon::parse($session->completed_at)->format('d M Y, h:i A') : now()->format('d M Y') }}</strong></div>
                <div>Duration: <strong>{{ $stats['timeSpentMinutes'] }} min</strong></div>
            </div>
        </div>

        <!-- Hero Score Banner -->
        <div class="score-hero">
            <div class="score-hero-left">
                <h1>{{ $session->title ?? 'Grand Mock Performance Report' }}</h1>
                <p>Scored with official national blueprint & negative-marking rules: {{ $pathway->markingRules() }}</p>
                <div class="score-badge-pills">
                    <span class="pill">{{ $pathway->label() }}</span>
                    <span class="pill">{{ $stats['total'] }} Questions</span>
                    <span class="pill">{{ $stats['correct'] }} / {{ $stats['total'] }} Correct</span>
                </div>
            </div>
            <div class="score-ring">
                <div class="score-ring-inner">
                    <span class="score-pct">{{ round($stats['accuracy']) }}%</span>
                    <span class="score-pct-label">Accuracy</span>
                </div>
            </div>
        </div>

        <!-- 4 Metrics Cards -->
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-val color-primary">{{ $stats['score'] }}</div>
                <div class="metric-label">Scaled Score (Max {{ $stats['maxMarks'] }})</div>
            </div>
            <div class="metric-card">
                <div class="metric-val color-correct">{{ $stats['correct'] }}</div>
                <div class="metric-label">Correct Answers</div>
            </div>
            <div class="metric-card">
                <div class="metric-val color-wrong">{{ $stats['incorrect'] }}</div>
                <div class="metric-label">Incorrect Answers</div>
            </div>
            <div class="metric-card">
                <div class="metric-val" style="color: #64748B;">{{ $stats['unanswered'] }}</div>
                <div class="metric-label">Skipped / Unattempted</div>
            </div>
        </div>

        <!-- Subject Breakdown Table -->
        @if(!empty($subjectBreakdown))
        <div class="section-title">Specialty & Subject Performance Breakdown</div>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Medical Specialty</th>
                        <th style="text-align: center;">Total</th>
                        <th style="text-align: center;">Correct</th>
                        <th style="text-align: center;">Incorrect</th>
                        <th style="text-align: center;">Penalty Lost</th>
                        <th style="text-align: center;">Net Score</th>
                        <th style="text-align: right;">Accuracy</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($subjectBreakdown as $sb)
                    <tr>
                        <td style="font-weight: 600;">{{ $sb['name'] }}</td>
                        <td style="text-align: center;">{{ $sb['total'] }}</td>
                        <td style="text-align: center; color: var(--correct); font-weight: 700;">{{ $sb['correct'] }}</td>
                        <td style="text-align: center; color: var(--wrong); font-weight: 700;">{{ $sb['incorrect'] }}</td>
                        <td style="text-align: center; color: var(--wrong); font-family: monospace;">-{{ $sb['penalty_lost'] }}</td>
                        <td style="text-align: center; font-weight: 700;">{{ $sb['net_score'] }}</td>
                        <td style="text-align: right; font-weight: 700; color: {{ $sb['accuracy'] >= 70 ? 'var(--correct)' : ($sb['accuracy'] >= 50 ? 'var(--primary)' : 'var(--wrong)') }};">
                            {{ $sb['accuracy'] }}%
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Detailed Question-by-Question Review -->
        <div class="section-title" style="margin-top: 24px;">Itemized Clinical Vignette Error Log</div>
        
        @foreach($questions as $index => $q)
            @php
                $attempt = $attemptsMap->get($q->id);
                $selectedOpt = $attempt?->selected_option;
                $isCorrect = (bool) ($attempt?->is_correct);
                $isAttempted = !empty($selectedOpt);
            @endphp
            <div class="question-block {{ $isCorrect ? 'is-correct' : ($isAttempted ? 'is-wrong' : '') }}">
                <div class="q-header">
                    <span class="q-num">Question {{ $index + 1 }} · {{ $q->subject->name ?? 'Clinical Science' }}</span>
                    @if($isCorrect)
                        <span class="q-status status-correct">✓ Correct (+{{ $pathway->pointsPerCorrect() }})</span>
                    @elseif($isAttempted)
                        <span class="q-status status-wrong">✕ Incorrect (-{{ $pathway->penaltyPerIncorrect() }})</span>
                    @else
                        <span class="q-status status-unanswered">○ Skipped (0)</span>
                    @endif
                </div>

                <div class="q-stem">
                    {{ $q->stem }}
                </div>

                <div class="q-options-grid">
                    @foreach($q->options as $opt)
                        @php
                            $isThisSelected = ($selectedOpt === $opt->option_key);
                            $isThisCorrect = ($q->correct_option === $opt->option_key);
                        @endphp
                        <div class="q-opt {{ $isThisCorrect ? 'correct-opt' : ($isThisSelected ? 'chosen-wrong' : '') }}">
                            <span class="q-opt-key">{{ $opt->option_key }}</span>
                            <span style="flex: 1;">{{ $opt->option_text }}</span>
                            @if($isThisCorrect)
                                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase;">(Key Answer)</span>
                            @elseif($isThisSelected)
                                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase;">(Your Answer)</span>
                            @endif
                        </div>
                    @endforeach
                </div>

                @if(!empty($q->foundation_explanation) || !empty($q->learning_objective))
                <div class="q-rationale">
                    <strong>Clinical Key & Learning Objective:</strong>
                    {{ $q->learning_objective ?? $q->foundation_explanation }}
                </div>
                @endif
            </div>
        @endforeach

        <div class="footer-note">
            Generated by Cortex Medical Question Engine (MedAI) · Free for Postgraduate Medical Students · Instant Scoring & Verified Rationales
        </div>
    </div>

</body>
</html>
