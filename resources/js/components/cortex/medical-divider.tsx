import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MedicalDividerProps {
    label: string;
    icon: LucideIcon;
    accentColor?: 'blue' | 'indigo' | 'emerald' | 'amber';
    subtitle?: string;
    className?: string;
}

export function MedicalDivider({
    label,
    icon: Icon,
    accentColor = 'blue',
    subtitle,
    className = '',
}: MedicalDividerProps) {
    const colorClasses = {
        blue: {
            line: 'via-[#55BDEB]/40',
            glow: 'bg-[#55BDEB]/20',
            border: 'border-[#55BDEB]/30 hover:border-[#55BDEB]/60',
            icon: 'text-[#55BDEB]',
            badgeText: 'text-[#55BDEB]',
            tick: 'text-[#55BDEB]/30',
        },
        indigo: {
            line: 'via-indigo-500/40',
            glow: 'bg-indigo-500/20',
            border: 'border-indigo-500/30 hover:border-indigo-500/60',
            icon: 'text-indigo-500',
            badgeText: 'text-indigo-500',
            tick: 'text-indigo-500/30',
        },
        emerald: {
            line: 'via-[#2FB36F]/40',
            glow: 'bg-[#2FB36F]/20',
            border: 'border-[#2FB36F]/30 hover:border-[#2FB36F]/60',
            icon: 'text-[#2FB36F]',
            badgeText: 'text-[#2FB36F]',
            tick: 'text-[#2FB36F]/30',
        },
        amber: {
            line: 'via-amber-500/40',
            glow: 'bg-amber-500/20',
            border: 'border-amber-500/30 hover:border-amber-500/60',
            icon: 'text-amber-500',
            badgeText: 'text-amber-500',
            tick: 'text-amber-500/30',
        },
    }[accentColor];

    return (
        <div
            className={`relative flex w-full items-center justify-center py-10 select-none sm:py-14 ${className}`}
        >
            {/* Ambient Center Glow */}
            <div
                className={`pointer-events-none absolute top-1/2 left-1/2 h-8 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-all ${colorClasses.glow}`}
            />

            {/* Continuous Gradient Line with Center Accent */}
            <div className="relative flex w-full items-center">
                {/* Left Line */}
                <div
                    className={`via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent`}
                />

                {/* Left Telemetry Crosshair */}
                <div
                    className={`hidden items-center px-4 font-mono text-[10px] font-bold sm:flex ${colorClasses.tick}`}
                >
                    +—·—+
                </div>

                {/* Center Modern Medical Chip */}
                <div
                    className={`bg-card/95 relative z-10 mx-2 inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md sm:mx-4 ${colorClasses.border}`}
                >
                    <span className="relative flex size-2">
                        <span
                            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                                accentColor === 'blue'
                                    ? 'bg-[#55BDEB]'
                                    : accentColor === 'indigo'
                                      ? 'bg-indigo-500'
                                      : accentColor === 'emerald'
                                        ? 'bg-[#2FB36F]'
                                        : 'bg-amber-500'
                            }`}
                        />
                        <span
                            className={`relative inline-flex size-2 rounded-full ${
                                accentColor === 'blue'
                                    ? 'bg-[#55BDEB]'
                                    : accentColor === 'indigo'
                                      ? 'bg-indigo-500'
                                      : accentColor === 'emerald'
                                        ? 'bg-[#2FB36F]'
                                        : 'bg-amber-500'
                            }`}
                        />
                    </span>

                    <Icon
                        className={`size-3.5 shrink-0 ${colorClasses.icon}`}
                    />

                    <span className="text-foreground font-mono text-[11px] font-extrabold tracking-widest uppercase">
                        {label}
                    </span>

                    {subtitle && (
                        <>
                            <span className="bg-border h-3 w-px" />
                            <span className="text-muted-foreground hidden text-[10px] font-medium md:inline">
                                {subtitle}
                            </span>
                        </>
                    )}
                </div>

                {/* Right Telemetry Crosshair */}
                <div
                    className={`hidden items-center px-4 font-mono text-[10px] font-bold sm:flex ${colorClasses.tick}`}
                >
                    +—·—+
                </div>

                {/* Right Line */}
                <div
                    className={`via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent`}
                />
            </div>
        </div>
    );
}
