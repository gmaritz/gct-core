# GCT Core – Product Catalogue

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Product Catalogue
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Introduction

This document defines every commercial product that GCT Core is designed to sell.

The Product Catalogue establishes the commercial vocabulary of the platform and forms the foundation for the Domain Model, Pricing Engine, Booking Engine, Supplier Integrations and Customer Experience.

Unlike many travel platforms, GCT Core focuses on curated premium travel experiences rather than offering every available tourism product.

Every product must align with the Go Cape Tours brand and quality standards.

---

# 2. Product Philosophy

Every product offered through GCT Core must satisfy the following principles:

- Premium quality
- Personally curated
- Authentic
- Reliable
- Memorable
- Commercially sustainable

Products are selected because they enhance the customer's journey—not because they increase inventory.

Quality always takes precedence over quantity.

---

# 3. Product Categories

The platform is organised into six primary commercial categories.

## Accommodation

Accommodation is offered as either a standalone booking or as part of a curated itinerary.

Examples include:

- Luxury Hotels
- Boutique Hotels
- Wine Estate Accommodation
- Country Lodges
- Safari Lodges
- Guest Houses
- Villas
- Apartments

Accommodation inventory is sourced through integrated accommodation suppliers.

---

## Private Experiences

Private experiences represent the core offering of Go Cape Tours.

Examples include:

- Private Cape Winelands Experiences
- Private Cape Peninsula Experiences
- Private Cape Town Experiences
- Private Garden Route Experiences
- Private Safari Experiences
- Private Cultural Experiences
- Private Food & Wine Experiences
- Bespoke Multi-Day Experiences

These experiences are designed, curated and operated under the Go Cape Tours brand.

---

## Wine Experiences

Wine tourism is a specialist area of the business.

Examples include:

- Boutique Wine Tours
- Premium Wine Tours
- Fine Wine Experiences
- Food & Wine Pairings
- Vertical Tastings
- Private Cellar Experiences
- Wine Masterclasses
- Harvest Experiences
- Winemaker Experiences

Wine experiences represent one of the platform's primary differentiators.

---

## Destination Experiences

Premium destination experiences that complement a customer's itinerary.

Examples include:

- Scenic Flights
- Helicopter Experiences
- Marine Experiences
- Wildlife Experiences
- Culinary Experiences
- Wellness Experiences
- Luxury Picnics
- Private Guided Experiences

Only experiences meeting Go Cape Tours quality standards are included.

---

## Curated Packages

Packages combine multiple products into a seamless travel experience.

A package may include:

- Accommodation
- Private Experiences
- Wine Experiences
- Destination Experiences

Packages are designed to maximise customer value while maintaining flexibility.

---

## Bespoke Itineraries

The highest-value product offered by GCT Core.

A bespoke itinerary is individually designed for a client and may combine multiple destinations, accommodation providers and premium experiences into one personalised journey.

These itineraries represent the flagship offering of Go Cape Tours.

---

# 4. Product Hierarchy

Products are organised using the following hierarchy.

Product Category

↓

Product

↓

Product Option

↓

Availability

↓

Price

↓

Booking

This hierarchy will later become the foundation of the Domain Model.

---

# 5. Product Attributes

Every commercial product should support a common set of attributes where applicable.

Examples include:

- Name
- Description
- Destination
- Region
- Images
- Duration
- Availability
- Price
- Currency
- Capacity
- Inclusions
- Exclusions
- Cancellation Policy
- Supplier
- Quality Rating
- Tags
- SEO Metadata
- GEO Metadata

Additional attributes may be defined for specialised product types.

---

# 6. Product Relationships

Products should be capable of being linked together.

Examples include:

Accommodation → Recommended Experiences

Accommodation → Wine Experiences

Wine Experience → Restaurant

Experience → Accommodation

Package → Multiple Experiences

Destination → Accommodation

Destination → Packages

This relationship model will support intelligent recommendations throughout the platform.

---

# 7. Product Lifecycle

Every product progresses through a defined lifecycle.

Draft

↓

Review

↓

Approved

↓

Published

↓

Available

↓

Unavailable

↓

Archived

The platform should preserve historical information even after products are retired.

---

# 8. Product Ownership

Products originate from one of two sources.

## Go Cape Tours

Products designed and curated directly by Go Cape Tours.

Examples include:

- Private Wine Experiences
- Private Touring Experiences
- Bespoke Itineraries

---

## Integrated Suppliers

Products supplied through external accommodation partners.

Supplier integrations provide:

- Availability
- Pricing
- Images
- Descriptions
- Policies
- Booking Confirmation

The platform remains supplier-independent and supports multiple integrations.

---

# 9. Product Quality Standards

Before publication every product should satisfy predefined quality standards.

These include:

- Trusted supplier
- Accurate information
- High-quality photography
- Current pricing
- Clear inclusions
- Transparent exclusions
- Verified availability
- Strong customer value
- Alignment with the Go Cape Tours brand

---

# 10. Future Expansion

The catalogue is intentionally extensible.

Future product categories may include:

- Multi-country journeys
- Expedition travel
- Rail experiences
- Luxury yacht charters
- Conservation experiences
- Exclusive events
- Seasonal collections

These additions should not require architectural redesign.

---

# 11. Conclusion

The Product Catalogue defines the commercial products available through GCT Core.

By separating commercial products from technical implementation, the platform remains flexible, scalable and capable of supporting future growth while preserving the premium positioning of Go Cape Tours.

This catalogue serves as the commercial foundation upon which the Domain Model, Booking Engine and Customer Experience will be built.