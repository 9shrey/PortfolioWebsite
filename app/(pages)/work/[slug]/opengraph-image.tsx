import { OG_SIZE, renderOg } from "@/app/components/art/og";
import { getProjectBySlug, projects } from "@/app/data/projects";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Project plate and headline results";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProjectBySlug(slug) ?? projects[0];
  return renderOg({ kicker: p.area, title: p.title, metrics: p.headline, slug: p.slug });
}
