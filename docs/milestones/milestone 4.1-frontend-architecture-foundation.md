# Milestone 4.1 – Frontend Architecture Foundation

---

## Objective

Establish the canonical frontend architecture for GCT Core.

This milestone defines the presentation layer, modular UI architecture, asset organisation, layout structure, and frontend engineering standards that every future user interface shall follow.

This milestone is **architectural only**.

No business functionality shall be introduced.

No booking functionality shall be introduced.

No catalogue functionality shall be introduced.

No supplier functionality shall be introduced.

The objective is to create a scalable frontend foundation that follows the same engineering discipline as the backend.

---

# Architectural Principles

The frontend shall follow the same engineering principles established throughout the platform.

- Architecture First
- Separation of Concerns
- Single Responsibility
- Modular Design
- Reusable Components
- Consistent Naming
- Clean Layering
- Maintainability before Convenience

The frontend shall be treated as an architectural layer rather than a collection of pages.

---

# Scope

Implement ONLY the following:

- Frontend folder architecture
- Shared application layout
- Shared partials
- Public asset structure
- Global design tokens
- Modular CSS architecture
- Modular JavaScript architecture
- Placeholder page
- View rendering conventions

No business pages shall be implemented.

No homepage design shall be implemented.

No business components shall be implemented.

No booking workflow shall be implemented.

---

# Frontend Engineering Standards

## Separation of Concerns

Every frontend responsibility shall exist in its own file.

### EJS

Responsible only for:

- HTML structure
- Semantic markup
- View composition

EJS files shall NOT contain:

- CSS
- JavaScript
- Business logic

---

### CSS

Responsible only for:

- Presentation
- Layout
- Typography
- Colours
- Spacing
- Animation

CSS files shall NOT contain:

- HTML
- JavaScript
- Business logic

---

### JavaScript

Responsible only for:

- Client-side behaviour
- Event handling
- DOM interaction
- Progressive enhancement

JavaScript shall NOT:

- Generate HTML
- Define styles
- Contain business logic

---

### Controllers

Responsible only for:

- Request orchestration
- Selecting views
- Passing view models

Controllers shall NOT contain presentation logic.

---

# One Responsibility Per File

Every frontend file shall have one clearly defined responsibility.

Example:

hero.ejs

hero.css

hero.js

Future:

hero.test.ts

No file should contain multiple unrelated responsibilities.

---

# Modular View Composition

Pages shall be assembled from reusable components.

Future pages shall follow:

Layout

↓

Partials

↓

Components

↓

Page

HTML duplication shall be avoided wherever possible.

---

# Inline Code Policy

The following are prohibited:

❌ Inline CSS

❌ Inline JavaScript

❌ Inline event handlers

Examples:

style="..."

onclick="..."

onchange="..."

All styling shall exist in CSS files.

All behaviour shall exist in JavaScript files.

---

# Frontend Folder Structure

Implement the following canonical structure.

```
src/
└── interfaces/
    └── views/
        ├── layouts/
        │
        │   main.ejs
        │
        ├── pages/
        │
        │   placeholder.ejs
        │
        ├── partials/
        │
        │   head.ejs
        │   header.ejs
        │   footer.ejs
        │   scripts.ejs
        │
        ├── components/
        │
        └── errors/
```

---

# Public Asset Structure

```
public/

    css/

        app.css

        base/

        layouts/

        components/

        pages/

        utilities/

    js/

        app.js

        layouts/

        components/

        pages/

        utilities/

    images/

    fonts/
```

Only the folder structure and foundation shall be created.

Business assets are out of scope.

---

# Application Layout

Create the canonical application layout.

Responsibilities:

- HTML document
- Meta data
- Asset loading
- Header inclusion
- Footer inclusion
- Page rendering
- Script loading

Every future page shall inherit this layout.

---

# Shared Partials

Create the following shared partials.

## head.ejs

Responsible for:

- meta tags
- page title
- stylesheet loading
- favicon
- future SEO hooks

---

## header.ejs

Initial placeholder only.

Responsibilities:

- Logo placeholder
- Brand placeholder
- Navigation placeholder

No business navigation.

---

## footer.ejs

Responsibilities:

- Copyright
- Company placeholder
- Platform version (development only)
- Future footer links

---

## scripts.ejs

Responsible for loading JavaScript assets.

No inline JavaScript.

---

# Design Tokens

Create the initial design language.

Examples include:

Colours

Typography

Spacing

Border Radius

Container Widths

Shadows

Transitions

These become the canonical visual language of GCT Core.

No page-specific styling shall be implemented.

---

# CSS Architecture

The stylesheet architecture shall be modular.

app.css shall act as the composition layer.

Individual styles shall be separated into dedicated modules.

Example:

base/

layouts/

components/

pages/

utilities/

Large monolithic CSS files shall be avoided.

---

# JavaScript Architecture

JavaScript shall follow the same modular approach.

Future features should exist as:

component.js

Each JavaScript module shall have a single responsibility.

Large monolithic JavaScript files shall be avoided.

---

# Future Component Convention

Every reusable component shall own its assets.

Example:

```
components/

    hero/

        hero.ejs
        hero.css
        hero.js

    navigation/

        navigation.ejs
        navigation.css
        navigation.js

    card/

        card.ejs
        card.css
        card.js
```

This convention shall be followed throughout the application.

---

# Naming Standards

Use consistent lowercase naming.

Examples:

main.ejs

header.ejs

hero.ejs

hero.css

hero.js

Avoid inconsistent naming conventions.

---

# Validation

Verify:

npm test

npm run build

npm run dev

Confirm:

✓ Existing API unchanged

✓ Existing OpenAPI unchanged

✓ Existing Runtime unchanged

✓ Existing tests pass

✓ Shared layout renders

✓ Placeholder page renders

✓ Static assets load

✓ No regressions introduced

---

# Deliverables

Return:

- Files created
- Files modified
- Folder structure
- Frontend architecture summary
- Validation results

Do not proceed beyond the defined scope.

---

# Out of Scope

The following shall NOT be implemented during this milestone.

- Landing Page
- Home Page Design
- Business Pages
- Catalogue Pages
- Booking Pages
- Authentication UI
- Search
- Supplier Integration
- Maps
- Images
- Animations
- Business Styling
- Responsive Optimisation
- SEO
- Accessibility Enhancements

These will be introduced in future milestones.

---

# Success Criteria

This milestone is complete when:

- The frontend architecture is established.
- Modular folder structures exist.
- Shared layouts are implemented.
- Shared partials are implemented.
- Asset architecture is established.
- Design token foundation exists.
- Existing platform functionality remains unchanged.
- All tests pass.
- The application builds successfully.
- The project is ready to begin UI implementation in Milestone 4.2.

This milestone establishes the canonical frontend architecture for the lifetime of the GCT Core platform.