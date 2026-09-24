import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

describe("Solopreneur landing performance safeguards", () => {
  it("keeps the hero image eager and high priority with intrinsic dimensions", () => {
    const page = read("../client/src/pages/ManagedClassPage.jsx");
    const heroImage = page.match(
      /<img\s+src=\{c\.hero\.imageUrl\}[\s\S]*?\/>/,
    )?.[0];

    expect(heroImage).toBeTruthy();
    expect(heroImage).toContain('width="1920"');
    expect(heroImage).toContain('height="1080"');
    expect(heroImage).toContain('fetchPriority="high"');
    expect(heroImage).not.toContain('loading="lazy"');
  });

  it("lazy loads below-fold landing images with dimensions and async decoding", () => {
    const page = read("../client/src/pages/ManagedClassPage.jsx");
    const belowFoldSources = [
      "c.story.imageUrl",
      "c.solution.imageUrl",
      "c.mentor.imageUrl",
      "c.ebook.imageUrl",
    ];

    for (const source of belowFoldSources) {
      const escaped = source.replaceAll(".", "\\.");
      const image = page.match(
        new RegExp(`<img\\s+src=\\{${escaped}\\}[\\s\\S]*?\\/>`),
      )?.[0];
      expect(image, source).toBeTruthy();
      expect(image, source).toMatch(/width="\d+"/);
      expect(image, source).toMatch(/height="\d+"/);
      expect(image, source).toContain('loading="lazy"');
      expect(image, source).toContain('decoding="async"');
    }
  });

  it("keeps YouTube behind a click-to-play facade", () => {
    const video = read("../client/src/components/class/ClassVideo.jsx");

    expect(video).toContain("playing ? (");
    expect(video).toContain("onClick={() => setPlaying(true)}");
    expect(video).toContain("youtube-nocookie.com/embed");
    expect(video).toContain('loading="lazy"');
    expect(video).toContain('width="1280"');
    expect(video).toContain('height="720"');
  });

  it("code-splits non-landing routes while keeping the managed class route eager", () => {
    const app = read("../client/src/App.jsx");

    expect(app).toContain('import ManagedClassPage from "./pages/ManagedClassPage.jsx"');
    expect(app).toContain('const AdminClassEditorPage = lazy(() => import("./pages/AdminClassEditorPage.jsx"))');
    expect(app).toContain("<Suspense fallback={null}>");
  });
});
