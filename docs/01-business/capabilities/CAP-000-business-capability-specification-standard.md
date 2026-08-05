# CAP-000 Business Capability Specification Standard

**Publication Edition**

| Attribute | Value |
|-----------|-------|
| Document Identifier | CAP-000 |
| Version | 1.0.0 |
| Status | Approved |
| Classification | Business Architecture Standard |
| Owner | Business Architecture Office |
| Approval Authority | Architecture Review Authority |
| Effective Date | TBD |
| Copyright | © Go Cape Tours |

---

# Document Information

| Attribute | Value |
|----------|-------|
| Document Identifier | CAP-000 |
| Document Title | Business Capability Specification Standard |
| Document Type | Business Architecture Standard |
| Version | 1.0.0 |
| Status | Approved |
| Classification | Internal |
| Owner | Business Architecture Office |
| Approval Authority | Architecture Review Authority |
| Effective Date | TBD |
| Review Cycle | Annual |
| Repository | Business Architecture Library |

---

# Document Control

| Version | Date | Description | Author | Approval |
|----------|------|-------------|---------|----------|
| 0.x | Development | Working Drafts | Business Architecture Office | Draft |
| 1.0.0 | TBD | First Approved Publication | Business Architecture Office | Approved |

---

# Authority

This standard is issued under the authority of the Business Architecture Office.

Compliance with this standard is mandatory for all Business Capability Specifications produced for the GCT Core Business Architecture Repository.

Any deviation from this standard **SHALL** be formally approved by the Architecture Review Authority before publication.

---

# Approval

| Role | Responsibility |
|------|----------------|
| Business Architecture Office | Document Ownership |
| Architecture Review Authority | Technical Approval |
| Publication Authority | Publication Approval |

---

# Release Notes

## Version 1.0.0

Initial approved publication establishing the canonical Business Capability Specification Standard for the GCT Core Business Architecture Repository.

This publication establishes the:

- Capability Specification Structure
- Capability Governance Framework
- Capability Metadata Standard
- Relationship Standards
- Traceability Requirements
- Lifecycle Management
- Compliance Requirements
- Publication Requirements

---

# Distribution

This publication SHALL be distributed to:

- Business Architecture Office
- Enterprise Architecture
- Platform Engineering
- Product Management
- Software Engineering
- Solution Architecture
- Quality Assurance

---

# Table of Contents

1. Purpose
2. Objectives
3. Scope
4. Intended Audience
5. Authority
6. Architecture Alignment
7. Definitions
8. Guiding Principles
9. Business Objectives
10. Related Documents
11. Change Control
12. Canonical Capability Meta-Model
13. Capability Behavioural Model
14. Mandatory Capability Specification Structure
15. Capability Specification Components
16. Capability Classification
17. Capability Definition Standard
18. Authoring Principles
19. RFC 2119 Terminology
20. Capability Quality Characteristics
21. Editorial Standards
22. Specification Integrity
23. Relationship Architecture
24. Relationship Principles
25. Canonical Relationship Model
26. Relationship Types
27. Relationship Matrix
28. Dependency Architecture
29. Dependency Classification
30. Traceability Architecture
31. Canonical Traceability Model
32. Traceability Principles
33. Impact Analysis
34. Cross-Reference Standard
35. Relationship Verification
36. Governance Framework
37. Governance Roles
38. Ownership Model
39. Decision Governance
40. Capability Lifecycle
41. Version Management
42. Change Management
43. Review Management
44. Compliance Governance
45. Risk Management
46. Exception Management
47. Publication Governance
48. Retirement
49. Continuous Improvement
50. Capability Assurance Framework
51. Compliance Framework
52. Verification Framework
53. Verification Matrix
54. Capability Coverage Matrix
55. Traceability Verification
56. Relationship Verification
57. Editorial Verification
58. Publication Readiness Assessment
59. Publication Readiness Checklist
60. Capability Quality Metrics
61. Conformance Statement
62. Assurance Certification
63. Publication Certification
64. Figure Register
65. Table Register
66. Official Release

Appendices

- Appendix A — Mandatory Business Capability Specification Template
- Appendix B — Capability Metadata Standard
- Appendix C — Canonical Relationship Catalogue
- Appendix D — Verification Checklist
- Appendix E — Identifier Standard
- Appendix F — RFC 2119 Reference
- Appendix G — Example Business Capability Specification
- Appendix H — Capability Authoring Workflow
- Appendix I — Glossary
- Appendix J — Acronyms

---

# 1 Purpose

## 1.1 Purpose

The purpose of this standard is to establish the mandatory structure, governance, content, quality, lifecycle, and publication requirements for all Business Capability Specifications within the GCT Core Business Architecture Repository.

This standard ensures that every Business Capability Specification is produced using a consistent, repeatable, and governed methodology that supports enterprise-wide understanding, traceability, and long-term maintainability.

### 1.2 Intent

This standard establishes the canonical method for documenting Business Capabilities.

It **SHALL** provide a common framework for:

- identifying Business Capabilities;
- defining Business Capabilities;
- classifying Business Capabilities;
- governing Business Capabilities;
- tracing Business Capabilities to strategic and operational artefacts; and
- maintaining Business Capability Specifications throughout their lifecycle.

### 1.3 Expected Outcomes

Application of this standard **SHALL** result in:

- consistent Business Capability documentation;
- improved architectural governance;
- improved business traceability;
- reduced ambiguity;
- improved reuse;
- improved maintainability; and
- improved decision support.

---

# 2 Objectives

The objectives of this standard are to:

