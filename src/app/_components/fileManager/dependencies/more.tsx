import { Button } from "@/components/ui/button";
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
  Star,
  Trash2,
  ImageIcon,
  CheckIcon,
  FolderClosedIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Dispatch } from "react";
import { Action } from "../main";

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

export function MoreButton({
  file,
  onDownload,
  onDelete,
}: {
  file: FileType;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 hover:bg-white cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4 text-black" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="m-0 overflow-hidden">
        <DropdownMenuItem onSelect={() => onDownload()}>
          <Download className="mr-2 h-4 w-4" />
          <span>{file.isDownloaded ? "Redownload" : "Download"}</span>
        </DropdownMenuItem>
        {file.isDownloaded && (
          <DropdownMenuItem onSelect={() => onDelete()}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => onDelete()}>
          <CheckIcon className="mr-2 h-4 w-4" />
          <span>Mark as completed</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>External Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Star className="mr-2 h-4 w-4" />
          <span>Mark as Favorite</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
  idDispatch: Dispatch<Action>;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="pl-5 pb-3">
        {list.length > 3 && (
          <>
            <BreadcrumbItem
              id={list[list.length - 3].id}
              onClick={() =>
                idDispatch({ type: "goto", payload: list.length - 3 })
              }
              className="selectDisable hover:text-black cursor-pointer"
            >
              ..
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        {list.length > 3
          ? list.slice(-2).map((folder, ind, arr) => (
              <>
                <BreadcrumbItem
                  id={folder.id}
                  onClick={() =>
                    ind != arr.length - 1 &&
                    idDispatch({ type: "goto", payload: ind +2})
                  }
                  className="selectDisable hover:text-black cursor-pointer"
                >
                  {folder.name}
                </BreadcrumbItem>
                {ind != arr.length - 1 && <BreadcrumbSeparator />}
              </>
            ))
          : list.map((folder, ind, arr) => (
              <>
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
                {ind != arr.length - 1 && <BreadcrumbSeparator />}
              </>
            ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
