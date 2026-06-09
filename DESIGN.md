# UNPUN Formula Studio Design Direction

## Product Use Case

UNPUN Formula Studio supports a workshop flow where a customer scans a QR code, enters basic contact information, selects a body oil formula, chooses active oils and fragrance, confirms consent, and receives a printed bottle label. The same order data is sent to the RD team for production through the connected sheet workflow.

## Experience Split

- Customer page: premium, calm, mobile-friendly, and non-technical.
- Admin page: structured, dense, operational, and easy for staff to scan.
- Printed outputs: strict black-and-white production artifacts, optimized for label and RD formula sheet clarity.

## Visual Direction

- Inspired by premium commerce and structured SaaS systems.
- Use warm off-white surfaces, slate text, deep green accents, and restrained amber highlights.
- Avoid decorative gradients, floating blobs, and overly playful styling.
- Keep controls compact but touch-friendly for workshop use.
- Prioritize scannability over marketing copy.

## Core UI Rules

- Customer-facing labels should describe outcomes, not back-office terms.
- Technical part codes may remain visible for RD traceability, but the primary text must be human-readable.
- Cost can be visible to customers as an estimated workshop cost.
- The customer page must not expose sheet IDs, webhook setup, retry sync, export, or order history.
- The admin page may expose sync and operational controls.

## Formula Part Language

- A: Base Oil
- B: Texture / Emollient
- C: Active Oils
- D: Fragrance
- E: Antioxidant

## Page-Level Patterns

- Customer page:
  - Left side: guided steps and order controls.
  - Right side: live label preview.
  - Bottom action area: estimated cost and confirm action.
- Admin page:
  - Mode switch and dashboard KPIs are allowed.
  - Keep tables compact with sticky headers.
  - Back-office controls should use neutral styling and clear hierarchy.

## Tone

- Thai-first for customer guidance.
- English can remain for formula names and ingredient names.
- Use short labels and avoid long explanatory paragraphs in the UI.