1. establish a canonical specification format;
2. ensure consistent capability identification;
3. define mandatory metadata requirements;
4. standardise capability relationships;
5. establish traceability across the Business Architecture;
6. support governance and lifecycle management;
7. improve architectural consistency;
8. provide repeatable documentation practices;
9. support implementation planning; and
10. enable future architectural evolution.

---

# 3 Scope

This standard applies to every Business Capability Specification within the GCT Core Business Architecture Repository.

The standard governs the:

- creation;
- review;
- approval;
- publication;
- maintenance; and
- retirement

of Business Capability Specifications.

This standard applies regardless of project phase or implementation technology.

---

# 4 Intended Audience

This publication is intended for:

- Business Architects
- Enterprise Architects
- Solution Architects
- Product Owners
- Business Analysts
- Platform Engineering
- Software Engineers
- Project Managers
- Governance Bodies

---

# 5 Authority

This publication derives its authority from the Business Architecture Governance Framework.

All Business Capability Specifications **SHALL** comply with this standard unless a formal exception has been approved.

---

# 6 Architecture Alignment

This standard aligns with the Business Architecture established for GCT Core.

Business Capability Specifications **SHALL** support:

- Business Vision
- Business Strategy
- Business Domains
- Business Services
- Business Processes
- Business Rules
- Business Information
- Business Events
- Business States
- Business Interfaces

Business Capability Specifications **SHALL** remain implementation independent.

---

# 7 Definitions

## Business Capability

A stable business ability that enables the organisation to achieve a defined business outcome independent of organisational structure, technology, or implementation.

## Business Capability Specification

The authoritative document describing a Business Capability, including its purpose, ownership, relationships, governance, lifecycle, and traceability.

## Capability Owner

The accountable role responsible for the governance, integrity, and lifecycle management of a Business Capability.

## Traceability

The ability to establish and maintain verifiable relationships between Business Capabilities and other Business Architecture artefacts.

## Relationship

A formally defined architectural association between two governed Business Architecture artefacts.

---

# 8 Guiding Principles

Business Capability Specifications **SHALL** be:

- business-focused;
- implementation independent;
- technology independent;
- stable over time;
- uniquely identifiable;
- traceable;
- governed;
- version controlled;
- reusable; and
- maintainable.

Every Business Capability **SHALL** represent **what** the business must be able to do rather than **how** the capability is implemented.

---

# 9 Business Objectives

This standard supports the following business objectives:

- improve strategic alignment;
- improve governance;
- improve business consistency;
- reduce duplication;
- improve traceability;
- improve decision making;
- support platform evolution; and
- enable scalable architecture.

---

# 10 Related Documents

| Identifier | Document |
|------------|----------|
| BUS-000 | Business Architecture Standard |
| BUS-001 | Business Capability Model |
| CAP-001 – CAP-027 | Business Capability Specifications |
| PRC Series | Business Process Specifications |
| ENT Series | Business Entity Specifications |
| RUL Series | Business Rule Specifications |
| EVT Series | Business Event Specifications |
| STA Series | Business State Specifications |
| SRV Series | Business Service Specifications |
| USE Series | Use Case Specifications |
| INF Series | Business Information Specifications |
| INT Series | Business Interface Specifications |
| ADR Series | Architecture Decision Records |

# 11 Change Control

## 11.1 Purpose

Change Control establishes the governance process for creating, reviewing, approving, publishing, modifying, and retiring Business Capability Specifications.

The objective is to preserve architectural integrity while allowing controlled evolution of the Business Capability Repository.

### 11.2 Change Principles

All changes **SHALL**:

- preserve the intent of the Business Capability;
- maintain architectural consistency;
- preserve traceability;
- be version controlled;
- be formally reviewed; and
- be approved before publication.

### 11.3 Types of Change

Changes **SHALL** be classified as one of the following.

| Type | Description |
|------|-------------|
| Major | Structural or semantic changes affecting the meaning, governance, or scope of a Business Capability. |
| Minor | Clarifications, metadata updates, or non-breaking improvements. |
| Editorial | Grammar, formatting, typographical, or presentation corrections that do not alter meaning. |

### 11.4 Approval Requirements

| Change Type | Approval Required |
|--------------|------------------|
| Major | Architecture Review Authority |
| Minor | Business Architecture Office |
| Editorial | Document Owner |

### 11.5 Versioning

Version numbers **SHALL** follow the format:

`Major.Minor.Revision`

Examples:

- 1.0.0
- 1.1.0
- 1.2.3
- 2.0.0

---

# 12 Canonical Capability Meta-Model

## 12.1 Purpose

The Canonical Capability Meta-Model establishes the mandatory architectural elements that constitute a Business Capability Specification.

Every Business Capability **SHALL** conform to this model.

### 12.2 Canonical Elements

Every Business Capability **SHALL** include:

- Identifier
- Name
- Description
- Purpose
- Business Outcome
- Scope
- Owner
- Relationships
- Dependencies
- Inputs
- Outputs
- Constraints
- Business Rules
- Lifecycle State
- Version
- Traceability
- Governance Metadata

### 12.3 Meta-Model Principles

The Canonical Capability Meta-Model **SHALL** be:

- complete;
- implementation independent;
- extensible;
- governed;
- reusable; and
- deterministic.

---

# 13 Capability Behavioural Model

## 13.1 Purpose

Business Capabilities describe enduring business abilities rather than operational workflows.

A Business Capability specifies **what** the organisation must be able to achieve.

Business Processes define **how** the capability is executed.

### 13.2 Behavioural Characteristics

