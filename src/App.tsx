import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";
import "./App.css";
import AccessibilityPermissions from "./components/AccessibilityPermissions";
import Footer from "./components/footer";
import Onboarding from "./components/onboarding";
import { Sidebar, SidebarSection, SECTIONS_CONFIG } from "./components/Sidebar";
import { useSettings } from "./hooks/useSettings";
import { commands } from "@/bindings";

import { invoke } from "@tauri-apps/api/core";
import { SpatialWorld } from "./components/spatial/SpatialWorld";
import { AppIcon3D } from "./components/spatial/AppIcon3D";
import { Globe, Baby, Mail, Compass, Sparkles, Mic } from "lucide-react";

const renderSettingsContent = (section: SidebarSection, setCurrentSection: (s: SidebarSection | null) => void, onClose: () => void) => {
  const isCoreApp = section !== "browser" && section !== "kids";
  const ActiveComponent = SECTIONS_CONFIG[section]?.component || SECTIONS_CONFIG.general.component;

  return (
    <div className="fixed inset-4 z-50 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Sidebar - Only shown for core app sections */}
      {isCoreApp && (
        <Sidebar
          activeSection={section}
          onSectionChange={setCurrentSection}
          filterIds={["browser", "kids"]}
        />
      )}

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-logo-primary hover:text-white rounded-full transition-all text-white/20"
          >
            <Compass size={20} className="rotate-45" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [currentSection, setCurrentSection] = useState<SidebarSection | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    // Notify diagnostic dashboard
    if ((window as any).setDiagnosticStatus) {
      (window as any).setDiagnosticStatus('p3', 'ok', 'PHASE 3: App Alive');
    }

    // DEBUG: Force Onboarding to FALSE to show 3D World immediately
    // const hasOnboarded = localStorage.getItem("aleflow_onboarded");
    // if (!hasOnboarded) {
    //   setShowOnboarding(true);
    // } else {
    setShowOnboarding(false);
    // }
  }, []);

  const handleModelSelected = () => {
    localStorage.setItem("aleflow_onboarded", "true");
    setShowOnboarding(false);
  };

  if (showOnboarding === null) {
    return <div className="h-screen w-screen bg-[#050505]" />;
  }

  return (
    <div className="h-screen w-screen bg-[#050505] overflow-hidden select-none text-white">
      <Toaster />

      {/* Subtle Life Indicator (Top Left) */}
      <div className="fixed top-6 left-6 z-[99999] pointer-events-none opacity-20">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[8px] font-black uppercase tracking-widest text-white">Kernel v0.8.0</p>
        </div>
      </div>

      {showOnboarding ? (
        <div className="relative z-10 w-full h-full">
          <Onboarding onModelSelected={handleModelSelected} />
        </div>
      ) : (
        <>
          {/* Spatial 3D World */}
          <SpatialWorld>
            {/* Center - Main AleFlow Hub (X, Y, Z) where Z is height */}
            <AppIcon3D
              id="aleflow"
              icon={Mic}
              label="AleFlow"
              color="#c1121f"
              position={[0, 0, 3]}
              onClick={() => setCurrentSection("general")}
            />
            
            {/* Arranged in a diamond on XY plane, standing at Z=3 */}
            <AppIcon3D
              id="browser"
              icon={Globe}
              label="Browser"
              color="#3b82f6"
              position={[-10, 10, 3]}
              onClick={() => setCurrentSection("browser")}
            />
            <AppIcon3D
              id="kids"
              icon={Baby}
              label="Kids Corner"
              color="#f43f5e"
              position={[10, 10, 3]}
              onClick={() => setCurrentSection("kids")}
            />
            <AppIcon3D
              id="gmail"
              icon={Mail}
              label="Mail"
              color="#22c55e"
              position={[-10, -10, 3]}
              onClick={() => setCurrentSection("browser")}
            />
            <AppIcon3D
              id="multiverse"
              icon={Sparkles}
              label="Multiverse"
              color="#a855f7"
              position={[10, -10, 3]}
              onClick={() => setCurrentSection("general")}
            />
          </SpatialWorld>

          {/* Floating UI Overlay */}
          <div className="fixed inset-0 pointer-events-none flex flex-col items-center">
            <div className="mt-20 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
              <div className="inline-flex items-center gap-4">
                <h1 className="text-6xl font-black text-white/20 uppercase tracking-[0.6em] blur-[1px]">AleFlow</h1>
                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/10 tracking-widest translate-y-2">V0.8.0</span>
              </div>
              <p className="text-[10px] text-white/10 uppercase tracking-[0.8em] mt-4 font-black">Spatial 3D Multiverse</p>
            </div>
          </div>
        </>
      )}

      {/* Settings Windows */}
      {currentSection && renderSettingsContent(currentSection, setCurrentSection, () => {
        invoke("hide_browser_webview", { id: "browser_content" }).catch(() => { });
        invoke("hide_browser_webview", { id: "kids_content" }).catch(() => { });
        setCurrentSection(null);
      })}

      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-none">
        <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Spatial 3D Environment</div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
