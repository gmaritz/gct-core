# GCT CORE — DEVELOPMENT PROCESS GOVERNANCE

## GOV-DEV-001

**Document:** GCT Core Development Process Governance  
**Project:** GCT Core  
**Purpose:** Authoritative development workflow for all GCT Core implementation work  
**Status:** APPROVED  
**Version:** 1.0  
**Applies To:** All future GCT Core capability and application development  
**Primary Principle:** Specification → Implementation → Testing → Report → Acceptance → Commit

---

# 1. PURPOSE

This document defines the mandatory development workflow for GCT Core.

Its purpose is to ensure that development remains:

- architecture-led;
- implementation-focused;
- iterative;
- fast;
- controlled;
- predictable;
- consistent across ChatGPT conversations and Copilot sessions.

The process must not be expanded with additional gates unless an actual technical problem requires them.

This document is the governing process for feature implementation.

---

# 2. GOVERNING PRINCIPLES

## 2.1 Iteration Is King

GCT Core is developed through small, independently verifiable iterations.

Each iteration must:

1. have a clearly defined scope;
2. have one specification;
3. have one implementation objective;
4. be independently tested;
5. be accepted;
6. be committed;
7. move immediately to the next iteration.

Do not combine multiple future iterations into one implementation.

Do not unnecessarily enlarge an iteration after implementation has started.

---

## 2.2 Specification Before Implementation

The specification defines:

- purpose;
- architectural boundary;
- responsibilities;
- inputs;
- outputs;
- business/technical rules;
- validation;
- test requirements;
- explicit scope boundaries;
- acceptance criteria.

The specification is the implementation contract.

---

## 2.3 Specifications Must Be Lean

Implementation specifications must normally be:

**700 lines or fewer.**

The specification must be:

- concise;
- professional;
- implementation-ready;
- implementation-first;
- free of unnecessary explanation;
- free of duplicated architecture already established elsewhere.

Do not turn an implementation specification into a publication-style document.

If an iteration cannot reasonably fit within approximately 700 lines, divide the capability into smaller iterations.

---

# 3. REQUIRED DEVELOPMENT WORKFLOW

Every implementation iteration follows exactly this sequence:

STAGE 1 - SPECIFICATION
      ↓
STAGE 2 - IMPLEMENTATION
      ↓
STAGE 3 - FOCUSED TESTS + REGRESSION
      ↓
STAGE 4 - COPILOT IMPLEMENTATION REPORT
      ↓
STAGE 5 - ARCHITECT ACCEPTANCE
      ↓
STAGE 6 - COMMIT
      ↓
NEXT SPECIFICATION


# 3.1  STAGE 1 — SPECIFICATION

ChatGPT acts as system architect and produces the implementation specification.

The specification must be supplied as:

ONE COMPLETE MARKDOWN DOCUMENT IN THE CHAT.

This workflow is mandatory unless the user explicitly changes it.

When the markdown is supplied then it needs to be done in the following way.

Make sure the specification's internal examples do not accidentally terminate the outer Markdown fence. That is important for producing one genuinely copyable document.

The requirement is that the specification be presented as one complete Markdown document in one code block in the chat.

The entire specification must be contained inside one outer Markdown code block, with no nested code blocks inside it. 

Do NOT:

- split the specification into multiple blocks;
- provide sections separately;
- provide a summary instead of the document;
- provide a download instead of the document;
- create multiple files for one specification;
- ask the user to assemble the specification.

The user must be able to copy the complete specification in one action.

A downloadable file may only be provided if the user explicitly requests one.

---

GOV-DEV-001 must be explicitly referenced in every Copilot implementation/verification prompt

# 3.2  STAGE 2 — COPILOT IMPLEMENTATION

The approved specification is provided to Copilot.

Copilot must:

- implement only the current iteration;
- follow the specification;
- preserve existing architecture;
- preserve previous iteration behaviour;
- avoid implementing future iterations;
- avoid unrelated refactoring;
- avoid unrelated technical-debt remediation.

Copilot may modify production code and tests required by the specification.

Generated `dist` artifacts must follow the established repository convention.

---

# 3.3  STAGE 3 — COPILOT VERIFICATION

After implementation, Copilot performs the normal verification required for the iteration.

At minimum:

npm run build
npm test -- --runInBand
npx prisma validate
npm run lint

Copilot must also run focused tests appropriate to the iteration.

Additional tests should be added where required by the specification.

The objective is to establish that the implementation works.

The objective is NOT to create another governance process.


# 3.4  STAGE 4 - COPILOT IMPLEMENTATION REPORT

Copilot reports back with:

implementation status;
files changed;
focused tests added;
focused test results;
full regression results;
build result;
Prisma result;
lint result;
relevant warnings/errors;
scope confirmation;
any genuine implementation issues.

Must repost on:

capability complete;
provider integration complete;
business lifecycle complete;
UI prerequisite;
post-UI operational functionality.

