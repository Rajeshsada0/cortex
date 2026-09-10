import React from 'react';
import { HelpCircle, CheckCircle, Sparkles } from 'lucide-react';

export type ConfidenceType = 'LOW' | 'MEDIUM' | 'HIGH';

interface ConfidenceSelectorProps {
    value: ConfidenceType;
    onChange: (val: ConfidenceType) => void;
    disabled?: boolean;
}

export function ConfidenceSelector({ value, onChange, disabled = false }: ConfidenceSelectorProps) {
    const options: { id: ConfidenceType; label: string; sub: string; color: string; icon: any }[] = [
        {
            id: 'LOW',
            label: 'Low',
            sub: 'Guess / 50-50',
            color: 'hover:border-amber-400 data-[selected=true]:border-amber-500 data-[selected=true]:bg-amber-500/10 data-[selected=true]:text-amber-600 dark:data-[selected=true]:text-amber-400',
            icon: HelpCircle,
        },
        {
            id: 'MEDIUM',
            label: 'Medium',
            sub: 'Probable',
            color: 'hover:border-[#55BDEB] data-[selected=true]:border-[#55BDEB] data-[selected=true]:bg-[#55BDEB]/10 data-[selected=true]:text-[#55BDEB]',
            icon: Sparkles,
        },
        {
            id: 'HIGH',
            label: 'High',
            sub: 'Certain',
            color: 'hover:border-[#2FB36F] data-[selected=true]:border-[#2FB36F] data-[selected=true]:bg-[#2FB36F]/10 data-[selected=true]:text-[#2FB36F]',
            icon: CheckCircle,
        },
    ];

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pre-Submission Confidence Rating
            </label>
            <div className="grid grid-cols-3 gap-2">
                {options.map((opt) => {
                    const isSelected = value === opt.id;
                    const Icon = opt.icon;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            disabled={disabled}
                            data-selected={isSelected}
                            onClick={() => onChange(opt.id)}
                            className={`flex flex-col items-center justify-center rounded-xl border border-border p-2 text-center transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${opt.color} ${
                                isSelected ? 'ring-1 ring-current font-bold' : 'bg-background hover:bg-muted/50'
                            }`}
                        >
                            <div className="flex items-center gap-1">
                                <Icon className="size-3.5" />
                                <span className="text-xs">{opt.label}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{opt.sub}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
