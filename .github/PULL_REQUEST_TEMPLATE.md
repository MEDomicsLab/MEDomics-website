## What and why

<!-- One or two sentences: what changes on the site, and why. Link the issue it resolves. -->

Closes #

## Type of change

<!-- The PR title must be a Conventional Commit, e.g. "feat(download): add installer checksums". -->

- [ ] `feat`: new page, section or behaviour
- [ ] `fix`: bug fix
- [ ] `docs` / `style` / `refactor` / `perf` / `test` / `build` / `ci` / `chore`

## Screenshots or recording

<!-- Required for any visual change: before/after, desktop and phone. Use the Vercel preview URL posted on this PR. -->

## Checklist

- [ ] `npm run check` passes locally
- [ ] `npm run build && npm run test:e2e` pass locally (when pages, components or motion changed)
- [ ] Copy is in `src/content/`, links in `src/content/links.ts`; nothing edited in generated files
- [ ] Works with reduced motion, by keyboard, and from 320 px to wide desktop
- [ ] New pages or behaviours are covered by a Playwright test (and new pages are in the sitemap and `e2e/helpers.ts`)
- [ ] No secrets, personal data or patient data in the code, screenshots or attachments
