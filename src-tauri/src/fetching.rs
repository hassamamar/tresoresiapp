use std::{fs, path::PathBuf, sync::Arc};

use serde::{Deserialize, Serialize};
use tauri::{async_runtime::Mutex, AppHandle, Emitter, Manager};

use reqwest::Client;
use reqwest::StatusCode;
use std::fs::File;
use std::io::Write;

use crate::get_app_data_path;

#[derive(Serialize, Deserialize, Debug)]
pub struct ShortcutDetails {
    pub targetId: String,       // ID of the file that this shortcut points to
    pub targetMimeType: String, // MIME type of the target file
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GoogleDriveFile {
    pub id: String,
    pub name: String,
    pub mimeType: String,
    pub size: Option<String>,
    pub webContentLink: Option<String>,
    pub shortcutDetails: Option<ShortcutDetails>, // Now explicitly defined
}
#[derive(Serialize, Deserialize, Debug)]
pub struct GoogleDriveResponse {
    files: Vec<GoogleDriveFile>,
}

#[tauri::command]
pub async fn file_list(id: String) -> Result<String, String> {
    let api_key = std::env::var("GOOGLE_API_KEY").expect("GOOGLE_API_KEY not set");

    let url = format!(
        "https://www.googleapis.com/drive/v3/files?q='{}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,size,webContentLink,shortcutDetails)&key={}",
        id, api_key
    );

    let client = reqwest::Client::new();

    let res = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {:?}", e))?;

    if res.status().is_success() {
        let drive_files: GoogleDriveResponse = res
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {:?}", e))?;

        let json_result = serde_json::to_string(&drive_files)
            .map_err(|e| format!("Failed to serialize files: {:?}", e))?;

        Ok(json_result)
    } else {
        Err(format!("Google Drive API error: {:?}", res.status()))
    }
}
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DownloadItem {
    id: String,
    name: String,
    progress: u8, // Download progress percentage
    path: Vec<String>,
}
#[tauri::command]
pub async fn download(
    download_file: DownloadItem,
    app_handle: AppHandle,
) -> Result<String, String> {
    let downloads_state = app_handle.state::<Arc<Mutex<Vec<DownloadItem>>>>();
    let mut downloads = downloads_state.lock().await;
    downloads.push(download_file.clone());
    app_handle
        .emit("downloads", downloads.clone())
        .map_err(|_| "Failed to add download to state".to_string())?;
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

#[tauri::command]
pub async fn loaded(app_handle: AppHandle) {
    let state = app_handle.state::<Arc<Mutex<Vec<DownloadItem>>>>();

    let content = state.lock().await;
    app_handle.emit("downloads", content.clone()).unwrap();
}
