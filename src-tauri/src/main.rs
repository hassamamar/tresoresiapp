// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use app_lib::get_app_data_path;
use app_lib::DownloadItem;
use std::{fs, sync::Arc};
use tauri::{async_runtime::Mutex, AppHandle, Manager};

fn main() {
    dotenv::dotenv().ok();
    tauri::Builder::default()
        .setup(|app| {
            // Use PathResolver to get the library.json path on startup
            let downloads_list: Arc<Mutex<Vec<DownloadItem>>> = Arc::new(Mutex::new(Vec::new()));
            app.manage(downloads_list);
            let app_handle = app.app_handle();

            let path = get_app_data_path(&app_handle).join("library.json");
            let initial_content: String;
            if !path.exists() {
                initial_content = String::from("{\"files\":[],\"last_visited\":[]}");
                fs::write(&path, initial_content.clone())
                    .map_err(|err| format!("Failed to create the file: {}", err))?;
            } else {
                initial_content = Ok(path)
                    .and_then(|path| {
                        fs::read_to_string(&path).map_err(|_| "Failed to read the file".to_string())
                    })
                    .unwrap_or_else(|_| "Failed to read the file".to_string());
            }

            // Store the content in Arc<Mutex>
            let library_file_content = Arc::new(Mutex::new(initial_content));

            app.manage(library_file_content); // Manage state for global access

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            close_window,
            minimize_window,
            app_lib::save_library,
            app_lib::get_library,
            app_lib::loaded,
            app_lib::download,
            app_lib::file_list,
            app_lib::file_exist,
            app_lib::file_list_offline,
            app_lib::open_file,
            app_lib::delete_file,
            app_lib::delete_folder
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
fn minimize_window(app: AppHandle) {
    let window = app.get_webview_window("main").unwrap();
    window.minimize().unwrap();
}