Every Business Capability **SHALL**:

- produce measurable business outcomes;
- support one or more Business Processes;
- interact with other Business Capabilities;
- remain stable despite organisational change; and
- remain independent of technology.

### 13.3 Capability Lifecycle

Business Capabilities evolve through controlled governance while maintaining stable business intent.

The implementation of a capability **MAY** change without requiring changes to the Business Capability itself.

---

# 14 Mandatory Capability Specification Structure

Every Business Capability Specification **SHALL** contain the following sections.

| Section | Mandatory |
|----------|-----------|
| Document Information | Yes |
| Purpose | Yes |
| Business Outcome | Yes |
| Scope | Yes |
| Capability Definition | Yes |
| Business Value | Yes |
| Inputs | Yes |
| Outputs | Yes |
| Relationships | Yes |
| Dependencies | Yes |
| Constraints | Yes |
| Business Rules | Yes |
| Ownership | Yes |
| Governance | Yes |
| Lifecycle | Yes |
| Traceability | Yes |
| Revision History | Yes |

Additional sections **MAY** be included where required, provided they do not conflict with this standard.

---

# 15 Capability Specification Components

Every Business Capability Specification **SHALL** consist of three categories of information.

## 15.1 Descriptive Components

These describe the capability.

- Identifier
- Name
- Description
- Purpose
- Business Outcome
- Scope

### 15.2 Governance Components

These define accountability.

- Owner
- Steward
- Approval Authority
- Lifecycle State
- Version
- Status

### 15.3 Architectural Components

These establish relationships.

- Business Processes
- Business Rules
- Business Information
- Business Services
- Business Events
- Business States
- Business Interfaces
- Dependencies
- Traceability

---

# 16 Capability Classification

Business Capabilities **SHALL** be classified consistently throughout the Business Architecture.

## 16.1 Classification Levels

| Level | Description |
|--------|-------------|
| Strategic | Enables strategic business outcomes. |
| Core | Delivers primary business value. |
| Supporting | Enables operation of core capabilities. |
| Shared | Reusable across multiple business domains. |

### 16.2 Classification Principles

Classification **SHALL**:

- support governance;
- support planning;
- support prioritisation; and
- remain stable over time.

---

# 17 Capability Definition Standard

Every Business Capability **SHALL** satisfy the following characteristics.

A Business Capability:

- expresses a business ability;
- is independent of organisational structure;
- is independent of implementation;
- produces business value;
- supports measurable outcomes;
- has defined ownership;
- has defined governance; and
- is traceable.

Business Capabilities **SHALL** be named using concise business terminology.

Capability names **SHALL** describe enduring business abilities rather than activities, projects, departments, or technical implementations.

---

# 18 Authoring Principles

Business Capability Specifications **SHALL** be authored according to the following principles.

## 18.1 Clarity

Specifications **SHALL** be concise, unambiguous, and understandable.

### 18.2 Consistency

Terminology **SHALL** be applied consistently throughout the repository.

### 18.3 Completeness

Mandatory sections **SHALL NOT** be omitted.

### 18.4 Traceability

All referenced Business Architecture artefacts **SHALL** be uniquely identifiable.

### 18.5 Maintainability

Specifications **SHALL** support controlled evolution without unnecessary restructuring.

---

# 19 RFC 2119 Terminology

Normative language within this publication **SHALL** use the terminology defined by RFC 2119.

| Term | Meaning |
|------|---------|
| SHALL | Mandatory requirement |
| SHALL NOT | Mandatory prohibition |
| SHOULD | Recommended practice |
| SHOULD NOT | Practice generally to be avoided |
| MAY | Optional behaviour |
| MUST | Equivalent to SHALL |
| MUST NOT | Equivalent to SHALL NOT |

These terms **SHALL** be interpreted consistently throughout all Business Capability Specifications.

---

# 20 Capability Quality Characteristics

Every published Business Capability Specification **SHALL** demonstrate the following quality characteristics.

| Characteristic | Description |
|----------------|-------------|
| Correct | Represents the intended Business Capability accurately |
| Complete | Includes all mandatory information |
| Consistent | Aligns with repository standards |
| Traceable | Supports bidirectional traceability |
| Governed | Has defined ownership and approval |
| Maintainable | Supports controlled change |
| Reusable | Can be referenced without duplication |
| Verifiable | Can be independently reviewed for compliance |

---

# 21 Editorial Standards

Business Capability Specifications **SHALL** comply with the following editorial conventions.

## 21.1 Language

Specifications **SHALL**:

- use formal business language;
- avoid implementation-specific terminology;
- avoid ambiguity; and
- avoid unnecessary repetition.

### 21.2 Formatting

Specifications **SHALL** maintain consistent:

- heading structure;
- numbering;
- tables;
- references; and
- terminology.

### 21.3 Identifiers

All architectural identifiers **SHALL** be unique within the repository.

Identifiers **SHALL** remain stable throughout the lifecycle of the Business Capability.

---

# 22 Specification Integrity

## 22.1 Purpose

Specification Integrity ensures that every Business Capability Specification remains complete, accurate, internally consistent, and aligned with the Business Architecture.

### 22.2 Integrity Requirements

Every published specification **SHALL**:

- comply with CAP-000;
- contain all mandatory sections;
- use approved terminology;
- maintain complete traceability;
- define ownership;
- define governance; and
- maintain revision history.

### 22.3 Integrity Verification

Before publication, every Business Capability Specification **SHALL** undergo verification confirming:

- structural compliance;
- editorial compliance;
- governance compliance;
- relationship completeness; and
- traceability completeness.

