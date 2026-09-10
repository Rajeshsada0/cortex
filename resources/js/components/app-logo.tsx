import { Activity } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#102A43] text-[#55BDEB] shadow-sm ring-1 ring-[#55BDEB]/30">
                <Activity className="size-5 text-[#55BDEB]" />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate text-sm font-bold tracking-tight text-[#102A43] dark:text-[#55BDEB]">
                    CORTEX <span className="font-normal text-xs text-muted-foreground">MED</span>
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                    MECEE • INI-CET • USMLE
                </span>
            </div>
        </>
    );
}
