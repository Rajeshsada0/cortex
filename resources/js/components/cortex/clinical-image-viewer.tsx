import React, { useState, useRef, useEffect } from 'react';
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Sliders,
    Maximize2,
    Eye,
    Shield,
    SunMedium,
    Contrast,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClinicalImageViewerProps {
    imageUrl: string;
    caption?: string | null;
    watermark?: {
        user_id?: string | number;
        user_email?: string;
        timestamp?: string;
        ip?: string;
        token?: string;
    };
    alt?: string;
}

export function ClinicalImageViewer({
    imageUrl,
    caption,
    watermark = {
        user_id: 'dr_cortex',
        user_email: 'dr.cortex@example.com',
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        token: 'CTX-88F9A',
    },
    alt = 'Clinical Vignette Diagnostic Asset',
}: ClinicalImageViewerProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // DICOM Windowing states
    const [brightness, setBrightness] = useState(100); // 50 to 150%
    const [contrast, setContrast] = useState(100); // 50 to 200%
    const [isInverted, setIsInverted] = useState(false);
    const [showControls, setShowControls] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
    const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.75));
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setBrightness(100);
        setContrast(100);
        setIsInverted(false);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const watermarkText = `${watermark.user_email || watermark.user_id} • IP:${watermark.ip || '127.0.0.1'} • ${watermark.token || 'CTX-DRM'}`;

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-black/95 text-white shadow-inner">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-neutral-900/90 px-3 py-2 text-xs backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#55BDEB]">
                        <Eye className="size-3.5" /> DICOM / HIGH-RES VIEWER
                    </span>
                    <span className="hidden text-white/50 sm:inline">•</span>
                    <span className="hidden font-mono text-[10px] text-white/60 sm:inline">
                        Zoom: {Math.round(scale * 100)}%
                    </span>
                </div>

                {/* Viewer Tools Action Bar */}
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowControls(!showControls)}
                        className={`h-7 px-2 text-xs text-white/80 hover:bg-white/10 hover:text-white ${
                            showControls ? 'bg-white/20 text-white' : ''
                        }`}
                        title="DICOM Windowing (Brightness / Contrast)"
                    >
                        <Sliders className="size-3.5 mr-1" />
                        Windowing
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        className="h-7 w-7 p-0 text-white/80 hover:bg-white/10 hover:text-white"
                        title="Zoom In"
                    >
                        <ZoomIn className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        className="h-7 w-7 p-0 text-white/80 hover:bg-white/10 hover:text-white"
                        title="Zoom Out"
                    >
                        <ZoomOut className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-7 w-7 p-0 text-white/80 hover:bg-white/10 hover:text-white"
                        title="Reset View"
                    >
                        <RotateCcw className="size-3.5" />
                    </Button>
                </div>
            </div>

            {/* Sliding Windowing Controls Panel */}
            {showControls && (
                <div className="flex flex-wrap items-center gap-4 border-b border-white/10 bg-neutral-900/95 px-4 py-2 text-xs text-white/90">
                    <div className="flex items-center gap-2">
                        <SunMedium className="size-3.5 text-amber-400" />
                        <span>Brightness:</span>
                        <input
                            type="range"
                            min="40"
                            max="160"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="h-1.5 w-24 cursor-pointer accent-[#55BDEB]"
                        />
                        <span className="font-mono text-[10px] text-white/60">{brightness}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Contrast className="size-3.5 text-cyan-400" />
                        <span>Contrast:</span>
                        <input
                            type="range"
                            min="50"
                            max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="h-1.5 w-24 cursor-pointer accent-[#55BDEB]"
                        />
                        <span className="font-mono text-[10px] text-white/60">{contrast}%</span>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsInverted(!isInverted)}
                        className="h-6 border-white/20 bg-transparent px-2 text-[10px] text-white hover:bg-white/10"
                    >
                        {isInverted ? 'Normal Window' : 'Invert (Bone Window)'}
                    </Button>
                </div>
            )}

            {/* Viewport Canvas with Pan and Zoom */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative flex min-h-[260px] max-h-[460px] w-full cursor-grab items-center justify-center overflow-hidden bg-neutral-950 p-2 select-none active:cursor-grabbing"
            >
                {/* Clinical Image with CSS Filters */}
                <div
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                            isInverted ? 'invert(1)' : ''
                        }`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    }}
                    className="relative flex items-center justify-center max-w-full"
                >
                    <img
                        src={imageUrl}
                        alt={alt}
                        className="max-h-[380px] w-auto rounded object-contain pointer-events-none"
                    />
                </div>

                {/* Anti-Scraping Dynamic Watermark Overlay */}
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden opacity-25">
                    <div className="grid grid-cols-2 gap-16 -rotate-25 transform select-none font-mono text-[11px] font-bold tracking-widest text-white/40">
                        <span>{watermarkText}</span>
                        <span>{watermarkText}</span>
                        <span>{watermarkText}</span>
                        <span>{watermarkText}</span>
                    </div>
                </div>

                {/* DRM Security Tag */}
                <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[9px] font-mono text-white/50 backdrop-blur-sm">
                    <Shield className="size-3 text-[#55BDEB]" />
                    <span>ENCRYPTED DRM ASSET</span>
                </div>
            </div>

            {/* Caption Banner */}
            {caption && (
                <div className="border-t border-white/10 bg-neutral-900/90 px-3 py-1.5 text-xs text-white/80">
                    <span className="font-semibold text-[#55BDEB]">Clinical Finding: </span>
                    {caption}
                </div>
            )}
        </div>
    );
}
