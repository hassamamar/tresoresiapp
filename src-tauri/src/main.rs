// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{AppHandle, Manager};

//if let Some(proj_dirs) = ProjectDirs::from("git","SiDorios","Survive the troll") {
//    proj_dirs.config_dir();
// Lin: /home/alice/.config/barapp
// Win: C:\Users\Alice\AppData\Roaming\Foo Corp\Bar App\config
// Mac: /Users/Alice/Library/Application Support/com.Foo-Corp.Bar-App
//}
fn main() {
    let _ = fix_path_env::fix();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            close_window,
            minimize_window,
            show_window,
            hide_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn close_window(app: AppHandle) {
    let window = app.get_webview_window("main").unwrap();
    window.close().unwrap();
}
#[tauri::command]
fn hide_window(app: AppHandle) {
    let window = app.get_webview_window("main").unwrap();
    window.hide().unwrap();
}
#[tauri::command]
fn show_window(app: AppHandle) {
    let window = app.get_webview_window("main").unwrap();
    window.show().unwrap();
    window.set_focus().unwrap();
}

#[tauri::command]
fn minimize_window(app: AppHandle) {
    let window = app.get_webview_window("main").unwrap();
    window.minimize().unwrap();
}
