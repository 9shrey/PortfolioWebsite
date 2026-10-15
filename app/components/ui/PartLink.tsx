"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { store, useStore } from "./store";

/** A link that is also a probe: hover or keyboard focus lights the matching
 *  part of the chip, and hovering that part in 3D lights this link back. */
export default function PartLink({
  part,
  href,
  className,
  children,
  ...rest
}: {
  part: string;
  href: string;
  className?: string;
  children: ReactNode;
  "aria-current"?: "page" | undefined;
}) {
  const lit = useStore((s) => s.hover === part);
  const on = () => store.set({ hover: part });
  const off = () => {
    if (store.get().hover === part) store.set({ hover: null });
  };
  return (
    <Link
      href={href}
      scroll={false}
      className={className}
      data-part={part}
      data-ui=""
      data-lit={lit || undefined}
      onMouseEnter={on}
      onMouseLeave={off}
      onFocus={on}
      onBlur={off}
      {...rest}
    >
      {children}
    </Link>
  );
}
