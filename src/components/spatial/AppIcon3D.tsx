import React, { useState, useRef } from "react";
import { useCursor, Html, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { LucideIcon } from "lucide-react";
import * as THREE from "three";

interface AppIcon3DProps {
    id: string;
    icon: LucideIcon;
    label: string;
    color: string;
    position: [number, number, number];
    onClick: () => void;
}

export const AppIcon3D: React.FC<AppIcon3DProps> = ({ icon: Icon, label, color, position, onClick }) => {
    const [hovered, setHovered] = useState(false);
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    useCursor(hovered);

    // Smooth hover animation
    useFrame((_, delta) => {
        if (meshRef.current) {
            const targetScale = hovered ? 1.1 : 1;
            meshRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale), 
                delta * 8
            );
        }
    });

    return (
        <Float 
            speed={1.5} 
            rotationIntensity={0.1} 
            floatIntensity={0.3}
            floatingRange={[-0.15, 0.15]}
        >
            <group ref={groupRef} position={position}>
                {/* 
                    Card standing upright like a wall:
                    - Wide in X (left-right): 5 units
                    - Thin in Y (front-back): 0.3 units  
                    - Tall in Z (up-down): 5 units
                    
                    Camera is at -Y looking towards +Y, so card faces correctly
                */}
                <mesh
                    ref={meshRef}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    onClick={onClick}
                    castShadow
                >
                    <boxGeometry args={[5, 0.3, 5]} />
                    <meshPhysicalMaterial
                        color={hovered ? color : "#1a1a1a"}
                        transmission={hovered ? 0.3 : 0.1}
                        thickness={0.5}
                        roughness={0.2}
                        metalness={0.1}
                        transparent
                        opacity={hovered ? 0.95 : 0.85}
                        emissive={color}
                        emissiveIntensity={hovered ? 0.4 : 0.1}
                    />
                </mesh>

                {/* Glow ring when hovered - standing vertical in front of card */}
                {hovered && (
                    <mesh rotation={[0, 0, 0]} position={[0, 0.3, 0]}>
                        <ringGeometry args={[2.8, 3.2, 32]} />
                        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
                    </mesh>
                )}

                {/* 
                    Icon & Label - on the FRONT face of the card
                    Camera is at +Y looking towards -Y (origin)
                    So front face should be at +Y side of the card
                    Rotation: rotate 90° around X to stand upright like the card
                */}
                <Html
                    transform
                    distanceFactor={8}
                    position={[0, 0.25, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    pointerEvents="none"
                    center
                >
                    <div className="flex flex-col items-center justify-center select-none">
                        <div 
                            className={`p-4 rounded-2xl transition-all duration-300 ${
                                hovered 
                                    ? 'bg-white/20 shadow-2xl scale-110' 
                                    : 'bg-white/5 scale-100'
                            }`}
                            style={{ 
                                boxShadow: hovered ? `0 0 30px ${color}40` : 'none' 
                            }}
                        >
                            <Icon 
                                size={40} 
                                color={hovered ? "#ffffff" : color} 
                                strokeWidth={1.5}
                            />
                        </div>
                        <p 
                            className={`mt-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
                                hovered ? 'text-white' : 'text-white/40'
                            }`}
                        >
                            {label}
                        </p>
                    </div>
                </Html>
            </group>
        </Float>
    );
};