Business Capability Specifications failing verification **SHALL NOT** be published until all non-conformities have been resolved.


# 23 Relationship Architecture

## 23.1 Purpose

The Relationship Architecture establishes the canonical framework for defining, governing, and maintaining relationships between Business Capability Specifications and other Business Architecture artefacts.

A consistent relationship architecture enables traceability, impact analysis, governance, and architectural integrity across the Business Architecture Repository.

### 23.2 Objectives

The Relationship Architecture SHALL:

- define approved relationship types;
- establish consistent relationship semantics;
- support architectural traceability;
- enable dependency analysis;
- facilitate impact assessment; and
- improve repository consistency.

### 23.3 Architectural Principles

Relationships SHALL:

- be explicitly defined;
- be uniquely identifiable;
- be semantically consistent;
- be governed;
- support bidirectional navigation where appropriate; and
- remain implementation independent.

---

# 24 Relationship Principles

Every Business Capability Specification SHALL comply with the following relationship principles.

## 24.1 Explicit Relationships

All architectural relationships SHALL be explicitly documented.

Implicit or assumed relationships SHALL NOT be relied upon.

### 24.2 Canonical Relationships

Only approved relationship types defined within this standard SHALL be used.

### 24.3 Stable Relationships

Relationships SHALL describe enduring business architecture and SHALL NOT represent temporary implementation details.

### 24.4 Traceable Relationships

Every relationship SHALL support architectural traceability and impact analysis.

---

# 25 Canonical Relationship Model

The Canonical Relationship Model defines the approved relationship categories used throughout the Business Architecture Repository.

## 25.1 Relationship Categories

| Category | Purpose |
|----------|---------|
| Structural | Defines architectural composition and hierarchy |
| Behavioural | Describes interactions and business behaviour |
| Dependency | Identifies prerequisite capabilities or artefacts |
| Governance | Defines ownership and accountability |
| Traceability | Links related architectural artefacts |
| Information | Defines information exchange relationships |

### 25.2 Canonical Model Principles

The Canonical Relationship Model SHALL:

- use standard relationship terminology;
- avoid duplicate relationship definitions;
- support repository consistency;
- enable impact analysis; and
- facilitate architectural governance.

---

# 26 Relationship Types

The following relationship types are approved for use within Business Capability Specifications.

| Relationship Type | Description |
|-------------------|-------------|
| Depends On | One capability requires another capability to function. |
| Enables | One capability enables another business capability or outcome. |
| Uses | A capability consumes another governed artefact. |
| Produces | A capability creates or delivers an artefact or outcome. |
| Owns | A capability has governance responsibility for an artefact. |
| References | A capability references another architectural artefact. |
| Triggers | A capability initiates another business event or process. |
| Supports | A capability contributes to another capability or objective. |
| Governs | A capability provides governance over another artefact. |
| Realises | A capability realises a business objective or strategic outcome. |

Additional relationship types SHALL require formal approval by the Business Architecture Office.

---

# 27 Relationship Matrix

The Relationship Matrix identifies the approved relationships between Business Capability Specifications and other Business Architecture artefacts.

| Source | Target | Relationship |
|---------|--------|--------------|
| Capability | Capability | Depends On, Enables, Supports |
| Capability | Business Process | Enables |
| Capability | Business Service | Provides, Uses |
| Capability | Business Rule | Governed By |
| Capability | Business Information | Uses, Produces |
| Capability | Business Event | Triggered By, Triggers |
| Capability | Business State | Transitions |
| Capability | Business Interface | Uses |
| Capability | Architecture Decision Record | References |

Relationship definitions SHALL remain consistent across the repository.

---

# 28 Dependency Architecture

## 28.1 Purpose

Dependency Architecture defines how Business Capability Specifications express reliance upon other Business Architecture artefacts.

Dependencies support:

- sequencing;
- planning;
- governance;
- implementation;
- impact analysis; and
- change management.

### 28.2 Dependency Principles

Dependencies SHALL:

- be explicit;
- be justified;
- be traceable;
- avoid unnecessary coupling; and
- support independent evolution where practical.

---

# 29 Dependency Classification

Dependencies SHALL be classified according to their architectural purpose.

| Dependency Type | Description |
|-----------------|-------------|
| Mandatory | Required for capability operation |
| Optional | Enhances capability but is not required |
| Shared | Common dependency across multiple capabilities |
| External | Outside the Business Architecture Repository |
| Strategic | Supports strategic business objectives |

Dependencies SHALL be reviewed during architecture governance.

---

# 30 Traceability Architecture

## 30.1 Purpose

The Traceability Architecture establishes the framework for linking Business Capability Specifications to all relevant Business Architecture artefacts.

Traceability supports:

- governance;
- impact analysis;
- compliance;
- change management; and
- architectural integrity.

### 30.2 Traceability Principles

Traceability SHALL be:

- complete;
- accurate;
- current;
- bidirectional where appropriate;
- governed; and
- verifiable.

---

# 31 Canonical Traceability Model

Business Capability Specifications SHALL maintain traceability to the following artefacts where applicable.

| Artefact | Traceability Required |
|-----------|-----------------------|
| Business Objective | Yes |
| Business Capability | Yes |
| Business Process | Yes |
| Business Rule | Yes |
| Business Service | Yes |
| Business Information | Yes |
| Business Event | Yes |
| Business State | Yes |
| Business Interface | Yes |
| Architecture Decision Record | Yes |

Traceability SHALL support end-to-end navigation throughout the repository.

---

# 32 Traceability Principles

