export interface FileType {
  id: string;
  name: string;
  mimeType: string;
  isDownloaded: boolean;
  parentPath?: string[];
  size?: number;
  shortcutDetails?: {
    targetId: string;
    targetMimeType: string;
  };
  children?: Map<string, FileLib>;
}
// FileLib and FullFileLib Classes
export class FileLib implements FileType {
  id: string;
  name: string;
  mimeType: string;
  isDownloaded: boolean;
  ParentPath?: string[];
  children?: Map<string, FileLib>;
  size?: number;

  constructor(
    name: string,
    mimeType: string,
    isDownloaded: boolean,
    id: string,
    ParentPath?: string[],
    children?: Map<string, FileLib>,
    size?: number
  ) {
    this.size = size;
    this.name = name;
    this.id = id;
    this.ParentPath = ParentPath;
    this.mimeType = mimeType;
    this.children = children || new Map<string, FileLib>();
    this.isDownloaded = isDownloaded == true;
  }

  serialize(): SerializedFileLib {
    return new SerializedFileLib(
      this.id,
      this.name,
      this.mimeType,
      this.isDownloaded,
      this.size,
      this.ParentPath,
      this.children
        ? Array.from(this.children.entries()).map(([key, child]) => [
            key,
            child.serialize(),
          ])
        : undefined
    );
  }
}

// FSLib Class
export class FSLib {
  files: Map<string, FileLib>;
  last_visited: Array<FileLib>;

  constructor(files?: Map<string, FileLib>, last_visited?: Array<FileLib>) {
    this.files = files || new Map<string, FileLib>();
    this.last_visited = last_visited || [];
  }
  serialize(): SerializedFSLib {
    // Serialize the files map into an array of tuples
    const serializedFiles = Array.from(this.files.entries()).map(
      ([key, value]) => [key, value.serialize()] as [string, SerializedFileLib]
    );

    // Serialize the last visited files, omitting children
    const serializedLastVisited = this.last_visited.map(
      (file) =>
        new FileLib(
          file.name,
          file.mimeType,
          file.isDownloaded,
          file.id,
          file.ParentPath
        )
    );

    return new SerializedFSLib(serializedFiles, serializedLastVisited);
  }

