import { useState } from "react";
import { Play } from "lucide-react";
import { getYouTubeId } from "@shared/youtube";

export default function ClassVideo({ config }) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYouTubeId(config.url);
  if (!config.enabled || !videoId) return null;
  const thumbnail =
    config.customThumbnailUrl ||
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const ratio =
    config.aspectRatio === "9:16"
      ? "9 / 16"
      : config.aspectRatio === "4:3"
        ? "4 / 3"
        : "16 / 9";
  return (
    <section className="class-video-section section-shell" id="video">
      <div className="class-video" style={{ aspectRatio: ratio }}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title={config.title || "Video kelas"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="class-video__facade"
            onClick={() => setPlaying(true)}
            aria-label={`Putar ${config.title || "video kelas"}`}
          >
            <img
              src={thumbnail}
              alt={`Preview ${config.title || "video kelas"}`}
              width="1280"
              height="720"
              loading="lazy"
              decoding="async"
            />
            <span>
              <Play size={27} fill="currentColor" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
