---
version: "alpha"
name: "Remoodle"
description: "Warm paper white, slate grotesk type, grained mist cards and pencil-scribble doodles around calm calendar panes. A student calendar that sells calm with a hand-drawn wink."
colors:
  primary: "#126bbf"
  primary-active: "#0d579c"
  on-primary: "#ffffff"
  surface: "#fbfaf7"
  surface-container: "#eef2f7"
  on-surface: "#24282c"
  on-surface-variant: "#5b626a"
  outline: "#e5e2db"
  night: "#24282c"
  blue: "#126bbf"
  blue-soft: "#e2edf9"
  teal: "#0f7a8a"
  teal-soft: "#d9f1f3"
  amber: "#a8560b"
  amber-soft: "#fbe9d3"
  green: "#23864f"
  green-soft: "#d9f4e2"
  violet: "#4c48c9"
  violet-soft: "#e7e6fb"
  red: "#b3261e"
  red-soft: "#fbd3d0"
typography:
  headline-display:
    fontFamily: "Hanken Grotesk"
    fontSize: 72px
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: "Hanken Grotesk"
    fontSize: 44px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.03em
  title-md:
    fontFamily: "Hanken Grotesk"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.02em
  body-md:
    fontFamily: "Hanken Grotesk"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: "Hanken Grotesk"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
rounded:
  xs: 6px
  sm: 8px
  md: 12px
  lg: 28px
  full: 999px
spacing:
  unit: 4px
  section: 110px
  max-width: 1200px
---

# Remoodle

> A warm paper desk with a calm week laid out on it, big slate grotesk type, grained mist cards, and a pencil that keeps doodling in the margins.

