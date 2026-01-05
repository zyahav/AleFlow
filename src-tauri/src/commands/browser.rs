use tauri::{AppHandle, Manager, WebviewUrl, Rect, LogicalPosition, LogicalSize, webview::{WebviewBuilder, Webview}};

#[tauri::command]
#[specta::specta]
pub async fn create_browser_webview(
    app: AppHandle,
    url: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    let main_window = app.get_window("main").ok_or("Main window not found")?;
    
    // Check if webview already exists
    if let Some(webview) = app.get_webview("browser_content") {
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

    let mut webview_builder = WebviewBuilder::new("browser_content", WebviewUrl::External(url.parse().map_err(|e| format!("Invalid URL: {}", e))?));
    
    // Set modern User Agent to avoid "Unsupported Browser" warnings (e.g., Gmail)
    webview_builder = webview_builder.user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");

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
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    if let Some(webview) = app.get_webview("browser_content") {
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
pub async fn hide_browser_webview(app: AppHandle) -> Result<(), String> {
    if let Some(webview) = app.get_webview("browser_content") {
        let webview: Webview<tauri::Wry> = webview;
        webview.hide().map_err(|e| format!("Hide failed: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn show_browser_webview(app: AppHandle) -> Result<(), String> {
    if let Some(webview) = app.get_webview("browser_content") {
        let webview: Webview<tauri::Wry> = webview;
        webview.show().map_err(|e| format!("Show failed: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn destroy_browser_webview(app: AppHandle) -> Result<(), String> {
    if let Some(webview) = app.get_webview("browser_content") {
        let webview: Webview<tauri::Wry> = webview;
        webview.close().map_err(|e| format!("Close failed: {}", e))?;
    }
    Ok(())
}
