import { Document } from './models';
export declare class Sialia {
    private documentService;
    private instance;
    private documents;
    constructor(config?: SialiaConfig);
    configure(config: SialiaConfig): Promise<any>;
    open(documentOrString?: Document | string): Promise<any>;
    close(): void;
}
export interface SialiaConfig {
    docs: Array<Document>;
    headers?: {
        [key: string]: string;
    };
}
