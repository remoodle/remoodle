function escapeHtml(value: string | number): string {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function bold(value: string | number): string {
  return `<b>${escapeHtml(value)}</b>`;
}

export function italic(value: string | number): string {
  return `<i>${escapeHtml(value)}</i>`;
}

export function code(value: string | number): string {
  return `<code>${escapeHtml(value)}</code>`;
}

export function link(href: string, label: string | number): string {
  return `<a href="${escapeAttribute(href)}">${escapeHtml(label)}</a>`;
}
