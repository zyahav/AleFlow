import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface SpatialCanvasProps {
    children?: React.ReactNode;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({ children }) => {
    const canvasRef = useRef<HTMLDivElement>(null);

    // Smooth panning values
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(1);

    const springConfig = { damping: 30, stiffness: 200 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);
    const springScale = useSpring(scale, springConfig);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            // Zooming
            const delta = e.deltaY * -0.005;
            const newScale = Math.min(Math.max(scale.get() + delta, 0.5), 3);
            scale.set(newScale);
        } else {
            // Panning via wheel
            x.set(x.get() - e.deltaX);
            y.set(y.get() - e.deltaY);
        }
    };

    return (
        <div
            ref={canvasRef}
            className="w-full h-full bg-[#050505] overflow-hidden relative cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
        >
            {/* Background Layer (Parallax Grid) */}
            <motion.div
                style={{
                    x: springX,
                    y: springY,
                    scale: springScale,
                    backgroundSize: "60px 60px",
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 0)",
                }}
                className="absolute inset-[-1000%] w-[2100%] h-[2100%]"
            />

            {/* Content Layer (Centered World) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    style={{
                        x: springX,
                        y: springY,
                        scale: springScale,
                    }}
                    className="relative w-0 h-0 flex items-center justify-center p-0"
                >
                    {/* The actual apps and icons will live here, centered at 0,0 */}
                    {children}
                </motion.div>
            </div>

            {/* Fixed UI Overlays (Dock) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 p-2.5 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 flex gap-4 pointer-events-auto shadow-2xl">
                    <div className="w-12 h-12 rounded-xl bg-logo-primary flex items-center justify-center text-white font-black shadow-[0_0_20px_rgba(193,18,31,0.4)] hover:scale-110 transition-transform cursor-pointer">A</div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition-all cursor-pointer">
                        <div className="w-1 h-1 rounded-full bg-current mx-0.5" />
                        <div className="w-1 h-1 rounded-full bg-current mx-0.5" />
                        <div className="w-1 h-1 rounded-full bg-current mx-0.5" />
                    </div>
                </div>
            </div>
        </div>
    );
};
