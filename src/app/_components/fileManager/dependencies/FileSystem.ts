export interface FileType {
  id: string;
  name: string;
  mimeType: string;
  isDownloaded: boolean;
  path?: string[];
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
  path?: string[];
  children?: Map<string, FileLib>;
  size?: number;

  constructor(
    name: string,
    mimeType: string,
    isDownloaded: boolean,
    id: string,
    path?: string[],
    children?: Map<string, FileLib>,
    size?: number
  ) {
    this.size = size;
    this.name = name;
    this.id = id;
    this.path = path;
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
      this.path,
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
  readFile(path: string[]): FileLib | undefined {
    let currentFile: FileLib | undefined;
    let currentMap = this.files;

    for (const segment of path) {
      currentFile = currentMap.get(segment);

      if (!currentFile) {
        return undefined; // If file not found, return undefined
      }

      if (currentFile.children) {
        currentMap = currentFile.children;
      } else if (segment !== path[path.length - 1]) {
        return undefined; // If not the last segment and no children, return undefined
      }
    }

    return currentFile;
  }
  readFolder(path: string[]): FileLib[] | undefined {
    let currentFile: FileLib | undefined;
    let currentMap = this.files;

    for (const segment of path) {
      currentFile = currentMap.get(segment);

      if (!currentFile) {
        return undefined; // If file not found, return undefined
      }

      if (currentFile.children) {
        currentMap = currentFile.children;
      } else if (segment !== path[path.length - 1]) {
        return undefined; // If not the last segment and no children, return undefined
      }
    }
    const files = currentFile?.children?.entries().map(([, file]) => file);
    if (files) return Array.from(files);
    else return [];
  }

  writeFile(path: string[], file: FileLib): void {
    path.push(file.name);
    let currentMap = this.files;
    // Traverse the path until we reach the second-to-last directory
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i];
      // Get the current file/folder at the path segment
      let currentFile = currentMap.get(segment);

      // If the segment doesn't exist, create a new folder
      if (!currentFile) {
        currentFile = new FileLib(
          segment,
          "application/vnd.google-apps.folder", // Google Drive type for folders
          false, // Not downloaded by default
          segment,
          path.slice(0, i + 1)
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
    const lastSegment = path[path.length - 1];
    currentMap.set(lastSegment, file);
  }
}

// SerializedFileLib Class
export class SerializedFileLib implements Omit<FileType, "children"> {
  id: string;
  name: string;
  mimeType: string;
  path?: string[];
  size?: number;
  children?: [string, SerializedFileLib][];
  constructor(
    id: string,
    name: string,
    mimeType: string,
    isDownloaded: boolean,
    size?: number,
    path?: string[],
    children?: [string, SerializedFileLib][]
  ) {
    this.name = name;
    this.mimeType = mimeType;
    this.isDownloaded = isDownloaded == true;
    this.size = size;
    this.id = id;
    this.path = path;
    this.children = children;
  }
  isDownloaded: boolean;

  parse(): FileLib {
    const fileLib = new FileLib(
      this.name,
      this.mimeType,
      this.isDownloaded,
      this.id,
      this.path,
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
          file.path
        )
    );
    return fsLib;
  }
}
