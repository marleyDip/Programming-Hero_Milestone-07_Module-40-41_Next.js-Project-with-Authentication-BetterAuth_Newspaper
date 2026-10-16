import {
  categoryHref,
  getCategoryNews,
  getHeadlines,
  getMostRead,
  getNewsDetails,
  getScrapableCategories,
  getSections,
} from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL.replace(/\/+$/, "");

  const [categories, sections, headlines, mostRead] = await Promise.all([
    getScrapableCategories(),
    getSections().catch(() => []),
    getHeadlines(50),
    getMostRead(),
  ]);

  // Collect additional articles from each scrapable category.
  const categoryResults = await Promise.all(
    categories.map(async (category) => {
      const categoryId = category.slug
        .replace(/^\/+/, "")
        .replace(/^category\//, "");

      try {
        const result = await getCategoryNews(categoryId);
        return result?.news ?? [];
      } catch {
        return [];
      }
    }),
  );

  // Merge article IDs from all available sources.
  const articleIds = new Set<string>();

  for (const article of [
    ...sections.flatMap((section) => section.articles),
    ...categoryResults.flat(),
    ...headlines,
    ...mostRead,
  ]) {
    if (article.id && (!("type" in article) || article.type !== "link")) {
      articleIds.add(article.id);
    }
  }

  // Verify each article and obtain its publication date.
  const articles = await Promise.all(
    [...articleIds].map(async (id) => {
      try {
        const article = await getNewsDetails(id);

        if (!article?.id || !article.title) return null;

        const timestamp = article.lastPublished ?? article.firstPublished;

        const lastModified = timestamp ? new Date(timestamp) : undefined;

        return {
          url: `${siteUrl}/news/${encodeURIComponent(article.id)}`,
          ...(lastModified && !Number.isNaN(lastModified.getTime())
            ? { lastModified }
            : {}),
        };
      } catch {
        return null;
      }
    }),
  );

  return [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },

    ...categories.map((category) => ({
      url: `${siteUrl}${categoryHref(category.slug)}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),

    ...articles.filter(
      (article): article is NonNullable<typeof article> => article !== null,
    ),
  ];
}

// app/sitemap.ts
/* import { categoryHref, getScrapableCategories } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getScrapableCategories();
  // console.log(categories);

  return [
    {
      url: SITE_URL,
      changeFrequency: "hourly",
      priority: 1,
    },

    ...categories.map((category) => ({
      url: `${SITE_URL}${categoryHref(category.slug)}`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];
} */

/* import type { MetadataRoute } from "next";

const SITE_URL = "https://bangla-brief.vercel.app/";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
} */

/* 
  "always"
  "hourly"
  "daily"
  "weekly"
  "monthly"
  "yearly"
  "never"

It's a hint to crawlers, not a command.

priority: 0.0 → 1.0

*/

/* import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://example.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
    },
  ];
} */
