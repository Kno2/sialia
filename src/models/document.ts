export interface Document {
    name?: string;
    url?: string;
    content?: string;
}

export function isDocument(arg: any): arg is Document {
    return arg.url !== undefined;
}
