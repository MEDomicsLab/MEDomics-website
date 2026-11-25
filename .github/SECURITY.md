<!--suppress HtmlDeprecatedAttribute -->
<p align="center">
  <img src="../docs/assets/icons/shield.svg" width="48" height="48" alt="">
</p>

# Security Policy

This repository contains the public website of MEDomics. It is a static export (HTML, CSS and JavaScript served by Vercel): **no backend, no database, no accounts, no cookies, and no user data** is collected or stored by the site.

## <img src="../docs/assets/icons/table.svg" width="28" alt="" align="absmiddle"> Scope

In scope:

- The website code in this repository and the build it produces (`out/`).
- The hosting configuration in `vercel.json` (redirects, headers).
- The GitHub Actions workflows under `.github/workflows/`.
- Vulnerabilities in dependencies that ship to visitors.

Out of scope:

- The **MEDomics application**: report its vulnerabilities through [MEDomicsLab/MEDomics](https://github.com/MEDomicsLab/MEDomics/security).
- Third-party services the site links to (GitHub, YouTube, Discord, the documentation host).

## <img src="../docs/assets/icons/shield.svg" width="28" alt="" align="absmiddle"> Reporting a vulnerability

Please **do not open a public issue or pull request** for a security problem.

Report it to the maintainers:

- preferably with GitHub's **[Report a vulnerability](https://github.com/MEDomicsLab/MEDomics-website/security/advisories/new)** form on this repository's Security tab, which stays private between you and the maintainers;
- or in the [MEDomicsLab discussions](https://github.com/orgs/MEDomicsLab/discussions). Discussions are public: describe the problem in general terms only and ask a maintainer to continue privately, without posting steps to reproduce or exploit code.

Please include a description of the issue and its impact, steps to reproduce (ideally a minimal proof of concept), the affected URL, commit or file, and whether the issue is already public.

We aim to acknowledge reports within **72 hours** and to give a status update within **7 days**. Please allow us a reasonable window to fix the issue before disclosing it.

## <img src="../docs/assets/icons/table.svg" width="28" alt="" align="absmiddle"> Research data

No clinical or patient data belongs in this repository. Do **not** include any in code, issues, pull requests, screenshots or attachments. If you find such material in the repository or on the site, treat it as a security issue and report it privately as above.

## <img src="../docs/assets/icons/book.svg" width="28" alt="" align="absmiddle"> Supported versions

Only `main`, deployed to the live site, is supported.