Every Business Capability Specification SHALL satisfy the following traceability principles.

## 32.1 Completeness

All mandatory relationships SHALL be represented.

### 32.2 Accuracy

Traceability SHALL accurately reflect the current Business Architecture.

### 32.3 Consistency

Relationship terminology SHALL remain consistent across all specifications.

### 32.4 Maintainability

Traceability SHALL remain current throughout the lifecycle of the Business Capability.

---

# 33 Impact Analysis

## 33.1 Purpose

Impact Analysis evaluates the consequences of proposed changes to Business Capability Specifications and their related architectural artefacts.

### 33.2 Assessment Areas

Impact Analysis SHALL consider:

- dependent Business Capabilities;
- Business Processes;
- Business Services;
- Business Rules;
- Business Information;
- Business Events;
- Business States;
- governance responsibilities; and
- architectural traceability.

### 33.3 Outcome

Impact assessments SHALL be documented prior to approval of major changes.

---

# 34 Cross-Reference Standard

Business Capability Specifications SHALL use consistent cross-referencing throughout the repository.

Cross-references SHALL:

- reference approved identifiers;
- avoid ambiguous naming;
- remain stable across versions;
- support repository navigation; and
- preserve traceability.

Broken references SHALL be corrected before publication.

---

# 35 Relationship Verification

Before publication, relationship verification SHALL confirm:

- approved relationship types are used;
- all referenced artefacts exist;
- identifiers are valid;
- relationship semantics are correct;
- duplicate relationships have been eliminated; and
- traceability is complete.

Specifications failing relationship verification SHALL NOT be published until all issues have been resolved.

---

# 36 Governance Framework

## 36.1 Purpose

The Governance Framework establishes accountability for the creation, maintenance, approval, publication, and retirement of Business Capability Specifications.

### 36.2 Governance Objectives

The Governance Framework SHALL:

- define ownership;
- establish approval authority;
- ensure compliance;
- maintain architectural integrity;
- support lifecycle management; and
- enable continuous improvement.

### 36.3 Governance Principles

Governance SHALL be:

- transparent;
- accountable;
- consistent;
- auditable;
- repeatable; and
- aligned with the Business Architecture Governance Framework.

Business Capability Specifications SHALL remain under governance for their entire lifecycle.


# 37 Governance Roles

## 37.1 Purpose

Governance Roles establish clear accountability for the creation, review, approval, publication, maintenance, and retirement of Business Capability Specifications.

Every Business Capability Specification SHALL have defined governance responsibilities throughout its lifecycle.

### 37.2 Governance Responsibilities

| Role | Responsibility |
|------|----------------|
| Business Architecture Office | Owns the Business Capability Specification Standard and governs repository integrity |
| Capability Owner | Accountable for the business capability and its specification |
| Capability Steward | Responsible for maintaining the specification and coordinating changes |
| Architecture Review Authority | Reviews and approves major architectural changes |
| Publication Authority | Authorises official publication |
| Contributors | Prepare and maintain specification content |
| Reviewers | Verify quality, compliance, and consistency |

### 37.3 Governance Principles

Governance SHALL:

- define accountability;
- maintain architectural consistency;
- support controlled evolution;
- ensure compliance; and
- provide an auditable approval process.

---

# 38 Ownership Model

## 38.1 Purpose

The Ownership Model defines accountability for each Business Capability Specification.

Ownership SHALL remain assigned for the entire lifecycle of the capability.

### 38.2 Ownership Requirements

Every Business Capability SHALL identify:

- Capability Owner;
- Capability Steward;
- Approval Authority; and
- Publication Authority.

Ownership SHALL be reviewed whenever organisational responsibilities change.

### 38.3 Ownership Responsibilities

Capability Owners SHALL:

- approve business intent;
- approve scope changes;
- approve business outcomes;
- support governance reviews; and
- ensure ongoing business relevance.

Capability Stewards SHALL:

- maintain documentation;
- coordinate reviews;
- maintain traceability;
- update metadata; and
- manage revision history.

---

# 39 Decision Governance

## 39.1 Purpose

Decision Governance establishes the process for making architectural decisions affecting Business Capability Specifications.

### 39.2 Decision Principles

Architectural decisions SHALL:

- be documented;
- be justified;
- be traceable;
- be reviewable; and
- support long-term maintainability.

### 39.3 Decision Records

Significant architectural decisions SHOULD be recorded using Architecture Decision Records (ADRs).

Business Capability Specifications SHOULD reference relevant ADRs where appropriate.

---

# 40 Capability Lifecycle

## 40.1 Purpose

The Capability Lifecycle defines the controlled progression of Business Capability Specifications from creation through retirement.

### 40.2 Lifecycle States

| State | Description |
|-------|-------------|
| Draft | Initial development |
| Under Review | Formal review in progress |
| Approved | Approved for publication |
| Published | Official repository version |
| Deprecated | Scheduled for retirement |
| Retired | No longer active |

### 40.3 Lifecycle Management

Business Capability Specifications SHALL transition through lifecycle states only via approved governance processes.

---

# 41 Version Management

## 41.1 Purpose

Version Management ensures controlled evolution of Business Capability Specifications.

### 41.2 Version Numbering

Specifications SHALL use semantic versioning.

| Version Element | Meaning |
|-----------------|---------|
| Major | Breaking architectural change |
| Minor | New capability content without breaking existing intent |
| Revision | Editorial or corrective updates |

Examples:

- 1.0.0
- 1.1.0
- 1.1.1
- 2.0.0

### 41.3 Version History

Every specification SHALL maintain a revision history identifying:

