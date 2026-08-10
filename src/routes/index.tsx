import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const SITE_URL = "https://dagrov-trade-connect.lovable.app";

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
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "DAGROV TRADE",
          url: `${SITE_URL}/`,
        }),
      },
    ],
  }),
  component: Index,
});

// The site itself is a static HTML/CSS/JS build in `public/site/`.
// This route renders a crawlable summary and forwards visitors to it.
function Index() {
  useEffect(() => {
    window.location.replace("/site/index.html");
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold text-foreground">
        DAGROV TRADE — International Agricultural Trade
      </h1>
      <p className="mt-4 text-muted-foreground">
        LLC DAGROV TRADE is an agricultural trading company specialising in bulk export supplies of
        Russian grains, pulses and oilseeds — coriander, chickpeas, lentils, flaxseed, mustard,
        safflower, millet and oats — to importers and processors in the Middle East, Asia, North
        Africa and Europe.
      </p>
      <p className="mt-4 text-muted-foreground">
        Every shipment follows GAFTA quality standards and Incoterms 2020, with independent surveyor
        inspection, phytosanitary certification and full container logistics to ports worldwide.
      </p>
      <p className="mt-6">
        <a href="/site/index.html" className="text-sm font-medium underline">
          Continue to the DAGROV TRADE website
        </a>
      </p>
    </main>
  );
}
