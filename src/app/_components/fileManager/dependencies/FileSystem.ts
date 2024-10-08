export interface FileType {
  id?: string;
  name: string;
  mimeType: string;
  isDownloaded: boolean;
  size?: number;
  shortcutDetails?: {
    targetId: string;
    targetMimeType: string;
  };
}
// FileLib and FullFileLib Classes
export class FileLib implements FileType {
  id?: string;
  name: string;
  mimeType: string;
  isDownloaded: boolean;
  real_path?: string;
  children?: Map<string, FileLib>;
  size?: number;
  constructor(
    name: string,
    mimeType: string,
    isDownloaded: boolean,
    id?: string,
    real_path?: string,
    children?: Map<string, FileLib>,
    size?: number
  ) {
    this.size = size;
    this.name = name;
    this.id = id;
    this.real_path = real_path;
    this.mimeType = mimeType;
    this.children = children || new Map<string, FileLib>();
    this.isDownloaded = isDownloaded == true;
  }

  serialize(): SerializedFileLib {
    return new SerializedFileLib(
      this.name,
      this.mimeType,
      this.isDownloaded,
      this.size,
      this.id,
      this.real_path,

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
}

// SerializedFileLib Class
export class SerializedFileLib implements FileType {
  id?: string;
  name: string;
  mimeType: string;
  real_path?: string;
  size?: number;
  children?: [string, SerializedFileLib][];
  constructor(
    name: string,
    mimeType: string,
    isDownloaded: boolean,
    size?: number,
    id?: string,
    real_path?: string,
    children?: [string, SerializedFileLib][]
  ) {
    this.name = name;
    this.mimeType = mimeType;
    this.isDownloaded = isDownloaded == true;
    this.size = size;
    this.id = id;
    this.real_path = real_path;
    this.children = children;
  }
  isDownloaded: boolean;

  parse(): FileLib {
    const fileLib = new FileLib(
      this.name,
      this.mimeType,
      this.isDownloaded,
      this.id,
      this.real_path,
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
          file.real_path
        )
    );
    return fsLib;
  }
}
