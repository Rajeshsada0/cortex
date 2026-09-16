import { useSettings } from '@/hooks/use-settings';

export default function AppLogo() {
    const settings = useSettings();
    const appName = settings.app_name || 'CORTEX MED';
    const version = settings.app_version || 'v4.2';
    const tagline = settings.app_tagline || 'Candidate Readiness Portal';
    const logoSrc = settings.site_logo || '/images/cortex-logo.png';

    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-1 shadow-xs dark:bg-cyan-950/40">
                <img
                    src={logoSrc}
                    alt={appName}
                    className="size-7 object-contain drop-shadow-xs"
                />
            </div>
            <div className="ml-2.5 grid flex-1 text-left leading-none">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-wider text-slate-900 dark:text-white">
                        {appName}
                    </span>
                    {version && (
                        <span className="rounded border border-cyan-500/30 bg-cyan-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-950/60 dark:text-cyan-400">
                            {version}
                        </span>
                    )}
                </div>
                {tagline && (
                    <span className="mt-1 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {tagline}
                    </span>
                )}
            </div>
        </>
    );
}
