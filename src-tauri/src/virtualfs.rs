#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use crate::get_app_data_path;
use std::{fs, sync::Arc};
use tauri::{async_runtime::Mutex, AppHandle, Manager};
#[tauri::command]
pub async fn get_library(app_handle: AppHandle) -> String {
    let state = app_handle.state::<Arc<Mutex<String>>>();
    let content = state.lock().await;
    content.clone()
}

#[tauri::command]
pub async fn save_library(app_handle: AppHandle, new_content: String) -> Result<(), String> {
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
