// Escoffe Tauri backend.
//
// The app is local-first: all persistence happens on the frontend through the
// store plugin. The backend only wires up the plugins and the window.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .run(tauri::generate_context!())
        .expect("error while running Escoffe");
}
