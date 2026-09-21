import Hero from "./Hero";
import Ledger from "./Ledger";
import WorkReel from "./WorkReel";
import Statement from "./Statement";
import Outro from "./Outro";

/** The scroll journey: a still title card, then the numbers that back it up,
 *  then work taking over the screen sideways, then a settling statement, then
 *  a decision. One crescendo, not five sections of equal weight. */
export default function HomeView() {
  return (
    <>
      <Hero />
      <Ledger />
      <WorkReel />
      <Statement />
      <Outro />
    </>
  );
}
