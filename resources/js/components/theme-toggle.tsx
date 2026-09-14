import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
    className?: string;
    variant?: 'ghost' | 'outline' | 'default';
    size?: 'sm' | 'default' | 'icon';
}

export function ThemeToggle({
    className,
    variant = 'ghost',
    size = 'icon',
}: ThemeToggleProps) {
    const [mounted, setMounted] = useState(false);
    const { resolvedAppearance, updateAppearance } = useAppearance();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    const isDark = mounted && resolvedAppearance === 'dark';

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            onClick={toggleTheme}
            className={cn(
                'size-9 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/80',
                className,
            )}
            title={
                isDark
                    ? 'Switch to Light theme'
                    : 'Switch to Dark theme'
            }
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="size-4.5 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
                <Moon className="size-4.5 text-slate-700 dark:text-slate-300 transition-transform duration-200 hover:-rotate-12" />
            )}
        </Button>
    );
}
