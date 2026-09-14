import React, { useState, useEffect } from 'react';
import {
    ChevronDown,
    Check,
    ShieldAlert,
    Sparkles,
    GraduationCap,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';

export interface PathwayOption {
    id: string;
    code?: string;
    name: string;
    fullName?: string;
    region: string;
    marking: string;
    penalty: string;
    badgeColor?: string;
    totalQuestions?: number;
    durationMinutes?: number;
}

const DEFAULT_PATHWAYS: PathwayOption[] = [
    {
        id: 'NEET_PG',
        name: 'NEET-PG (2026)',
        region: 'India',
        marking: '+4.0 / -1.0',
        penalty: 'National (-1.0)',
        badgeColor:
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
        id: 'INI_CET',
        name: 'INI-CET (AIIMS/PGI)',
        region: 'India',
        marking: '+1.0 / -0.33',
        penalty: 'Severe (-0.33)',
        badgeColor:
            'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
    {
        id: 'MECEE_PG',
        name: 'MECEE-PG',
        region: 'Nepal',
        marking: '+1.0 / -0.25',
        penalty: 'Standard (-0.25)',
        badgeColor:
            'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    },
    {
        id: 'USMLE_STEP1',
        name: 'USMLE Step 1',
        region: 'USA',
        marking: 'Pass / Fail',
        penalty: 'No Negative',
        badgeColor:
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
        id: 'USMLE_STEP2CK',
        name: 'USMLE Step 2 CK',
        region: 'USA',
        marking: 'Scaled 1–300',
        penalty: 'No Negative',
        badgeColor:
            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
        id: 'COMBINED',
        name: 'Combined Global Track',
        region: 'Global',
        marking: '+1.0 / -0.25',
        penalty: 'Standard (-0.25)',
        badgeColor:
            'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    },
];

interface PathwaySelectorProps {
    currentPathway?: string;
    onPathwayChange?: (newPathway: string) => void;
}

export function PathwaySelector({
    currentPathway,
    onPathwayChange,
}: PathwaySelectorProps) {
    const { exam_pathways } = usePage<{ exam_pathways?: PathwayOption[] }>().props;
    const pathways = exam_pathways && exam_pathways.length > 0 ? exam_pathways : DEFAULT_PATHWAYS;

    const [activeId, setActiveId] = useState<string>(
        currentPathway || pathways[0]?.id || 'INI_CET',
    );
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (currentPathway && currentPathway !== activeId) {
            setActiveId(currentPathway);
        }
    }, [currentPathway]);

    const active = pathways.find((p) => p.id === activeId) || pathways[0] || {
        id: activeId,
        name: activeId,
        region: 'Global',
        marking: '',
        penalty: '',
        badgeColor: '',
    };

    const handleSelect = async (pathwayId: string) => {
        if (pathwayId === activeId) return;
        const target = pathways.find((p) => p.id === pathwayId) || { name: pathwayId, marking: '' };
        setActiveId(pathwayId);
        setIsUpdating(true);

        try {
            const res = await fetch('/api/v1/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ active_pathway: pathwayId }),
            });

            if (res.ok) {
                toast.success(`Active pathway switched to ${target.name}`, {
                    description: target.marking
                        ? `Marking rules & blueprints dynamically updated to ${target.marking}`
                        : undefined,
                });
                if (onPathwayChange) {
                    onPathwayChange(pathwayId);
                } else {
                    window.location.reload();
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || 'Failed to update pathway');
            }
        } catch (error) {
            toast.error('Failed to update pathway');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 sm:gap-2.5 rounded-xl border border-border bg-card px-2 sm:px-3.5 text-xs text-foreground shadow-xs hover:border-slate-300 hover:bg-muted/80 dark:border-slate-700/80 dark:bg-[#0d1627] dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-[#121f36]"
                    disabled={isUpdating}
                >
                    <span className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-xs ring-2 shadow-emerald-500/50 ring-emerald-500/20 dark:bg-emerald-400" />
                    <div className="flex min-w-0 items-center gap-1.5 text-left text-xs">
                        <span className="max-w-[70px] xs:max-w-[105px] sm:max-w-none truncate font-semibold text-foreground dark:text-white">
                            {active.name}
                        </span>
                        {active.marking && (
                            <span className="hidden rounded border border-border bg-muted/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 sm:inline-block">
                                {active.marking}
                            </span>
                        )}
                    </div>
                    <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 max-w-[calc(100vw-2rem)] p-2">
                <div className="text-muted-foreground px-2 py-1.5 text-xs font-semibold">
                    SWITCH EXAM PATHWAY
                </div>
                {pathways.map((p) => {
                    const isSelected = p.id === activeId;
                    return (
                        <DropdownMenuItem
                            key={p.id}
                            onClick={() => handleSelect(p.id)}
                            className={`flex cursor-pointer items-start justify-between rounded-lg p-2.5 transition-colors ${
                                isSelected
                                    ? 'text-foreground bg-[#55BDEB]/10 font-medium'
                                    : 'hover:bg-muted'
                            }`}
                        >
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold">
                                        {p.name}
                                    </span>
                                    <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[9px] tracking-wider uppercase">
                                        {p.region}
                                    </span>
                                </div>
                                <span className="text-muted-foreground text-[11px]">
                                    Rules: {p.marking} {p.penalty ? `(${p.penalty})` : ''}
                                </span>
                            </div>
                            {isSelected && (
                                <Check className="mt-0.5 size-4 shrink-0 text-[#55BDEB]" />
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
