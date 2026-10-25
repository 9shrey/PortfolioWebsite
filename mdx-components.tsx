import type { MDXComponents } from "mdx/types";
import { Callout, PlateFigure, RooflineFigure, Stat } from "@/app/components/writing/mdx";

const components: MDXComponents = {
  Callout,
  PlateFigure,
  RooflineFigure,
  Stat,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
