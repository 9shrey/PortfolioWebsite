"use client";

import { openApp } from "./index";
import { projects } from "@/app/data/projects";

/** A file explorer over the five projects. */
export default function Projects() {
  return (
    <div className="os-files">
      <p className="os-path">~/projects · {projects.length} items</p>
      <table className="os-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Area</th>
            <th scope="col" className="num">
              Tests
            </th>
            <th scope="col" className="num hide-sm">
              Year
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.slug}>
              <td>
                <button type="button" className="os-file" onClick={() => openApp("case", p.slug)}>
                  <span aria-hidden>▸ </span>
                  {p.slug}.case
                </button>
              </td>
              <td>{p.area}</td>
              <td className="num">{p.testCount || "—"}</td>
              <td className="num hide-sm">{p.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
