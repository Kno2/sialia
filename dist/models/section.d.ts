export interface Section {
    key: string;
    display: string;
    tagName: string;
    icon: string;
    sort?: number;
    enabled?: boolean;
}
export declare function updateSortOrder(sections: Array<Section>): Array<Section>;
