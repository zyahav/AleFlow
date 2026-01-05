import React, { useState, useRef, useEffect } from "react";
import {
    Play,
    ChevronLeft,
    Globe,
    Lock
} from "lucide-react";
import { Button } from "../ui/Button";
import { invoke } from "@tauri-apps/api/core";

interface RestrictedVideo {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
}

const ALLOWED_VIDEOS: RestrictedVideo[] = [
    {
        id: "RQc9Z1mimHc",
        title: "Video 1: Lesson Part A",
        thumbnail: "https://img.youtube.com/vi/RQc9Z1mimHc/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=RQc9Z1mimHc&t=833s&autoplay=1"
    },
    {
        id: "SXNPx7AHBug",
        title: "Video 2: Educational Discovery",
        thumbnail: "https://img.youtube.com/vi/SXNPx7AHBug/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=SXNPx7AHBug&t=162s&autoplay=1"
    },
    {
        id: "a4phOL83OqU",
        title: "Video 3: Creative Minds",
        thumbnail: "https://img.youtube.com/vi/a4phOL83OqU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=a4phOL83OqU&autoplay=1"
    },
    {
        id: "aUtt3zZ53Ks",
        title: "Video 4: Wonders of Science",
        thumbnail: "https://img.youtube.com/vi/aUtt3zZ53Ks/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=aUtt3zZ53Ks&t=382s&autoplay=1"
    },
    {
        id: "uKyXClW8_Wg_1",
        title: "Video 5: Nature exploration (I)",
        thumbnail: "https://img.youtube.com/vi/uKyXClW8_Wg/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=uKyXClW8_Wg&t=225s&autoplay=1"
    },
    {
        id: "uKyXClW8_Wg_2",
        title: "Video 6: Nature exploration (II)",
        thumbnail: "https://img.youtube.com/vi/uKyXClW8_Wg/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=uKyXClW8_Wg&t=907s&autoplay=1"
    },
    {
        id: "kcRkS7E8wI4_1",
        title: "Video 7: Historic Journeys (Part 1)",
        thumbnail: "https://img.youtube.com/vi/kcRkS7E8wI4/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=kcRkS7E8wI4&t=437s&autoplay=1"
    },
    {
        id: "kcRkS7E8wI4_2",
        title: "Video 8: Historic Journeys (Part 2)",
        thumbnail: "https://img.youtube.com/vi/kcRkS7E8wI4/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=kcRkS7E8wI4&t=1365s&autoplay=1"
    },
    {
        id: "kcRkS7E8wI4_3",
        title: "Video 9: Historic Journeys (Part 3)",
        thumbnail: "https://img.youtube.com/vi/kcRkS7E8wI4/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=kcRkS7E8wI4&t=2528s&autoplay=1"
    },
    {
        id: "U5KFb2gQQkc",
        title: "Video 10: Building Bridges",
        thumbnail: "https://img.youtube.com/vi/U5KFb2gQQkc/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=U5KFb2gQQkc&t=697s&autoplay=1"
    },
    {
        id: "dxbA1r5dpjg_1",
        title: "Video 11: Future Tech (I)",
        thumbnail: "https://img.youtube.com/vi/dxbA1r5dpjg/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=dxbA1r5dpjg&t=1115s&autoplay=1"
    },
    {
        id: "dxbA1r5dpjg_2",
        title: "Video 12: Future Tech (II)",
        thumbnail: "https://img.youtube.com/vi/dxbA1r5dpjg/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=dxbA1r5dpjg&t=1430s&autoplay=1"
    },
    {
        id: "5UiONQxJxS8",
        title: "Video 13: Ocean Life",
        thumbnail: "https://img.youtube.com/vi/5UiONQxJxS8/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=5UiONQxJxS8&t=869s&autoplay=1"
    },
    {
        id: "NxYlf-YnooM",
        title: "Video 14: Space Exploration",
        thumbnail: "https://img.youtube.com/vi/NxYlf-YnooM/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=NxYlf-YnooM&t=1313s&autoplay=1"
    }
];

