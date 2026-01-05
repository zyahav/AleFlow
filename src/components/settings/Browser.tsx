import React, { useState, useRef, useEffect } from "react";
import {
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    RotateCw,
    ExternalLink,
    Globe,
    Home
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

import { invoke } from "@tauri-apps/api/core";

interface Tab {
    id: string;
    title: string;
    url: string;
}

const DEFAULT_TABS: Tab[] = [
    { id: "1", title: "Wikipedia", url: "https://en.m.wikipedia.org" },
    { id: "2", title: "Tauri", url: "https://tauri.app" },
];

const HOME_URL = "https://en.m.wikipedia.org";

const STORAGE_KEY = "aleflow_browser_tabs";

export const Browser: React.FC = () => {
    const [tabs, setTabs] = useState<Tab[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        try {
            return saved ? JSON.parse(saved) : DEFAULT_TABS;
        } catch {
            return DEFAULT_TABS;
        }
    });
    const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id);
    const [urlInput, setUrlInput] = useState<string>(() => tabs[0].url);
    const contentRef = useRef<HTMLDivElement>(null);
    const webviewCreated = useRef(false);

    // Persist tabs to localStorage
    React.useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    }, [tabs]);

    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

    // Sync native webview bounds and existence
    useEffect(() => {
        const updateBounds = async (forceUrl?: string) => {
            if (!contentRef.current) return;
            const rect = contentRef.current.getBoundingClientRect();

            // Calibration: On macOS with native title bars, we need to adjust y
            // because rect.top is relative to the viewport (below title bar)
            // while add_child is often relative to the window top.
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const offset = isMac ? 28 : 0; // Standard macOS title bar height

            const x = rect.left;
            const y = rect.top + offset;
            const width = rect.width;
            const height = rect.height;

            try {
                if (!webviewCreated.current) {
                    await invoke("create_browser_webview", {
                        url: activeTab.url,
                        x, y, width, height
                    });
                    webviewCreated.current = true;
                } else {
                    // Update bounds
                    await invoke("update_browser_webview_bounds", {
                        x, y, width, height
                    });
                    // If we have a forceUrl (navigation), handle it
                    if (forceUrl) {
                        await invoke("create_browser_webview", {
                            url: forceUrl,
                            x, y, width, height
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to sync native webview:", err);
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            updateBounds();
        });

        if (contentRef.current) {
            resizeObserver.observe(contentRef.current);
            updateBounds(activeTab.url);
        }

        // Periodic sync for safety
        const interval = setInterval(updateBounds, 100);

        return () => {
            resizeObserver.disconnect();
            clearInterval(interval);
            invoke("hide_browser_webview").catch(console.error);
        };
    }, [activeTabId, activeTab.url]);

    // Handle initial show and component unmount
    useEffect(() => {
        invoke("show_browser_webview").catch(console.error);
        return () => {
            invoke("hide_browser_webview").catch(console.error);
        };
    }, []);

    const handleAddTab = () => {
        const newTab: Tab = {
            id: Math.random().toString(36).substr(2, 9),
            title: "New Tab",
            url: HOME_URL,
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
        setUrlInput(newTab.url);
    };

    const handleCloseTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (tabs.length === 1) return;
        const newTabs = tabs.filter((t) => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            setActiveTabId(newTabs[0].id);
            setUrlInput(newTabs[0].url);
        }
    };

    const handleTabClick = (tab: Tab) => {
        setActiveTabId(tab.id);
        setUrlInput(tab.url);
    };

    const isInternalNavigation = useRef(false);

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let trimmed = urlInput.trim();
        if (!trimmed) return;

        let formattedUrl = trimmed;
        const isUrl = trimmed.includes(".") && !trimmed.includes(" ");

        if (isUrl) {
            if (!formattedUrl.startsWith("http")) {
                formattedUrl = `https://${formattedUrl}`;
            }
        } else {
            // Treat as search query
            formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}&igu=1`;
        }

        isInternalNavigation.current = true;
        const newTabs = tabs.map((t) =>
            t.id === activeTabId ? {
                ...t,
                url: formattedUrl,
                title: isUrl ? trimmed.split("/")[0] : `Search: ${trimmed}`
            } : t
        );
        setTabs(newTabs);
        setUrlInput(formattedUrl);
    };

    const handleOpenExternal = async () => {
        try {
            // Direct invoke to avoid import issues with the plugin wrapper
            await invoke("plugin:opener|open", { path: activeTab.url });
        } catch (error) {
            console.error("Failed to open URL externally:", error);
            window.open(activeTab.url, "_blank");
        }
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#0a0a0a] border-l border-white/5 overflow-hidden">
            {/* Tab Bar */}
            <div className="flex items-center bg-[#111] px-1 pt-1 gap-1 overflow-x-auto no-scrollbar group/tabs">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-[10px] font-bold cursor-pointer transition-all flex-1 min-w-[100px] max-w-[160px] border-t border-x border-transparent ${activeTabId === tab.id
                            ? "bg-logo-primary text-white border-logo-primary/20 shadow-lg z-10"
                            : "bg-white/5 text-white/20 hover:bg-logo-primary hover:text-white hover:border-logo-primary/20"
                            }`}
                    >
                        <Globe size={11} className={`${activeTabId === tab.id ? "text-white" : "text-white/20 group-hover:text-white/60"}`} />
                        <span className="truncate flex-1 lowercase tracking-tight">{tab.title}</span>
                        <button
                            onClick={(e) => handleCloseTab(e, tab.id)}
                            className={`p-0.5 hover:bg-black/20 rounded transition-all ${activeTabId === tab.id ? "text-white/80" : "text-white/20 group-hover:text-white/60"}`}
                        >
                            <X size={10} />
                        </button>
                    </div>
                ))}
                <button
                    onClick={handleAddTab}
                    className="p-1.5 mb-0.5 hover:bg-logo-primary/20 rounded-md text-white/20 hover:text-logo-primary transition-all flex-shrink-0"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 p-3 bg-[#111] border-b border-white/5 group/toolbar">
                <div className="flex items-center gap-1">
                    <span className="text-[9px] bg-logo-primary/20 text-logo-primary font-black px-1.5 py-0.5 rounded border border-logo-primary/20 group-hover/toolbar:bg-logo-primary group-hover/toolbar:text-white transition-colors duration-300">v0.7.1</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 px-2 border-none hover:bg-logo-primary/10 hover:text-logo-primary text-white/20 hover:text-white transition-all"
                        onClick={() => {
                            const newTabs = tabs.map(t => t.id === activeTabId ? { ...t, url: HOME_URL, title: "Wikipedia" } : t);
                            setTabs(newTabs);
                            setUrlInput(HOME_URL);
                        }}
                        title="Home"
                    >
                        <Home size={14} />
                    </Button>
                    <div className="flex gap-0.5">
                        <Button variant="ghost" size="sm" className="p-1 px-2 border-none hover:bg-logo-primary/10 hover:text-logo-primary text-white/20 hover:text-white transition-all">
                            <ChevronLeft size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1 px-2 border-none hover:bg-logo-primary/10 hover:text-logo-primary text-white/20 hover:text-white transition-all">
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1 px-2 border-none hover:bg-logo-primary/10 hover:text-logo-primary text-white/20 hover:text-white transition-all">
                        <RotateCw size={14} />
                    </Button>
                </div>

                <form onSubmit={handleUrlSubmit} className="flex-1">
                    <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full text-[11px] py-1 h-8 bg-white/5 border-white/5 hover:border-logo-primary hover:bg-white/10 focus:border-logo-primary focus:ring-1 focus:ring-logo-primary/20 rounded-md transition-all font-medium text-white/50 hover:text-white focus:text-white placeholder:text-white/5 pl-3"
                        placeholder="Search or enter website"
                    />
                </form>

                <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 px-2 border-none hover:bg-logo-primary/20 hover:text-logo-primary text-white/20 hover:text-white transition-all"
                    onClick={handleOpenExternal}
                    title="Open in System Browser"
                >
                    <ExternalLink size={14} />
                </Button>
            </div>

            {/* Content Area - Placeholder for Native Webview */}
            <div ref={contentRef} className="flex-1 relative bg-white border-t border-white/10">
                <div className="absolute inset-0 flex items-center justify-center text-mid-gray/30 pointer-events-none">
                    <Globe size={48} className="opacity-10" />
                </div>
            </div>
        </div>
    );
};

export default Browser;
