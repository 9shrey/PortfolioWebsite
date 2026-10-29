import "./writing.css";

/** Writing gets its own quiet page, as on Felix's site: one column of type, light or dark. */
export default function WritingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="wx">{children}</div>;
}
