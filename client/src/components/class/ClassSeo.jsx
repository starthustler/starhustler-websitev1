import { useEffect } from "react";

function setMeta(selector, attributes) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }
  Object.entries(attributes).forEach(([key, value]) =>
    node.setAttribute(key, value || "")
  );
}

export default function ClassSeo({ seo, faq }) {
  useEffect(() => {
    document.title = seo.title;
    setMeta('meta[name="description"]', {
      name: "description",
      content: seo.metaDescription,
    });
    setMeta('meta[property="og:title"]', {
      property: "og:title",
      content: seo.ogTitle || seo.title,
    });
    setMeta('meta[property="og:description"]', {
      property: "og:description",
      content: seo.ogDescription || seo.metaDescription,
    });
    setMeta('meta[property="og:image"]', {
      property: "og:image",
      content: seo.ogImage,
    });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute(
      "href",
      seo.canonicalUrl || window.location.href.split("?")[0]
    );
    let script = document.getElementById("class-faq-schema");
    if (!script) {
      script = document.createElement("script");
      script.id = "class-faq-schema";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq
        .filter(item => item.enabled)
        .map(item => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    });
    return () => {
      document.getElementById("class-faq-schema")?.remove();
    };
  }, [seo, faq]);
  return null;
}
