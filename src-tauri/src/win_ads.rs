#[cfg(target_os = "windows")]
pub mod windows_ads {

    use std::fs::{File, OpenOptions};
    use std::io::{Read, Write};

    pub fn set_ads(file_path: &str, stream_name: &str, value: &str) -> std::io::Result<()> {
        // Open the file stream for writing (this will create it if it doesn't exist)
        let stream_path = format!("{}:{}", file_path, stream_name);
        println!("id : {value} , path : {file_path:?}");
        let mut file = OpenOptions::new()
            .write(true)
            .create(true)
            .open(stream_path)?;
        file.write_all(value.as_bytes())?;
        Ok(())
    }
    #[cfg(target_os = "windows")]
    pub fn get_ads(file_path: &str, stream_name: &str) -> std::io::Result<String> {
        // Open the file stream for reading
        let stream_path = format!("{}:{}", file_path, stream_name);
        let mut file = File::open(stream_path)?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;
        Ok(contents)
    }
}