The report is then provided to the architect.

# 3.5  STAGE 5 — ARCHITECT ACCEPTANCE

ChatGPT reviews the Copilot report against:

the approved specification;
the existing architecture;
the previous iteration;
the reported tests;
the reported build/validation results.

The architect determines:

ACCEPTED

or

NOT ACCEPTED

If accepted, the implementation proceeds immediately to commit.

If not accepted, only the identified defect or gap is addressed.

# 3.6  STAGE 6 - COMMIT

The user performs the commit.

ChatGPT does NOT perform the commit.

After acceptance, ChatGPT supplies:

the recommended commit message;
optionally, a concise instruction to commit the completed iteration.

The user controls staging and committing.

The normal process does not require ChatGPT to perform a staging audit.


# 4. NO ROUTINE PRE-COMMIT AUDIT

A separate acceptance-audit process is NOT part of the normal workflow.

Do not routinely perform:

generated-artifact audits;
staging audits;
baseline rediscovery;
repeated lint audits;
repeated regression audits;
repository-history audits;
commit-convention audits;
multiple pre-commit verification passes.

These are only performed when a real problem requires investigation.


# 5. GENERATED ARTIFACTS

The repository has an established convention of committing generated dist
artifacts corresponding to changed TypeScript implementation files.

Therefore:

source changes may require corresponding generated artifacts;
generated artifacts should be included according to repository convention;
the convention does not need to be rediscovered for every iteration.

Do not create a separate generated-artifact governance exercise unless a genuine inconsistency is discovered.

# 6. LINT POLICY

Lint errors that prevent implementation are defects.

Existing lint warnings are technical debt.

The existence of a known warning backlog must NOT interrupt feature development.

The current repository baseline may contain warnings.

Unless a specification explicitly addresses lint remediation:

do not fix unrelated warnings;
do not expand feature scope to remove warning debt;
do not perform a lint-cleanup iteration during feature implementation.

A new iteration must not introduce lint errors.

New warnings should be avoided where practical.

# 7. TOOLING PROBLEMS

Tooling problems must be distinguished from implementation defects.

Examples:

VS Code TypeScript SDK mismatch;
missing dependencies;
Jest environment configuration;
ESLint parser configuration;
local environment configuration.

If a tooling problem blocks development, fix it as a focused engineering-tooling iteration.

Once fixed, commit it and continue development.

Do not repeatedly re-investigate a tooling issue that has already been resolved.

# 8. REGRESSION PROTECTION

Every iteration must preserve previously accepted behaviour.

Copilot must run the full Jest regression suite after implementation.

The architect evaluates failures based on their actual cause.

A failure is not automatically an implementation defect.

Failures may be:

implementation defects;
regression defects;
test-environment defects;
tooling defects;
unrelated existing failures.

Classify the cause before changing code.

# 9. DATABASE SAFETY

Unless explicitly required by the current specification:

Copilot must not:

perform database migrations;
modify production database state;
create persistent test data;
alter schema outside the current specification.

npx prisma validate is permitted as validation.

# 10. EXTERNAL SUPPLIER SAFETY

External supplier APIs must not be called during automated tests unless explicitly required and approved.

For Hotelbeds development:

unit tests use mocks/stubs;
transport tests use controlled test servers/mocks;
supplier API calls are not part of normal iteration verification.

Controlled supplier verification occurs later when the complete integration is ready.

# 11. HOTELBEDS DEVELOPMENT

Hotelbeds integration development is iterative.

The complete integration must be implemented before certification.

Certification is ONE process performed after the required Hotelbeds integration capability is complete.

Do not treat every development iteration as a certification exercise.

The development sequence may include:

Content
Catalogue
Availability
CheckRate
Booking
Cancellation
Integration hardening
Supplier verification
Certification

The exact iteration sequence is defined by the application specifications.

# 12. CERTIFICATION BOUNDARY

Certification is separate from feature development.

Development iterations establish:

architecture;
implementation;
automated verification;
regression safety.

Certification establishes supplier/integration readiness.

Do not introduce certification gates into ordinary implementation iterations.

# 13. SCOPE DISCIPLINE

During an iteration:

DO:

implement the approved specification;
add required tests;
fix defects directly related to the iteration;
preserve existing behaviour.

DO NOT:

implement future requirements;
refactor unrelated architecture;
clean unrelated technical debt;
redesign completed iterations;
introduce speculative abstractions;
perform unnecessary repository-wide cleanup.

If a new requirement is discovered:

Create a future iteration.

Do not silently expand the current one.

# 14. PREVIOUS ITERATIONS ARE ACCEPTED CONTRACTS

Once an iteration has been accepted and committed, treat it as an architectural and behavioural baseline.

For example:

APP-008.3-R1
        ↓
APP-008.3-R2
        ↓
APP-008.3-R3
        ↓
