import { links } from '../links';

/**
 * English copy. Drafted from MEDOMICS_APP_ANALYSIS.md in our own words.
 * `{version}` and `{date}` are replaced at render time from releases.json.
 * Rule: never describe a disabled module (extraction, MEDprofiles) as available.
 */
export const en = {
  meta: {
    siteName: 'MEDomics',
    title: 'MEDomics: open-source platform for medical data modeling',
    description:
      'An open-source desktop platform where clinicians and computer scientists turn heterogeneous patient data into validated, explainable predictive models, designed visually and exported as code.',
  },

  nav: {
    skip: 'Skip to content',
    home: 'MEDomics home',
    platform: 'Platform',
    platformIntro: {
      title: 'One workspace, every stage',
      text: 'The modules follow the life of a clinical model, from raw tables to predictions.',
    },
    platformItems: [
      { title: 'Design', text: 'Clean, merge, tag and profile your data.', icon: 'table', anchor: 'design' },
      { title: 'Development', text: 'Visual ML pipelines, evaluated and explained.', icon: 'nodes', anchor: 'development' },
      { title: 'Collaborate', text: 'Portable models and federated learning.', icon: 'network', anchor: 'collaborate' },
      { title: 'Deployment', text: 'Predictions for one patient or a whole file.', icon: 'predict', anchor: 'deployment' },
    ],
    resources: 'Resources',
    resourcesIntro: {
      title: 'Learn MEDomics',
      text: 'Guides, walkthroughs and reproducible examples.',
    },
    resourcesItems: [
      { title: 'Documentation', text: 'Module-by-module guides and best practices.', icon: 'book', href: links.docs },
      { title: 'Video tutorials', text: 'Timestamped walkthroughs of every module.', icon: 'play', href: links.youtube },
      { title: 'Proofs of concept', text: 'Three end-to-end studies you can reproduce.', icon: 'flask', href: links.pocs },
    ],
    openSource: 'Open source',
    about: 'About',
    download: 'Download',
    github: 'GitHub',
    menu: 'Open menu',
    close: 'Close menu',
    language: 'Language',
  },

  hero: {
    title: ['Medical data in.', 'Trusted models out.'],
    text: 'MEDomics is an open-source desktop platform where clinicians and computer scientists turn heterogeneous patient data into validated, explainable predictive models, designed visually and exported as code.',
    releaseLabel: 'Latest release',
    releaseTitle: 'MEDomics {version}',
    releaseNote: 'MEDomicsLab is now MEDomics. Released {date}.',
    releaseLink: 'Release notes',
    cta: 'Download MEDomics',
    secondary: 'Explore tutorials',
  },

  layers: {
    title: ['One workspace,', 'from data to deployment.'],
    intro:
      'MEDomics arranges the life of a clinical model into layers. Each one builds on the last, inside a single workspace that keeps datasets, experiments and models side by side.',
    steps: [
      {
        key: 'design',
        tag: 'Design',
        title: 'Prepare and understand your data',
        text: 'Clean, merge, encode and split clinical tables with no-code tools. Tag columns and rows for later stratification, then profile everything with SweetViz, ydata-profiling and D-Tale.',
        primary: { label: 'See the Design layer', href: 'platform#design' },
        secondary: { label: 'Read the guide', href: links.inputModule },
      },
      {
        key: 'development',
        tag: 'Development',
        title: 'Build pipelines you can defend',
        text: 'Connect Dataset, Clean, Split, Model and Train nodes on a canvas powered by PyCaret and scikit-learn. Tune, ensemble, calibrate and pick thresholds, then evaluate on held-out or external cohorts with SHAP explanations.',
        primary: { label: 'See the Development layer', href: 'platform#development' },
        secondary: { label: 'Read the guide', href: links.learningModule },
      },
      {
        key: 'collaborate',
        tag: 'Collaborate',
        title: 'Share models, not patient data',
        text: 'Package a trained pipeline as a portable .medmodel file, simulate federated training across hospitals with MEDfl, and hand any pipeline to a programmer as a generated Jupyter notebook.',
        primary: { label: 'See collaboration', href: 'platform#collaborate' },
        secondary: { label: 'Federated learning guide', href: links.federatedModule },
      },
      {
        key: 'deployment',
        tag: 'Deployment',
        title: 'Put a model to work',
        text: 'Load a .medmodel in the Application module and get a predicted class with its confidence, for one patient through a form or for a whole CSV file at once.',
        primary: { label: 'See the Deployment layer', href: 'platform#deployment' },
        secondary: { label: 'Read the guide', href: links.applicationModule },
      },
    ],
  },

  workflow: {
    title: ['Scattered inputs,', 'one rigorous pipeline.'],
    intro:
      'Clinical tables, questionnaires, EHR extracts and database queries converge into one reproducible path. What comes out is ready to share: a model, the evidence behind it, and its code.',
    inputsLabel: 'Inputs',
    outputsLabel: 'Outputs',
    steps: [
      { title: 'Prepare', text: 'Merge, clean, encode and split into learning and holdout sets.' },
      { title: 'Explore', text: 'Profile datasets and compare cohorts before you model.' },
      { title: 'Learn', text: 'Train, tune and compare models on a visual canvas.' },
      { title: 'Evaluate', text: 'Test on unseen cohorts and explain every prediction.' },
    ],
  },

  proof: {
    title: ['Proven on real', 'clinical questions.'],
    intro:
      'Three proofs of concept in the documentation walk through MEDomics end to end, on public or synthetic data that anyone can reproduce.',
    feature: {
      label: 'Proof of concept · Questionnaires',
      finding:
        'Using patient-reported questionnaire data, a Random Forest built in MEDomics predicted emotional distress, and its SHAP analysis pointed to sleep quality as the strongest predictor. Every step, from Superset curation to per-patient predictions, ran inside the platform.',
      source: 'The PARIS demo',
      link: 'Read the walkthrough',
    },
    stats: [
      { value: '9', label: 'hospitals in the federated learning proof of concept' },
      { value: '3', label: 'end-to-end proofs of concept, with data you can access' },
    ],
    second: {
      finding:
        'A model trained on MIMIC-IV was tested internally, on aggregated eICU data and hospital by hospital, then compared with a federated model trained across nine eICU hospitals.',
      source: 'End-to-end ICU pipeline',
      link: 'Read the walkthrough',
    },
    cta: {
      title: 'Learn it step by step.',
      button: 'Watch the tutorials',
    },
  },

  resources: {
    title: ['Learn at', 'your own pace.'],
    intro: 'Documentation, video walkthroughs and a community of researchers who use MEDomics every day.',
    feature: {
      title: 'Documentation',
      text: 'Module-by-module guides, best-practice DO’s and DON’Ts, and reproducible proofs of concept with public data.',
      href: links.docs,
    },
    cards: [
      { title: 'Video tutorials', href: links.youtube, tone: 'red' },
      { title: 'Quick start', href: links.quickStart, tone: 'green' },
      { title: 'Discord community', href: links.discord, tone: 'discord' },
      { title: 'Release notes', href: links.releases, tone: 'orange' },
    ],
    all: 'All documentation',
  },

  openSource: {
    title: ['Open by default,', 'built to be extended.'],
    intro:
      'MEDomics is released under the GPL-3.0 license. Its building blocks are standalone open-source packages that you can also use on their own.',
    root: 'medomics/',
    items: [
      {
        name: 'MEDomics',
        text: 'The desktop platform: an Electron and React client with Node, Go and Python services.',
        primary: { label: 'GitHub', href: links.github },
        secondary: { label: 'Releases', href: links.releases },
        icon: 'cube',
      },
      {
        name: 'MEDfl',
        text: 'Federated learning for tabular medical data, built on Flower and Optuna, with optional differential privacy.',
        primary: { label: 'GitHub', href: links.medfl },
        secondary: { label: 'Guide', href: links.federatedModule },
        icon: 'network',
      },
      {
        name: 'MEDiml',
        text: 'Radiomics processing and feature extraction, also available as a standalone application.',
        primary: { label: 'GitHub', href: links.medimlRepo },
        secondary: { label: 'mediml.app', href: links.mediml },
        icon: 'disk',
      },
      {
        name: 'MED3pa',
        text: 'Reliability analysis for deployed models: covariate shift, uncertainty and problematic profiles. Graphical integration is upcoming.',
        primary: { label: 'GitHub', href: links.med3pa },
        secondary: null,
        icon: 'shield',
      },
    ],
  },

  faq: {
    title: ['Questions,', 'answered.'],
    intro: 'Can’t find what you need? Ask the community on Discord or open an issue on GitHub.',
    categories: [
      {
        name: 'General',
        items: [
          {
            q: 'Who is MEDomics for?',
            a: 'Clinical researchers who want to build predictive models without writing code, and data scientists who want rigorous, reproducible experiments with a clean path to code. No specific background is required, although knowing machine-learning basics helps in the Learning module.',
          },
          { q: 'Is MEDomics free?', a: 'Yes. MEDomics is open-source software released under the GPL-3.0 license.' },
          {
            q: 'Do I need to know how to code?',
            a: 'No. Data preparation, exploration, model training, evaluation and prediction all work through forms and a visual canvas. When you want code, the Generate button exports any pipeline as a Jupyter notebook.',
          },
        ],
      },
      {
        name: 'Install & requirements',
        items: [
          {
            q: 'Which operating systems are supported?',
            a: 'Windows 10 and 11, Ubuntu 22.04 and 24.04, and macOS (tested on Apple silicon). On macOS, install the .pkg first (Python environment and database), then the .dmg application.',
          },
          {
            q: 'What hardware do I need?',
            a: 'At least 8 GB of RAM (12 GB or more recommended), a 4-core 2.5 GHz processor (8 cores at 3.5 GHz or more recommended) and about 8 GB of free disk space. A GPU is optional.',
          },
          {
            q: 'macOS says the app cannot be opened. What should I do?',
            a: 'The macOS build is not signed yet. Open System Settings, then Privacy & Security, and choose Open Anyway for MEDomics.',
          },
        ],
      },
      {
        name: 'Data & privacy',
        items: [
          {
            q: 'Where does my data go?',
            a: 'Nowhere you do not choose. MEDomics runs on your computer and keeps data in a workspace folder, either local or on a server you connect to over SSH with Remote MEDomics.',
          },
          {
            q: 'Can I collaborate without sharing patient data?',
            a: 'Yes. A .medmodel file contains the trained pipeline and its metadata, not the training data. The federated learning module simulates training across institutions where raw data stays at each site.',
          },
          {
            q: 'Which data formats can I use?',
            a: 'CSV files are the main format. Through Superset you can also query databases and export the results to your workspace. Image, text and time-series extraction modules are temporarily disabled while they are being stabilized.',
          },
        ],
      },
      {
        name: 'Machine learning',
        items: [
          {
            q: 'Which algorithms are available?',
            a: 'The estimators of PyCaret and scikit-learn, such as logistic regression, random forests, gradient boosting and neural networks, with tuning, ensembling, stacking, blending, probability calibration and threshold optimization.',
          },
          {
            q: 'How does MEDomics help prevent data leakage?',
            a: 'The Split node supports k-fold cross-validation, repeated subsampling and bootstrapping, with stratification by column or row tags so patients or sites never straddle train and test. Preprocessing learned on training data is frozen inside the saved model.',
          },
          {
            q: 'Can I export my work as code?',
            a: 'Yes. Generate turns a pipeline into a Jupyter notebook that you can open in the built-in Jupyter or in VS Code.',
          },
        ],
      },
    ],
  },

  finalCta: {
    title: ['Build your first', 'clinical model', 'today.'],
    primary: 'Download {version}',
    secondary: 'Read the docs',
    sceneTitle: 'Learning module · experiment',
    sceneLabel:
      'Animation of the MEDomics Learning module: Dataset, Split, Model (logistic regression), Train model and Analysis nodes are dragged onto the canvas, linked into a pipeline and run. The results panel shows an example ROC curve with an AUC of 0.91, the metrics table and the confusion matrix.',
    social: { github: 'GitHub', discord: 'Discord', youtube: 'YouTube' },
  },

  footer: {
    contactTitle: 'Get in touch',
    contactText: 'Questions, ideas or bugs? The team answers on Discord and GitHub.',
    location: 'McGill University · Montréal, Canada',
    lab: { before: 'Developed and maintained by ', label: 'MEDomicsLab', href: links.lab },
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Platform', href: 'platform' },
          { label: 'Download', href: 'download' },
          { label: 'Release notes', href: links.releases },
        ],
      },
      {
        title: 'Learn',
        links: [
          { label: 'Documentation', href: links.docs },
          { label: 'Quick start', href: links.quickStart },
          { label: 'Tutorials', href: links.youtube },
          { label: 'Proofs of concept', href: links.pocs },
        ],
      },
      {
        title: 'Community',
        links: [
          { label: 'GitHub', href: links.github },
          { label: 'Discord', href: links.discord },
          { label: 'Report an issue', href: links.issues },
          { label: 'Contribute', href: links.collaboration },
        ],
      },
      {
        title: 'Project',
        links: [
          { label: 'About', href: 'about' },
          { label: 'Privacy', href: 'privacy' },
          { label: 'Terms', href: 'terms' },
        ],
      },
    ],
    legal: ['© MEDomics contributors', 'Software licensed under GPL-3.0'],
  },

  toast: {
    title: 'MEDomics {version} is out',
    text: 'MEDomicsLab is now MEDomics. See what is new in this release.',
    primary: 'Download',
    secondary: 'Dismiss',
  },

  platform: {
    meta: {
      title: 'Platform',
      description:
        'The MEDomics modules, layer by layer: data preparation, visual machine learning, evaluation, federated learning and deployment.',
    },
    title: ['Every stage of a clinical', 'model, in one place.'],
    intro:
      'MEDomics groups its modules into layers that follow a model’s life. Everything shares one workspace: a DATA folder for datasets and an EXPERIMENTS folder for scenes, models and results.',
    layers: [
      {
        id: 'design',
        tag: 'Design layer',
        title: 'Prepare and understand your data',
        text: 'No-code tools turn raw tables into model-ready learning and holdout sets. Destructive changes can be previewed, cancelled, or saved as a non-destructive view.',
        modules: [
          {
            name: 'Input module',
            text: 'Merge, clean, one-hot encode, drop duplicates, create subsets and holdout sets, tag rows and columns, and reduce features with PCA or Spearman correlation.',
          },
          {
            name: 'Exploratory module',
            text: 'SweetViz and ydata-profiling reports for one dataset or a comparison of two, plus interactive D-Tale dashboards.',
          },
          {
            name: 'Superset',
            text: 'Launch Apache Superset from the app, connect to databases, build dashboards and export SQL query results to your workspace.',
          },
        ],
        shots: ['data-table', 'exploratory'],
        doc: links.inputModule,
      },
      {
        id: 'development',
        tag: 'Development layer',
        title: 'Build and evaluate visual ML pipelines',
        text: 'The Learning module is a node canvas organized in Initialization, Training and Analysis boxes. A pipeline only runs when it is complete, and nodes placed in the wrong box turn red.',
        modules: [
          {
            name: 'Learning module',
            text: 'Dataset, Clean, Split, Model, Train and Combine nodes on top of PyCaret: cross-validation, subsampling or bootstrapping, tuning, ensembling, calibration and threshold optimization.',
          },
          {
            name: 'Experimental scenes',
            text: 'A quick sandbox that trains every available estimator and ranks them before you build the full pipeline.',
          },
          {
            name: 'Evaluation module',
            text: 'Test a saved model on a holdout set or an external cohort, with predictions, confidence scores and an ExplainerDashboard of SHAP explanations.',
          },
        ],
        shots: ['canvas', 'results'],
        doc: links.learningModule,
      },
      {
        id: 'collaborate',
        tag: 'Collaboration',
        title: 'Share models, code and experiments',
        text: 'Models, notebooks and federated experiments are designed to leave your machine without the patient data behind them.',
        modules: [
          {
            name: '.medmodel files',
            text: 'A self-contained package: a scikit-learn pipeline with its frozen preprocessing plus metadata on variables and target, so it behaves the same on a laptop or a hospital server.',
          },
          {
            name: 'Generated notebooks',
            text: 'Any pipeline becomes a Jupyter notebook that opens in the built-in Jupyter or in VS Code.',
          },
          {
            name: 'Federated learning (MEDfl)',
            text: 'Simulate training across hospitals on a visual canvas: networks of nodes, aggregation strategies, Optuna optimization and per-node results.',
          },
        ],
        shots: ['notebook'],
        doc: links.federatedModule,
      },
      {
        id: 'deployment',
        tag: 'Deployment layer',
        title: 'Turn a model into predictions',
        text: 'The Application module loads a .medmodel and asks only for the variables the model needs. Missing optional values are filled by the model’s own preprocessing.',
        modules: [
          { name: 'Single patient', text: 'A form with one field per model variable returns a predicted class and its confidence.' },
          { name: 'Batch file', text: 'Upload a CSV with the training columns to score a whole cohort at once.' },
        ],
        shots: [],
        doc: links.applicationModule,
      },
    ],
    guardrails: {
      title: 'Guardrails built into the canvas',
      text: 'A node dropped in the wrong box turns it red, pipelines must run from a dataset to the Analysis box, and column selectors are filtered by data type. Mistakes are caught before they cost you an afternoon.',
    },
    filesTitle: 'File types',
    filesIntro: 'Everything MEDomics creates is a file in your workspace, so experiments are easy to version, share and reopen.',
    files: [
      { ext: '.medml', text: 'A Learning scene: the canvas and its pipelines.' },
      { ext: '.medmlres', text: 'Saved results of a scene run, kept across restarts.' },
      { ext: '.medmodel', text: 'A finalized model: pipeline plus metadata.' },
      { ext: '.medeval', text: 'An evaluation page: predictions and dashboard.' },
      { ext: '.medflres', text: 'Federated learning results.' },
      { ext: '.ipynb', text: 'A generated notebook for the code path.' },
    ],
    toolsTitle: 'Also in the box',
    tools: [
      { name: 'Code editor', text: 'Edit Python, Markdown, JSON and text files from the workspace.' },
      { name: 'Terminal & Jupyter', text: 'An integrated terminal and an embedded Jupyter server.' },
      { name: 'Remote MEDomics', text: 'Connect over SSH and work on a workspace that lives on a server.' },
      { name: 'Viewers', text: 'Data tables, images, JSON and an output log with progress.' },
    ],
    comingBack: 'Image, text and time-series extraction and MEDprofiles are temporarily disabled while they pass stability checks.',
  },

  download: {
    meta: {
      title: 'Download',
      description: 'Download MEDomics for Windows, Ubuntu and macOS. System requirements, installation steps and Remote MEDomics.',
    },
    title: ['Download', 'MEDomics.'],
    intro:
      'Free and open source. The installer sets up the application, a bundled Python environment and a local database in your home folder.',
    versionLabel: 'Version',
    latestTag: 'latest',
    os: {
      windows: { name: 'Windows', note: 'Windows 10 and 11', button: 'Download .exe' },
      linux: { name: 'Ubuntu', note: 'Ubuntu 22.04 and 24.04', button: 'Download .deb' },
      mac: { name: 'macOS', note: 'Two steps: environment, then app', button: 'Step 1 · .pkg', button2: 'Step 2 · .dmg' },
    },
    unavailable: 'Not available for this version',
    allReleases: 'All releases on GitHub',
    reqTitle: 'System requirements',
    reqHead: ['', 'Minimum', 'Recommended'],
    reqComponent: 'Component',
    req: [
      ['Memory', '8 GB RAM', '12 GB RAM or more'],
      ['Processor', '4 cores · 2.5 GHz', '8 cores · 3.5 GHz or more'],
      ['Disk', '5–8 GB free', '8 GB free or more'],
      ['GPU', 'Not required', 'Optional, for federated training'],
    ],
    stepsTitle: 'Install & uninstall',
    steps: {
      windows: {
        install: [
          'Download the .exe installer.',
          'Run it and follow the prompts.',
          'Launch MEDomics and choose an empty folder as your workspace.',
        ],
        uninstall: [
          'Uninstall MEDomics from Windows Settings → Apps.',
          'Delete the .medomics folder in your user folder to remove the Python environment and database.',
        ],
      },
      linux: {
        install: [
          'Download the .deb package.',
          'Install it with: sudo apt install ./MEDomics-<version>-ubuntu.deb',
          'Launch MEDomics and choose an empty folder as your workspace.',
        ],
        uninstall: ['Run: sudo apt remove medomics-platform', 'Delete ~/.medomics to remove the Python environment and database.'],
      },
      mac: {
        install: [
          'Install the .pkg first: it sets up the Python environment and the database.',
          'Then open the .dmg and drag MEDomics to Applications.',
          'The app is not signed yet: if macOS blocks it, go to System Settings → Privacy & Security → Open Anyway.',
        ],
        uninstall: ['Move MEDomics from Applications to the Trash.', 'Delete ~/.medomics to remove the Python environment and database.'],
      },
    },
    installLabel: 'Install',
    uninstallLabel: 'Uninstall',
    remote: {
      title: 'Remote MEDomics',
      badge: 'In progress',
      text: 'Keep your data on a lab workstation or server and work from a lightweight client. The client connects over SSH, installs or updates the headless server, then lets you pick a remote folder as your workspace. Some modules are not available in remote mode yet.',
      server: 'Server package',
      client: 'Client package',
      guide: 'Connection guide',
    },
  },

  about: {
    meta: { title: 'About', description: 'Who builds MEDomics, who supports it, and the open-source tools it relies on.' },
    title: ['Built by researchers,', 'for researchers.'],
    intro:
      'MEDomics is developed to bring clinicians and computer scientists onto the same platform, so that heterogeneous medical data can become personalized, trustworthy predictive models.',
    historyTitle: 'From MEDomicsLab to MEDomics',
    history:
      'The platform started as MEDomicsLab, released in pre-alpha in early 2024. It has since grown into MEDomics, with a redesigned learning architecture, Superset dashboards, federated learning and a remote mode.',
    labTitle: 'Developed by MEDomicsLab',
    labText:
      'MEDomics is developed and maintained by MEDomicsLab, the research lab behind the platform. Visit the lab’s website to meet the team and explore its research.',
    labCta: 'Visit medomicslab.com',
    leadsTitle: 'Project leads',
    leads: [
      { name: 'Martin Vallières', role: 'Co-lead · McGill University' },
      { name: 'Olivier Morin', role: 'Co-lead · University of California, San Francisco' },
    ],
    supportTitle: 'Support & partners',
    support: [
      { name: 'McGill University', role: 'Development' },
      { name: 'Université de Sherbrooke', role: 'Development' },
      { name: 'Unité de soutien SSA Québec', role: 'Funding' },
      { name: 'Réseau-1 Québec', role: 'Partner' },
      { name: 'medomics.ai', role: 'Partner' },
    ],
    toolsTitle: 'Standing on open source',
    toolsIntro: 'MEDomics relies on these projects. Thank you to their maintainers.',
    tools: [
      'PyCaret',
      'scikit-learn',
      'SHAP',
      'ExplainerDashboard',
      'SweetViz',
      'ydata-profiling',
      'D-Tale',
      'Apache Superset',
      'Flower',
      'Optuna',
      'MongoDB',
      'Jupyter',
      'Electron',
      'React',
    ],
    contribute: 'Contribute on GitHub',
    designTitle: 'Design credit',
    designIntro: 'This website’s design is recreated from nualt.fr. We say so plainly here and in the README.',
    design: [
      {
        title: 'What comes from nualt.fr',
        text: 'We studied nualt.fr closely and rebuilt its design language for MEDomics: the two-colour palette (the same cobalt blue and ivory values), the blueprint grid of hairlines, the page structure and the order of its sections, the header that changes colour over blue sections, the pinned scroll scene under the hero, the particle streams along dotted lines, the buttons that fill with pixels, the rolling-letter headings, the falling pixel blocks, the browser window with a repository tree, the numbered FAQ boxes and the isometric line-drawing style. Spacing, type sizes and animation timings were measured from it.',
      },
      {
        title: 'What is our own',
        text: 'All text, the MEDomics content and screenshots, every illustration, icon, cursor and animation drawing (generated from scratch in code), and all of the source code, which was written for this site. The original heading typeface is replaced by General Sans; no logo, image or file from nualt.fr is used.',
      },
      {
        title: 'No affiliation',
        text: 'MEDomics and MEDomicsLab are not affiliated with nualt.fr, and this recreation does not imply its endorsement.',
      },
    ],
    designLink: 'Visit nualt.fr',
  },

  legal: {
    privacy: {
      meta: {
        title: 'Privacy',
        description: 'Privacy notice for the MEDomics website: no cookies, no analytics, no tracking, and no personal data collected.',
      },
      title: 'Privacy',
      body: [
        'This website does not use cookies, analytics or tracking scripts, and it does not collect personal information.',
        'Links to GitHub, YouTube, Discord and the documentation lead to third-party services with their own privacy policies.',
        'The MEDomics application runs on your own computer or on a server you control. Data you open in it stays in your workspace.',
      ],
    },
    terms: {
      meta: {
        title: 'Terms',
        description: 'Terms of use for the MEDomics website and software: GPL-3.0 licence, research use only, not a medical device.',
      },
      title: 'Terms',
      body: [
        'The MEDomics software is distributed under the GNU General Public License v3.0. See the LICENSE file in the repository for the full terms.',
        'MEDomics is research software. It is not a medical device and must not be used as the sole basis for clinical decisions.',
        'The content of this website is provided as is, without warranty of any kind.',
      ],
    },
    draftNote: 'Draft text, pending review by the MEDomics team.',
  },

  notFound: { title: ['Page not', 'found.'], text: 'The page you are looking for does not exist or has moved.', home: 'Back to home' },

  common: {
    readGuide: 'Read the guide',
    external: '(opens in a new tab)',
  },
};
