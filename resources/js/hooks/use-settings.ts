import { usePage } from '@inertiajs/react';

export interface SystemSettings {
    app_name: string;
    app_version: string;
    app_tagline: string;
    site_logo: string;
    site_favicon: string;
    footer_text: string;
    contact_email?: string;
    seo_meta_title: string;
    seo_meta_description: string;
    seo_meta_keywords: string;
    seo_og_image: string;
    social_facebook?: string;
    social_twitter?: string;
    social_instagram?: string;
    social_youtube?: string;
    social_linkedin?: string;
    social_telegram?: string;
}

export const DEFAULT_SETTINGS: SystemSettings = {
    app_name: 'CORTEX MED',
    app_version: 'v4.2',
    app_tagline: 'Candidate Readiness Portal',
    site_logo: '/images/cortex-logo.png',
    site_favicon: '/favicon.ico',
    footer_text: '© 2026 Cortex Med. High-Stakes Doctor Entrance Simulation Engine.',
    contact_email: 'support@cortexmed.com',
    seo_meta_title: 'Cortex Medical — Postgraduate Doctor Entrance Preparation (MECEE-PG • INI-CET • USMLE)',
    seo_meta_description: 'High-Stakes Postgraduate Doctor Entrance Simulation Engine. Prepare for Nepal MECEE-PG, NMCLE, India INI-CET, and USMLE with clinical vignettes, negative marking, and spaced repetition.',
    seo_meta_keywords: 'MBBS, NMCLE, MECEE-PG, INI-CET, USMLE, Medical Entrance Exam, Clinical Scenario Questions, CSQ, Medical PG Preparation',
    seo_og_image: '/images/cortex-logo.png',
    social_facebook: 'https://facebook.com/cortexmed',
    social_twitter: 'https://twitter.com/cortexmed',
    social_instagram: 'https://instagram.com/cortexmed',
    social_youtube: 'https://youtube.com/@cortexmed',
    social_linkedin: 'https://linkedin.com/company/cortexmed',
    social_telegram: 'https://t.me/cortexmed',
};

export function useSettings(): SystemSettings {
    const { settings } = usePage<{ settings?: Partial<SystemSettings> }>().props;
    return {
        ...DEFAULT_SETTINGS,
        ...(settings || {}),
    };
}
