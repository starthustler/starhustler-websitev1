import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

describe("Solopreneur landing performance safeguards", () => {
  it("keeps the hero image eager and high priority with intrinsic dimensions", () => {
    const page = read("../client/src/pages/ManagedClassPage.jsx");
    const heroImage = page.match(
      /<ClassImage\s+src=\{c\.hero\.imageUrl\}[\s\S]*?\/>/,
    )?.[0];

    expect(heroImage).toBeTruthy();
    expect(heroImage).toContain('width="1920"');
    expect(heroImage).toContain('height="1080"');
    expect(heroImage).toContain("eager");
    expect(heroImage).toContain("solopreneurHeroSources");
  });

  it("loads Google Fonts without blocking the critical CSS path", () => {
    const css = read("../client/src/index.css");
    const html = read("../client/index.html");

    expect(css).not.toContain("fonts.googleapis.com");
    expect(html).toContain('rel="preconnect" href="https://fonts.gstatic.com"');
    expect(html).toContain('rel="preload"');
    expect(html).toContain("this.rel='stylesheet'");
  });

  it("keeps preview instrumentation out of production builds", () => {
    const config = read("../vite.config.ts");

    expect(config).toContain('command === "serve"');
    expect(config).toContain("vitePluginManusRuntime()");
  });

  it("lazy loads below-fold landing images with dimensions and async decoding", () => {
    const page = read("../client/src/pages/ManagedClassPage.jsx");
    const belowFoldSources = [
      { label: "story", pattern: /<ClassImage\s+[\s\S]*?c\.story\.imageUrl[\s\S]*?\/>/ },
      { label: "solution", pattern: /<ClassImage\s+src=\{c\.solution\.imageUrl\}[\s\S]*?\/>/ },
      { label: "mentor", pattern: /<ClassImage\s+src=\{c\.mentor\.imageUrl\}[\s\S]*?\/>/ },
      { label: "ebook", pattern: /<ClassImage\s+src=\{c\.ebook\.imageUrl\}[\s\S]*?\/>/ },
    ];

    for (const source of belowFoldSources) {
      const image = page.match(source.pattern)?.[0];
      expect(image, source.label).toBeTruthy();
      expect(image, source.label).toMatch(/width="\d+"/);
      expect(image, source.label).toMatch(/height="\d+"/);
      expect(image, source.label).not.toContain("eager");
    }
  });

  it("uses content visibility for long below-fold sections", () => {
    const css = read("../client/src/index.css");
    expect(css).toMatch(/\.class-deferred-section\s*\{[^}]*content-visibility:\s*auto/s);
    expect(css).toMatch(/\.class-deferred-section\s*\{[^}]*contain-intrinsic-size:/s);
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
