import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap lost">
      <p className="kicker">404 · below the roof</p>
      <h1>Nothing measured here.</h1>
      <p>That page doesn&apos;t exist, or it moved when the site was rebuilt.</p>
      <p>
        <Link className="btn btn-primary" href="/">
          Back to the start
        </Link>{" "}
        <Link className="btn" href="/#work">
          See the work
        </Link>
      </p>
    </div>
  );
}
