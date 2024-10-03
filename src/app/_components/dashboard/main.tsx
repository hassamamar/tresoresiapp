import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GridIcon,
  ListIcon,
  MoreHorizontal,
  Download,
  Check,
  FileText,
  FileSpreadsheet,
  File,
  FileCode,
  Archive,
  ExternalLink,
  Star,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  CheckIcon,
  FolderClosedIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface File {
  id: number;
  name: string;
  type: string;
  size: string;
  isDownloaded: boolean;
}

function MoreButton({
  file,
  onDownload,
  onDelete,
}: {
  file: File;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-white cursor-pointer">
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

function FileTypeIcon({ type }: { type: string }) {
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

export default function Dashboard() {
  const [mode, setMode] = useState<"list" | "squares">("list");
  const [sortBy, setSortBy] = useState<"name" | "size">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterDownloaded, setFilterDownloaded] = useState<
    "all" | "downloaded" | "not-downloaded"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [files, setFiles] = useState<File[]>([
    {
      id: 1,
      name: "Document.pdf",
      type: "pdf",
      size: "2.5 MB",
      isDownloaded: true,
    },
    {
      id: 2,
      name: "Image.jpg",
      type: "image",
      size: "3.2 MB",
      isDownloaded: false,
    },
    {
      id: 3,
      name: "Spreadsheet.xlsx",
      type: "spreadsheet",
      size: "1.8 MB",
      isDownloaded: true,
    },
    {
      id: 4,
      name: "Presentation.pptx",
      type: "presentation",
      size: "5.7 MB",
      isDownloaded: false,
    },
    {
      id: 5,
      name: "Notes.txt",
      type: "text",
      size: "12 KB",
      isDownloaded: true,
    },
    {
      id: 6,
      name: "Archive.zip",
      type: "archive",
      size: "10.1 MB",
      isDownloaded: false,
    },
    {
      id: 7,
      name: "Report.docx",
      type: "pdf",
      size: "1.5 MB",
      isDownloaded: true,
    },
    {
      id: 8,
      name: "Logooooerh ethoet eth oe.png",
      type: "folder",
      size: "0.8 MB",
      isDownloaded: true,
    },
    {
      id: 9,
      name: "Budget.xlsx",
      type: "spreadsheet",
      size: "2.2 MB",
      isDownloaded: false,
    },
    {
      id: 10,
      name: "Proposal",
      type: "folder",
      size: "4.3 MB",
      isDownloaded: true,
    },
    {
      id: 11,
      name: "Spreadsheet.xlsx",
      type: "spreadsheet",
      size: "1.8 MB",
      isDownloaded: true,
    },
    {
      id: 12,
      name: "Presentation.pptx",
      type: "presentation",
      size: "5.7 MB",
      isDownloaded: false,
    },
    {
      id: 13,
      name: "Notes.txt",
      type: "text",
      size: "12 KB",
      isDownloaded: true,
    },
    {
      id: 14,
      name: "Archive.zip",
      type: "archive",
      size: "10.1 MB",
      isDownloaded: false,
    },
    {
      id: 15,
      name: "Report.docx",
      type: "pdf",
      size: "1.5 MB",
      isDownloaded: true,
    },
    {
      id: 16,
      name: "Logooooerh ethoet eth oe.png",
      type: "folder",
      size: "0.8 MB",
      isDownloaded: true,
    },
    {
      id: 17,
      name: "Budget.xlsx",
      type: "spreadsheet",
      size: "2.2 MB",
      isDownloaded: false,
    },
    {
      id: 18,
      name: "Proposal",
      type: "folder",
      size: "4.3 MB",
      isDownloaded: true,
    },
  ]);

  const ITEMS_PER_PAGE = 8;

  const toggleMode = () => setMode(mode === "list" ? "squares" : "list");

  const handleDownload = (id: number) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, isDownloaded: true } : file
      )
    );
  };

  const handleDelete = (id: number) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, isDownloaded: false } : file
      )
    );
  };

  const toggleSort = () => {
    if (sortBy === "name") {
      setSortBy("size");
    } else {
      setSortBy("name");
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    const finalArray = files
      .filter((file) => {
        if (filterDownloaded === "downloaded") return file.isDownloaded;
        if (filterDownloaded === "not-downloaded") return !file.isDownloaded;
        return true;
      })
      .filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "name") {
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else {
          const sizeA = parseFloat(a.size);
          const sizeB = parseFloat(b.size);
          return sortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA;
        }
      });
    return finalArray
      .filter((file) => file.type == "folder")
      .concat(finalArray.filter((file) => file.type != "folder"));
  }, [files, filterDownloaded, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = filteredAndSortedFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage *ITEMS_PER_PAGE
  );

  return (
    <div
      className="w-full overflow-hidden bg-white rounded-lg"
      data-tauri-drag-region
    >
      <div className="p-4 pt-2 border-b" data-tauri-drag-region>
        <h1 className="text-3xl font-bold mb-7 flex gap-2 items-center">
          <Image
            src="/googleDrive2.png"
            alt=""
            width={35}
            height={35}
            className="mr-1"
          />
          Tresor Drive
        </h1>
        <div
          className="flex flex-col sm:flex-row gap-4 items-center justify-between"
          data-tauri-drag-region
        >
          {/* Search and Sort */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-600"
            />
            <Button
              onClick={toggleSort}
              variant="outline"
              className="whitespace-nowrap bg-gray-100 border rounded-md hover:bg-gray-200"
            >
              Sort by {sortBy === "name" ? "Name" : "Size"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Filter and Toggle View */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={filterDownloaded}
              onValueChange={(value: "all" | "downloaded" | "not-downloaded") =>
                setFilterDownloaded(value)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px] rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-600">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="downloaded">Downloaded</SelectItem>
                <SelectItem value="not-downloaded">Not Downloaded</SelectItem>
              </SelectContent>
            </Select>

            {/* Toggle View Button */}
            <Button
              onClick={toggleMode}
              variant="outline"
              className="bg-gray-100 border rounded-md hover:bg-gray-200"
            >
              {mode === "list" ? (
                <GridIcon className="h-4 w-4" />
              ) : (
                <ListIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className={` ${mode == "squares" ? "" : "px-4 h-[384px]"}`}>
        <div
          className={` ${
            mode === "squares"
              ? "flex flex-col gap-4"
              : "grid grid-cols-1 w-[675px]"
          }`}
        >
          {mode == "squares" ? (
            <ScrollArea
              id="squares"
              className=" h-[420px] w-[691px] pl-4 pr-6 border-b"
            >
              <div className={`grid my-4 grid-cols-2 gap-4 `}>
                {filteredAndSortedFiles
                  .filter((file) => file.type == "folder")
                  .map((file) => (
                    <div
                      key={file.id}
                      className={`p-2 border  border-gray-300 hover:bg-gray-100  active:bg-gray-200 rounded-lg flex ${
                        file.type === "folder"
                          ? "items-center justify-between h-12" // Simplified for folders in squares mode
                          : "flex-col items-center justify-between h-32" // Regular layout for files in squares mode
                      } w-full bg-white `}
                    >
                      {/* File/Folder Icon and Name */}
                      <div
                        className={`flex ${
                          file.type !== "folder"
                            ? "flex-col items-center text-center"
                            : "items-center"
                        } overflow-hidden`}
                      >
                        <div
                          className={`${
                            file.type !== "folder" ? "mb-1" : "mr-3"
                          } flex-shrink-0`}
                        >
                          <FileTypeIcon type={file.type} />
                        </div>
                        <div
                          className={`${
                            file.type !== "folder" ? "text-center" : ""
                          } min-w-0 flex-1`}
                        >
                          <div
                            className={`${
                              file.type !== "folder" ? "text-sm" : "text-base"
                            } font-medium truncate w-48`}
                          >
                            {file.name}
                          </div>
                          {file.type !== "folder" && (
                            <div className="text-xs text-gray-500 mr-3 mt-1">
                              {file.size}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* File/Folder Actions */}
                      <div
                        className={`flex items-center gap-3 ${
                          file.type !== "folder" ? "mt-1" : ""
                        }`}
                      >
                        {file.isDownloaded ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Download className="h-4 w-4 text-gray-500 " />
                        )}
                        <MoreButton
                          file={file}
                          onDownload={() => handleDownload(file.id)}
                          onDelete={() => handleDelete(file.id)}
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <div className={`grid  grid-cols-4 gap-4 pb-2`}>
                {filteredAndSortedFiles
                  .filter((file) => file.type != "folder")
                  .map((file) => (
                    <div
                      key={file.id}
                      className={`p-2 border border-gray-300 hover:bg-gray-100  active:bg-gray-200 rounded-lg flex ${
                        file.type === "folder"
                          ? "items-center justify-between h-12" // Simplified for folders in squares mode
                          : "flex-col items-center justify-between h-32" // Regular layout for files in squares mode
                      } w-full bg-white `}
                    >
                      {/* File/Folder Icon and Name */}
                      <div
                        className={`flex ${
                          file.type !== "folder"
                            ? "flex-col items-center text-center"
                            : "items-center"
                        } overflow-hidden`}
                      >
                        <div
                          className={`${
                            file.type !== "folder" ? "mb-1" : "mr-3"
                          } flex-shrink-0`}
                        >
                          <FileTypeIcon type={file.type} />
                        </div>
                        <div
                          className={`${
                            file.type !== "folder" ? "text-center" : ""
                          } min-w-0 flex-1`}
                        >
                          <div
                            className={`${
                              file.type !== "folder" ? "text-sm" : "text-base"
                            } font-medium truncate w-28`}
                          >
                            {file.name}
                          </div>
                          {file.type !== "folder" && (
                            <div className="text-xs text-gray-500 mr-3 mt-1">
                              {file.size}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* File/Folder Actions */}
                      <div
                        className={`flex items-center gap-3 ${
                          file.type !== "folder" ? "mt-1" : ""
                        }`}
                      >
                        {file.isDownloaded ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Download className="h-4 w-4 text-gray-500 " />
                        )}
                        <MoreButton
                          file={file}
                          onDownload={() => handleDownload(file.id)}
                          onDelete={() => handleDelete(file.id)}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          ) : (
            paginatedFiles.map((file, ind, array) => (
              <div
                key={file.id}
                className={`p-2 border border-t-0 border-gray-300 hover:bg-gray-100 active:bg-gray-200  flex items-center justify-between h-12  border-x-0  ${
                  ind == array.length - 1 && "border-b-0"
                }
                    } w-full bg-white `}
              >
                {/* File/Folder Icon and Name */}
                <div className={`flex items-center overflow-hidden`}>
                  <div className={`mr-3 flex-shrink-0`}>
                    <FileTypeIcon type={file.type} />
                  </div>
                  <div className={` min-w-0 flex-1`}>
                    <div className={`text-base font-medium truncate w-96`}>
                      {file.name}
                    </div>
                  </div>
                </div>

                {/* File/Folder Actions */}
                <div className={`flex items-center gap-3 `}>
                  <div className="text-xs text-gray-500 mr-3">{file.size}</div>

                  {file.isDownloaded ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Download className="h-4 w-4 text-gray-500 " />
                  )}
                  <MoreButton
                    file={file}
                    onDownload={() => handleDownload(file.id)}
                    onDelete={() => handleDelete(file.id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {mode == "list" && (
        <div className="p-4 pt-0 border-t flex items-center justify-between">
          <span className="text-sm pt-2 text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="icon"
              className="h-8 w-8 mt-3 bg-gray-100 border rounded-md hover:bg-gray-200"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              variant="outline"
              size="icon"
              className="h-8 w-8 mt-3 bg-gray-100 border rounded-md hover:bg-gray-200"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
