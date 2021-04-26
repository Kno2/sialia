import _ from 'lodash';
import { Document } from '../src/models';

const fileNames: string[] = [
  'C-CDA_R2-1_CCD.xml',
  'C-CDA_R2_Care_Plan.xml',
  'CCD 1.xml',
  'Consult 1.xml',
  'DIR.sample.xml',
  'Discharge Summary 1.xml',
  'Final_Task_Force_Full_Sample_R1.1.xml',
  'HandP 1.xml',
  'Myra Jones_CCD.xml',
  'Op Note 1.xml',
  'Proc Note 1.xml',
  'Progress Note 1.xml',
  'UD 1.xml',
  'UD 2.xml',
];

export const DOCUMENTS: Document[] = _.map(fileNames, (name) => ({
  name: name,
  url: name
}));