- version;
- date;
- summary of change;
- author; and
- approval.

---

# 42 Change Management

## 42.1 Purpose

Change Management governs modifications to Business Capability Specifications while preserving repository integrity.

### 42.2 Change Principles

Changes SHALL:

- preserve business intent;
- maintain traceability;
- preserve governance;
- be reviewed; and
- be approved before publication.

### 42.3 Change Categories

Changes SHALL be classified as:

- Major;
- Minor; or
- Editorial.

Each category SHALL follow the approval requirements defined in this standard.

---

# 43 Review Management

## 43.1 Purpose

Review Management establishes the formal review process for Business Capability Specifications.

### 43.2 Review Objectives

Reviews SHALL verify:

- completeness;
- correctness;
- governance;
- traceability;
- editorial quality; and
- compliance.

### 43.3 Review Participants

Reviews MAY involve:

- Business Architects;
- Enterprise Architects;
- Domain Experts;
- Product Owners;
- Capability Owners; and
- Governance Representatives.

---

# 44 Compliance Governance

## 44.1 Purpose

Compliance Governance ensures that every published Business Capability Specification conforms to CAP-000.

### 44.2 Compliance Requirements

Compliance SHALL include verification of:

- mandatory structure;
- metadata;
- identifiers;
- relationships;
- governance;
- traceability;
- lifecycle; and
- editorial standards.

### 44.3 Non-Conformance

Non-conformities SHALL be:

- documented;
- assessed;
- resolved; or
- formally approved as exceptions.

---

# 45 Risk Management

## 45.1 Purpose

Risk Management identifies and manages risks affecting Business Capability Specifications.

### 45.2 Typical Risks

Examples include:

- incomplete documentation;
- inconsistent terminology;
- broken traceability;
- unclear ownership;
- duplicate capabilities; and
- governance failures.

### 45.3 Risk Treatment

Risks SHALL be:

- identified;
- assessed;
- documented;
- monitored; and
- resolved where appropriate.

---

# 46 Exception Management

## 46.1 Purpose

Exception Management governs approved deviations from this standard.

### 46.2 Exception Principles

Exceptions SHALL:

- be documented;
- include justification;
- identify affected specifications;
- identify approving authority; and
- define review dates.

Exceptions SHALL be reviewed periodically to determine continued validity.

---

# 47 Publication Governance

## 47.1 Purpose

Publication Governance defines the process for officially releasing Business Capability Specifications.

### 47.2 Publication Requirements

Prior to publication, every specification SHALL:

- complete review;
- complete verification;
- satisfy compliance requirements;
- receive formal approval; and
- receive a publication version.

### 47.3 Repository Publication

Only approved specifications SHALL be published to the Business Architecture Repository.

---

# 48 Retirement

## 48.1 Purpose

Retirement governs the controlled withdrawal of obsolete Business Capability Specifications.

### 48.2 Retirement Criteria

A specification MAY be retired when:

- superseded;
- no longer relevant;
- merged into another capability; or
- formally withdrawn.

### 48.3 Retirement Process

Retired specifications SHALL:

- retain historical versions;
- preserve identifiers;
- maintain traceability; and
- clearly indicate retirement status.

Identifiers SHALL NOT be reused following retirement.

---

# 49 Continuous Improvement

## 49.1 Purpose

Continuous Improvement ensures that the Business Capability Specification Standard remains effective and relevant.

### 49.2 Improvement Sources

Improvements MAY arise from:

- governance reviews;
- implementation experience;
- architecture reviews;
- repository audits;
- stakeholder feedback; and
- lessons learned.

### 49.3 Improvement Principles

Improvements SHALL:

- preserve consistency;
- improve clarity;
- reduce ambiguity;
- strengthen governance; and
- maintain architectural integrity.

---

# 50 Capability Assurance Framework

## 50.1 Purpose

The Capability Assurance Framework provides confidence that published Business Capability Specifications meet the required standards of quality, governance, and completeness.

### 50.2 Assurance Objectives

The framework SHALL ensure that specifications are:

- complete;
- accurate;
- consistent;
- governed;
- traceable;
- maintainable; and
- publication ready.

### 50.3 Assurance Activities

Capability assurance SHALL include:

- governance review;
- structural verification;
- relationship verification;
- traceability verification;
- editorial review;
- compliance assessment; and
- publication approval.

Business Capability Specifications SHALL successfully complete the Capability Assurance Framework before official publication.


# 51 Compliance Framework

## 51.1 Purpose

The Compliance Framework establishes the mandatory requirements for verifying that every Business Capability Specification conforms to the requirements defined by CAP-000.

Compliance ensures consistency, governance, quality, maintainability, and architectural integrity across the Business Architecture Repository.

### 51.2 Compliance Objectives

The Compliance Framework SHALL:

- establish mandatory compliance criteria;
- support consistent governance;
- ensure repository integrity;
- enable repeatable verification;
- support publication readiness; and
- provide an auditable compliance process.

### 51.3 Compliance Requirements

Every Business Capability Specification SHALL comply with:

- document structure;
- mandatory metadata;
- identifier standards;
- relationship standards;
- traceability requirements;
- governance requirements;
- lifecycle requirements;
- editorial standards; and
- publication requirements.

Non-conformance SHALL be documented and resolved prior to publication unless formally approved as an exception.

---

# 52 Verification Framework

## 52.1 Purpose

The Verification Framework establishes the activities required to confirm that a Business Capability Specification is complete, accurate, governed, and suitable for publication.

### 52.2 Verification Objectives

