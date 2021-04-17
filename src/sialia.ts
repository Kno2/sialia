import riot from 'riot';
import { Document, isDocument } from './models';
import { DocumentsService } from './services';

export class Sialia {
    private documentService: DocumentsService;
    private instance: any;
    private documents: Array<Document>;

    constructor(config?: SialiaConfig) {
        this.documentService = new DocumentsService();

        this.instance = riot.mount('sialia')[0];

        if (config) this.configure(config);
    }

    public configure(config: SialiaConfig): Promise<any> {
        // backwards compatibility
        this.documents = (config.docs || []).map(x => ({
            name: x['Name'] || x.name,
            url: x['Url'] || x.name
        }));

        this.documentService.setHeaders({ ...(config.headers || {}) });

        if (this.documents[0]) {
            this.open(this.documents[0]);
        }
    }

    public open(documentOrString?: Document | string): Promise<any> {

        let document = documentOrString as Document;

        if (!isDocument(documentOrString)) {
            document = { url: documentOrString };
        }

        if (document) {
            return this.documentService.open(document)
                .then((options) => {
                    options.documents = this.documents || [document];
                    this.instance.opts = options;
                    this.instance.update();
                });
        }

        this.close();
        return Promise.resolve();
    }

    public close(): void {
        this.instance.opts = {};
        this.instance.update();
    }
}

export interface SialiaConfig {
    docs: Array<Document>;
    headers?: { [key: string]: string };
}
