import path from "path";

export const pathJoin = (path1: string, path2: string) => {
  return path.join(path1, path2).replace(/\\/g, "/");
};