  readFile(ParentPath: string[]): FileLib | undefined {
    let currentFile: FileLib | undefined;
    let currentMap = this.files;

    for (const segment of ParentPath) {
      currentFile = currentMap.get(segment);

      if (!currentFile) {
        return undefined; // If file not found, return undefined
      }

      if (currentFile.children) {
        currentMap = currentFile.children;
      } else if (segment !== ParentPath[ParentPath.length - 1]) {
        return undefined; // If not the last segment and no children, return undefined
      }
    }

    return currentFile;
  }
  readFolder(FilePath: string[]): FileLib[] | undefined {
    let currentFile: FileLib | undefined;
    let currentMap = this.files;

    for (const segment of FilePath) {
      currentFile = currentMap.get(segment);

      if (!currentFile) {
        return undefined; // If file not found, return undefined
      }

      if (currentFile.children) {
        currentMap = currentFile.children;
      } else if (segment !== FilePath[FilePath.length - 1]) {
        return undefined; // If not the last segment and no children, return undefined
      }
    }
    const files = currentFile?.children?.entries().map(([, file]) => file);
    if (files) return Array.from(files);
    else return [];
  }
  //----------------------------------------
  writeFile(virtualPath: string[], file: FileLib) {
    virtualPath.push(file.name);
    let currentMap = this.files;
    // Traverse the ParentPath until we reach the second-to-last directory
    for (let i = 0; i < virtualPath.length - 1; i++) {
      const segment = virtualPath[i];
      // Get the current file/folder at the ParentPath segment
      let currentFile = currentMap.get(segment);

      // If the segment doesn't exist, create a new folder
      if (!currentFile) {
        currentFile = new FileLib(
          segment,
          "application/vnd.google-apps.folder", // Google Drive type for folders
          false, // Not downloaded by default
          "",
          virtualPath.slice(0, i + 1)
        );
        currentMap.set(segment, currentFile);
      }

      // Verify that the current file is a folder (Google Drive folder type)
      if (currentFile.mimeType !== "application/vnd.google-apps.folder") {
        throw new Error(
          `Path error: '${segment}' is a file, expected a folder.`
        );
      }

      // Move to the children of the current folder
      if (!currentFile.children) {
        currentFile.children = new Map<string, FileLib>();
      }
      currentMap = currentFile.children;
    }

    // Insert the file at the last segment
    const lastSegment = virtualPath[virtualPath.length - 1];
    currentMap.set(lastSegment, file);
  }
  //----------------------------------------
  deleteFile(filePath: string[]): void {
    let currentMap = this.files;
    const folderStack: Array<[Map<string, FileLib>, string]> = [];

    // Traverse the path to locate the file
    for (const segment of filePath) {
      const currentFile = currentMap.get(segment);

      if (!currentFile) {
        throw new Error(`Path error: '${segment}' not found.`);
      }

      // Ensure the current segment is a folder
      if (currentFile.mimeType !== "application/vnd.google-apps.folder") {
        throw new Error(
          `Path error: '${segment}' is a file, expected a folder.`
        );
      }

      // Push the current folder and its key onto the stack for later cleanup
      folderStack.push([currentMap, segment]);

      // Move to the next level of children
      currentMap = currentFile.children!;
    }

    // Delete the target file (last element in the path)
    const fileToDelete = filePath[filePath.length - 1];
    if (!currentMap.has(fileToDelete)) {
      throw new Error(`File '${fileToDelete}' not found.`);
    }
    currentMap.delete(fileToDelete);

    // Now, cleanup: Remove any empty folders
    while (folderStack.length > 0) {
      const [parentMap, folderKey] = folderStack.pop()!;
      const folder = parentMap.get(folderKey);

      if (folder && folder.children && folder.children.size === 0) {
        parentMap.delete(folderKey); // Delete empty folder
      } else {
        // If folder is not empty, stop the cleanup process
        break;
      }
    }
  }
  //----------------------------------------
  moveFile(sourcePath: string[], destinationPath: string[]): void {
    const file = this.readFile(sourcePath);
    if (!file) throw Error("file doesn't exist");
    this.deleteFile(sourcePath);
    const newName=destinationPath.pop();
     if (!newName) throw Error("destinationPath is too short");
    file.name=newName;
    this.writeFile(destinationPath, file);
  }
}

// SerializedFileLib Class
export class SerializedFileLib implements Omit<FileType, "children"> {
  id: string;
  name: string;
  mimeType: string;
  ParentPath?: string[];
  size?: number;
  children?: [string, SerializedFileLib][];
  constructor(
    id: string,
    name: string,
    mimeType: string,
    isDownloaded: boolean,
    size?: number,
    ParentPath?: string[],
    children?: [string, SerializedFileLib][]
  ) {
    this.name = name;
    this.mimeType = mimeType;
    this.isDownloaded = isDownloaded == true;
    this.size = size;
    this.id = id;
    this.ParentPath = ParentPath;
    this.children = children;
  }
  isDownloaded: boolean;

  parse(): FileLib {
    const fileLib = new FileLib(
      this.name,
      this.mimeType,
      this.isDownloaded,
      this.id,
      this.ParentPath,
      this.children ? new Map<string, FileLib>() : undefined,
      this.size
    );

    // Parse children
    if (this.children) {
      this.children.forEach(([key, child]) => {
        fileLib.children!.set(key, child.parse());
      });
    }

    return fileLib;
  }
}

// SerializedFSLib Class
export class SerializedFSLib {
  files: [string, SerializedFileLib][];
  last_visited: Omit<FileLib, "children">[];

  constructor(
    files: [string, SerializedFileLib][],
    last_visited: Omit<FileLib, "children">[]
  ) {
    this.files = files;
    this.last_visited = last_visited;
  }
  // Parse a serialized FSLib object back to FSLib
  parse(): FSLib {
    const fsLib = new FSLib();

    // Parse files
    this.files.forEach(([key, value]) => {
      fsLib.files.set(key, value.parse());
    });

    // Parse last_visited
    fsLib.last_visited = this.last_visited.map(
      (file) =>
        new FileLib(
          file.name,
          file.mimeType,
          file.isDownloaded,
          file.id,
          file.ParentPath
        )
    );
    return fsLib;
  }
}
