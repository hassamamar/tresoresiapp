// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{fs, path::PathBuf, sync::Arc};

use serde::{Deserialize, Serialize};
use tauri::{async_runtime::Mutex, AppHandle, Emitter, Manager};

use reqwest::Client;
use reqwest::StatusCode;
use std::fs::File;
use std::io::Write;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct DownloadItem {
    id: String,
    name: String,
    progress: u8, // Download progress percentage
    path: Vec<String>,
}

#[tauri::command]
async fn download(download_file: DownloadItem, app_handle: AppHandle) -> Result<String, String> {
    let downloads_state = app_handle.state::<Arc<Mutex<Vec<DownloadItem>>>>(); 
    let mut downloads = downloads_state.lock().await;
    downloads.push(download_file.clone());
    app_handle.emit("downloads",downloads.clone() ).map_err(|_| "Failed to add download to state".to_string())?;
    println!("downloading : {:?}", download_file);
    let api_key: String = std::env::var("GOOGLE_API_KEY")
        .unwrap_or(String::from("AIzaSyCmuuYqcdpNDxafcVFMLa6ZhW4j_6X3zYE"));
    let url = format!(
        "https://www.googleapis.com/drive/v3/files/{}?alt=media&key={}",
        download_file.id, api_key
    );

    let app_dir = get_app_data_path(&app_handle).join("Offline");
    let client = Client::new();

    let mut response = client
        .get(&url)
        .send()
        .await
        .map_err(|_| "Failed to download file".to_string())?;

    if response.status() != StatusCode::OK {
        return Err(format!("{:?}", response));
    }

    // Get the total size of the file
    let total_size: usize = response.content_length().unwrap_or(0) as usize;
    let mut downloaded = 0;

    // Ensure the app directory exists
    if !app_dir.exists() {
        let _ = fs::create_dir(app_dir.clone());
    }
    let file_parent_pathbuf: PathBuf = download_file.path.iter().collect::<PathBuf>();
    let file_parent_path = app_dir.join(file_parent_pathbuf);
    if !file_parent_path.exists() {
        let _ = fs::create_dir_all(file_parent_path.clone());
    }
    let file_path = file_parent_path.join(download_file.name); // Specify your file name
    let mut file = File::create(&file_path).map_err(|_| "Failed to create file".to_string())?;

    // Read the response in chunks
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|_| "Error reading chunk".to_string())?
    {
        file.write_all(&chunk)
            .map_err(|_| "Failed to write to file".to_string())?;
        downloaded += chunk.len();

        // Emit progress to the frontend
        if total_size > 0 {
            let progress = (downloaded * 100 / total_size) as u8;
            downloads.retain_mut(|download| {
                if download_file.id == download.id {
                    if progress == 100 {
                        return false;
                    } else {
                        download.progress = progress;
                        return true;
                    }
                } else {
                    return true;
                }
            });
            app_handle
                .emit("downloads", downloads.clone())
                .map_err(|_| "Failed to emit progress".to_string())?;
        }
    }

    Ok(format!("File downloaded successfully to {:?}", file_path))
}

fn get_app_data_path(app_handle: &AppHandle) -> PathBuf {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();
    if !app_data_dir.exists() {
        let _ = fs::create_dir(app_data_dir.clone());
    }
    app_data_dir
}

#[tauri::command]
async fn get_library(app_handle: AppHandle) -> String {
    let state = app_handle.state::<Arc<Mutex<String>>>();
    let content = state.lock().await;
    content.clone()
}
#[tauri::command]
async fn loaded(app_handle: AppHandle) {
    let state = app_handle.state::<Arc<Mutex<Vec<DownloadItem>>>>();

    let content = state.lock().await;
    app_handle.emit("downloads", content.clone()).unwrap();
}

#[tauri::command]
async fn save_library(app_handle: AppHandle, new_content: String) -> Result<(), String> {
    // Get the path to library.json in AppData using the PathResolver
    let path = get_app_data_path(&app_handle);

    // Save the new content to the file
    fs::write(&path.join("library.json"), new_content.clone()).map_err(|err| err.to_string())?;

    // Update the in-memory content
    let state = app_handle.state::<Arc<Mutex<String>>>();
    let mut content = state.lock().await;
    *content = new_content;

    Ok(())
}
fn main() {
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
            loaded,
            download
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
