import _ from 'lodash';
import { Section, Document } from './models';

export const SECTIONS: Section[] = [
  { key: 'allergies', display: 'Allergies', tagName: 'allergies', icon: 'pagelines' },
  { key: 'care_plan', display: 'Care Plan', tagName: 'care-plan', icon: 'sticky-note-o' },
  { key: 'chief_complaint', display: 'Chief Complaint', tagName: 'chief-complaint', icon: 'bullhorn' },
  { key: 'encounters', display: 'Encounters', tagName: 'encounters', icon: 'stethoscope' },
  { key: 'functional_status', display: 'Functional Status', tagName: 'functional-status', icon: 'wheelchair' },
  { key: 'immunization_declines', display: 'Declined Immunizations', tagName: 'immunization-declines', icon: 'ban' },
  { key: 'immunizations', display: 'Immunization', tagName: 'immunizations', icon: 'eyedropper' },
  { key: 'instructions', display: 'Patient Instructions', tagName: 'instructions', icon: 'user-md' },
  { key: 'medications', display: 'Medications', tagName: 'medications', icon: 'medkit' },
  { key: 'problems', display: 'Problems', tagName: 'problems', icon: 'exclamation-triangle' },
  { key: 'procedures', display: 'Procedures', tagName: 'procedures', icon: 'hospital-o' },
  { key: 'results', display: 'Results', tagName: 'results', icon: 'flask' },
  { key: 'smoking_status', display: 'Smoking Status', tagName: 'smoking-status', icon: 'fire' },
  { key: 'vitals', display: 'Vitals', tagName: 'vitals', icon: 'heartbeat' },
];

export const IGNORE_SECTIONS: string[] = ['document', 'demographics', 'json'];

let root: string = 'https://raw.githubusercontent.com/dougludlow/ccdaview/develop/docs/';
let fileNames: string[] = [
  'C-CDA_R2-1_CCD.xml',
  'C-CDA_R2_Care_Plan.xml',
  'CCD 1.xml',
  'Consult 1.xml',
  'DIR.sample.xml',
  'Discharge Summary 1.xml',
  'Final_Task_Force_Full_Sample_R1.1.xml',
  'HandP 1.xml',
  'Op Note 1.xml',
  'Proc Note 1.xml',
  'Progress Note 1.xml',
  'UD 1.xml',
  'UD 2.xml',
];

export const DOCUMENTS: Document[] = _.map(fileNames, (name) => ({
  name: name,
  url: `${root}${name}`
}));
