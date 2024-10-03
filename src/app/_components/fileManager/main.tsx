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
  GridIcon,
  ListIcon,
  ArrowUpDown,
} from "lucide-react";
import FilesList, { FileType } from "./dependencies/filesList";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


export default function FileManager() {
  const [mode, setMode] = useState<"list" | "squares">("list");
  const [sortBy, setSortBy] = useState<"name" | "size">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterDownloaded, setFilterDownloaded] = useState<
    "all" | "downloaded" | "not-downloaded"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
 
  const { isLoading, data:fil } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/drive?id=1akzOIDlH3IjZY-hDVyW5fb8Jwg12zdi0"
        );
        console.log(res.data);
        return res.data;
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  });
  const [files, setFiles] = useState<FileType[]>([
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

  
/*function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "Ko", "Mo", "Go"]; // Labels for file sizes
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${sizes[index]}`;
}*/
  const toggleMode = () => setMode(mode === "list" ? "squares" : "list");

 

  

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
      <FilesList filteredAndSortedFiles={filteredAndSortedFiles} setFiles={setFiles} mode={mode}/>
    </div>
  );
}
