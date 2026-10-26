import Link from "next/link";
import { Note } from "./components/pro/Pen";

export default function NotFound() {
  return (
    <div className="page lost">
      <p className="folio" aria-hidden>
        <span>Error</span>
        <span>Below the roof</span>
        <span>Shrey Singh · ML Systems</span>
      </p>
      <h1 className="lost-big">404</h1>
      <Note className="page-note" tilt={-5}>
        nothing measured here. not even noise.
      </Note>
      <p className="page-lede">That page doesn&apos;t exist, or it moved when the site was rebuilt.</p>
      <p className="acts">
        <Link className="act act-ink" href="/">
          Back to the start <span aria-hidden>→</span>
        </Link>
        <Link className="act" href="/#work">
          See the work <span aria-hidden>→</span>
        </Link>
      </p>
    </div>
  );
}
