use std::ffi::CString;
use std::io::{self};
use std::ptr;
use winapi::um::fileapi::{CreateFileA, ReadFile, WriteFile, OPEN_ALWAYS};
use winapi::um::winnt::{FILE_ATTRIBUTE_NORMAL, GENERIC_READ, GENERIC_WRITE, HANDLE};
#[cfg(target_os = "windows")]
pub fn create_ads(file_path: &str, attr_name: &str, data: &str) -> io::Result<()> {
    let ads_path = format!("{}:{}", file_path, attr_name);
    let c_path = CString::new(ads_path).unwrap();

    let handle: HANDLE = unsafe {
        CreateFileA(
            c_path.as_ptr(),
            GENERIC_WRITE,
            0,
            ptr::null_mut(),
            OPEN_ALWAYS,
            FILE_ATTRIBUTE_NORMAL,
            ptr::null_mut(),
        )
    };

    if handle.is_null() {
        return Err(io::Error::last_os_error());
    }

    // Write data to the ADS
    let mut written: u32 = 0;
    let result = unsafe {
        WriteFile(
            handle,
            data.as_ptr() as *const _,
            data.len() as u32,
            &mut written,
            ptr::null_mut(),
        )
    };

    unsafe { winapi::um::handleapi::CloseHandle(handle) };

    if result == 0 {
        return Err(io::Error::last_os_error());
    }
    Ok(())
}
#[cfg(target_os = "windows")]
pub fn read_ads(file_path: &str, attr_name: &str) -> io::Result<String> {
    let ads_path = format!("{}:{}", file_path, attr_name);
    let c_path = CString::new(ads_path).unwrap();

    let handle: HANDLE = unsafe {
        CreateFileA(
            c_path.as_ptr(),
            GENERIC_READ,
            0,
            ptr::null_mut(),
            OPEN_ALWAYS,
            FILE_ATTRIBUTE_NORMAL,
            ptr::null_mut(),
        )
    };

    if handle.is_null() {
        return Err(io::Error::last_os_error());
    }

    let mut buffer: [u8; 256] = [0; 256]; // Adjust size as needed
    let mut read: u32 = 0;
    let result = unsafe {
        ReadFile(
            handle,
            buffer.as_mut_ptr() as *mut _,
            buffer.len() as u32,
            &mut read,
            ptr::null_mut(),
        )
    };

    unsafe { winapi::um::handleapi::CloseHandle(handle) };

    if result == 0 {
        return Err(io::Error::last_os_error());
    }

    let data = String::from_utf8_lossy(&buffer[..read as usize]).to_string();
    Ok(data)
}

pub fn delete_ads(file_path: &str, attr_name: &str) -> io::Result<()> {
    let ads_path = format!("{}:{}", file_path, attr_name);
    let c_path = CString::new(ads_path).unwrap();

    let handle: HANDLE = unsafe {
        CreateFileA(
            c_path.as_ptr(),
            GENERIC_WRITE,
            0,
            ptr::null_mut(),
            OPEN_ALWAYS,
            FILE_ATTRIBUTE_NORMAL,
            ptr::null_mut(),
        )
    };

    if handle.is_null() {
        return Err(io::Error::last_os_error());
    }

    // Write empty data to delete the ADS
    let mut written: u32 = 0;
    let result = unsafe {
        WriteFile(
            handle,
            ptr::null(),
            0,
            &mut written,
            ptr::null_mut(),
        )
    };

    unsafe { winapi::um::handleapi::CloseHandle(handle) };

    if result == 0 {
        return Err(io::Error::last_os_error());
    }
    Ok(())
}

