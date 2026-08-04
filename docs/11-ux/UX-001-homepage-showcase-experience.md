# UX-001
# Homepage Showcase Experience

---

# Document Control

| Item | Value |
|------|-------|
| Document | UX-001 |
| Title | Homepage Showcase Experience |
| Project | GCT Core |
| Status | Approved |
| Version | 1.0 |
| Owner | UX Architecture |

---

Implementation Note

This document defines the intended user experience and interaction model for the Homepage Showcase. It is not an implementation specification. All development work shall be carried out through the corresponding IMP-* implementation specifications while conforming to DS-001 and this document.

# Purpose

This document defines the user experience for the Homepage Showcase.

The Homepage Showcase is the primary commercial experience of the Go Cape Tours website.

Unlike a traditional Hero banner, the Homepage Showcase combines editorial storytelling with intelligent merchandising to present visitors with carefully curated journeys that encourage exploration and immediate booking.

The Homepage Showcase establishes the premium identity of Go Cape Tours.

---

# Design Philosophy

The Homepage Showcase should feel like the opening spread of a premium travel magazine.

Visitors should feel inspired before they feel persuaded.

The experience should communicate:

- Elegance
- Trust
- Discovery
- Authenticity
- Exclusivity
- Calm
- Exceptional value

The Homepage Showcase should never resemble a discount travel website.

---

# Experience Objectives

The Homepage Showcase shall:

- Introduce Go Cape Tours.
- Establish premium positioning.
- Present curated journeys.
- Inspire exploration.
- Create subtle urgency.
- Encourage bookings.
- Promote repeat visits through regularly changing featured journeys.

---

# Information Hierarchy

The Homepage Showcase consists of two equally important experiences.

```
Editorial Story

+

Featured Journeys
```

Neither side should visually dominate the other.

---

# Editorial Story

Purpose

Communicate the Go Cape Tours brand.

The editorial panel should remain largely static.

It tells visitors:

- Who we are.
- What we believe.
- Why we are different.

Suggested content

Headline

```
Private Journeys Through South Africa
```

Supporting copy

```
Discover carefully curated wine tours, private day experiences and luxury journeys designed around exceptional accommodation, remarkable destinations and authentic local knowledge.
```

Primary CTA

```
Explore Experiences
```

Secondary CTA

```
Plan Your Journey
```

---

# Featured Journeys

Purpose

Present the best opportunities currently available.

The Homepage Showcase should never present raw supplier inventory.

Every journey represents a Go Cape Tours curated product.

---

# Journey Rotation

The Homepage Showcase displays

```
Three Featured Journeys
```

The merchandising engine selects the journeys.

Rotation should occur:

- Automatically
- Smoothly
- Without disrupting the visitor

Suggested interval

```
8–10 seconds
```

Manual navigation shall always be available.

---

# Journey Card

Each journey contains:

```
Journey Name

Destination

Duration

Hero Image

Journey Highlights

Accommodation Gallery

Price

Book Journey

Saving
```

The Journey Card is the centrepiece of the Homepage Showcase.

---

# Accommodation Gallery

Accommodation is part of the journey.

It should never feel like an unrelated hotel booking.

Display

```
Three accommodation thumbnails
```

Examples

```
Lanzerac

Babylonstoren

Coopmanhuijs
```

The gallery uses locally stored imagery sourced from Hotelbeds and managed within the GCT Core platform.

---

# Gallery Interaction

Selecting an accommodation image opens an elegant modal or lightbox.

The visitor remains on the homepage.

The interaction may display:

- Large photography
- Hotel description
- Star rating
- Facilities
- Destination

The journey remains the primary focus.

The accommodation supports the story.

---

# Journey Highlights

Display only the most important inclusions.

Examples

```
Private Guide

Wine Tastings

Luxury Accommodation

Breakfast Included

Private Transfers
```

Limit

```
Maximum six highlights
```

Avoid long feature lists.

---

# Pricing

Pricing should appear near the bottom of the Journey Card.

Example

```
From

R18 950

per couple
```

The experience should dominate.

Price supports the decision.

---

# Savings

Savings should remain understated.

Example

```
Save 18%
```

Display adjacent to the CTA.

Savings should never dominate the card.

The premium perception takes priority over discount messaging.

---

# Visual Hierarchy

Priority

```
Journey Image

↓

Journey Name

↓

Journey Story

↓

Accommodation

↓

Highlights

↓

Price

↓

Book Journey

↓

Saving
```

Price is intentionally secondary.

---

# Motion

Animations should be calm.

Examples

- Crossfade between journeys.
- Gentle image transitions.
- Subtle hover elevation.
- Soft gallery animation.

Avoid

- Sliding carousels
- Flashing content
- Aggressive movement

---

# Mobile Experience

The editorial story appears first.

The featured journey appears beneath.

Accommodation thumbnails become horizontally scrollable.

Journey rotation remains available.

Manual navigation remains accessible.

---

# Future Merchandising Engine

Future homepage data will originate from:

```
Merchandising Engine

↓

Homepage View Model

↓

Homepage Showcase
```

The Homepage Showcase has no knowledge of:

- Hotelbeds
- Supplier APIs
- Business Rules
- Pricing Logic

It simply renders the supplied View Model.

---

# Future Personalisation

The architecture should support future capabilities.

Examples

- Seasonal journeys
- Returning visitor preferences
- Geographic targeting
- Campaign-specific journeys
- Language-specific journeys

No structural redesign should be required.

---

# Success Criteria

Visitors should immediately understand:

- Go Cape Tours offers premium curated journeys.
- The journeys are authentic.
- The accommodation is exceptional.
- The featured journeys are regularly refreshed.
- Booking today provides access to exceptional opportunities.

The Homepage Showcase should encourage visitors to continue exploring the platform.

---

# Relationship to Other Specifications

DS-001

Defines the visual language.

IMP-002

Defines the technical implementation.

UX-001

Defines the visitor experience.

Together these three documents establish the complete Homepage Showcase architecture.