"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Magnetic from "../motion/Magnetic";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/now", label: "Now" },
  { href: "/contact", label: "Contact" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Nav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      setSolid(y > 24);

      // Ignore sub-pixel jitter and the elastic overscroll region, otherwise
      // the bar flickers at the top of the page and during rubber-banding.
      if (Math.abs(delta) > 6 && y > 140) {
        setHidden(delta > 0);
      } else if (y <= 140) {
        setHidden(false);
      }

      lastY.current = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the overlay on navigation. Adjusted during render rather than in an
  // effect — React re-runs this component before committing, so the menu never
  // paints open on the new route the way an effect-based close would.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }

  // Lock the page behind the overlay, and let Escape dismiss it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[100]"
        animate={{ y: hidden && !open ? "-105%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div
          className={`transition-colors duration-500 ${
            solid && !open
              ? "border-b border-[var(--rule-soft)] bg-[var(--bg)]/80 backdrop-blur-xl"
              : "border-b border-transparent"
          }`}
        >
          <nav
            className="shell flex items-center justify-between"
            style={{ height: "var(--nav-h)" }}
            aria-label="Primary"
          >
            <Magnetic strength={0.2}>
              <Link
                href="/"
                className="group flex items-center gap-2.5"
                aria-label="Shrey Singh — home"
              >
                <span
                  aria-hidden
                  className="block h-1.5 w-1.5 rounded-full bg-[var(--signal)]"
                  style={{ boxShadow: "0 0 10px var(--signal)" }}
                />
                <span className="micro !text-[var(--fg)] transition-colors group-hover:!text-[var(--signal)]">
                  Shrey Singh
                </span>
              </Link>
            </Magnetic>

            <div className="hidden items-center gap-9 md:flex">
              {LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Magnetic key={link.href} strength={0.35}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className="micro relative block py-1 transition-colors duration-200 hover:!text-[var(--fg)]"
                      style={{ color: active ? "var(--signal)" : undefined }}
                    >
                      {link.label}
                      {active ? (
                        <motion.span
                          layoutId="nav-mark"
                          className="absolute -bottom-0.5 left-1/2 block h-px w-3 -translate-x-1/2 bg-[var(--signal)]"
                          transition={{ type: "spring", stiffness: 400, damping: 34 }}
                        />
                      ) : null}
                    </Link>
                  </Magnetic>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative z-10 -mr-2 flex h-10 w-10 items-center justify-center md:hidden"
            >
              <span aria-hidden className="relative block h-3 w-6">
                <motion.span
                  className="absolute left-0 top-0 block h-px w-6 bg-[var(--fg)]"
                  animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 block h-px w-6 bg-[var(--fg)]"
                  animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                />
              </span>
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            key="menu"
            className="fixed inset-0 z-[95] flex flex-col justify-between bg-[var(--bg)] md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <nav
              className="shell flex flex-1 flex-col justify-center gap-1 pt-20"
              aria-label="Mobile"
            >
              {LINKS.map((link, i) => (
                <span key={link.href} className="block overflow-hidden py-1">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%", transition: { duration: 0.25, ease: EASE } }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="display flex items-baseline gap-4 text-[clamp(2.5rem,13vw,4rem)]"
                      style={{
                        color: isActive(link.href) ? "var(--signal)" : undefined,
                      }}
                    >
                      <span className="micro !text-[var(--fg-mute)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {link.label}
                    </Link>
                  </motion.span>
                </span>
              ))}
            </nav>

            <motion.div
              className="shell flex flex-wrap gap-x-6 gap-y-2 pb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.4 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <a href="mailto:9shrey@gmail.com" className="micro">
                Email
              </a>
              <a
                href="https://github.com/9shrey"
                target="_blank"
                rel="noreferrer"
                className="micro"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/9shrey"
                target="_blank"
                rel="noreferrer"
                className="micro"
              >
                LinkedIn
              </a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
