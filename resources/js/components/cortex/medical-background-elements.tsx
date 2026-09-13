import React from 'react';

export function MedicalBackgroundElements() {
    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
            {/* 1. Subtle Clinical Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#55BDEB08_1px,transparent_1px),linear-gradient(to_bottom,#55BDEB08_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_85%_70%_at_50%_35%,#000_65%,transparent_100%)] bg-[size:44px_44px]" />

            {/* 2. Soft Ambient Medical Blur Orbs in Clinical Dark Palette */}
            <div className="absolute -top-32 right-1/4 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute top-1/3 -left-24 h-[420px] w-[420px] rounded-full bg-sky-500/8 blur-[130px]" />
            <div className="absolute right-1/4 -bottom-20 h-[400px] w-[500px] rounded-full bg-blue-500/8 blur-[120px]" />
        </div>
    );
}
