use std::{fs, path::PathBuf};

use tauri::{ AppHandle, Manager};
mod local;
mod fetching;
mod virtualfs;
mod win_adr;
pub use win_adr::*;
pub use fetching::*;
pub use virtualfs::*;
pub use local::*;
pub fn get_app_data_path(app_handle: &AppHandle) -> PathBuf {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();
    if !app_data_dir.exists() {
        let _ = fs::create_dir(app_data_dir.clone());
    }
    app_data_dir
}
