/** A hook into the light field for code outside it: SHREY-OS's boot uses
 *  it to drop a wall over the POST screen and lift it onto the desktop.
 *  `wall` is null whenever the field can't run; callers then just swap. */
export const fx = {
  wall: null as null | ((label: string, swap: () => void) => Promise<void>),
};

/** Wall if possible, plain swap otherwise. */
export function wall(label: string, swap: () => void) {
  return fx.wall ? fx.wall(label, swap) : Promise.resolve(swap());
}
