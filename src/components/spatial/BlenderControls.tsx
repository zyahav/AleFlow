import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Blender-style camera controls with smooth damping
 * - Scroll: Orbit around target
 * - Shift + Scroll: Pan
 * - Ctrl/Cmd + Scroll: Zoom
 * - Middle mouse drag: Orbit
 * - Shift + Middle mouse: Pan
 */
export const BlenderControls: React.FC = () => {
    const { camera, gl } = useThree();
    
    const state = useRef({
        // Current values (what we interpolate towards)
        target: new THREE.Vector3(0, 0, 3), // Look at center, slightly elevated
        phi: Math.PI / 3,      // Vertical angle (60 degrees - comfortable viewing angle)
        theta: Math.PI / 2,    // Horizontal angle - camera at +Y looking towards -Y
        radius: 40,
        
        // Smoothed values (what the camera actually uses)
        smoothTarget: new THREE.Vector3(0, 0, 3),
        smoothPhi: Math.PI / 3,
        smoothTheta: Math.PI / 2,
        smoothRadius: 40,
        
        // Interaction state
        isDragging: false,
        isPanning: false,
        lastX: 0,
        lastY: 0,
    });

    useEffect(() => {
        const domElement = gl.domElement;

        // ==================== WHEEL CONTROLS ====================
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const s = state.current;

            if (e.ctrlKey || e.metaKey) {
                // ZOOM (Ctrl/Cmd + Scroll)
                const zoomSpeed = 0.003 * s.radius; // Proportional to distance
                s.radius += e.deltaY * zoomSpeed;
                s.radius = Math.max(8, Math.min(s.radius, 150));
            } else if (e.shiftKey) {
                // PAN (Shift + Scroll)
                const panSpeed = s.radius * 0.002;
                const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
                const up = new THREE.Vector3(0, 0, 1); // Z-up world
                
                s.target.addScaledVector(right, e.deltaX * panSpeed);
                s.target.addScaledVector(up, -e.deltaY * panSpeed);
            } else {
                // ORBIT (Normal Scroll) - Smooth and gentle
                const orbitSpeed = 0.003;
                s.theta -= e.deltaX * orbitSpeed;
                s.phi += e.deltaY * orbitSpeed;
                
                // Clamp phi to comfortable range (not too high, not too low)
                s.phi = Math.max(0.2, Math.min(s.phi, Math.PI * 0.45));
            }
        };

        // ==================== MOUSE DRAG CONTROLS ====================
        const handleMouseDown = (e: MouseEvent) => {
            // Middle mouse button (wheel click)
            if (e.button === 1) {
                e.preventDefault();
                state.current.lastX = e.clientX;
                state.current.lastY = e.clientY;
                
                if (e.shiftKey) {
                    state.current.isPanning = true;
                } else {
                    state.current.isDragging = true;
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const s = state.current;
            const deltaX = e.clientX - s.lastX;
            const deltaY = e.clientY - s.lastY;
            s.lastX = e.clientX;
            s.lastY = e.clientY;

            if (s.isDragging) {
                // Orbit - very smooth
                const orbitSpeed = 0.005;
                s.theta -= deltaX * orbitSpeed;
                s.phi += deltaY * orbitSpeed;
                s.phi = Math.max(0.2, Math.min(s.phi, Math.PI * 0.45));
            } else if (s.isPanning) {
                // Pan
                const panSpeed = s.radius * 0.002;
                const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
                const up = new THREE.Vector3(0, 0, 1);
                
                s.target.addScaledVector(right, -deltaX * panSpeed);
                s.target.addScaledVector(up, deltaY * panSpeed);
            }
        };

        const handleMouseUp = () => {
            state.current.isDragging = false;
            state.current.isPanning = false;
        };

        // Prevent context menu on middle click
        const handleContextMenu = (e: MouseEvent) => {
            if (e.button === 1) e.preventDefault();
        };

        // ==================== EVENT LISTENERS ====================
        domElement.addEventListener("wheel", handleWheel, { passive: false });
        domElement.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        domElement.addEventListener("contextmenu", handleContextMenu);

        return () => {
            domElement.removeEventListener("wheel", handleWheel);
            domElement.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            domElement.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [camera, gl]);

    // ==================== SMOOTH CAMERA UPDATE ====================
    useFrame((_, delta) => {
        const s = state.current;
        
        // Damping factor - lower = smoother/slower, higher = snappier
        // 0.08 feels like floating through space, very comfortable
        const damping = 1 - Math.pow(0.001, delta * 3);
        
        // Smoothly interpolate all values
        s.smoothPhi += (s.phi - s.smoothPhi) * damping;
        s.smoothTheta += (s.theta - s.smoothTheta) * damping;
        s.smoothRadius += (s.radius - s.smoothRadius) * damping;
        s.smoothTarget.lerp(s.target, damping);

        // Calculate camera position from spherical coordinates (Z-up)
        const x = s.smoothRadius * Math.sin(s.smoothPhi) * Math.cos(s.smoothTheta);
        const y = s.smoothRadius * Math.sin(s.smoothPhi) * Math.sin(s.smoothTheta);
        const z = s.smoothRadius * Math.cos(s.smoothPhi);

        camera.position.set(
            s.smoothTarget.x + x,
            s.smoothTarget.y + y,
            s.smoothTarget.z + z
        );

        camera.lookAt(s.smoothTarget);
        camera.up.set(0, 0, 1); // Z-up
        camera.updateMatrixWorld();
    });

    return null;
};
