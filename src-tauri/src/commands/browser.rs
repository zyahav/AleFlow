use tauri::{AppHandle, Manager, WebviewUrl, Rect, LogicalPosition, LogicalSize, webview::{WebviewBuilder, Webview}};

#[tauri::command]
#[specta::specta]
pub async fn create_browser_webview(
    app: AppHandle,
    url: String,
    id: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    restricted: bool,
) -> Result<(), String> {
    let main_window = app.get_window("main").ok_or("Main window not found")?;
    
    // Check if webview already exists
    if let Some(webview) = app.get_webview(&id) {
        let webview: Webview<tauri::Wry> = webview;
        webview.navigate(url.parse().map_err(|e| format!("Invalid URL: {}", e))?)
            .map_err(|e| format!("Navigation failed: {}", e))?;
        webview.set_bounds(Rect {
            position: LogicalPosition { x, y }.into(),
            size: LogicalSize { width, height }.into(),
        }).map_err(|e| format!("Set bounds failed: {}", e))?;
        webview.show().map_err(|e| format!("Show failed: {}", e))?;
        return Ok(());
    }

    let mut webview_builder = WebviewBuilder::new(&id, WebviewUrl::External(url.parse().map_err(|e| format!("Invalid URL: {}", e))?));
    
    // Set modern User Agent to avoid "Unsupported Browser" warnings (e.g., Gmail)
    webview_builder = webview_builder.user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");

    if restricted {
        webview_builder = webview_builder.on_navigation(move |url: &tauri::Url| {
            let url_str = url.as_str();
            
            // Allow YouTube internal resources, embeds, and essential data streams
            let is_internal_resource = url_str.contains("ytimg.com") 
                || url_str.contains("googlevideo.com")
                || url_str.contains("youtube.com/s/") 
                || url_str.contains("youtube.com/api/")
                || url_str.contains("youtube.com/youtubei/")
                || url_str.contains("google.com/recaptcha")
                || url_str.contains("generate_204")
                || url_str.contains("yts/js") || url_str.contains("yts/css")
                || url_str.contains("doubleclick.net") // Often used for player states
                || url_str.contains("gstatic.com");

            let is_player_page = url_str.contains("youtube.com/embed/") 
                || url_str.contains("youtube-nocookie.com/embed/")
                || url_str.contains("youtube.com/watch");

            // Block intentional navigation away to main YouTube UI
            let is_ui_escape = url_str.contains("youtube.com/results") 
                || (url_str.contains("youtube.com") && url.path() == "/")
                || url_str.contains("youtube.com/channel")
                || url_str.contains("youtube.com/user")
                || url_str.contains("youtube.com/shorts");

            (is_internal_resource || is_player_page) && !is_ui_escape
        });

        // SAFETY SHIELD: Inject CSS to hide all standard YouTube UI
        let script = r#"
            (function() {
                const style = document.createElement('style');
                style.textContent = `
                    ytd-masthead, #masthead-container { display: none !important; }
                    #secondary, .ytd-watch-flexy[is-secondary-column] { display: none !important; }
                    #comments { display: none !important; }
                    ytd-merch-shelf-renderer { display: none !important; }
                    .ytp-pause-overlay { display: none !important; }
                    .ytp-ce-element { display: none !important; }
                    #container.ytd-masthead { display: none !important; }
                    ytd-browse { display: none !important; }
                    ytd-popup-container { display: none !important; }
                    #columns { padding-left: 0 !important; }
                    #primary { padding-right: 0 !important; max-width: 100% !important; width: 100% !important; }
                    ytd-page-manager { margin-top: 0 !important; }
                    tp-yt-app-drawer { display: none !important; }
                    ytd-mini-guide-renderer { display: none !important; }
                    .ytp-chrome-top-buttons { display: none !important; }
                    .ytp-youtube-button { display: none !important; }
                    .ytp-share-button { display: none !important; }
                    body { overflow: hidden !important; }
                    #page-manager { margin-top: 0 !important; }
                `;
                document.head.append(style);
                
                // Cleanup loop for late-loading elements
                setInterval(() => {
                    const elements = document.querySelectorAll('ytd-masthead, #masthead-container, #secondary, #comments, .ytp-pause-overlay, ytd-popup-container');
                    elements.forEach(el => { if(el) el.style.display = 'none'; });
                }, 1000);
            })();
        "#;
        webview_builder = webview_builder.initialization_script(script);
    }

    // Set data store identifier for persistence (macOS specific, requires [u8; 16])
    let mut session_id = [0u8; 16];
    let id_bytes = b"aleflow_browser_";
    session_id[..id_bytes.len()].copy_from_slice(id_bytes);
    webview_builder = webview_builder.data_store_identifier(session_id);

    // We need to position it correctly on top of the placeholder in the main window
    main_window.add_child(
        webview_builder,
        LogicalPosition { x, y },
        LogicalSize { width, height },
    ).map_err(|e| format!("Failed to add native webview: {}", e))?;

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn update_browser_webview_bounds(
    app: AppHandle,
    id: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    if let Some(webview) = app.get_webview(&id) {
        let webview: Webview<tauri::Wry> = webview;
        webview.set_bounds(Rect {
            position: LogicalPosition { x, y }.into(),
            size: LogicalSize { width, height }.into(),
        }).map_err(|e| format!("Update bounds failed: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn hide_browser_webview(app: AppHandle, id: String) -> Result<(), String> {
    if let Some(webview) = app.get_webview(&id) {
        let webview: Webview<tauri::Wry> = webview;
        webview.hide().map_err(|e| format!("Hide failed: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn show_browser_webview(app: AppHandle, id: String) -> Result<(), String> {
    if let Some(webview) = app.get_webview(&id) {
        let webview: Webview<tauri::Wry> = webview;
        webview.show().map_err(|e| format!("Show failed: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn destroy_browser_webview(app: AppHandle, id: String) -> Result<(), String> {
    if let Some(webview) = app.get_webview(&id) {
        let webview: Webview<tauri::Wry> = webview;
        webview.close().map_err(|e| format!("Close failed: {}", e))?;
    }
    Ok(())
}
