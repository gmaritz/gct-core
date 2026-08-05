# DS-001
# Frontend Design System

---

# Document Control

| Item | Value |
|------|-------|
| Document | DS-001 |
| Title | Frontend Design System |
| Project | GCT Core |
| Status | Approved |
| Version | 1.0 |
| Owner | Frontend Engineering |

---

# Purpose

This document defines the visual design language for the GCT Core frontend.

It establishes reusable design tokens, component standards, typography, spacing, accessibility requirements and responsive behaviour.

All frontend components shall comply with this document.

The Design System is the single source of truth for all user interface implementation.

---

# Design Philosophy

The Go Cape Tours brand shall present itself as:

- Premium
- Elegant
- Authentic
- Personal
- Sophisticated
- Calm
- Scenic
- Experience-driven
- Timeless
- Professional

The interface should never feel cluttered, overly commercial or overly decorative.

Whitespace is considered a primary design element.

Every screen should communicate quality before functionality.

---

# Brand Identity

The visual identity is inspired by:

- Premium travel
- Fine wine
- Cape landscapes
- Luxury lodges
- Boutique hospitality
- Natural light
- Refined simplicity

The interface should feel welcoming and luxurious without appearing extravagant.

---

# Colour System

The interface uses a premium silver foundation with charcoal typography and a refined gold brand accent.

The gold is reserved for branding and calls-to-action.

It should never dominate the interface.

---

## Design Tokens

```css
:root {

    /* ==========================================================
       BACKGROUNDS
       ========================================================== */

    --color-background-primary: #f5f7fa;
    --color-background-secondary: #e8ecf1;
    --color-background-tertiary: #d1d5db;
    --color-background-dark: #9ca3af;

    /* ==========================================================
       TYPOGRAPHY
       ========================================================== */

    --color-text-primary: #111827;
    --color-text-secondary: #4b5563;

    /* ==========================================================
       BRAND
       ========================================================== */

    --color-brand: #B8731A;
    --color-brand-hover: #9C5F13;
    --color-brand-light: #D69A3C;

    /* ==========================================================
       BORDERS
       ========================================================== */

    --color-border: rgba(107,114,128,.20);

    /* ==========================================================
       SHADOWS
       ========================================================== */

    --color-shadow: rgba(55,65,81,.16);

    /* ==========================================================
       STATUS
       ========================================================== */

    --color-success: #2F855A;
    --color-warning: #D69E2E;
    --color-error: #C53030;
    --color-info: #2563EB;

    /* ==========================================================
       BORDER RADIUS
       ========================================================== */

    --radius-sm: 6px;
    --radius-md: 12px;
    --radius-lg: 20px;
    --radius-pill: 999px;

    /* ==========================================================
       SPACING
       ========================================================== */

    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    --space-2xl: 48px;
    --space-3xl: 64px;
    --space-hero: 96px;

    /* ==========================================================
       SHADOWS
       ========================================================== */

    --shadow-sm: 0 2px 6px rgba(0,0,0,.08);
    --shadow-md: 0 8px 24px rgba(0,0,0,.12);
    --shadow-lg: 0 16px 40px rgba(0,0,0,.18);

    /* ==========================================================
       ANIMATION
       ========================================================== */

    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 300ms ease;

}
```

---

# Typography

## Heading Font

Cormorant Garamond

Fallback

```
Georgia, serif
```

Used for:

- Hero headings
- Section headings
- Feature headings
- Testimonials
- Promotional content

---

## Body Font

Inter

Fallback

```
system-ui, sans-serif
```

Used for:

- Paragraphs
- Navigation
- Forms
- Buttons
- Lists
- Labels

---

## Typography Scale

| Element | Desktop | Mobile |
|----------|----------|----------|
| H1 | 3.5rem | 2.5rem |
| H2 | 2.75rem | 2rem |
| H3 | 2rem | 1.6rem |
| H4 | 1.5rem | 1.3rem |
| H5 | 1.25rem | 1.1rem |
| H6 | 1rem | 1rem |
| Body | 1rem | 1rem |
| Small | .875rem | .875rem |

Line Height

```
1.7
```

---

# Layout

The application shall use a mobile-first responsive layout.

Maximum content width

```
1280px
```

Container

```
margin: 0 auto;
padding-inline: 24px;
```

All pages shall maintain generous whitespace.

---

---

# Content Container

The application shall use a shared content container to provide consistent horizontal alignment across all pages and reusable sections.

The content container is a foundational layout primitive and shall be reused throughout the frontend.

## Standard Container

```css
.container {
    width: min(100% - (2 * var(--space-lg)), 1280px);
    margin-inline: auto;
}
```

The container shall provide:

- Consistent horizontal alignment
- Predictable spacing
- Responsive scaling
- Maximum readable line lengths
- Reusable layout behaviour

