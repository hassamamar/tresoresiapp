use std::{
    fs::{self, File},
    path::PathBuf,
};

use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;

use crate::get_app_data_path;
#[derive(Serialize, Deserialize, Debug)]
pub struct ReceiveFileType {
    name: String,
    path: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SendFileType {
    name: String,
    size:usize,
    mimeType: String,
}
pub fn get_offline_path(app_handle: &AppHandle, path: Vec<String>) -> PathBuf {
    let path_dir = get_app_data_path(&app_handle).join("Offline");
    path_dir.join(path.iter().collect::<PathBuf>())
}
#[tauri::command]
pub fn file_exist(file: ReceiveFileType, app_handle: AppHandle) -> Result<bool, String> {
    let offline_path = get_offline_path(&app_handle, file.path);
    fs::exists(offline_path.join(file.name)).map_err(|_| String::from("file doesn't exist"))
}

#[tauri::command]
pub fn file_list_offline(
    folder_path_vec: Vec<String>,
    app_handle: AppHandle,
) -> Result<Vec<SendFileType>, String> {
    let folder_path = get_offline_path(&app_handle, folder_path_vec);
    if !folder_path.exists() {
        return Err(String::from("Folder doesn't exist"));
    }
    if !folder_path.is_dir() {
        return Err(String::from("Provided path for a folder is not a folder"));
    }
    let folder_reader = fs::read_dir(folder_path);
    let mut entries = Vec::new();
    if let Ok(folder_reader) = folder_reader {
        for entry in folder_reader {
            if let Ok(entry) = entry {
                let path = entry.path();
                let name = path.file_name().unwrap().to_string_lossy().into_owned();

                // Determine if the entry is a folder
                let mimeType = if path.is_dir() {
                    String::from("application/vnd.google-apps.folder")
                } else {
                    String::from("application/vnd.google-apps.file")
                };
                let size=entry.metadata().unwrap().len() as usize;
                // Push into Vec<File>
                entries.push(SendFileType { name, mimeType,size });
            }
        }
    }
    Ok(entries)
}

#[tauri::command]
pub fn open_file(file: ReceiveFileType, app_handle: AppHandle) -> Result<(), ()> {
    let file_path = get_offline_path(&app_handle, file.path).join(file.name);
    app_handle
        .shell()
        .open(file_path.to_string_lossy(), None)
        .map_err(|_| ())
}

#[tauri::command]
pub fn delete_file(file: ReceiveFileType, app_handle: AppHandle) -> Result<(), String> {
    let file_path = get_offline_path(&app_handle, file.path).join(file.name);
    println!("{:#?}",file_path);
    let result=fs::remove_file(file_path);
    println!("{:#?}",result);
    result.map_err(|err|format!("{:#?}",err))
}
#[tauri::command]
pub fn delete_folder(path: Vec<String>, app_handle: AppHandle) -> Result<(), String> {
    let file_path = get_offline_path(&app_handle, path);
    fs::remove_dir_all(file_path).map_err(|_|"Failed to delete file".to_string())
}