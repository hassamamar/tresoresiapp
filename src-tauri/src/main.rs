// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{
    fs, io::Read, path::PathBuf, sync::{Arc, Mutex}
};

use tauri::{ AppHandle, Emitter, Manager, State};

use reqwest::blocking::Client;
use reqwest::StatusCode;
use std::fs::File;
use std::io::Write;

#[tauri::command]
fn download_file(file_id: &str, app_handle: AppHandle) -> Result<String, String> {
    let api_key :String= std::env::var("GOOGLE_API_KEY").unwrap_or(String::from("AIzaSyCmuuYqcdpNDxafcVFMLa6ZhW4j_6X3zYE"));
    let url = format!(
        "https://www.googleapis.com/drive/v3/files/{}?alt=media&key={}",
        file_id, api_key
    );

    let client = Client::new();
    let mut response = client
        .get(&url)
        .send()
        .map_err(|_| "Failed to download file".to_string())?;

    if response.status() != StatusCode::OK {
        return Err(format!("{:?}",response));
    }

    // Get the total size of the file
    let total_size:usize = response.content_length().unwrap_or(0) as usize;
    let mut downloaded =0;
    let mut buffer = vec![0; 1024];

    // Get the user's Documents directory
    let app_dir = get_app_data_path(&app_handle).join("Tresor Esi");
    if !app_dir.exists(){
        fs::create_dir(app_dir.clone());
    }
    let file_path = app_dir.join("file.pdf"); // Specify your file name

    let mut file = File::create(&file_path).map_err(|_| "Failed to create file".to_string())?;

    while let Ok(bytes_read) = response.read(&mut buffer) {
        if bytes_read == 0 {
            break; // End of the file
        }
        file.write_all(&buffer[..bytes_read])
            .map_err(|_| "Failed to write to file".to_string())?;
        downloaded += bytes_read;

        // Emit progress to the frontend
        let progress = (downloaded * 100 / total_size) as u32;
       app_handle.emit("download-progress", progress).map_err(|_| "Failed to emit progress".to_string())?;
    }

    Ok(format!("File downloaded successfully to {:?}", file_path))
}
fn get_app_data_path(app_handle: &AppHandle) -> PathBuf {
    // Use PathResolver to get the AppData directory path
    let app_data_dir = app_handle.path().app_data_dir().unwrap();
    if !app_data_dir.exists() {
        println!("\n {:?} \n", app_data_dir);
        let _ = fs::create_dir(app_data_dir.clone());
    }
    app_data_dir
}

#[tauri::command]
fn get_library(state: State<Arc<Mutex<String>>>) -> String {
    let content = state.lock().unwrap();
    content.clone()
}
#[tauri::command]
fn save_library(
    app_handle: AppHandle,
    new_content: String,
    state: State<Arc<Mutex<String>>>,
) -> Result<(), String> {
    // Get the path to library.json in AppData using the PathResolver
    let path = get_app_data_path(&app_handle);

    // Save the new content to the file
    fs::write(&path.join("library.json"), new_content.clone()).map_err(|err| err.to_string())?;

    // Update the in-memory content
    let mut content = state.lock().unwrap();
    *content = new_content;

    Ok(())
}
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Use PathResolver to get the library.json path on startup
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
            let file_content = Arc::new(Mutex::new(initial_content));

            app.manage(file_content); // Manage state for global access

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            close_window,
            minimize_window,
            show_window,
            hide_window,
            save_library,
            get_library,
            download_file
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
