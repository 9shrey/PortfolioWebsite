"use client";

import { useEffect } from "react";
import { store, useStore } from "../ui/store";
import { filterCategories } from "@/app/data/projects";

/** Category filter for the cores. Jev's "filter the work by…" lands here
 *  too (through the store), and non-matching towers dim in 3D. */
export default function FilterChips() {
  const filter = useStore((s) => s.filter);

  // Hide rows that don't match (CSS reads data-filter on the list).
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".rows > li[data-tags]").forEach((li) => {
      const tags = (li.dataset.tags ?? "").split("|");
      li.hidden = filter !== "All" && !tags.includes(filter);
    });
  }, [filter]);

  return (
    <div className="filters" role="group" aria-label="Filter cores">
      {filterCategories.map((c) => (
        <button
          key={c}
          type="button"
          className="filter"
          data-ui=""
          aria-pressed={filter === c}
          onClick={() => store.set({ filter: c })}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
