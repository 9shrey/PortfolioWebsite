import { mode } from "../mode/mode";

/** Leave the OS for a professional page (a full case study, a post): the
 *  route changes under the wall that brings the résumé back. */
export function goPro(push: (href: string) => void, href: string) {
  push(href);
  mode.request("pro");
}
