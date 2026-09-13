import { Zap } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-md shadow-cyan-950/50">
                <Zap className="size-5 fill-current" />
            </div>
            <div className="ml-2.5 grid flex-1 text-left leading-none">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-wider text-white">
                        CORTEX<span className="text-cyan-400">MED</span>
                    </span>
                    <span className="rounded border border-cyan-500/40 bg-cyan-950/60 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-400">
                        v4.2
                    </span>
                </div>
                <span className="mt-1 truncate text-[11px] font-medium text-slate-400">
                    Candidate Readiness Portal
                </span>
            </div>
        </>
    );
}
