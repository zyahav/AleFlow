import React from "react";
import { useTranslation } from "react-i18next";
import { Cog, FlaskConical, History, Info, Sparkles, Globe, Baby } from "lucide-react";
import AleFlowMark from "./icons/AleFlowMark";
import { useSettings } from "../hooks/useSettings";
import {
  GeneralSettings,
  AdvancedSettings,
  HistorySettings,
  DebugSettings,
  AboutSettings,
  PostProcessingSettings,
} from "./settings";
import { Browser } from "./settings/Browser";
import { RestrictedBrowser } from "./settings/RestrictedBrowser";

export type SidebarSection = keyof typeof SECTIONS_CONFIG;

interface IconProps {
  width?: number | string;
  height?: number | string;
  size?: number | string;
  className?: string;
  [key: string]: any;
}

interface SectionConfig {
  labelKey: string;
  icon: React.ComponentType<IconProps>;
  component: React.ComponentType;
  enabled: (settings: any) => boolean;
}

export const SECTIONS_CONFIG = {
  browser: {
    labelKey: "sidebar.browser",
    icon: Globe,
    component: Browser,
    enabled: () => true,
  },
  kids: {
    labelKey: "sidebar.kids",
    icon: Baby,
    component: RestrictedBrowser,
    enabled: () => true,
  },
  general: {
    labelKey: "sidebar.general",
    icon: AleFlowMark,
    component: GeneralSettings,
    enabled: () => true,
  },
  advanced: {
    labelKey: "sidebar.advanced",
    icon: Cog,
    component: AdvancedSettings,
    enabled: () => true,
  },
  postprocessing: {
    labelKey: "sidebar.postProcessing",
    icon: Sparkles,
    component: PostProcessingSettings,
    enabled: (settings) => settings?.post_process_enabled ?? false,
  },
  history: {
    labelKey: "sidebar.history",
    icon: History,
    component: HistorySettings,
    enabled: () => true,
  },
  debug: {
    labelKey: "sidebar.debug",
    icon: FlaskConical,
    component: DebugSettings,
    enabled: (settings) => settings?.debug_mode ?? false,
  },
  about: {
    labelKey: "sidebar.about",
    icon: Info,
    component: AboutSettings,
    enabled: () => true,
  },
} as const satisfies Record<string, SectionConfig>;

interface SidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  filterIds?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  filterIds,
}) => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const availableSections = Object.entries(SECTIONS_CONFIG)
    .filter(([id, config]) => {
      if (filterIds?.includes(id)) return false;
      return config.enabled(settings);
    })
    .map(([id, config]) => ({ id: id as SidebarSection, ...config }));

  return (
    <div className="flex flex-col items-center w-40 h-full px-2 border-r border-mid-gray/20">
      <div className="flex flex-col items-center w-full gap-1 pt-2 border-t border-mid-gray/20">
        {availableSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <div
              key={section.id}
              className={`flex gap-2 items-center p-2 w-full rounded-lg cursor-pointer transition-colors ${isActive
                ? "bg-logo-primary/80"
                : "hover:bg-mid-gray/20 hover:opacity-100 opacity-85"
                }`}
              onClick={() => onSectionChange(section.id)}
            >
              <Icon width={24} height={24} className="shrink-0" />
              <div className="flex flex-col flex-1 truncate">
                <p
                  className="text-sm font-medium truncate"
                  title={t(section.labelKey)}
                >
                  {t(section.labelKey)}
                </p>
                {section.id === "browser" && (
                  <span className="text-[10px] opacity-70 font-bold bg-white/20 px-1 rounded self-start">
                    v0.7.2
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
