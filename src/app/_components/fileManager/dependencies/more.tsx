import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Download,
  FileText,
  FileSpreadsheet,
  File,
  FileCode,
  Archive,
  ExternalLink,
  ImageIcon,
  FolderClosedIcon,
  CopyPlusIcon,
  PanelLeftOpenIcon,
  FolderXIcon,
  CircleXIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { Dispatch } from "react";
import { open } from "@tauri-apps/plugin-shell";
import { OnlineAction } from "../FileManager";

export interface FileType {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  isDownloaded?: boolean;
  shortcutDetails?: {
    targetId: string;
    targetMimeType: string;
  };
}
export function isFileType(obj: FileType): boolean {
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.mimeType === "string" &&
    typeof obj.size === "number" &&
    (obj.isDownloaded === undefined || typeof obj.isDownloaded === "boolean") &&
    (obj.shortcutDetails === undefined ||
      (typeof obj.shortcutDetails === "object" &&
        typeof obj.shortcutDetails.targetId === "string" &&
        typeof obj.shortcutDetails.targetMimeType === "string"))
  );
}
export function MoreButton({
  file,
  onDownload,
  onDelete,
  onOpen,
}: {
  file: FileType;
  onDownload: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`h-8 w-8 hover:bg-white p-0 flex items-center justify-center rounded-lg cursor-pointer`}
      >
        <MoreHorizontal className="h-4 w-4 text-black" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="m-0 overflow-hidden">
        {isFile(file) && file.isDownloaded && (
          <DropdownMenuItem onSelect={() => onOpen()}>
            <PanelLeftOpenIcon className="mr-2 h-4 w-4" />
            <span>Open</span>
          </DropdownMenuItem>
        )}
        {isFile(file) && (
          <DropdownMenuItem
            onSelect={() => {
              console.log("donwloading");
              if (file.isDownloaded) onDelete();
              else onDownload();
            }}
          >
            {file.isDownloaded ? (
              <CircleXIcon className="mr-2 h-4 w-4" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            <span>{file.isDownloaded ? "Delete" : "Download"}</span>
          </DropdownMenuItem>
        )}
        {isFile(file) && (
          <DropdownMenuItem>
            <CopyPlusIcon className="mr-2 h-4 w-4" />
            <span>Add to library</span>
          </DropdownMenuItem>
        )}

        {file.id && (
          <DropdownMenuItem onClick={() => open(GetExternalLink(file))}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>External Link</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function isFolder(file: FileType) {
  return file.mimeType == "application/vnd.google-apps.folder";
}
export function isFolderShortcut(file: FileType) {
  return (
    file.shortcutDetails?.targetMimeType == "application/vnd.google-apps.folder"
  );
}
export function isShortcut(file: FileType) {
  return file.mimeType == "application/vnd.google-apps.shortcut";
}
export function isFile(file: FileType) {
  return !isFolder(file) && !isFolderShortcut(file);
}

function GetExternalLink(file: FileType) {
  switch (file.mimeType) {
    case "application/vnd.google-apps.folder":
      return `https://drive.google.com/drive/folders/${file.id}`;
    case "application/vnd.google-apps.shortcut":
      return `https://drive.google.com/drive/folders/${file.shortcutDetails?.targetId}`;

    default:
      return `https://drive.google.com/file/d/${file.id}`;
  }
}

interface FileTypeIconProps {
  type: string;
}
export function LoadingComponent() {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`w-12 h-12 border-4 border-t-4 border-gray-300 border-t-[#1A97EE] rounded-full animate-spin`}
      ></div>
    </div>
  );
}
export function FileTypeIcon({ type }: FileTypeIconProps) {
  switch (type) {
    // Folder
    case "application/vnd.google-apps.folder":
      return <FolderClosedIcon className="h-4 w-4" />;

    // Google Docs
    case "application/vnd.google-apps.document":
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return <FileText className="h-4 w-4" />;

    // Google Sheets
    case "application/vnd.google-apps.spreadsheet":
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return <FileSpreadsheet className="h-4 w-4" />;

    // Google Slides / Presentations
    case "application/vnd.google-apps.presentation":
    case "application/vnd.ms-powerpoint":
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return <File className="h-4 w-4" />;

    // Images
    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/svg+xml":
      return <ImageIcon className="h-4 w-4" />;

    // PDF
    case "application/pdf":
      return <FileText className="h-4 w-4" />;

    // Compressed files (archives)
    case "application/zip":
    case "application/x-rar-compressed":
    case "application/x-7z-compressed":
    case "application/gzip":
      return <Archive className="h-4 w-4" />;

    // Code files (text-based)
    case "text/plain":
    case "application/json":
    case "text/html":
    case "text/css":
    case "application/javascript":
    case "application/x-sh":
      return <FileCode className="h-4 w-4" />;

    // Default for unsupported types
    default:
      return <FileText className="h-4 w-4" />;
  }
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "Ko", "Mo", "Go"]; // Labels for file sizes
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${sizes[index]}`;
}
export function BreadcrumbFiles({
  list,
  idDispatch,
}: {
  list: { id: string; name: string }[];
  idDispatch: Dispatch<OnlineAction>;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="pl-5 pb-3">
        {list.length > 3 && (
          <>
            <BreadcrumbItem
              key="..."
              id={list[list.length - 3].id}
              onClick={() =>
                idDispatch({ type: "goto", payload: list.length - 3 })
              }
              className="selectDisable hover:text-black cursor-pointer"
            >
              ..
            </BreadcrumbItem>
            <BreadcrumbSeparator key="sep..." />
          </>
        )}
        {list.length > 3
          ? list.slice(-2).map((folder, ind, arr) => (
              <React.Fragment key={ind}>
                {" "}
                {/* Use folder.id as key */}
                <BreadcrumbItem
                  id={folder.id}
                  onClick={() =>
                    ind != arr.length - 1 &&
                    idDispatch({ type: "goto", payload: ind +list.length- 2 })
                  }
                  className="selectDisable hover:text-black cursor-pointer"
                >
                  {folder.name}
                </BreadcrumbItem>
                {ind != arr.length - 1 && (
                  <BreadcrumbSeparator key={`sep-${folder.id}`} />
                )}
              </React.Fragment>
            ))
          : list.map((folder, ind, arr) => (
              <React.Fragment key={ind}>
                {" "}
                {/* Use folder.id as key */}
                <BreadcrumbItem
                  id={folder.id}
                  onClick={() =>
                    ind != arr.length - 1 &&
                    idDispatch({ type: "goto", payload: ind })
                  }
                  className="selectDisable hover:text-black cursor-pointer"
                >
                  {folder.name}
                </BreadcrumbItem>
                {ind != arr.length - 1 && (
                  <BreadcrumbSeparator key={`sep-${folder.id}`} />
                )}
              </React.Fragment>
            ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
