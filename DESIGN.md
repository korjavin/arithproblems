---
name: Math Worksheet Generator
colors:
  orange-dark: "#a33f11"
  orange: "#d86424"
  orange-bright: "#ef8639"
  orange-light: "#f59e44"
  cream: "#fff8ef"
  cream-soft: "#fff2df"
  cream-medium: "#ffe5c2"
  cream-strong: "#ffd49a"
  text-primary: "#43281b"
  text-secondary: "#7a5a47"
  text-tertiary: "#9e7b67"
  border: "rgba(163, 63, 17, 0.2)"
  border-strong: "rgba(163, 63, 17, 0.4)"
  shadow: "rgba(105, 45, 18, 0.22)"
  focus: "rgba(239, 134, 57, 0.35)"
  success: "#2f9f59"
  success-bg: "#f0fdf4"
  success-border: "#bbf7d0"
  danger: "#d84d3e"
  danger-bg: "#fee2e2"
  danger-border: "#fecaca"
  warning: "#ca8a04"
  warning-bg: "#fefce8"
  warning-border: "#fde68a"
  info: "#2563eb"
  info-bg: "#eff6ff"
  info-border: "#bfdbfe"
  header-start: "rgba(108, 41, 13, 0.9)"
  header-mid: "rgba(163, 63, 17, 0.92)"
  header-end: "rgba(216, 100, 36, 0.9)"
  bg-body: "#fffaf4"
  bg-card: "rgba(255, 252, 247, 0.88)"
  bg-input: "rgba(255, 250, 243, 0.95)"
  bg-hover: "#fff2dc"
  fg-primary: "#43281b"
  fg-secondary: "#7a5a47"
  fg-muted: "#9e7b67"
  fg-on-dark: "#fff8f0"
typography:
  h1:
    fontFamily: "Nunito Sans, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: "700"
    lineHeight: "1.25"
  h2:
    fontFamily: "Nunito Sans, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: "700"
    lineHeight: "1.375"
  h3:
    fontFamily: "Nunito Sans, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: "600"
    lineHeight: "1.375"
  body:
    fontFamily: "Nunito Sans, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.625"
  body-sm:
    fontFamily: "Nunito Sans, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: "400"
    lineHeight: "1.5"
  label:
    fontFamily: "Nunito Sans, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: "500"
    lineHeight: "1.5"
  caption:
    fontFamily: "Nunito Sans, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: "600"
    letterSpacing: "0.04em"
    textTransform: "uppercase"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
    fontSize: "0.9em"
  proverb:
    fontFamily: "Nunito Sans, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: "700"
    fontStyle: "italic"
spacing:
  space-1: "0.25rem"
  space-2: "0.5rem"
  space-3: "0.75rem"
  space-4: "1rem"
  space-6: "1.5rem"
  space-8: "2rem"
  space-12: "3rem"
  space-16: "4rem"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  full: "9999px"
shadows:
  sm: "0 1px 2px 0 rgba(0,0,0,0.05)"
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)"
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)"
  card: "0 22px 40px rgba(105, 45, 18, 0.12)"
  header: "0 18px 34px rgba(73, 27, 8, 0.28)"
  btn: "0 8px 18px rgba(105, 45, 18, 0.22)"
components:
  panel:
    backgroundColor: "{colors.bg-card}"
    borderRadius: "{rounded.lg}"
    boxShadow: "{shadows.card}"
    padding: "{spacing.space-6}"
  button-primary:
    background: "linear-gradient(145deg, #a33f11, #d86424, #ef8639)"
    color: "{colors.fg-on-dark}"
    borderRadius: "{rounded.md}"
    boxShadow: "{shadows.btn}"
    padding: "12px 24px"
    typography: "{typography.body}"
    fontWeight: "700"
  button-secondary:
    background: "linear-gradient(145deg, #fff9f0, #ffeacc)"
    color: "{colors.orange-dark}"
    borderRadius: "{rounded.md}"
    boxShadow: "0 4px 10px rgba(105, 45, 18, 0.1)"
    padding: "12px 24px"
    typography: "{typography.body}"
    fontWeight: "700"
  input:
    backgroundColor: "{colors.bg-input}"
    borderRadius: "{rounded.md}"
    padding: "10px 12px"
    border: "2px solid rgba(163, 63, 17, 0.18)"
---

# Brand & Style

This design system centers on a warm, approachable, and educational aesthetic. It is tailored for an application focused on generating math worksheets, where the visual environment needs to be inviting rather than intimidating. The overall personality is friendly, structured, and gently encouraging.

## Colors

The color palette is built around an analogous range of warm tones, primarily moving from soft, inviting creams to vibrant, energetic oranges.
*   **Backgrounds:** The primary canvas and surface areas utilize soft cream colors, providing a low-strain reading experience that mimics the feel of high-quality physical paper.
*   **Accents:** A scale of oranges—from deep rust to bright tangerine—serves as the primary brand and action color. This conveys warmth and energy.
*   **Text:** Typography relies on deep, warm browns instead of stark blacks, maintaining high contrast while keeping the overall palette unified and gentle on the eyes.

## Typography

The design system utilizes a rounded sans-serif typeface as its primary font, balancing geometric clarity with organic softness.
*   **Hierarchy:** Headings are bold and structurally clear to establish distinct sections, while body text uses a relaxed line height to ensure readability, especially for younger users or detailed math problems.
*   **Functional Fonts:** A clear, tabular monospace font is employed for inputs, hotkeys, and mathematical symbols where vertical alignment and distinct character recognition are paramount.
*   **Styling:** Special elements, like motivational proverbs, use italicized weights to add a touch of personality and encouragement.

## Layout & Spacing

The layout is structured yet fluid, relying on generous padding to separate interactive controls from the output canvas.
*   **Rhythm:** A defined spacing scale ensures consistent gaps between elements.
*   **Containers:** Content is grouped into distinct "panels" or "cards" that float slightly above the main background, providing clear visual boundaries for different functional areas like navigation, controls, and generated worksheets.

## Elevation & Depth

Depth is used to establish hierarchy and focus without resorting to harsh, dark shadows.
*   **Warm Shadows:** Box shadows incorporate subtle tints of the primary orange/brown colors rather than pure black or gray. This creates a natural, "glowing" drop shadow that grounds elements beautifully against the cream background.
*   **Frosted Surfaces:** Panels and sidebars utilize subtle background blurs and slight transparency, allowing the underlying background gradient to softly influence the surface color, creating a premium, modern feel.
*   **Layering:** Interactive elements like primary buttons are elevated with distinct, warmer shadows that expand upon interaction, providing immediate, tactile feedback.

## Shapes

The shape language is consistently soft and friendly.
*   **Corners:** All interactive elements (buttons, inputs) and structural containers (panels, sidebars) use moderately rounded corners. This softens the interface, moving away from rigid, clinical right angles.
*   **Badges:** Small informational elements, such as hotkey indicators or topic badges, often employ fully rounded (pill-shaped) borders to contrast with larger rectangular containers.

## Components

### Panels and Cards
The core structural elements are semi-transparent cards that sit above a subtly textured or gradient background. They use a delicate white border to catch the light and soft, warm shadows to separate them from the canvas.

### Action Elements
Primary buttons draw attention with rich, multi-stop orange gradients and significant elevation. Secondary buttons invert this, using a soft cream gradient with orange text and a more subtle shadow, reserving the highest contrast for the most critical actions.

### Inputs & Interaction
Form fields and inputs sit within slightly darker, inset containers. Upon focus, they feature a vibrant, semi-transparent ring, providing unmistakable accessibility and interaction feedback while remaining integrated with the warm color story.
