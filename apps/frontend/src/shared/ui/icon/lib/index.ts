export const fileIcons = {
  "application/pdf": "vscode-icons:file-type-pdf2",
  "application/msword": "vscode-icons:file-type-word",
  "application/vnd.ms-word": "vscode-icons:file-type-word",
  "application/vnd.oasis.opendocument.text": "vscode-icons:file-type-word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml":
    "vscode-icons:file-type-word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "vscode-icons:file-type-word",
  "application/vnd.ms-excel": "vscode-icons:file-type-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml":
    "vscode-icons:file-type-excel",
  "application/vnd.oasis.opendocument.spreadsheet":
    "vscode-icons:file-type-excel",
  "application/vnd.ms-powerpoint": "vscode-icons:file-type-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml":
    "vscode-icons:file-type-powerpoint",
  "application/vnd.oasis.opendocument.presentation":
    "vscode-icons:file-type-powerpoint",
  "text/plain": "vscode-icons:file-type-text",
  "text/html": "vscode-icons:file-type-html",
  "text/x-python": "vscode-icons:file-type-python",
  "text/x-java": "vscode-icons:file-type-java",
  "text/x-c": "vscode-icons:file-type-c",
  "text/x-c++": "vscode-icons:file-type-cpp",
  "text/x-csharp": "vscode-icons:file-type-csharp",
  "text/x-php": "vscode-icons:file-type-php",
  "text/x-ruby": "vscode-icons:file-type-ruby",
  "text/x-perl": "vscode-icons:file-type-perl",
  "text/x-shellscript": "vscode-icons:file-type-shell",
  "text/x-sql": "vscode-icons:file-type-sql",
  "text/x-yaml": "vscode-icons:file-type-yaml",
  "text/x-markdown": "vscode-icons:file-type-markdown",
  "text/x-tex": "vscode-icons:file-type-tex",
  "text/x-cmake": "vscode-icons:file-type-cmake",
  "application/json": "vscode-icons:file-type-json",
  "application/gzip": "vscode-icons:file-type-zip",
  "application/zip": "vscode-icons:file-type-zip",
};

export const icons = {
  api: "carbon:api-1",
  error: "material-symbols:error-outline-rounded",
  arrow_left: "ic:round-arrow-back",
  search: "ic:sharp-search",
  sun: "material-symbols:sunny-rounded",
  moon: "material-symbols:dark-mode",
  edit: "ic:round-edit",
  add: "ic:round-add",
  delete: "ic:round-delete",
  file: "vscode-icons:default-file",
  people: "fluent:people-add-20-filled",
  ...fileIcons,
} as const;
