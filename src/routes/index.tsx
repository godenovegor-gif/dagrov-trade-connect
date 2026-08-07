import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DAGROV TRADE — Export of Grains, Pulses and Oilseeds" },
      {
        name: "description",
        content:
          "LLC DAGROV TRADE — bulk export supplies of Russian coriander, chickpeas, lentils, flaxseed, mustard, safflower, millet and oats. GAFTA standards, Incoterms 2020.",
      },
      { property: "og:title", content: "DAGROV TRADE — International Agricultural Trade" },
      {
        property: "og:description",
        content:
          "Bulk export supplies of Russian grains, pulses and oilseeds to the Middle East, Asia, North Africa and Europe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// The site itself is a static HTML/CSS/JS build in `public/site/`.
// This route just forwards the root URL to it.
function Index() {
  useEffect(() => {
    window.location.replace("/site/index.html");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <a href="/site/index.html" className="text-sm text-muted-foreground underline">
        DAGROV TRADE
      </a>
    </div>
  );
}
