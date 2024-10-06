export interface FileLib {
  id?: string;
  real_path?: string;
  type: string;
  children?: Map<string, FileLib>;
}

interface SerializedFileLib {
  id?: string;
  real_path?: string;
  type: string;
  children?: [string, SerializedFileLib][];
}

export interface FullFileLib extends FileLib {
  name: string;
}

export interface FSLib {
  files: Map<string, FileLib>;
  last_visited: Array<FullFileLib>;
}

export interface SerializedFSLib {
  files: [string, SerializedFileLib][];
  last_visited: Omit<FullFileLib, "children">[];
}

// Serialize FSLib to a JSON-compatible format
export function serializeFSLib(fsLib: FSLib): SerializedFSLib {
  if (!(fsLib instanceof Object)) {
    throw new TypeError("Expected an FSLib object.");
  }

  return {
    files: Array.from(fsLib.files.entries()).map(([key, value]) => [
      key,
      serializeFileLib(value),
    ]),
    last_visited: fsLib.last_visited.map((file) => ({
      id: file.id,
      real_path: file.real_path,
      type: file.type,
      name: file.name,
    })),
  };
}

// Serialize individual FileLib to a JSON-compatible format
function serializeFileLib(fileLib: FileLib): SerializedFileLib {
  return {
    id: fileLib.id,
    real_path: fileLib.real_path,
    type: fileLib.type,
    children: fileLib.children
      ? Array.from(fileLib.children.entries()).map(([key, child]) => [
          key,
          serializeFileLib(child),
        ])
      : undefined, // Use undefined instead of Map for children
  };
}

// Parse a serialized FSLib object back to FSLib
export function parseFSLib(serialized: SerializedFSLib): FSLib {
  const fsLib: FSLib = {
    files: new Map<string, FileLib>(),
    last_visited: [],
  };

  // Parse files
  serialized.files.forEach(([key, value]) => {
    fsLib.files.set(key, parseFileLib(value));
  });

  // Parse last_visited
  fsLib.last_visited = serialized.last_visited.map((file) => ({
    id: file.id,
    real_path: file.real_path,
    type: file.type,
    name: file.name,
  }));

  return fsLib;
}

// Parse individual SerializedFileLib back to FileLib
function parseFileLib(serialized: SerializedFileLib): FileLib {
  const fileLib: FileLib = {
    id: serialized.id,
    real_path: serialized.real_path,
    type: serialized.type,
    children: serialized.children ? new Map<string, FileLib>() : undefined,
  };

  // Parse children
  if (serialized.children) {
    serialized.children.forEach(([key, child]) => {
      fileLib.children!.set(key, parseFileLib(child));
    });
  }

  return fileLib;
}
