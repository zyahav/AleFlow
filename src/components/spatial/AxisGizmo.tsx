import React from "react";
import { GizmoHelper, GizmoViewport } from "@react-three/drei";

export const AxisGizmo: React.FC = () => {
    return (
        <GizmoHelper
            alignment="bottom-right"
            margin={[80, 80]}
        >
            <GizmoViewport
                axisColors={["#ff3653", "#0adb46", "#2c8cfc"]} // Standard red/green/blue for X/Y/Z
                labelColor="white"
            />
        </GizmoHelper>
    );
};
