
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
import { FileType } from "./filesList";

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
          <MoreHorizontal className="h-4 w-4 " />
          <span className="sr-only">More options</span>
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

export function FileTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "folder":
      return <FolderClosedIcon className="h-4 w-4" />;
    case "pdf":
      return <FileText className="h-4 w-4" />;
    case "image":
      return <ImageIcon className="h-4 w-4" />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-4 w-4" />;
    case "presentation":
      return <File className="h-4 w-4" />;
    case "text":
      return <FileCode className="h-4 w-4" />;
    case "archive":
      return <Archive className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}
