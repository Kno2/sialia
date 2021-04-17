export interface DocType {
    displayName: string;
    loinc: string;
    rootTemplateId: string;
    templateId: string;
    type: string;
}
export interface IPreferences {
    id: string;
    type: DocType;
    enabledSectionKeys: Array<string>;
    sortedSectionKeys: Array<string>;
    isSet: boolean;
}
export declare class Preferences {
    id: string;
    type: DocType;
    enabledSectionKeys: Array<string>;
    sortedSectionKeys: Array<string>;
    isSet: boolean;
    constructor(pref: IPreferences);
    isSectionEnabled(key: string): boolean;
    indexOfSection(key: string): number;
}
