"use client"
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

export default function DownloadFile() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unlisten = listen("download-progress", (event) => {
      const progress = event.payload as number; // Get the progress value
      setProgress(progress); // Update the progress state
    });

    return () => {
      unlisten.then((u) => u()); // Clean up the listener on component unmount
    };
  }, []);

  const downloadFile = async () => {
    setProgress(0); // Reset progress before starting download
    try {
      const message = await invoke("download_file", {
        fileId: "1rCWr0-XltblY4_NdgNL-z_bE-MrNk96H",
      });
      console.log(message);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  return (
    <div>
      <button onClick={downloadFile}>Download File</button>
      <p>Download progress: {progress}%</p>
    </div>
  );
}
