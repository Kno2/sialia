import { Section } from './section';
import { Preferences } from './preferences';

export class ViewerOptions {
    public sections: Array<Section>;
    public data: any;
    public pref: Preferences;
    public documents?: Array<any>;
}
