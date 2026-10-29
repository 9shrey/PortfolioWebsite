import Plain from "./room/Plain";
import RoomGate from "./room/RoomGate";
import { roomContent } from "./room/content";

/** Home is the room. Underneath it, server-rendered, is the same content as a plain page: what
 *  search engines, screen readers and browsers without a GPU get (and anyone who asks for it). */
export default async function Home() {
  const content = await roomContent();
  return (
    <>
      <Plain c={content} />
      <RoomGate content={content} />
    </>
  );
}
