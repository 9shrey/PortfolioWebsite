import { createContext, useContext } from "react";
import type { Post } from "@/app/lib/posts";

/** What SHREY-OS gets from the server: posts can't be read in the browser. */
export const OsContext = createContext<{ posts: Post[] }>({ posts: [] });
export const useOs = () => useContext(OsContext);