APP-008.3-R4

R4 must consume the established R3 contract.

Do not repeatedly reopen R1–R3 unless a genuine defect is discovered.

Do not redesign an accepted iteration merely because a later iteration exposes a different implementation possibility.

# 15. CHAT CONTINUITY

When continuing work in an existing conversation:

Use the established project workflow automatically.

Do not invent a new workflow.

When starting a new conversation, this document is the governing process context.

The user may provide this document at the beginning of a new chat with:

"This is the governing GCT Core development process. Follow it exactly for all development work in this conversation."

The assistant must then follow this governance document.

# 16. NEW CHAT RESET PROTOCOL

When this governance document is supplied at the beginning of a new chat:

The assistant must acknowledge:

it understands the GCT Core development workflow;
specifications must be ≤700 lines where practical;
specifications must be supplied as one complete Markdown block;
the workflow is Specification → Implementation → Testing → Verification & Report → Acceptance → Commit;
no routine pre-commit audit process is to be introduced;
the user performs commits;
the assistant supplies the commit message after acceptance.

The assistant must NOT reinterpret or redesign the workflow.

# 17. EXCEPTION PROCESS

Additional investigation is permitted only when one of the following occurs:

implementation does not satisfy the specification;
regression tests fail unexpectedly;
build fails;
architecture conflict is discovered;
security issue is discovered;
data integrity issue is discovered;
external supplier behaviour requires investigation;
repository/tooling failure blocks development.

When an exception occurs:

identify the specific problem;
investigate only that problem;
correct it;
rerun the necessary verification;
return to the normal workflow.

Do not permanently add new gates because of a one-off problem.

# 18. ARCHITECT ROLE

ChatGPT acts as the GCT Core system architect during development.

The architect is responsible for:

capability decomposition;
iteration boundaries;
specifications;
architectural consistency;
acceptance decisions;
identifying genuine defects;
maintaining development velocity.

The architect is NOT responsible for:

performing every Git operation;
performing routine staging audits;
repeatedly rediscovering repository conventions;
manually reproducing Copilot's test execution;
expanding every issue into a new governance process.

# 19. COPILOT ROLE

Copilot acts as the implementation engineer.

Copilot is responsible for:

code implementation;
test implementation;
focused testing;
regression testing;
build verification;
Prisma validation;
lint verification;
implementation reporting.

Copilot does not redefine the architecture or expand the specification without
architect approval.

# 20. USER ROLE

The user acts as project owner/developer and controls:

repository;
Copilot execution;
environment;
Git commits;
supplier credentials;
external supplier testing;
certification process.

The user provides Copilot's implementation report to the architect for acceptance.

# 21. DEFINITION OF DONE

An implementation iteration is DONE when:

the approved specification is implemented;
required tests pass;
regression tests pass or known unrelated failures are understood;
build passes;
Prisma validation passes where applicable;
no new blocking lint errors exist;
no architectural violation remains;
the architect accepts the implementation.

After acceptance:

Commit and move on.

# 22. PROCESS SUCCESS CRITERION

The development process is successful when it enables rapid, controlled progress
toward the complete GCT Core platform.

The process must reduce risk without becoming the source of development delay.

When in doubt:

Prefer the smallest sufficient verification that establishes correctness.

Do not add process for the sake of process.


# 23. FINAL GOVERNING WORKFLOW

STAGE 1:
┌──────────────────────────────┐
│        SPECIFICATION         │
│      ≤ ~700 lines            │
│   One complete Markdown file │
└──────────────┬───────────────┘
               ↓
STAGE 2:
┌──────────────────────────────┐
│        IMPLEMENTATION        │
│          Copilot             │
└──────────────┬───────────────┘
               ↓
STAGE 3:
┌──────────────────────────────┐
│   FOCUSED + REGRESSION TESTS │
│          Copilot             │
└──────────────┬───────────────┘
               ↓
STAGE 4:
┌──────────────────────────────┐
│       COPILOT REPORT         │
└──────────────┬───────────────┘
               ↓
STAGE 5:
┌──────────────────────────────┐
│     ARCHITECT ACCEPTANCE     │
└──────────────┬───────────────┘
               ↓
STAGE 6:
┌──────────────────────────────┐
│           COMMIT             │
│       User performs it       │
│   Architect supplies message │
└──────────────┬───────────────┘
               ↓
        NEXT ITERATION

This workflow is mandatory unless the user explicitly changes it.

The format ChatGPT / Architect provide the Markdown is very important as it saves a lot of development time. When the Markdown is supplied then it needs to be done in the following way.

Make sure the specification's internal examples do not accidentally terminate the outer Markdown fence. That is important for producing one genuinely copyable document.
The requirement is that the specification be presented as one complete Markdown document in one code block in the chat.
The entire specification must be contained inside one outer Markdown code block, with no nested code blocks inside it. 

END GOV-DEV-001