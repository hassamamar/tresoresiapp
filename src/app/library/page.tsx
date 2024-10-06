"use client";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { FileLib } from "../_components/fileManager/dependencies/FileSystem";

export default function Home() {
  const [library, setLibrary] = useState<FileLib[] | undefined>();
  async function get_library() {
    console.log(await invoke("get_library"));
    setLibrary(JSON.parse(await invoke("get_library")));
  }
  useEffect(() => {
    if (typeof window != "undefined") get_library();
  },[setLibrary]);

  return <>Library : {JSON.stringify(library)}</>;
}
