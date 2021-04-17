import _ from 'lodash';

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

export class Preferences {
    public id: string;
    public type: DocType;
    public enabledSectionKeys: Array<string>;
    public sortedSectionKeys: Array<string>;
    public isSet: boolean;

    constructor(pref: IPreferences) {
        this.id = pref.id;
        this.type = pref.type;
        this.enabledSectionKeys = pref.enabledSectionKeys || [];
        this.sortedSectionKeys = pref.sortedSectionKeys || [];
        this.isSet = pref.isSet;
    }

    public isSectionEnabled(key: string): boolean {
        return _.some(this.enabledSectionKeys, (k) => {
            return k === key;
        });
    }

    public indexOfSection(key: string): number {
        return this.sortedSectionKeys.indexOf(key);
    }
}
