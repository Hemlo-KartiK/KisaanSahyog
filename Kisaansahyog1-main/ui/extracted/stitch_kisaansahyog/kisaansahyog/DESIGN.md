---
name: KisaanSahyog
colors:
  surface: '#fdf9f1'
  surface-dim: '#dddad2'
  surface-bright: '#fdf9f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3eb'
  surface-container: '#f1ede6'
  surface-container-high: '#ece8e0'
  surface-container-highest: '#e6e2da'
  on-surface: '#1c1c17'
  on-surface-variant: '#41493f'
  inverse-surface: '#31302b'
  inverse-on-surface: '#f4f0e8'
  outline: '#71796e'
  outline-variant: '#c0c9bc'
  surface-tint: '#2e6b34'
  primary: '#12521e'
  on-primary: '#ffffff'
  primary-container: '#2e6b34'
  on-primary-container: '#a7e9a5'
  inverse-primary: '#95d693'
  secondary: '#805437'
  on-secondary: '#ffffff'
  secondary-container: '#fec29e'
  on-secondary-container: '#794e31'
  tertiary: '#5e4200'
  on-tertiary: '#ffffff'
  tertiary-container: '#7d5800'
  on-tertiary-container: '#ffd385'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f3ad'
  primary-fixed-dim: '#95d693'
  on-primary-fixed: '#002106'
  on-primary-fixed-variant: '#12521e'
  secondary-fixed: '#ffdbc7'
  secondary-fixed-dim: '#f4ba96'
  on-secondary-fixed: '#311300'
  on-secondary-fixed-variant: '#653d22'
  tertiary-fixed: '#ffdea8'
  tertiary-fixed-dim: '#fabc3e'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5e4200'
  background: '#fdf9f1'
  on-background: '#1c1c17'
  surface-variant: '#e6e2da'
typography:
  display:
    fontFamily: Source Serif 4
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
  display-mobile:
    fontFamily: Source Serif 4
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 1.375rem
    fontWeight: '600'
    lineHeight: 1.875rem
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  title-lg:
    fontFamily: Noto Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.625rem
  title-md:
    fontFamily: Noto Sans
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Noto Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Noto Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  label-lg:
    fontFamily: Noto Sans
    fontSize: 0.9375rem
    fontWeight: '600'
    lineHeight: 1.375rem
  label-md:
    fontFamily: Noto Sans
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  label-sm:
    fontFamily: Noto Sans
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system embodies the dignified, physical authority of the traditional rural ledger (*khata bahi*), paired with the living vitality of fertile, well-irrigated farmland. It serves agrarian producers and smallholders in rural India, many of whom are first-time smartphone users navigating digital interfaces under direct sunlight with weathered hands.

The visual style is **Tactile Ledger Heritage**: rooted in physical paper notebooks, ruled bookkeeping records, and official agricultural certificates, but refined into a resilient, high-affordance digital workspace. Rather than sterile corporate fintech or flat minimalist tech abstractions, the interface evokes warm cream parchment, structured hairline ink rules, deep fertile green prosperity, and rich earth tones. 

The emotional response must be immediate trust (*vishwas*), dignity (*samman*), clarity, and tactile reassurance. Every primary interaction prioritizes physical tangibility: high-contrast boundaries, prominent voice-first entry points, generous hit surfaces, and bilingual legibility that honors native regional scripts alongside English.

## Colors

The color palette translates the natural and ceremonial elements of agrarian enterprise into functional digital tokens:

- **Primary (`#2E6B34` - Deep Crop Green):** Represents vigorous standing crops, agricultural yield, and prosperity. It acts as the lead anchor for verified statuses, active states, key transactions, and primary actions.
- **Secondary (`#6B4226` - Soil Brown):** Rooted in tilled earth and traditional cloth-bound ledger bindings. Used for structural framing, key headers, and anchored contextual surfaces.
- **Tertiary (`#E0A526` - Harvest Gold):** Recalls ripe wheat, mustard blooms, and market liquidity. Deployed deliberately for pending states, highlights, advisories, and vital action callouts.
- **Neutral Canvas (`#FAF6EE` - Parchment Cream):** A non-glare, organic paper ground that reduces eye strain in outdoor conditions compared to harsh #FFFFFF whites.
- **Surface Crisp (`#FFFFFF`):** High-priority card interiors and elevated focal elements, encased in warm ledger rules (`#E8DCC8`).
- **Support Colors:** Clay Red (`#B3412E`) handles critical alerts, crop loss warnings, and debits; Soft Green tint (`#E6F2DF`) cushions positive confirmations and credit entries; Deep Carbon Earth (`#2B1D12`) governs all high-legibility body typography.

Light mode is the default and only active mode, calibrated precisely to resist intense outdoor ambient lighting and direct glare.

## Typography

Typography bridges formal record-keeping with clear readability for bilingual and multi-script layouts:

- **Headlines & Display (`Source Serif 4`):** Carries the formal weight of official ledger stamps, patwari records, and market receipts. Used for page titles, high-level summaries, and financial ledger totals.
- **Body & Functional UI (`Noto Sans`):** Selected for its comprehensive glyph support across Devanagari, Gurmukhi, and Latin scripts. Its open counters and clear aperture ensure immediate glyph differentiation even on low-resolution displays or degraded glass.

