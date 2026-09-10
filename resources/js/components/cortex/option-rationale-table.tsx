import React from 'react';
import { Check, X } from 'lucide-react';

interface OptionItem {
    id: string;
    option_key: string;
    option_text: string;
    rationale: string;
}

interface OptionRationaleTableProps {
    options: OptionItem[];
    correctOption: string;
    selectedOption?: string | null;
}

export function OptionRationaleTable({
    options,
    correctOption,
    selectedOption,
}: OptionRationaleTableProps) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Option-by-Option Rationale Table ("Why choices are correct / wrong")
            </h4>

            <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
                {options.map((opt) => {
                    const isCorrect = opt.option_key.toUpperCase() === correctOption.toUpperCase();
                    const isUserChoice = selectedOption && opt.option_key.toUpperCase() === selectedOption.toUpperCase();

                    return (
                        <div
                            key={opt.id || opt.option_key}
                            className={`flex flex-col gap-2 p-3.5 text-xs transition-colors ${
                                isCorrect
                                    ? 'bg-[#2FB36F]/10'
                                    : isUserChoice
                                      ? 'bg-[#E05252]/10'
                                      : 'bg-background hover:bg-muted/30'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`flex size-6 items-center justify-center rounded-md font-bold text-xs ${
                                            isCorrect
                                                ? 'bg-[#2FB36F] text-white'
                                                : isUserChoice
                                                  ? 'bg-[#E05252] text-white'
                                                  : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {opt.option_key}
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {opt.option_text}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {isUserChoice && (
                                        <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-white">
                                            Your Pick
                                        </span>
                                    )}
                                    {isCorrect ? (
                                        <span className="flex items-center gap-1 rounded bg-[#2FB36F] px-2 py-0.5 text-[10px] font-bold text-white">
                                            <Check className="size-3" /> Correct
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            <X className="size-3" /> Incorrect
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground pl-8">
                                {opt.rationale}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