---

## Usage

The standard container shall be used by:

- Navigation
- Hero
- Featured Experiences
- Value Proposition
- Testimonials
- Footer
- Booking Pages
- Experience Pages
- Contact Page
- About Page

---

## Full Width Sections

Some sections may intentionally span the full viewport.

Examples include:

- Hero background image
- Promotional banners
- Image galleries
- Footer background

In these cases:

- The section background may be full width.
- The content shall remain constrained within the shared container.

Example

```
------------------------------------------------------

Full-width Background

    +--------------------------------------------+
    |                                            |
    |      Shared Content Container              |
    |                                            |
    +--------------------------------------------+

------------------------------------------------------
```

---

## Responsive Behaviour

Desktop

Maximum width

```
1280px
```

Tablet

Container automatically scales using available viewport width.

Mobile

Container maintains equal horizontal padding using Design Tokens.

No component shall define its own horizontal page margins outside the shared container.

---

## Engineering Principle

The content container is part of the Design System.

Individual components shall consume the shared container rather than defining independent page widths.

This ensures consistent alignment, simplifies responsive layouts and reinforces the visual rhythm of the interface.

# Responsive Breakpoints

| Device | Width |
|----------|--------|
| Mobile | <768px |
| Tablet | 768px–1023px |
| Desktop | ≥1024px |
| Wide Desktop | ≥1440px |

---

# Navigation

Navigation shall comply with IMP-001.

Requirements:

- Fixed position
- Transparent over hero
- Premium silver when scrolling
- Smooth transitions
- Gold hover indicator
- Gold active state
- Gold CTA button
- Dark typography

---

# Buttons

## Primary

Purpose

Primary actions.

Appearance

- Brand Gold background
- White text
- Pill radius
- Medium shadow

Hover

- Darker gold
- Slight elevation

---

## Secondary

Purpose

Alternative actions.

Appearance

- Transparent background
- Dark border
- Dark typography

Hover

- Premium silver background

---

## Ghost

Purpose

Navigation

Secondary actions

Minimal emphasis

Appearance

Transparent

No border

---

# Cards

Cards shall include:

- White background
- Medium radius
- Medium shadow
- Generous padding
- Smooth hover animation

Cards should feel elevated without appearing heavy.

---

# Images

Images are a primary storytelling element.

Requirements:

- High resolution
- Authentic photography
- Natural lighting
- Landscape orientation where appropriate
- Lazy loading below the fold
- Responsive sizing
- WebP or AVIF preferred
- Meaningful alt text

Stock imagery should be avoided wherever possible.

---

# Icons

Preferred Library

Heroicons

Style

Outline

Icons should use the brand colour only where emphasis is required.

---

# Forms

Forms shall include:

- Clear labels
- Consistent spacing
- Visible focus states
- Inline validation
- Accessible error messaging

Rounded corners shall follow Design Tokens.

---

# Elevation

| Component | Elevation |
|------------|-----------|
| Navigation | Small |
| Cards | Medium |
| Dropdowns | Medium |
| Modal | Large |

---

# Motion

Animations should be subtle.

Maximum duration

```
300ms
```

Preferred easing

```
ease
```

Motion should support usability rather than decoration.

Avoid excessive movement.

---

# Accessibility

Minimum standard

WCAG AA

Requirements

- Semantic HTML
- Keyboard navigation
- Screen reader compatibility
- Visible focus indicators
- Colour contrast compliance
- ARIA where appropriate
- Touch-friendly controls
- Minimum tap target 44px × 44px

Accessibility is mandatory.

---

# Performance

Target Lighthouse Scores

| Category | Target |
|-----------|---------|
| Performance | ≥95 |
| Accessibility | 100 |
| Best Practices | ≥95 |
| SEO | ≥95 |

Images shall be optimized.

JavaScript shall be deferred where possible.

CSS shall remain modular.

---

# CSS Architecture

```
public/

css/

    base/
    layout/
    components/
    pages/
    utilities/
```

No inline CSS.

No duplicated component styling.

All components shall consume Design Tokens.

---

# Component Standards

Every reusable component shall:

- Consume Design Tokens
- Be responsive
- Be accessible
- Be modular
- Avoid duplicated styles
- Use semantic HTML
- Avoid inline JavaScript
- Avoid inline CSS

---

# Future Compatibility

This Design System supports future expansion including:

- Dark mode
- Theme switching
- White-label branding
- Customer dashboard
- Booking workflow
- Supplier portal
- CMS-driven content
- Mobile application

Future enhancements shall extend the Design Tokens rather than replace them.

---

# Compliance

All future frontend implementation specifications (IMP-*) shall comply with DS-001.

Any deviation from this document shall require approval through an Architecture Decision Record (ADR).

---

# Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Established the GCT Core Frontend Design System and Design Tokens |