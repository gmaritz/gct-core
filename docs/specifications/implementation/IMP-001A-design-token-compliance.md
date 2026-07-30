# IMP-001A
# Frontend Implementation Specification
## Design Token Compliance

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | IMP-001A |
| Title | Design Token Compliance |
| Status | Approved |
| Owner | Frontend Engineering |
| Depends On | DS-001 Frontend Design System, IMP-001 Global Navigation |
| Followed By | IMP-002 Hero Section |

---

# Objective

Ensure all existing frontend components fully consume the DS-001 Design System through semantic design tokens.

This implementation is an engineering refinement milestone.

It introduces no new business functionality or user-facing features.

The objective is to eliminate unnecessary hard-coded design values and establish a single source of truth for all reusable visual properties.

---

# Scope

This implementation includes:

- Design token adoption
- Component refactoring
- CSS cleanup
- Token expansion where justified
- Verification
- Regression testing

This implementation excludes:

- Hero section
- Landing page content
- New components
- New routes
- New business functionality

---

# Engineering Principle

All reusable visual values shall originate from DS-001 Design Tokens.

Component styles shall consume tokens rather than define their own reusable values.

Component styles may only contain literal values when those values are unique to the component and not suitable for reuse.

---

# Files In Scope

## Base

```
public/css/base/tokens.css
```

---

## Components

```
public/css/components/navigation.css

public/css/components/button.css

public/css/components/forms.css

public/css/components/card.css
```

---

## Pages

```
public/css/pages/placeholder.css
```

---

## Global Composition

```
public/css/app.css
```

---

# Required Refactoring

## Colours

Replace reusable hard-coded colours with semantic design tokens.

Examples

Instead of

```css
color: #111827;
```

use

```css
color: var(--color-text-primary);
```

Instead of

```css
background: #ffffff;
```

use

```css
background: var(--color-surface);
```

---

## Border Radius

Replace

```css
border-radius: 999px;
```

with

```css
border-radius: var(--radius-pill);
```

Replace

```css
border-radius: 12px;
```

with

```css
border-radius: var(--radius-md);
```

---

## Spacing

Replace reusable spacing literals with spacing tokens.

Example

Instead of

```css
padding: 24px;
```

use

```css
padding: var(--space-lg);
```

Unique layout values may remain literal where appropriate.

---

## Shadows

Replace reusable shadows with shadow tokens.

Instead of

```css
box-shadow: 0 8px 24px rgba(...);
```

use

```css
box-shadow: var(--shadow-md);
```

---

## Transitions

Replace reusable transition timings.

Instead of

```css
transition: 250ms ease;
```

use

```css
transition: var(--transition-normal);
```

---

## Form Controls

Replace reusable values such as:

- control heights
- padding
- border radius
- focus styling

with Design Tokens wherever appropriate.

---

# Token Expansion

If a reusable design value is missing from DS-001, introduce a new semantic token.

Examples

```css
--color-surface
--color-surface-muted

--color-text-inverse

--control-min-height

--textarea-min-height

--focus-ring-width

--focus-ring-color
```

New tokens shall represent reusable design concepts rather than component-specific values.

---

# Values That Shall NOT Become Tokens

The following shall remain component-specific:

- Decorative gradients
- Hero image overlays
- Component artwork
- One-off illustrations
- Experimental showcase styling

Design Tokens represent reusable design primitives.

They shall not become a collection of arbitrary colours.

---

# CSS Architecture

The following layering shall be preserved:

```
base/
    tokens.css
    typography.css

layout/

components/

pages/

utilities/
```

No component shall redefine Design Tokens.

---

# Accessibility

Accessibility shall not regress.

Maintain:

- WCAG AA compliance
- Visible focus indicators
- Minimum touch target size (44px × 44px)
- Keyboard accessibility

---

# Performance

The refactoring shall not negatively impact:

- Lighthouse score
- CSS bundle size
- Runtime performance

Token usage should improve maintainability without increasing rendering complexity.

---

# Verification

After refactoring:

- Run the complete test suite.
- Build the application.
- Execute startup verification.
- Confirm that all existing functionality continues to operate correctly.

---

# Acceptance Criteria

Implementation is complete when:

- `tokens.css` remains the canonical source of reusable design values.
- Component styles consume semantic design tokens.
- Reusable colours are tokenized.
- Reusable spacing values are tokenized.
- Reusable shadows are tokenized.
- Reusable border radii are tokenized.
- Reusable transition values are tokenized.
- Only intentional component-specific literals remain.
- All tests pass.
- The application builds successfully.
- Runtime startup verification passes.

---

# Deliverables

```
public/css/base/tokens.css

public/css/components/navigation.css

public/css/components/button.css

public/css/components/forms.css

public/css/components/card.css

public/css/pages/placeholder.css

public/css/app.css
```

---

# Implementation Report

Upon completion, produce:

```
RPT-001A-design-token-compliance.md
```

The report shall include:

- Files modified
- Tokens added
- Hard-coded values removed
- Intentional literals retained
- Test results
- Build results
- Startup verification
- Outstanding observations

---

# Milestone Outcome

Upon successful completion, the GCT Core frontend shall have a fully adopted Design Token architecture.

All reusable frontend components will consume the DS-001 Design System, establishing a consistent, maintainable, and extensible visual foundation for future milestones, beginning with IMP-002 – Hero Section.