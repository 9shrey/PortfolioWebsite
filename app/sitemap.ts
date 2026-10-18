import type { MetadataRoute } from "next";
import { site } from "./data/site";
import { projects } from "./data/projects";
import { listPosts } from "./lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await listPosts()).filter((p) => p.status === "published");
  const u = (p: string) => `${site.url}${p}`;
  return [
    { url: u("/"), priority: 1 },
    ...projects.map((p) => ({ url: u(`/work/${p.slug}`), priority: p.featured ? 0.9 : 0.6 })),
    { url: u("/cv"), priority: 0.8 },
    { url: u("/now"), priority: 0.4 },
    { url: u("/writing"), priority: 0.6 },
    ...posts.map((p) => ({ url: u(`/writing/${p.slug}`), lastModified: p.date, priority: 0.7 })),
  ];
}
