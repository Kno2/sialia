import { ViewerOptions, Preferences, DocType } from '../models';
import _ from 'lodash';

export class PreferencesService  {
    public save(opts: ViewerOptions): void {

        const enabled = _.filter(opts.sections, (item) => {
            return item.enabled;
        });

        const sortOrder = _.map(opts.sections, (item) => {
            return item.key;
        });

        const pref = this.getPreferences(opts.pref.type);
        pref.enabledSectionKeys = _.map(enabled, (item) => {
            return item.key;
        });
        pref.sortedSectionKeys = sortOrder;
        pref.isSet = true;

        const storageId = 'doc_' + opts.pref.type.templateId;
        localStorage.setItem(storageId, JSON.stringify(pref));
    }

    public getPreferences(docType: DocType): Preferences {

        const id = docType.templateId;
        const storageId = 'doc_' + id;
        const prefString = localStorage.getItem(storageId);
        
        let pref = JSON.parse(prefString);
        const isSet = pref !== null;

        if (!isSet) {
            pref = {
                id: id,
                isSet: isSet,
                type: docType,
                enabledSectionKeys: null,
                sortedSectionKeys: null
            };
        }

        return new Preferences(pref);
    }
}
