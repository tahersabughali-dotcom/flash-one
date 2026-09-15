export const FILE_MAX_BYTES = 20 * 1024 * 1024;
export const FILE_BUCKET = "project-files";

export const FILE_EXTENSIONS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "txt",
  "csv",
  "zip",
  "docx",
  "xlsx",
] as const;

export const FILE_VISIBILITIES = ["customer", "project_team", "internal"] as const;
export type FileVisibility = (typeof FILE_VISIBILITIES)[number];

export const FILE_VISIBILITY_LABELS: Record<FileVisibility, string> = {
  customer: "Visible to customer",
  project_team: "Project team",
  internal: "Internal",
};

export const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  txt: "text/plain",
  csv: "text/csv",
  zip: "application/zip",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
