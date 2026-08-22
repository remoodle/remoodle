const ROOM_CODE_PATTERN = /C1\.\d+\.\d+[A-Z]*/;

export function extractRoomCode(location: string): string | null {
  return location.match(ROOM_CODE_PATTERN)?.[0] ?? null;
}

export function sanitizeRoomFilename(room: string): string {
  return room.replace(/[/\\?%*:|"<>.\s]/g, "-");
}

export function getUniqueRooms(items: { isOnline: boolean; location: string }[]): string[] {
  const seen = new Set<string>();
  const rooms: string[] = [];
  for (const item of items) {
    if (!item.isOnline) {
      const code = extractRoomCode(item.location);
      if (code && !seen.has(code)) {
        seen.add(code);
        rooms.push(code);
      }
    }
  }
  return rooms;
}
