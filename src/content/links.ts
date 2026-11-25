/**
 * Every outbound URL lives here, so a change is one line.
 * DOCS: the address the project owner provided. The repository README uses
 * medomics-udes.gitbook.io; both serve the same content (pending confirmation).
 */
const DOCS = 'https://medomicslab.gitbook.io/medomics-docs';
const GH = 'https://github.com/MEDomicsLab/MEDomics';

export const links = {
  docs: DOCS,
  quickStart: `${DOCS}/quick-start`,
  inputModule: `${DOCS}/tutorials/design/input-module`,
  exploratoryModule: `${DOCS}/tutorials/design/exploratory-module`,
  learningModule: `${DOCS}/tutorials/development/learning-module`,
  medmodel: `${DOCS}/tutorials/development/learning-module/medmodel`,
  dosDonts: `${DOCS}/tutorials/development/learning-module/dos-and-donts`,
  evaluationModule: `${DOCS}/tutorials/development/evaluation-module`,
  federatedModule: `${DOCS}/tutorials/development/federated-learning-module`,
  applicationModule: `${DOCS}/tutorials/deployment/application-module`,
  superset: `${DOCS}/tutorials/superset`,
  remote: `${DOCS}/tutorials/remote-medomics`,
  remoteConnect: `${DOCS}/tutorials/remote-medomics/connection-tutorial`,
  pocs: `${DOCS}/proofs-of-concept`,
  pocParis: `${DOCS}/proofs-of-concept/the-paris-demo`,
  pocSynthetic: `${DOCS}/proofs-of-concept/ml-with-synthetic-data`,
  pocEndToEnd: `${DOCS}/proofs-of-concept/end-to-end-medomics-pipeline`,
  newFeatures: `${DOCS}/new-features`,
  collaboration: `${DOCS}/collaboration`,
  github: GH,
  releases: `${GH}/releases`,
  issues: `${GH}/issues`,
  discussions: `${GH}/discussions`,
  license: `${GH}/blob/main/LICENSE`,
  discord: 'https://discord.com/invite/ZbaGj8E6mP',
  youtube: 'https://www.youtube.com/@MEDomicsLab',
  overviewVideo: 'https://youtu.be/9vcAkIaAcxE',
  medfl: 'https://github.com/MEDomics-UdeS/MEDfl',
  designSource: 'https://nualt.fr/',
  lab: 'https://www.medomicslab.com/',
  mediml: 'https://mediml.app',
  medimlRepo: 'https://github.com/MEDomicsLab/MEDiml-pkg',
  med3pa: 'https://github.com/MEDomics-UdeS/MED3pa',
} as const;
