# Repository and Vercel setup (one time)

Everything the code needs is committed. This checklist covers the settings that live on GitHub and Vercel, in the order to apply them. The repository is [`MEDomicsLab/MEDomics-website`](https://github.com/MEDomicsLab/MEDomics-website).

## 1. Before the first push

- [ ] Create the **empty**, public repository on GitHub (no README, licence or `.gitignore`: they are already here).
- [ ] Give the MEDomics developers **Write** access to the repository (Settings → Collaborators and teams): any of them can then approve pull requests.

## 2. First push

Run from this folder (`medomics-site/`), which is the repository root:

```bash
git init -b main
git add -A
git status            # check: no node_modules/, .next/, out/, test-results/ or .env files
git commit -m "chore: initial import of the MEDomics website"
git remote add origin git@github.com:MEDomicsLab/MEDomics-website.git
git push -u origin main
```

The first push triggers the workflows. Let them finish: the required checks must have run once before the ruleset can reference them.

## 3. Repository settings (Settings → General)

- [ ] **Pull Requests**: allow **squash merging** only (untick merge commits and rebase merging); default squash message: **Pull request title and description**.
- [ ] Tick **Always suggest updating pull request branches** and **Automatically delete head branches**.
- [ ] Optional: **Allow auto-merge** (a PR then merges itself once approved and green).

## 4. Protect `main` (Settings → Rules → Rulesets)

- [ ] **New ruleset → Import a ruleset** → select `.github/rulesets/protect-main.json`, review, then **Create**.

It enforces: pull requests only, one approving review from someone with write access (stale approvals dismissed, the last pusher cannot approve their own push), resolved conversations, squash merges, linear history, no force-push or deletion, and these required checks on an up-to-date branch:

`Lint & static checks` · `Build (production)` · `Playwright e2e` · `Accessibility (axe)` · `Lighthouse CI` · `Lint workflows` · `Conventional PR title` · `npm audit (production deps)` · `Secret scanning (gitleaks)`

The ruleset has no bypass list. To let an admin merge in an emergency, add the **Repository admin** role under _Bypass list_, set to _For pull requests only_.

## 5. Security (Settings → Code security)

- [ ] Enable **Dependabot alerts** and **Dependabot security updates** (version updates are already configured in `.github/dependabot.yml`).
- [ ] Enable **Secret scanning** and **Push protection**.
- [ ] Enable **Private vulnerability reporting** (used by `.github/SECURITY.md`).

## 6. Actions and labels

- [ ] Settings → Actions → General → _Workflow permissions_: **Read repository contents** (the workflows ask for more only where needed).
- [ ] Issues → Labels: make sure `bug`, `enhancement`, `dependencies` and `ci` exist (the issue forms and Dependabot apply them).

## 7. Vercel

- [ ] **Add New → Project → Import** `MEDomicsLab/MEDomics-website`. Framework preset: _Other_; root directory: the repository root. The build settings come from `vercel.json` (`npm ci`, `npm run build`, output `out/`).
- [ ] Project → Settings → General → **Node.js version: 24.x** (matches `.nvmrc`).
- [ ] Project → Settings → Git: production branch **`main`**. Preview deployments for pull requests are on by default; Vercel comments the preview URL on each PR.
- [ ] Project → Settings → Domains: add **medomics.app** (and `www.medomics.app` redirecting to it), then update the DNS records Vercel shows.
- [ ] Project → Settings → Git → **Deploy Hooks**: create a hook on `main`, then save its URL in GitHub as the repository secret **`VERCEL_DEPLOY_HOOK_URL`** (Settings → Secrets and variables → Actions). The weekly _Refresh release data_ workflow uses it.
- [ ] Optional: add the **Vercel** check to the ruleset's required checks once it has run on a PR, so a PR cannot merge if its preview build fails.

## 8. Optional

- [ ] Install the [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci) and save its token as `LHCI_GITHUB_APP_TOKEN`, to get Lighthouse results as a PR status with a report link.
- [ ] Add the repository's description, website (`https://medomics.app`) and topics on its GitHub home page.
