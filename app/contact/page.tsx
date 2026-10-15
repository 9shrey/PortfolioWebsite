import type { Metadata } from "next";
import { ContactBody } from "../components/sections/Bodies";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Shrey Singh.",
};

export default function ContactPage() {
  return <ContactBody />;
}