Verification SHALL confirm:

- completeness;
- correctness;
- consistency;
- governance compliance;
- relationship integrity;
- traceability completeness;
- editorial quality; and
- publication readiness.

### 52.3 Verification Activities

Verification SHALL include:

- structural review;
- metadata validation;
- identifier validation;
- relationship validation;
- traceability validation;
- governance validation;
- editorial review; and
- compliance assessment.

---

# 53 Verification Matrix

The Verification Matrix identifies the mandatory verification activities required before publication.

| Verification Area | Verification Requirement |
|-------------------|--------------------------|
| Structure | Mandatory sections completed |
| Metadata | Mandatory metadata present |
| Governance | Ownership assigned |
| Relationships | Canonical relationships verified |
| Traceability | Required traceability established |
| Lifecycle | Lifecycle state assigned |
| Editorial | Editorial standards satisfied |
| Compliance | CAP-000 compliance confirmed |
| Publication | Approval completed |

Verification records SHALL be retained as part of the repository audit trail.

---

# 54 Capability Coverage Matrix

The Capability Coverage Matrix confirms that every Business Capability Specification contains the required architectural content.

| Capability Element | Mandatory |
|--------------------|-----------|
| Identifier | Yes |
| Name | Yes |
| Description | Yes |
| Purpose | Yes |
| Business Outcome | Yes |
| Scope | Yes |
| Business Value | Yes |
| Inputs | Yes |
| Outputs | Yes |
| Dependencies | Yes |
| Relationships | Yes |
| Business Rules | Yes |
| Ownership | Yes |
| Governance | Yes |
| Lifecycle | Yes |
| Traceability | Yes |
| Version Information | Yes |
| Revision History | Yes |

All mandatory elements SHALL be completed before publication.

---

# 55 Traceability Verification

## 55.1 Purpose

Traceability Verification confirms that Business Capability Specifications maintain complete and accurate relationships with the wider Business Architecture.

### 55.2 Verification Criteria

Verification SHALL confirm:

- identifiers are valid;
- referenced artefacts exist;
- relationships are complete;
- traceability is current;
- bidirectional relationships are maintained where applicable; and
- repository references remain valid.

Broken traceability SHALL be corrected before publication.

---

# 56 Relationship Verification

## 56.1 Purpose

Relationship Verification confirms that every architectural relationship complies with the Canonical Relationship Model.

### 56.2 Verification Criteria

Relationship verification SHALL confirm:

- approved relationship types are used;
- relationship semantics are correct;
- duplicate relationships have been eliminated;
- referenced artefacts exist; and
- relationships support governance and impact analysis.

Specifications failing relationship verification SHALL NOT be published.

---

# 57 Editorial Verification

## 57.1 Purpose

Editorial Verification ensures that every Business Capability Specification complies with the editorial conventions defined by CAP-000.

### 57.2 Verification Criteria

Editorial verification SHALL confirm:

- consistent heading structure;
- consistent numbering;
- approved terminology;
- correct grammar and spelling;
- formatting consistency;
- valid references; and
- publication quality.

Editorial corrections SHALL NOT alter architectural meaning.

---

# 58 Publication Readiness Assessment

## 58.1 Purpose

Publication Readiness Assessment determines whether a Business Capability Specification is suitable for official publication.

### 58.2 Readiness Criteria

A specification SHALL be considered publication ready when:

- all mandatory sections are complete;
- governance approval has been obtained;
- verification has been completed;
- compliance has been confirmed;
- version information has been assigned;
- publication authority approval has been received.

Specifications failing any readiness criterion SHALL remain unpublished.

---

# 59 Publication Readiness Checklist

The following checklist SHALL be completed before publication.

| Checklist Item | Complete |
|----------------|----------|
| Mandatory sections completed | □ |
| Metadata completed | □ |
| Ownership assigned | □ |
| Relationships verified | □ |
| Traceability verified | □ |
| Governance completed | □ |
| Editorial review completed | □ |
| Compliance confirmed | □ |
| Approval received | □ |
| Version assigned | □ |
| Repository updated | □ |

Completion of this checklist SHALL form part of the publication record.

---

# 60 Capability Quality Metrics

Business Capability Specifications SHALL be assessed using the following quality metrics.

| Quality Metric | Objective |
|----------------|-----------|
| Completeness | All mandatory content present |
| Correctness | Accurate representation of the business capability |
| Consistency | Compliance with repository standards |
| Governance | Defined ownership and accountability |
| Traceability | Complete architectural traceability |
| Maintainability | Supports controlled evolution |
| Reusability | Suitable for reuse across the repository |
| Publication Quality | Meets publication standards |

Quality metrics SHALL support continuous improvement activities.

---

# 61 Conformance Statement

A Business Capability Specification SHALL be considered conformant when it:

- complies with CAP-000;
- satisfies all mandatory requirements;
- successfully completes verification;
- receives formal approval; and
- is published within the Business Architecture Repository.

Conformance SHALL be maintained throughout the lifecycle of the specification.

---

# 62 Assurance Certification

Following successful verification and compliance assessment, the responsible reviewer SHALL certify that the Business Capability Specification satisfies the requirements of CAP-000.

Certification SHALL record:

- specification identifier;
- specification version;
- certification date;
- reviewer; and
- certification outcome.

---

# 63 Publication Certification

Publication Certification records the formal approval for release.

Certification SHALL confirm that the specification:

- has completed governance review;
- has completed verification;
- has completed compliance assessment;
- has received publication approval; and
- is authorised for repository publication.

Publication Authority approval SHALL constitute the official release of the specification.

