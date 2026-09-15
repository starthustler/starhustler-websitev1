export function getYouTubeId(value = ""): string {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be")
      return url.pathname.split("/").filter(Boolean)[0] || "";
    if (url.pathname.startsWith("/embed/"))
      return url.pathname.split("/")[2] || "";
    return url.searchParams.get("v") || "";
  } catch {
    return "";
  }
}
