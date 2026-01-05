import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import "./App.css";
import AccessibilityPermissions from "./components/AccessibilityPermissions";
import Footer from "./components/footer";
import Onboarding from "./components/onboarding";
import { Sidebar, SidebarSection, SECTIONS_CONFIG } from "./components/Sidebar";
import { useSettings } from "./hooks/useSettings";
import { commands } from "@/bindings";

import { invoke } from "@tauri-apps/api/core";
import { SpatialCanvas } from "./components/spatial/SpatialCanvas";
import { AppIcon } from "./components/spatial/AppIcon";
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
  const { settings, updateSetting } = useSettings();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const result = await commands.hasAnyModelsAvailable();
      if (result.status === "ok") {
        setShowOnboarding(!result.data);
      } else {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      setShowOnboarding(true);
    }
  };

  const handleModelSelected = () => {
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <Onboarding onModelSelected={handleModelSelected} />;
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden select-none">
      <Toaster />

      {/* The Spatial Canvas is now our Home */}
      <SpatialCanvas>
        <AppIcon
          id="aleflow"
          icon={Mic}
          label="AleFlow"
          color="#c1121f"
          initialPosition={{ x: 0, y: 0 }}
          onClick={() => setCurrentSection("general")}
        />
        <AppIcon
          id="browser"
          icon={Globe}
          label="Browser"
          color="#3b82f6"
          initialPosition={{ x: -220, y: -100 }}
          onClick={() => setCurrentSection("browser")}
        />
        <AppIcon
          id="kids"
          icon={Baby}
          label="Kids Corner"
          color="#f43f5e"
          initialPosition={{ x: 220, y: -100 }}
          onClick={() => setCurrentSection("kids")}
        />
        <AppIcon
          id="gmail"
          icon={Mail}
          label="Mail"
          color="#22c55e"
          initialPosition={{ x: -220, y: 150 }}
          onClick={() => setCurrentSection("browser")} // Temporarily re-using browser
        />
        <AppIcon
          id="multiverse"
          icon={Sparkles}
          label="Multiverse"
          color="#a855f7"
          initialPosition={{ x: 220, y: 150 }}
          onClick={() => { }} // Future logic
        />

        {/* Floating Welcome Message */}
        <div className="absolute top-[-320px] text-center pointer-events-none">
          <div className="inline-flex items-center gap-4">
            <h1 className="text-6xl font-black text-white/20 uppercase tracking-[0.6em] blur-[1px]">AleFlow</h1>
            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/10 tracking-widest translate-y-2">V0.8.0</span>
          </div>
          <p className="text-[10px] text-white/10 uppercase tracking-[0.8em] mt-4 font-black">Spatial Operating System</p>
        </div>
      </SpatialCanvas>

      {/* Render active app as an 'Island' or 'Window' over the canvas */}
      {currentSection && renderSettingsContent(currentSection, setCurrentSection, () => {
        // Cleanup when closing windows
        invoke("hide_browser_webview", { id: "browser_content" }).catch(() => { });
        invoke("hide_browser_webview", { id: "kids_content" }).catch(() => { });
        setCurrentSection(null);
      })}

      {/* Minimal Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-none">
        <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest">v0.8.0-spatial</div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
