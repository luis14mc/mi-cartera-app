---
name: Canopy Nocturne
colors:
  surface: '#171212'
  surface-dim: '#171212'
  surface-bright: '#3e3838'
  surface-container-lowest: '#120d0d'
  surface-container-low: '#201a1a'
  surface-container: '#241e1e'
  surface-container-high: '#2e2928'
  surface-container-highest: '#3a3333'
  on-surface: '#ebe0df'
  on-surface-variant: '#bccbb9'
  inverse-surface: '#ebe0df'
  inverse-on-surface: '#352f2f'
  outline: '#869485'
  outline-variant: '#3d4a3d'
  surface-tint: '#54e076'
  primary: '#54e076'
  on-primary: '#003914'
  primary-container: '#1eb854'
  on-primary-container: '#004117'
  inverse-primary: '#006e2d'
  secondary: '#44e2cd'
  on-secondary: '#003731'
  secondary-container: '#03c6b2'
  on-secondary-container: '#004d44'
  tertiary: '#bbcabd'
  on-tertiary: '#26332a'
  tertiary-container: '#95a498'
  on-tertiary-container: '#2d3a31'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#73fe90'
  primary-fixed-dim: '#54e076'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#62fae3'
  secondary-fixed-dim: '#3cddc7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#d7e6d9'
  tertiary-fixed-dim: '#bbcabd'
  on-tertiary-fixed: '#121e16'
  on-tertiary-fixed-variant: '#3c4a40'
  background: '#171212'
  on-background: '#ebe0df'
  surface-variant: '#3a3333'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 46px
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses a nocturnal, bio-organic elegance rooted in deep forest undergrowth and dark timber soils. Rejecting high-glare neon aesthetics and harsh pure blacks, it constructs a serene, contemplative digital sanctuary. The emotional register is grounded, tranquil, protective, and unmistakably premium.

The aesthetic philosophy draws on organic minimalism tempered with natural tactile warmth. Deep roasted espresso charcoals establish an earthy foundation, allowing refined chlorophyll greens, botanical emeralds, and misted eucalyptus sages to glow naturally without abrasive synthetic glare. Layouts emphasize breathing room, quiet content pacing, disciplined typography, and soft pillular interaction zones.

## Colors

The color palette grounds the UI in primordial earthen depths and natural botanical luminescences:

- **Earthen Foundation (Base tiers):**
  - Surface Background (`base-300`): `#100c0c` — Root soil depth; foundational canvas.
  - Intermediate Canvas (`base-200`): `#140f0f` — Sunken panels and structural structural trays.
  - Surface Card/Container (`base-100`): `#171212` — Raised timber espresso surfaces.
- **Accents & Growth:**
  - Primary (`#1eb854`): Canopy emerald. Directs primary calls-to-action, active indicators, and organic key highlights.
  - Secondary (`#2dd4bf`): Muted eucalyptus sage. Applied to supportive filters, secondary badges, and ambient atmospheric accents.
  - Tertiary / Surface Border (`#26332a`): Deep slate forest moss. Defines quiet structural divisions, outlines, and inactive control plates.
- **Typography & Content:**
  - On-Surface Base: `#e2e8f0` (Warm Ivory / Bleached Birch), preventing glare while ensuring crisp WCAG AAA legibility.
  - Muted Copy: `#94a3b8` tinted softly toward lichen gray.

## Typography

The typographical pair establishes an intentional dialogue between welcoming organic geometry and Swiss utilitarian readability:

- **Display & Headings (Plus Jakarta Sans):** Its subtle rounded apertures echo the natural contours of botanical shapes, bringing warmth and approachable authority to key titles and section banners.
- **Body & Controls (Inter):** Highly legible, neutral, and precise. Used for high-density content, field labels, metadata, and buttons to preserve total clarity and effortless scanning.
- **Rhythm & Line Height:** Line heights are open and generous to complement the dark backdrop, preventing visual crowding and eye fatigue.

## Layout & Spacing

The layout structure relies on a fluid grid bounded by generous structural breathing room:

- **Canvas Organization:** A 12-column responsive fluid grid on desktop (`>1024px`) transitioning to an 8-column layout on tablets (`640px - 1023px`), and a 4-column layout on mobile (`<640px`).
- **Margins & Gutters:** Desktop experiences leverage standard margins of `2rem` (expanding up to `4rem` on wide displays) with `1.5rem` gutters. Mobile views condense to `1rem` margins and gutters.
- **Spacing Cadence:** Vertical progression adheres to disciplined multiples of `0.5rem` (`space-sm`), reserving wide `space-xl` gaps between distinct organic groups to ensure visual calm.

## Elevation & Depth

Visual hierarchy abandons traditional harsh drop shadows in favor of tonal stepping and low-contrast botanical outlines:

- **Tonal Stepping:** Surfaces elevate by stepping up from deep earthen base (`base-300: #100c0c`) to shelf base (`base-200: #140f0f`) to elevated card surfaces (`base-100: #171212`).
- **Lichen Edge Outlines:** Higher elevation surfaces feature subtle 1px structural boundaries tinted with forest slate: `rgba(38, 51, 42, 0.45)`.
- **Canopy Ambient Glows:** Elevated floating components (modals, dropdown drawers) receive deeply diffused, low-opacity shadows with an organic undertone: `0 12px 32px -4px rgba(10, 8, 8, 0.7), 0 4px 12px rgba(30, 184, 84, 0.04)`.

## Shapes

The design system incorporates a dual-tier curvature philosophy balancing structural presence with tactile softness:

- **Containers & Structural Surfaces:** Employ standard rounded boundaries (`1rem` / `rounded-lg`) mimicking softened timber blocks and river stone geometry.
- **Interactive Controls (Inputs, Buttons, Badges):** Sculpted into full pill shapes (`rounded-full` / `2rem`), delivering inviting, ergonomic touchpoints that soften the dark canvas.

## Components

### Buttons
- **Primary:** Full-pill shaped (`2rem`), coated in canopy emerald (`#1eb854`), text set in dark espresso (`#100c0c`, `Inter 600`). On hover, smoothly transitions brightness with subtle internal radiance.
- **Secondary:** Eucalyptus sage outline or semi-translucent fill (`rgba(45, 212, 191, 0.12)`) paired with `#2dd4bf` label text.
- **Ghost/Tertiary:** Quiet timber surface (`base-100`), framed by `1px` solid `#26332a`, text rendered in `#e2e8f0`.

### Input Fields
- Enclosed in elongated pill containers (`2rem` border-radius) built on `#140f0f` (`base-200`) background with a 1px border of `#26332a`.
- Focus states smoothly activate an inner highlight and border transition to canopy emerald (`#1eb854`) with zero abrasive outer rings.

### Cards & Panels
- Structured with `1rem` corner rounding, resting on `#171212` (`base-100`) with a faint perimeter boundary of `1px solid rgba(38, 51, 42, 0.4)`. Internal content uses `space-lg` padding.

### Chips & Badges
- Pill-shaped tags using muted moss and eucalyptus backdrops (`rgba(45, 212, 191, 0.1)`) with crisp typography (`label-sm`, letter spacing `0.02em`).

### Checkboxes & Radios
- Rounded checkbox corners (`0.25rem`) and circular radio discs encased in `#26332a` borders. Checked states fill with `#1eb854` and display crisp `#100c0c` icons.

### Lists & Navigation
- Flat, minimal dividers using `#26332a`. Selected list items receive a rounded pill background wash (`rgba(30, 184, 84, 0.08)`) with a left emerald pip.