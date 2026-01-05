import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Preload } from "@react-three/drei";
import { TerrainNet } from "./TerrainNet";
import { AxisGizmo } from "./AxisGizmo";
import { BlenderControls } from "./BlenderControls";

interface SpatialWorldProps {
    children?: React.ReactNode;
}

export const SpatialWorld: React.FC<SpatialWorldProps> = ({ children }) => {
    return (
        <div className="w-full h-full bg-[#030303] relative overflow-hidden">
            <Canvas
                shadows
                gl={{ 
                    antialias: true, 
                    alpha: false,
                    powerPreference: "high-performance"
                }}
                camera={{ 
                    position: [25, -25, 20], 
                    fov: 45, 
                    near: 0.1,
                    far: 500,
                    up: [0, 0, 1] 
                }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    {/* Soft ambient lighting - warm and welcoming */}
                    <ambientLight intensity={0.4} color="#ffffff" />
                    
                    {/* Main key light - warm sunlight feel */}
                    <directionalLight 
                        position={[20, 20, 30]} 
                        intensity={1.2} 
                        castShadow 
                        color="#fff5e6"
                        shadow-mapSize={[2048, 2048]}
                        shadow-camera-far={100}
                        shadow-camera-left={-30}
                        shadow-camera-right={30}
                        shadow-camera-top={30}
                        shadow-camera-bottom={-30}
                    />
                    
                    {/* Fill light - cool accent */}
                    <pointLight position={[-15, -15, 15]} intensity={0.4} color="#6699ff" />
                    
                    {/* Rim light - subtle highlight */}
                    <pointLight position={[0, 30, 5]} intensity={0.3} color="#ff9966" />

                    {/* The Infinite Grid Floor */}
                    <TerrainNet />

                    {/* Soft contact shadows for grounding */}
                    <ContactShadows 
                        opacity={0.35} 
                        scale={60} 
                        blur={2} 
                        far={10} 
                        resolution={512} 
                        color="#000000"
                        position={[0, 0, 0]}
                    />

                    {/* Application Content */}
                    <group position={[0, 0, 0]}>
                        {children}
                    </group>

                    {/* Blender-style smooth controls */}
                    <BlenderControls />
                    
                    {/* Navigation gizmo */}
                    <AxisGizmo />

                    {/* Atmospheric fog - creates depth and coziness */}
                    <fog attach="fog" args={['#030303', 40, 120]} />
                    
                    {/* Preload assets for smooth experience */}
                    <Preload all />
                </Suspense>
            </Canvas>
            
            {/* Helpful hint overlay */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none opacity-30 hover:opacity-60 transition-opacity">
                <div className="flex gap-6 text-[10px] text-white/50 font-mono uppercase tracking-widest">
                    <span>Scroll: Orbit</span>
                    <span>Shift+Scroll: Pan</span>
                    <span>Ctrl+Scroll: Zoom</span>
                </div>
            </div>
        </div>
    );
};
