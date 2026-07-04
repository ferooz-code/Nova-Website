# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Confirmed product brief

- Nova Solutions Tech is presented as the global distributor of PURIUM.
- The site should cover every English PURIUM navigation page, including company, technology, products, specifications, installation categories, service, sustainability, media, inquiries, and policy content.
- Use Nova's identity and Canadian headquarters while retaining PURIUM's restrained black, white, and cyan industrial visual language.
- PURIUM text and media may be reused only where Nova has authorization to republish them.
- Keep the site fully responsive, with working navigation, image previews, installation filters, and inquiry/service form states.
- Lead with PURIUM products and technology rather than manufacturer leadership or corporate personalities; do not reintroduce CEO-message content.
- Present Nova Solutions Tech as PURIUM's exclusive global sales and distribution partner and route all commercial, product, distribution, installation, and support inquiries through Nova.
- Keep editable public content in `src/data/site-content.json`; secure runtime edits, uploaded media, inquiries, and administrator credentials belong to the Node server and must never be committed.
- Technical pages should favor structured data, readable evidence and a small number of purposeful high-resolution visuals; never turn source-site icons, arrows or tiny document scans into a large thumbnail wall.
- When a source document is too small to remain legible at presentation size, keep it out of the hero and express its verified data in accessible HTML instead.
- The About section is Nova-first: exclude PURIUM executive, registration, manufacturer-address, CI and character content; retain manufacturer milestones only when they support product credibility.
- Body copy and navigation labels must use high-contrast text. Vision and History should use structured HTML layouts instead of decorative source graphics or duplicated content.
- Consumables and accessories should be presented as image-led product cards mapped to the source specifications; delivery and installation should interleave each image with its corresponding process step.
- Place official product videos beside the most relevant product content instead of rebuilding a standalone promotional Media section.
- On every content page, keep each source image in the same section as the heading, description, feature, product family or service step it illustrates; do not collect context-dependent images in a detached gallery at the bottom.
- Keep Environmental Management, but exclude manufacturer ESG, donation/social, ethical-management and promotional Media pages from Nova’s public navigation and routes.
