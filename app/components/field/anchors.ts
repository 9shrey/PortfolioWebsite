/** Elements that a figure is glued to. The light field draws whichever one
 *  is most in view; the element's box is the figure's box, every frame. */
const set = new Set<HTMLElement>();
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const anchors = {
  add(el: HTMLElement) {
    set.add(el);
    emit();
    return () => {
      set.delete(el);
      emit();
    };
  },
  all: () => set,
  /** Something about an anchor changed (stacking, visibility): re-pick. */
  ping: emit,
  subscribe(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};
