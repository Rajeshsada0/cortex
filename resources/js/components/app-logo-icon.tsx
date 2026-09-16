import type { ImgHTMLAttributes } from 'react';
import { useSettings } from '@/hooks/use-settings';

export default function AppLogoIcon({
    className = 'size-9',
    alt,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    const settings = useSettings();
    const logoSrc = settings.site_logo || '/images/cortex-logo.png';
    const appName = alt || settings.app_name || 'Cortex Med';

    return (
        <img
            src={logoSrc}
            alt={appName}
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
