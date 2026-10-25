"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="wrap lost">
      <p className="kicker">Error</p>
      <h1>Something broke.</h1>
      <p>This page hit an error while rendering. Trying again usually works.</p>
      <p>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>{" "}
        <Link className="btn" href="/">
          Home
        </Link>
      </p>
    </div>
  );
}
