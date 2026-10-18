"use client";

import { openApp } from "./index";

export const TRASH_FILE = "cuBLAS_dispatch_heuristic.bak";

export default function Trash() {
  return (
    <div className="os-files">
      <p className="os-path">~/.trash · 1 item</p>
      <table className="os-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Deleted</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <button type="button" className="os-file" onClick={() => openApp("note", TRASH_FILE)}>
                <span aria-hidden>▸ </span>
                {TRASH_FILE}
              </button>
            </td>
            <td>2026 · by inferbench</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