### Hierarchy & Script Pairing
All bilingual pairings position the regional script (e.g., Hindi or Punjabi) as the primary focal line (`title-lg` or `body-lg`), with English transliteration/translation placed directly below at one step smaller scale (`label-md` or `label-sm`) in a muted earth tone (`#6B4226`). Line heights are intentionally loosened to prevent conjunct glyph clipping (*matras* and *halants*) in Devanagari.

## Layout & Spacing

The layout operates on a flexible, vertical-first progressive grid calibrated for mobile handsets used with one hand in agricultural fields:

- **Mobile (<640px):** Single-column fluid stack with `1rem` outer margins and `1rem` gutters. Actions are thumb-accessible within the lower 60% of the display. Touch targets enforce a mandatory **minimum dimension of 56px × 56px** to accommodate calloused fingertips and one-handed operation.
- **Tablet & Desktop (≥640px to 1024px+):** Constrained card-book layout (max content container of 840px for single-task flows; 1200px 8-column layout for market dashboards) centered against the parchment background.

Vertical rhythm adheres strictly to an 8px base grid, scaled with component gaps defined by `space-sm` (8px), `space-md` (16px), and `space-lg` (24px). Critical action modules (Voice mic button, mandi price ticker, scan inputs) remain pinned or anchored to eliminate deep exploratory scroll hunting.

## Elevation & Depth

Visual hierarchy uses physical sheet-layering rather than synthetic digital blurs:

- **The Ledger Bed (Base Canvas):** `#FAF6EE` parchment ground represents the base notebook surface.
- **Structured Card Sheets:** `#FFFFFF` cards sit on top with a distinct `1px solid #E8DCC8` parchment rule border and a grounded earth shadow: `0px 2px 4px rgba(43, 29, 18, 0.06), 0px 4px 12px rgba(43, 29, 18, 0.04)`.
- **Raised Interactive Affordance:** Buttons and interactive touch nodes introduce tactile stamp-like depth using an offset base lip: a crisp bottom shadow (`0px 3px 0px #1E4622` for Deep Crop Green components) that visibly depresses to `0px 0px 0px` on active press.
- **Voice Overlays & Modals:** Floated at high elevation with a deep scrim (`rgba(43, 29, 18, 0.65)`), focusing total user attention on oral and audio cues.

## Shapes

The shape system adopts **Soft Geometry (`roundedness: 1`)** reflecting paper ledger corners and physical stamp seals:

- **Base Radius (0.25rem / 4px):** Form fields, table cells, transaction receipts, and tabular line items. Mimics crisp paper corners with slight physical wear.
- **Large Radius (0.5rem / 8px):** Primary ledger cards, advice panels, and high-level section containers.
- **Extra-Large Radius (0.75rem / 12px):** Action drawers, modal sheets, and dialogue panels.
- **Circular / Pill Exception:** Voice command nodes, audio play chips, and category tags utilize full rounded pill curves to signify interactive touch tools distinct from structural record data.

## Components

### Buttons & Voice Nodes
- **Primary Action Button:** Solid `#2E6B34` fill, white `#FAF6EE` typography, 56px minimum height, 4px corner radius, supported by a 3px darker under-edge (`#1E4622`) for clear tactile affordance. Houses both regional text and an illustrative icon.
- **Voice Mic FAB / Input Bar:** Floating or docked 64px circular node finished in `#2E6B34` with an animated pulsing ripple in `#E6F2DF`. Includes a bold microphone glyph and bilingual prompt *"Bol kar batayein / Speak here"*.

### Cards & Ledger Entries
- **Khata Ledger Card:** Built with `#FFFFFF` background, bound by a 1px border of `#E8DCC8`. Includes a top accent stripe (`#2E6B34` for deposits/growth, `#B3412E` for costs/dues, `#6B4226` for advisory). Data is presented in clean double-ruled rows resembling physical passbooks.
- **Mandi Price Strip:** Displays high-contrast commodity icons, bold Source Serif numerical rates (₹/quintal), and day-over-day price trends using arrows with dual text labels (*Tezi / Mandi*).

### Chips & Filters
- **Status & Category Chips:** 40px height for easy tapping, edged with `#E8DCC8`, with pill-shaped rounding. Active chips take a solid `#2E6B34` fill with white text; inactive chips sit on `#FAF6EE` parchment with `#2B1D12` text.

### Form Inputs & Soil Dials
- **Bilingual Field Inputs:** Minimum height of 56px, bordered in 1.5px `#E8DCC8`, shifting to 2px `#2E6B34` on focus. Integrated mic icon inside the trailing edge allows voice-to-text dictation for every field.
- **Soil Dial / Radial Meter:** Circular visual gauge displaying soil moisture, NPK balance, or harvest readiness. Uses a segmented arc (Green `#2E6B34`, Gold `#E0A526`, Red `#B3412E`) with a central reading in bold Source Serif typography, paired with audio readout triggers.

### Checkboxes & Selection Rows
- **List Selectors:** Minimum 56px height per row. Checkboxes are enlarged (24px × 24px) with high-contrast tactile checks (`#2E6B34` when checked) and clear separation lines (`#E8DCC8`) to prevent mis-taps.