---

# 64 Figure Register

The following figures are defined within this publication.

| Figure | Description |
|---------|-------------|
| Figure CAP-000-1 | Architecture Context |
| Figure CAP-000-2 | Canonical Capability Meta-Model |
| Figure CAP-000-3 | Capability Behavioural Model |
| Figure CAP-000-4 | Canonical Relationship Model |
| Figure CAP-000-5 | Canonical Traceability Model |
| Figure CAP-000-6 | Capability Lifecycle |

Future editions SHALL update this register as figures are added, modified, or retired.

---

# 65 Table Register

The following tables are defined within this publication.

| Table | Description |
|--------|-------------|
| Table CAP-000-1 | Mandatory Capability Specification Structure |
| Table CAP-000-2 | Capability Specification Components |
| Table CAP-000-3 | Capability Classification |
| Table CAP-000-4 | RFC 2119 Terminology |
| Table CAP-000-5 | Capability Quality Characteristics |
| Table CAP-000-6 | Relationship Categories |
| Table CAP-000-7 | Relationship Matrix |
| Table CAP-000-8 | Dependency Classification |
| Table CAP-000-9 | Governance Responsibilities |
| Table CAP-000-10 | Capability Lifecycle States |
| Table CAP-000-11 | Version Management |
| Table CAP-000-12 | Compliance Framework |
| Table CAP-000-13 | Verification Matrix |
| Table CAP-000-14 | Capability Coverage Matrix |
| Table CAP-000-15 | Publication Readiness Checklist |
| Table CAP-000-16 | Capability Quality Metrics |

Future editions SHALL maintain this register as the authoritative index of tables.

---

# 66 Official Release

## 66.1 Publication Statement

CAP-000 — **Business Capability Specification Standard** Version **1.0.0** is the approved standard governing the creation, governance, maintenance, and publication of Business Capability Specifications within the GCT Core Business Architecture Repository.

All Business Capability Specifications SHALL comply with this standard unless a formally approved exception has been granted.

This publication becomes effective on the approved publication date and remains in force until superseded or formally retired through the Business Architecture Governance Framework.

---

# Appendix A — Mandatory Business Capability Specification Template (Normative)

Every Business Capability Specification SHALL include, as a minimum:

1. Document Information
2. Purpose
3. Business Outcome
4. Scope
5. Capability Definition
6. Business Value
7. Inputs
8. Outputs
9. Relationships
10. Dependencies
11. Business Rules
12. Ownership
13. Governance
14. Lifecycle
15. Traceability
16. Revision History

---

# Appendix B — Capability Metadata Standard (Normative)

Mandatory metadata SHALL include:

- Capability Identifier
- Capability Name
- Version
- Status
- Owner
- Steward
- Approval Authority
- Lifecycle State
- Effective Date
- Review Date

---

# Appendix C — Canonical Relationship Catalogue (Normative)

Approved relationship types include:

- Depends On
- Enables
- Uses
- Produces
- Owns
- References
- Triggers
- Supports
- Governs
- Realises

Additional relationship types SHALL require formal approval by the Business Architecture Office.

---

# Appendix D — Verification Checklist (Normative)

Verification SHALL confirm:

- document completeness;
- metadata completeness;
- governance assignment;
- relationship integrity;
- traceability completeness;
- editorial compliance;
- publication readiness; and
- overall CAP-000 compliance.

---

# Appendix E — Identifier Standard (Normative)

Business Capability identifiers SHALL:

- be unique;
- remain stable throughout their lifecycle;
- follow the approved repository naming convention; and
- never be reused after retirement.

---

# Appendix F — RFC 2119 Reference (Normative)

Normative language within this publication SHALL be interpreted in accordance with RFC 2119.

The following terms are used:

- SHALL
- SHALL NOT
- SHOULD
- SHOULD NOT
- MAY
- MUST
- MUST NOT

---

# Appendix G — Example Business Capability Specification (Informative)

This appendix provides an illustrative example of a Business Capability Specification prepared in accordance with CAP-000.

The example is informative only and introduces no additional mandatory requirements.

---

# Appendix H — Capability Authoring Workflow (Informative)

The recommended authoring workflow is:

1. Identify the Business Capability.
2. Define the business outcome.
3. Complete mandatory metadata.
4. Establish architectural relationships.
5. Define governance responsibilities.
6. Complete traceability.
7. Perform verification.
8. Obtain approvals.
9. Publish to the Business Architecture Repository.

---

# Appendix I — Glossary (Informative)

This appendix consolidates the business architecture terminology used throughout CAP-000 and serves as the authoritative glossary for Business Capability Specifications.

---

# Appendix J — Acronyms (Informative)

| Acronym | Meaning |
|----------|---------|
| ADR | Architecture Decision Record |
| BUS | Business Architecture Standard |
| CAP | Business Capability Specification |
| ENT | Business Entity Specification |
| EVT | Business Event Specification |
| INF | Business Information Specification |
| INT | Business Interface Specification |
| PRC | Business Process Specification |
| RUL | Business Rule Specification |
| SRV | Business Service Specification |
| STA | Business State Specification |
| USE | Use Case Specification |

---

# End of Publication

## CAP-000 — Business Capability Specification Standard

| Attribute | Value |
|-----------|-------|
| Version | 1.0.0 |
| Publication Status | Approved |
| Repository Classification | Business Architecture Standard |
| Owner | Business Architecture Office |
| Copyright | © Go Cape Tours |

This concludes the **CAP-000 Business Capability Specification Standard Version 1.0.0 Publication Edition**.