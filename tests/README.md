# GCT Core Test Suite

## Philosophy

Tests verify observable behaviour rather than implementation details.

## Structure

- unit/ – isolated domain and application tests
- integration/ – HTTP and platform integration tests
- fixtures/ – reusable test data
- helpers/ – shared testing utilities

## Principles

- Tests are deterministic.
- Tests are independent.
- Tests must not rely on execution order.
- Every bug should first be reproduced by a failing test.

# Test Structure

This folder contains the repository's automated test assets.

## Layout

- integration/platform: platform-facing HTTP integration tests
- integration/catalogue, reservations, suppliers, bookings, journeys: feature-area integration test buckets
- unit/domain, application, shared, infrastructure: unit-test buckets by architectural layer
- fixtures: reusable test data and constants
- helpers: shared test utilities and bootstrap helpers
