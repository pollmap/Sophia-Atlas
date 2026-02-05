import { MetadataRoute } from "next";
import philosophersData from "@/data/persons/philosophers.json";
import religiousFiguresData from "@/data/persons/religious-figures.json";
import scientistsData from "@/data/persons/scientists.json";
import historicalFiguresData from "@/data/persons/historical-figures.json";
import eventsData from "@/data/entities/events.json";
import ideologiesData from "@/data/entities/ideologies.json";
import movementsData from "@/data/entities/movements.json";
import institutionsData from "@/data/entities/institutions.json";
import textsData from "@/data/entities/texts.json";
import conceptsData from "@/data/entities/concepts.json";
import religionsData from "@/data/religions.json";

const BASE_URL = "https://sophia-atlas.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const allPersons = [
    ...philosophersData,
    ...religiousFiguresData,
    ...scientistsData,
    ...historicalFiguresData,
  ] as { id: string }[];

  const allEntities = [
    ...(eventsData as { id: string }[]),
    ...(ideologiesData as { id: string }[]),
    ...(movementsData as { id: string }[]),
    ...(institutionsData as { id: string }[]),
    ...(textsData as { id: string }[]),
    ...(conceptsData as { id: string }[]),
  ];

  const allReligions = religionsData as { id: string }[];

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/persons`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/entities`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/connections`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/search`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/philosophy/timeline`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/philosophy/graph`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/philosophy/questions`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/science`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/science/timeline`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/science/fields`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/history`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/history/timeline`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/culture`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/religion/map`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/religion/tree`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/religion/compare`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/learn`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Person pages
  const personPages: MetadataRoute.Sitemap = allPersons.map((p) => ({
    url: `${BASE_URL}/persons/${p.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Entity pages
  const entityPages: MetadataRoute.Sitemap = allEntities.map((e) => ({
    url: `${BASE_URL}/entities/${e.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // Religion pages
  const religionPages: MetadataRoute.Sitemap = allReligions.map((r) => ({
    url: `${BASE_URL}/religion/${r.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Philosophy detail pages (legacy routes)
  const philosophyPages: MetadataRoute.Sitemap = (philosophersData as { id: string }[]).map((p) => ({
    url: `${BASE_URL}/philosophy/${p.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...personPages,
    ...entityPages,
    ...religionPages,
    ...philosophyPages,
  ];
}
