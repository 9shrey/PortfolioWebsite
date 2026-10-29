# Shrey Singh — portfolio

A desk at night by a rainy window in New York, in the browser. Everything on the desk is a page:

| Object | Opens |
| --- | --- |
| GPU cards in the stepped rack | Work: click one and it moves into the test bench; the projector shows its slide, with links to the case study and GitHub and the next/previous card drawn on it |
| ID badge | About |
| Notebook | Writing |
| Phone | Contact |
| Wall planner | This year's goals (`app/data/goals.ts`) |
| Paper tray | Résumé |
| Books on the eye-level shelf | Books (`assets/room/books.json`) |

There are no side panels: About, Writing, Contact, Résumé and Books are paper cards that float up off
the desk (`app/room/engine/cards.ts`), and their links are clickable on the card itself.

Rest the pointer near an edge of the screen (or drag) to look around the room, all the way round.
Typing on your keyboard presses the same keys on the desk. The wall clock keeps your local time; click
it and the battery falls out. The mug, plant, posters and bench fan respond to clicks too. Settings
(quality, glow, grain, camera sway, frame rate) are remembered per browser. The hash in the URL mirrors the view
(`/#work/inferbench`, `/#about`, ...). Sound (rain and an original music-box waltz, both synthesised) is
off until the visitor turns it on. To use a recording instead, put it in `public/room/` and set `MUSIC_URL` in `app/room/engine/audio.ts`.

Built with Next.js 16, React 19, three.js and TypeScript. Inspired by felixrieseberg.com.

## How it's made

The room is modelled and lit in Blender from a script, then baked: each surface's finished, lit look
is rendered into a few texture atlases, so the browser only draws textured triangles and stays fast.

```
scripts/room/fetch.mjs     CC0 models + textures from Poly Haven -> assets/room/src (gitignored)
scripts/room/textures.py   card labels, ID badge, résumé page -> assets/room/src/gen
scripts/room/build.py      builds the room in Blender (Z-up) and renders previews
scripts/room/bake.py       bakes atlases + shade maps, exports public/room/room.glb and scene.json
scripts/room/blender.sh    runs Blender headless (system install or the Flathub app)
assets/room/cards.json     the cards, in rack order (shared by the build and the page)
```

```sh
npm run room:fetch                 # once
npm run room                       # textures -> bake (~25 min on a GTX 1650) -> compress
scripts/room/blender.sh --python scripts/room/build.py -- preview /tmp/p.png   # quick look first
```

**Live surfaces** (the planner, the projector screen, posters, card labels, badge, résumé) are not
baked into the atlases. Each gets a small *shade* map instead: a bake of a white stand-in. The page
draws the picture and multiplies it by that shade, so it stays sharp up close and can change without
a rebake.

On top of the bake (`app/room/engine/fx.ts`): a glow on the brightest things (lamp, projected slide,
lit windows), a vignette and fine grain, and the projector's beam with dust in it. On slow machines the
glow is the first thing dropped, then resolution.

The view out of the window is a real photograph, Midtown at night from Top of the Rock by
[Anthony Delanoix](https://unsplash.com/photos/aerial-photography-of-empire-state-building-during-nighttime-79HoTuHnNsc)
on Unsplash (Unsplash License), cropped and softened into `public/room/nyc.webp`. It sits 10 m behind
the glass for real parallax; a shader adds flickering windows, rain falling past and drops on the
glass (`app/room/engine/city.ts`).

## Where things are

| Path | What |
| --- | --- |
| `app/page.tsx` | Home: the room, over a plain server-rendered copy of the same content |
| `app/room/` | The room: engine, city, sound, surfaces, panels, styles |
| `app/room/script.ts` | Head script: WebGL 2 on a real GPU gets the room; software renderers get the plain page |
| `app/(pages)/` | Case studies, posts, CV, /now: the printed pages (styles in `app/art.css`) |
| `app/data/` | Content: projects, experience, skills, goals, site identity |
| `content/writing/` | Posts (MDX) |

`?plain=1` shows the reading view; `?room=1` forces the room.

## Rules

Every number on the site traces to a project repo. Figures are labelled "measured" or "schematic".
