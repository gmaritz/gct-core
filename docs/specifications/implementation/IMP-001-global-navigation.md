# MILESTONE-4.2.1
# Frontend Implementation Specification
## Global Navigation Component

---

## Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Milestone | 4.2.1 |
| Component | Global Navigation |
| Status | Approved |
| Owner | Frontend Engineering |
| Architecture | Milestone 4.1 Frontend Foundation |
| Dependencies | Shared Layout, Shared Partials |

---

# Objective

Implement the reusable Global Navigation component for GCT Core.

The navigation must serve as the primary navigation component across the entire platform and shall not be implemented specifically for the landing page.

It will be reused by:

- Landing Page
- Experiences
- Wine Tours
- Day Tours
- Cape Packages
- Garden Route
- Safari Packages
- About
- Contact
- Booking
- Future authenticated pages

---

# Scope

This milestone includes:

- Navigation HTML
- Responsive behaviour
- Mobile navigation
- Sticky navigation
- Scroll behaviour
- Accessibility
- Navigation styling
- Navigation JavaScript

This milestone excludes:

- Authentication
- User profile menu
- Search
- Shopping basket
- Booking workflow
- Dynamic menu generation
- CMS integration

---

# Component Structure

```
views/
└── partials/
    navigation.ejs

public/
├── css/
│   components/
│       navigation.css
│
└── js/
    components/
        navigation.js
```

---

# Navigation Layout

Desktop Layout

```
+----------------------------------------------------------------------------------+
| GO CAPE TOURS                                                                    |
|                                                                                  |
| Wine Tours | Day Tours | Cape Packages | Garden Route | Safari Packages          |
|                                                          About | Contact | Book  |
+----------------------------------------------------------------------------------+
```

---

# Navigation Items

## Primary Navigation

- Wine Tours
- Day Tours
- Cape Packages
- Garden Route
- Safari Packages

---

## Secondary Navigation

- About
- Contact

---

## Primary CTA

Book Now

The Book Now button shall be visually distinguished from all other navigation items.

---

# Logo

The logo shall initially render as a text logo.

```
Go Cape Tours
```

The component shall allow future replacement with:

- SVG logo
- Light variant
- Dark variant
- Responsive logo assets

No structural changes shall be required.

---

# Behaviour

## Desktop

Navigation shall:

- remain fixed to the top
- initially render transparent over the hero section
- transition to a solid background when scrolling
- reduce vertical padding slightly on scroll
- display a subtle shadow after scroll

Transition duration:

250–300ms

---

## Mobile

Navigation shall collapse into a hamburger menu.

Initial state:

```
GO CAPE TOURS                    ☰
```

Expanded state:

```
Wine Tours

Day Tours

Cape Packages

Garden Route

Safari Packages

---------------------

About

Contact

---------------------

Book Now
```

---

# Mobile Behaviour

The navigation JavaScript shall provide:

- Open menu
- Close menu
- Toggle menu
- Close on Escape
- Close when clicking outside
- Restore keyboard focus
- Lock body scrolling while menu is open
- Update aria-expanded state

---

# Accessibility

The component shall include:

Semantic navigation

```
<nav>
```

ARIA

```
aria-label="Primary Navigation"
```

Hamburger

```
aria-expanded

aria-controls
```

Keyboard support

- Tab
- Shift+Tab
- Enter
- Escape

Visible focus indicators are mandatory.

---

# CSS Responsibilities

navigation.css shall contain:

- Layout
- Responsive breakpoints
- Typography
- Spacing
- Hover states
- Focus states
- Sticky navigation
- Scroll state
- Mobile animation
- Transition effects

No inline styles shall be used.

---

# JavaScript Responsibilities

navigation.js shall only manage behaviour.

It shall not:

- manipulate styling
- create HTML
- inject CSS

Responsibilities:

- Toggle mobile navigation
- Handle Escape
- Handle outside click
- Update aria-expanded
- Restore focus
- Scroll detection
- Body scroll locking

---

# Responsive Breakpoints

Mobile

```
<768px
```

Tablet

```
768px–1023px
```

Desktop

```
≥1024px
```

---

# Performance Requirements

The component shall:

- avoid layout shifts
- minimise JavaScript execution
- use CSS transitions
- defer JavaScript loading
- avoid unnecessary DOM manipulation

---

# Future Compatibility

The component shall support future enhancements without structural redesign.

Examples include:

- Mega menu
- Destination dropdowns
- User authentication menu
- Language selector
- Currency selector
- Sticky booking CTA
- Dynamic CMS navigation

---

# Acceptance Criteria

Implementation is complete when:

- Navigation renders correctly on desktop.
- Navigation renders correctly on tablet.
- Navigation renders correctly on mobile.
- Sticky behaviour functions correctly.
- Mobile menu operates correctly.
- Accessibility requirements are satisfied.
- JavaScript is behaviour-only.
- CSS is presentation-only.
- HTML is semantic.
- Component is reusable throughout GCT Core.
- No inline CSS or JavaScript is present.

---

## Deliverables

```
views/partials/navigation.ejs

public/css/components/navigation.css

public/js/components/navigation.js
```

---

## Milestone Outcome

Upon successful completion, GCT Core shall have a reusable, production-ready Global Navigation component that forms the foundation for all public-facing pages and supports future platform expansion without requiring architectural modification.