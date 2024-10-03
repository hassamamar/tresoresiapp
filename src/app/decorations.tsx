"use client";
import { Minus, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export default function Decorations() {
  return (
    <div className="flex items-center justify-between gap-3 absolute top-3 right-3">
      <Minus
        className=" text-black hover:opacity-70 hover:cursor-pointer z-10"
        onClick={() => {
          invoke("minimize_window");
        }}
      />
      <X
        className=" text-black hover:opacity-70 hover:cursor-pointer z-10"
        onClick={() => {
          invoke("close_window");
        }}
      />
    </div>
  );
}