Adapted from the Sleight flavor (https://flavors.design/f/sleight) and recoloured around the ReMoodle mark (`#126bbf`): a cap on a stem between two pillars.

## Overview

A calendar for university students that sells calm without looking like a school portal. The page is a warm off-white, the type is a tight, heavy grotesk in slate, and every claim is shown as a real calendar pane: a sidebar with a month picker and calendar toggles, a week of colour-coded classes, and one glowing blue popover that is the Telegram reminder the bot is about to send. Around those panes a pencil has been at work: a spiral and a few dashes sit beside the pane. Feature cards are mist (`#eef2f7`) with a fine grain, rounded 28px, with a white mini-UI cropped at the bottom edge.

The product is Remoodle Calendar: classes from My DU and deadlines from Moodle in one week view, with reminders in Telegram and an iCal feed for any other calendar app. It is NOT a dark developer page and NOT a university portal: no neon, no glass, no gradients on buttons, no stock photos, no crests.

The same system carries the product. Inside the app the doodles disappear, panes become the whole screen, and the blue stays rare: the primary action, today's date, the current-time line and the active sidebar item.

## Colors

| Role        | Value     | Notes                                                                             |
| ----------- | --------- | --------------------------------------------------------------------------------- |
| bg          | `#fbfaf7` | the paper; most of the page and the app canvas                                    |
| bg-2        | `#eef2f7` | mist: feature cards, pill tabs, hovered rows, the sidebar                         |
| fg          | `#24282c` | slate ink for headlines, the dark button and doodle outlines                      |
| fg-muted    | `#5b626a` | body copy, captions, time labels                                                  |
| accent      | `#126bbf` | ReMoodle blue (the logo mark): the primary CTA, the glowing popover border, today |
| accent-down | `#0d579c` | the primary button while pressed or hovered                                       |
| accent-fg   | `#ffffff` | text on the blue button                                                           |
| border      | `#e5e2db` | warm hairlines and the pencil scribble colour (mixed with mist)                   |
| night       | `#24282c` | the dark secondary button, tooltips, the dark app tile                            |

Event colours are fixed per calendar so a week reads at a glance. Each has an ink and a soft fill; events use the soft fill with the ink for text.

| Calendar           | Ink       | Soft      |
| ------------------ | --------- | --------- |
| Lectures           | `#126bbf` | `#e2edf9` |
| Online classes     | `#0f7a8a` | `#d9f1f3` |
| In-person practice | `#a8560b` | `#fbe9d3` |
| Moodle assignments | `#23864f` | `#d9f4e2` |
| Quizzes and events | `#4c48c9` | `#e7e6fb` |
| Attendance         | `#5b626a` | `#e9ebee` |

Blue is the only brand accent. It appears on one big button per view, the popover border, today's date and the current-time line; never on body text except links.

### Night scheme

Derived from the logo's slate. `bg #1b1e21`, `bg-2 #24282c`, `fg #eef0f2`, `fg-muted #a1a8b0`, `border rgb(255 255 255 / 9%)`, `accent #2f86d9` with white text. Soft event fills become 22% tints of their ink over slate.

## Typography

- Display and body: `"Hanken Grotesk Variable", system-ui, sans-serif` — one family. Headlines at 600 with `-0.04em` at 72px, `-0.03em` at 44px; body 400 at 15px/1.5; buttons and labels 500.
- Scale: 11 / 12 / 13 / 14 / 15 / 17 / 19 / 22 / 28 / 34 / 44 / 56 / 72
- Load: `@fontsource-variable/hanken-grotesk`
- Rules: headlines are sentence case, tight and heavy, in slate (never pure black). Lead copy is 19px in muted slate, centred under the headline, 620px wide at most. The wordmark is lowercase 700 with `-0.06em` tracking. Eyebrows are small muted labels above card titles, never uppercase.
- Numbers in the calendar (dates, times) use tabular figures.

## Layout

- Max width 1200px, centred with 20px side gutters; the hero pane caps at 1000px
- Base unit 4px; spacing scale 4 / 8 / 12 / 16 / 24 / 40 / 64 / 110
- Section rhythm 110px vertical; everything on the landing page is centred
- Hero: centred headline, lead, a blue pill CTA, then the calendar pane cropped at the bottom with doodles behind and the reminder popover overlapping its lower left
- Mist trio: three equal cards, label then title then copy, with a cropped white mini-UI filling the lower half
- App: a 272px sidebar on mist beside a full-height paper canvas; the calendar toolbar is 56px; no page padding around the grid
- Density: airy on the landing page, compact in the app (32px controls, 13px event text)

## Elevation & Depth

Paper on a desk: flat warm sections, white panes that float a little, mist cards that sit flat with grain.

- Panes and mini-UIs: `0 1px 3px rgb(36 40 44 / 10%), 0 6px 18px rgb(36 40 44 / 7%)` on white with a 1px 10% slate hairline.
- The reminder popover glows: `border: 1.5px solid var(--primary); box-shadow: 0 0 28px color-mix(in srgb, var(--primary) 22%, transparent)`. It is the only glow on the page and never appears inside the app.
- Mist cards carry grain: an SVG `feTurbulence` noise tile in `::after` at `opacity: 0.35` with `mix-blend-mode: multiply`, clipped by `overflow: hidden`.
- The sticky nav fades to `color-mix(in srgb, var(--background) 92%, transparent)` with an 8px backdrop blur — the only blur allowed.
- Menus, popovers and dialogs use the pane shadow. Nothing else casts a shadow.
- Forbidden: coloured drop shadows other than the popover glow, glass cards, gradient buttons.

## Shapes

- Radius: 6px on calendar events and checkboxes; 8px on menu items and inputs; 12px on small cards, popovers and dialogs; 28px on mist cards and the hero pane
- Pills (999px) on every button, chip, tab and badge
- Doodles are single-stroke 2px lines with round caps and loose curves: a spiral and four dashes beside the hero pane
- Avatars are circles with initials on a soft blue; no photographs

## Components

- Buttons: pills. App size 32px / 14px weight 500; landing large 52px / 17px. Primary blue with white text; dark slate (`secondary`) with paper text; outline 1px hairline for tertiary; ghost for toolbar icons. Hover only shifts the fill.
- Nav: sticky 64px bar, lowercase wordmark with the cap-and-pillars mark, a dark Sign in button. The landing page is the nav, the hero and the mist trio under a centred title and lead; nothing else.
- Calendar pane: white, 28px top corners, a sidebar (month picker, calendar toggles with coloured dots) beside a week grid with 64px hours. Events are soft fills with an ink title, a muted time line and the room; past events fade to 60%.
- Sidebar (app): mist surface, 272px. Items are 32px rows with a 16px icon; hover and active backgrounds are one shared highlight that travels between rows on a fast critically damped spring; the active row also shifts to semibold and the icon stroke thickens from 1.5 to 2. Calendar toggles are rows with a coloured dot and a check that appears on hover. Course filters nest under a course row with a left hairline. `[` collapses the sidebar.
- Reminder popover: white, 14px radius, blue glow, the bot avatar, two lines of copy and a time.
- Mist card: muted eyebrow, 28px title, a sentence, then a white mini-UI cropped at the bottom.

## Do's and Don'ts

- Do show the product as real panes built from the real calendar components.
- Do let pencil doodles break the edge of a pane: a spiral and dashes, never around type.
- Do use mist cards with grain for every feature panel and crop the white mini-UI at the bottom.
- Do keep blue for one big button per view.
- Do write copy with concrete numbers and a calm, slightly wry tone.

- Don't use more than one typeface.
- Don't put the pencil colour on text; scribbles stay in mist-tinted strokes.
- Don't add gradients to buttons or glass to cards.
- Don't use photographs; avatars are initials on a soft fill.
- Don't colour headlines; they stay slate.
- Don't let a doodle cover body copy.
- Don't use uppercase labels or section titles.
- Don't draw doodles inside the app.

## Motion

- Duration 130ms, easing `cubic-bezier(0.215, 0.61, 0.355, 1)` for colour changes
- Springs (critically damped): fast 80ms for hover highlights, moderate 160ms for menus and the sidebar highlight between sections, slow 240ms with a little bounce for the sidebar collapsing
- What animates: button and link colours, tab pill fills, the sidebar highlight, the popover rising into place on load (900ms), the current-time line
- What never animates: mist cards, doodles, panes, the calendar grid, anything moving on scroll
- All animation respects `prefers-reduced-motion`; travel collapses to a fade and the first frame is complete without it

## Reference CSS

```css
:root {
  --background: #fbfaf7;
  --muted: #eef2f7;
  --foreground: #24282c;
  --primary: #126bbf;
  --radius-lg: 28px;
  --grain: 0.35;
}
.mist {
  position: relative;
  background: var(--muted);
  border-radius: var(--radius-lg);
  overflow: hidden;
  isolation: isolate;
}
.mist::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--noise);
  opacity: var(--grain);
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: -1;
}
.glow {
  border: 1.5px solid var(--primary);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 0 28px color-mix(in srgb, var(--primary) 22%, transparent);
}
```

## How to apply this flavor

1. Use the tokens in `src/styles.css`; never write a raw hex in a component.
2. Set headlines with the `type-*` utilities; keep lead copy muted and centred.
3. Show the product as white panes built from the real calendar components, with one blue-glow reminder popover; put features on grained mist cards with a cropped mini-UI.
4. Draw the pencil motif on the landing page only: a spiral and dashes behind the pane.
5. Keep motion to colour swaps, the sidebar highlight, the popover rise and the time line; check the Don't list before finishing.
6. The live reference for every token and component is `/design-system`.
