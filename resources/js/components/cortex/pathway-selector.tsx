import React, { useState } from 'react';
import { ChevronDown, Check, ShieldAlert, Sparkles, GraduationCap } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface PathwayOption {
    id: 'MECEE_PG' | 'INI_CET' | 'USMLE_STEP1' | 'USMLE_STEP2CK' | 'COMBINED';
    name: string;
    region: string;
    marking: string;
    penalty: string;
    badgeColor: string;
}

const PATHWAYS: PathwayOption[] = [
    {
        id: 'INI_CET',
        name: 'INI-CET (AIIMS/PGI)',
        region: 'India',
        marking: '+1.0 / -0.33',
        penalty: 'Severe (-0.33)',
        badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
    {
        id: 'MECEE_PG',
        name: 'MECEE-PG',
        region: 'Nepal',
        marking: '+1.0 / -0.25',
        penalty: 'Standard (-0.25)',
        badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    },
    {
        id: 'USMLE_STEP1',
        name: 'USMLE Step 1',
        region: 'USA',
        marking: 'Pass / Fail',
        penalty: 'No Negative',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
        id: 'USMLE_STEP2CK',
        name: 'USMLE Step 2 CK',
        region: 'USA',
        marking: 'Scaled 1–300',
        penalty: 'No Negative',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
        id: 'COMBINED',
        name: 'Combined Global Track',
        region: 'Global',
        marking: '+1.0 / -0.25',
        penalty: 'Standard (-0.25)',
        badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    },
];

interface PathwaySelectorProps {
    currentPathway: string;
    onPathwayChange?: (newPathway: string) => void;
}

export function PathwaySelector({ currentPathway, onPathwayChange }: PathwaySelectorProps) {
    const [activeId, setActiveId] = useState<string>(currentPathway || 'INI_CET');
    const [isUpdating, setIsUpdating] = useState(false);

    const active = PATHWAYS.find((p) => p.id === activeId) || PATHWAYS[0];

    const handleSelect = async (pathwayId: string) => {
        if (pathwayId === activeId) return;
        setActiveId(pathwayId);
        setIsUpdating(true);

        try {
            const res = await fetch('/api/v1/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ active_pathway: pathwayId }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Active pathway switched to ${active.name}`, {
                    description: `Marking rules & blueprints dynamically updated to ${active.marking}`,
                });
                if (onPathwayChange) {
                    onPathwayChange(pathwayId);
                } else {
                    window.location.reload();
                }
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
                    className="h-9 gap-2 border-[#55BDEB]/30 bg-background/80 px-3 hover:border-[#55BDEB] hover:bg-[#55BDEB]/5"
                    disabled={isUpdating}
                >
                    <GraduationCap className="size-4 text-[#55BDEB]" />
                    <div className="flex items-center gap-1.5 text-left text-xs">
                        <span className="font-semibold text-foreground">{active.name}</span>
                        <span className="hidden rounded px-1.5 py-0.2 text-[10px] font-medium sm:inline-block border border-border">
                            {active.marking}
                        </span>
                    </div>
                    <ChevronDown className="size-3.5 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    SWITCH EXAM PATHWAY
                </div>
                {PATHWAYS.map((p) => {
                    const isSelected = p.id === activeId;
                    return (
                        <DropdownMenuItem
                            key={p.id}
                            onClick={() => handleSelect(p.id)}
                            className={`flex cursor-pointer items-start justify-between rounded-lg p-2.5 transition-colors ${
                                isSelected
                                    ? 'bg-[#55BDEB]/10 font-medium text-foreground'
                                    : 'hover:bg-muted'
                            }`}
                        >
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold">{p.name}</span>
                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                                        {p.region}
                                    </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground">
                                    Rules: {p.marking} ({p.penalty})
                                </span>
                            </div>
                            {isSelected && <Check className="size-4 text-[#55BDEB] shrink-0 mt-0.5" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
