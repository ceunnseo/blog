import { NotionFileLike } from "../types";
export const extractFileUrl = (file: NotionFileLike): string => {
  if (!file) return "";
  if (file.type === "external") return file.external?.url ?? "";
  if (file.type === "file") return file.file?.url ?? ""; // may be temporary
  return "";
};