export const RestrictedBrowser: React.FC = () => {
    const [selectedVideo, setSelectedVideo] = useState<RestrictedVideo | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const webviewCreated = useRef(false);

    const WV_ID = "kids_content";

    // Standard cleanup function
    const cleanup = async () => {
        try {
            await invoke("hide_browser_webview", { id: WV_ID });
            await invoke("destroy_browser_webview", { id: WV_ID });
            webviewCreated.current = false;
        } catch (e) {
            // Ignore if not created yet
        }
    };

    // Effect for handling selection and bounds sync
    useEffect(() => {
        if (!selectedVideo || !contentRef.current) {
            cleanup();
            return;
        }

        const updateBoundsAndShow = async () => {
            if (!contentRef.current) return;
            const rect = contentRef.current.getBoundingClientRect();

            // Calibration for macOS title bar
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const offset = isMac ? 28 : 0;

            const x = rect.left;
            const y = rect.top + offset;
            const width = rect.width;
            const height = rect.height;

            try {
                // We always 'create' to handle both initial creation and navigation/URL update
                await invoke("create_browser_webview", {
                    url: selectedVideo.url,
                    id: WV_ID,
                    x, y, width, height,
                    restricted: true
                });
                webviewCreated.current = true;
                await invoke("show_browser_webview", { id: WV_ID });
            } catch (err) {
                console.error("Failed to sync native webview:", err);
            }
        };

        const interval = setInterval(() => {
            if (contentRef.current && webviewCreated.current) {
                const rect = contentRef.current.getBoundingClientRect();
                const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                const offset = isMac ? 28 : 0;
                invoke("update_browser_webview_bounds", {
                    id: WV_ID,
                    x: rect.left,
                    y: rect.top + offset,
                    width: rect.width,
                    height: rect.height
                }).catch(() => { });
            }
        }, 100);

        updateBoundsAndShow();

        return () => {
            clearInterval(interval);
            cleanup();
        };
    }, [selectedVideo]);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    const handleBack = async () => {
        await cleanup();
        setSelectedVideo(null);
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#0a0a0a] border-l border-white/5 overflow-hidden relative">
            {/* Navigation Header - Shown in both grid and playback for safety */}
            <div className={`p-4 bg-[#111] border-b border-white/5 flex items-center justify-between ${selectedVideo ? 'h-16' : ''}`}>
                <div className="flex items-center gap-2 text-logo-primary">
                    <Lock size={18} />
                    <h2 className="text-sm font-black tracking-widest uppercase">Kids Corner</h2>
                </div>
                {selectedVideo && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="bg-logo-primary/10 border border-logo-primary/20 text-logo-primary hover:bg-logo-primary hover:text-white shadow-2xl rounded-full px-4 h-9 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <ChevronLeft size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Videos</span>
                    </Button>
                )}
            </div>

            <div className={`flex-1 overflow-y-auto ${selectedVideo ? 'p-0' : 'p-6'} scrollbar-hide flex flex-col`}>
                {!selectedVideo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ALLOWED_VIDEOS.map((video) => (
                            <div
                                key={video.id}
                                onClick={() => setSelectedVideo(video)}
                                className="group relative bg-[#151515] rounded-2xl overflow-hidden border border-white/5 cursor-pointer hover:border-logo-primary/50 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl"
                            >
                                <div className="aspect-video relative">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                                        <div className="w-12 h-12 rounded-full bg-logo-primary flex items-center justify-center shadow-xl transform scale-0 group-hover:scale-100 transition-all duration-300">
                                            <Play size={24} className="text-white fill-current ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xs font-bold text-white/90 group-hover:text-logo-primary transition-colors truncate">
                                        {video.title}
                                    </h3>
                                    <p className="text-[10px] text-white/30 mt-1 uppercase tracking-tighter">YouTube Verified Content</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div ref={contentRef} className="flex-1 w-full bg-black">
                        {/* Native Webview placeholder - fills entire area in playback mode */}
                        <div className="w-full h-full flex items-center justify-center text-white/5 pointer-events-none">
                            <Globe size={120} className="animate-pulse" />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Status - Hidden in playback mode */}
            {!selectedVideo && (
                <div className="p-3 bg-logo-primary/5 border-t border-logo-primary/10 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-logo-primary animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-logo-primary/60">Restricted Safe Mode Active</span>
                </div>
            )}
        </div>
    );
};

export default RestrictedBrowser;
