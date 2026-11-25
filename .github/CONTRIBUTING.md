<!--suppress HtmlDeprecatedAttribute -->
<p align="center">
  <img src="../docs/assets/icons/pr.svg" width="48" height="48" alt="">
</p>

# Contributing to the MEDomics website

Thank you for helping improve the website. This guide covers the rules every change follows. The website is maintained by the MEDomics developers at [MEDomicsLab](https://www.medomicslab.com/); by taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

> [!IMPORTANT]
> This repository is the **website** only. Bugs or ideas about the MEDomics **application** belong in [MEDomicsLab/MEDomics](https://github.com/MEDomicsLab/MEDomics/issues). Security problems are never reported in public: see [SECURITY.md](SECURITY.md).

## <img src="../docs/assets/icons/shield.svg" width="28" alt="" align="absmiddle"> The rules on `main`

`main` is what Vercel serves at the live address, so it is protected. These rules are **enforced by GitHub**, not just recommended:

| Rule                                | What it means for you                                                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| No direct pushes                    | Every change, including maintainers', arrives through a pull request                                                               |
| One approving review                | A maintainer other than the author reviews; a new push dismisses earlier approvals                                                 |
| Required checks must pass           | Lint & static checks, Build, Playwright e2e, Accessibility, Lighthouse, Lint workflows, Conventional PR title, npm audit, gitleaks |
| Branch up to date                   | The PR must contain the latest `main` before it merges ("Update branch")                                                           |
| Conversations resolved              | Every review thread is resolved before merging                                                                                     |
| Squash merge only, linear history   | The PR becomes one commit on `main`, named after the PR title                                                                      |
| No force-push or deletion of `main` | History on `main` is never rewritten                                                                                               |

## <img src="../docs/assets/icons/terminal.svg" width="28" alt="" align="absmiddle"> Workflow

1. **Open or pick an issue** (use the forms: blank issues are disabled). For anything bigger than a fix or a copy change, agree on the approach in the issue first.
2. **Branch from an up-to-date `main`**, named `<type>/<short-topic>`:

   ```bash
   git switch main && git pull
   git switch -c feat/download-checksums
   ```

   Types are the Conventional Commit types below: `feat/`, `fix/`, `docs/`, `refactor/`, `perf/`, `test/`, `chore/`…

3. **Make the change.** Keep each PR to one topic: small PRs are reviewed faster.
4. **Run the checks locally** before pushing:

   ```bash
   npm run check                          # always
   npm run build && npm run check:links   # if you changed pages, links or content
   npm run test:e2e                       # if you changed pages, components or motion
   ```

   `npm run format` and `npm run lint:fix` fix most formatting and lint findings for you.

5. **Push and open a pull request** against `main`. Fill in the template, link the issue (`Closes #12`), and add screenshots or a short recording for any visual change. Open it as a **draft** while you are still working.
6. **Review.** Address every comment with a new commit (no force-push during review, so reviewers can see what changed) and resolve the threads. Vercel posts a preview URL on the PR: reviewers check the change there.
7. **Merge.** Once approved and green, a maintainer squash-merges it and the branch is deleted. Vercel deploys `main` within a minute or two.

## <img src="../docs/assets/icons/pr.svg" width="28" alt="" align="absmiddle"> Pull request titles and commits

The PR title must follow [Conventional Commits](https://www.conventionalcommits.org/), because it becomes the commit message on `main` (the `Conventional PR title` check enforces this):

```text
<type>(<optional scope>): <subject starting in lower case>
```

| Type       | Use it for                                          |
| ---------- | --------------------------------------------------- |
| `feat`     | A new page, section, component or visible behaviour |
| `fix`      | A bug fix (layout, link, animation, accessibility…) |
| `docs`     | README, CONTRIBUTING, code comments only            |
| `style`    | Formatting only, no change in behaviour             |
| `refactor` | Restructuring without a visible change              |
| `perf`     | Faster loading or smoother animation                |
| `test`     | Playwright specs or script tests                    |
| `build`    | Build scripts, Next.js or Vercel configuration      |
| `ci`       | GitHub Actions workflows                            |
| `chore`    | Dependencies, tooling, housekeeping                 |
| `revert`   | Reverting an earlier change                         |

Use the area of the site as the scope when it helps: `home`, `hero`, `download`, `platform`, `about`, `header`, `footer`, `seo`, `a11y`, `deps`.

```text
feat(download): add checksums under each installer
fix(header): keep the blue palette under the preloader
docs(readme): explain the release refresh workflow
```

Commits inside your branch can be named freely, since they are squashed, but descriptive messages make the review easier.

## <img src="../docs/assets/icons/flask.svg" width="28" alt="" align="absmiddle"> What a change must keep true

- **Content goes in `src/content/`**, not in components: copy in `en/index.ts`, links in `links.ts`. Never edit the generated `releases.json` or `images.json` by hand.
- **No promise the app does not keep.** Do not advertise disabled modules (extraction, MEDprofiles) as available.
- **Accessibility**: every page passes axe with no serious or critical violation, interactive elements are reachable by keyboard with a visible focus ring, and decorative graphics are `aria-hidden`.
- **Motion has a fallback**: anything that moves respects `prefers-reduced-motion` and shows a static final state. Heavy effects stay behind the desktop gate in `src/lib/motion.ts`.
- **No horizontal scroll** from 320 px to wide desktop.
- **Budgets**: JS ≤ 300 KB and CSS ≤ 15 KB (brotli), Lighthouse accessibility, best practices and SEO ≥ 0.95.
- **Tests follow features**: a new page goes into `ROUTES` in `e2e/helpers.ts` and the sitemap; a new behaviour gets a Playwright test.
- **Licences**: new production dependencies must use a licence on the allow-list in `scripts/check/licenses.mjs`. Fonts and images need a licence that allows web use, committed next to them.
- **No secrets and no patient data**, ever, in code, issues, screenshots or attachments.

## <img src="../docs/assets/icons/download.svg" width="28" alt="" align="absmiddle"> Dependencies

Dependabot opens grouped update PRs every Monday. They follow the same rules: green checks and a review before merging. Install new packages with exact versions (`npm install --save-exact`) and commit `package-lock.json`.

## <img src="../docs/assets/icons/book.svg" width="28" alt="" align="absmiddle"> Questions

Ask in the pull request or issue, or on the MEDomics [Discord](https://discord.com/invite/ZbaGj8E6mP).
