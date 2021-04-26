import { Section } from './models';

export const SECTIONS: Array<Section> = [
    { key: 'allergies', display: 'Allergies', tagName: 'generic', icon: 'pagelines' },
    { key: 'care_plan', display: 'Care Plan', tagName: 'generic', icon: 'sticky-note-o' },
    { key: 'chief_complaint', display: 'Chief Complaint', tagName: 'generic', icon: 'bullhorn' },
    { key: 'encounters', display: 'Encounters', tagName: 'generic', icon: 'stethoscope' },
    { key: 'functional_statuses', display: 'Functional Status', tagName: 'generic', icon: 'wheelchair' },
    { key: 'immunizations', display: 'Immunizations', tagName: 'generic', icon: 'eyedropper' },
    { key: 'instructions', display: 'Patient Instructions', tagName: 'generic', icon: 'user-md' },
    { key: 'medications', display: 'Medications', tagName: 'generic', icon: 'medkit' },
    { key: 'problems', display: 'Problems', tagName: 'generic', icon: 'exclamation-triangle' },
    { key: 'procedures', display: 'Procedures', tagName: 'generic', icon: 'hospital-o' },
    { key: 'results', display: 'Results', tagName: 'generic', icon: 'flask' },
    { key: 'smoking_status', display: 'Smoking Status', tagName: 'generic', icon: 'fire' },
    { key: 'vitals', display: 'Vitals', tagName: 'generic', icon: 'heartbeat' },
];

export const IGNORE_SECTIONS: Array<string> = ['document', 'demographics', 'json', 'immunization_declines'];
