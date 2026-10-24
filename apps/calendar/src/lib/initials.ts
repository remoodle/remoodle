/** Up to two initials for an avatar: "Aru Zhan" → "AZ", "aru_zh" → "AZ". */
export function initials(name: string) {
  return (
    name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("") || "A"
  );
}
