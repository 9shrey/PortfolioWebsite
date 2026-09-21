import type { Metadata } from "next";
import ContactView from "../components/contact/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Shrey Singh.",
};

export default function ContactPage() {
  return <ContactView />;
}
