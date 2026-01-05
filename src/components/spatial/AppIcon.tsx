import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AppIconProps {
    id: string;
    icon: LucideIcon;
    label: string;
    color?: string;
    onClick?: () => void;
    initialPosition?: { x: number, y: number };
}

export const AppIcon: React.FC<AppIconProps> = ({
    icon: Icon,
    label,
    color = "#3b82f6",
    onClick,
    initialPosition = { x: 0, y: 0 }
}) => {
    return (
        <motion.div
            drag
            dragMomentum={false}
            style={{ x: initialPosition.x, y: initialPosition.y }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="absolute flex flex-col items-center gap-3 cursor-pointer group"
        >
            {/* The Icon Container */}
            <div
                style={{
                    backgroundColor: color,
                    boxShadow: `0 10px 30px -5px ${color}66`
                }}
                className="w-20 h-20 rounded-[22%] flex items-center justify-center relative overflow-hidden transition-shadow group-hover:shadow-[0_15px_40px_-5px_var(--tw-shadow-color)]"
            >
                {/* Glassy reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />

                {/* The Actual Icon */}
                <Icon size={40} className="text-white relative z-10" strokeWidth={2.5} />
            </div>

            {/* Label */}
            <span className="text-white/60 font-bold text-[11px] tracking-widest uppercase group-hover:text-white transition-colors">
                {label}
            </span>

            {/* Hover Glow */}
            <div
                style={{ backgroundColor: color }}
                className="absolute inset-0 blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity -z-10"
            />
        </motion.div>
    );
};
