import React, { useRef } from "react";
import { Grid, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TerrainNetProps {
    visible?: boolean;
}

export const TerrainNet: React.FC<TerrainNetProps> = ({ visible = true }) => {
    const starsRef = useRef<THREE.Points>(null);
    
    // Gentle rotation of stars - creates a living, breathing space
    useFrame((_, delta) => {
        if (starsRef.current) {
            starsRef.current.rotation.z += delta * 0.01; // Very slow rotation
        }
    });

    if (!visible) return null;

    return (
        <group>
            {/* Main Grid - Rotated to be on XY plane (floor at Z=0) for Z-up world */}
            <Grid
                sectionSize={10}
                sectionThickness={1}
                sectionColor="#c1121f"
                cellSize={2}
                cellThickness={0.6}
                cellColor="#1a1a1a"
                infiniteGrid
                fadeDistance={80}
                fadeStrength={3}
                position={[0, 0, 0]}
                rotation={[Math.PI / 2, 0, 0]} // Rotate to lay flat on XY plane
            />
            
            {/* Ambient Stars - Makes it feel like your own universe */}
            <Stars
                ref={starsRef}
                radius={100}
                depth={50}
                count={2000}
                factor={3}
                saturation={0.2}
                fade
                speed={0.5}
            />
            
            {/* Subtle ground plane for shadows - on XY plane */}
            <mesh position={[0, 0, -0.01]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <shadowMaterial opacity={0.15} />
            </mesh>
        </group>
    );
};
