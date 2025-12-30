export interface ItemEvent {
    type: 'search' | 'cover' | 'catalog' | 'chapter' | 'error' | 'complete' | 'close';
    data: SearchItem | CoverItem | CatalogItem[] | ChapterItem | null;
    timestamp: string;
}

export interface SearchItem {
    url?:            string;
    title?:          string;
    category?:       string;
    author?:         string;
    image?:          string;
    description?:    string;
    latest?:         string;
    latest_title?:   string;
    status?:         string;
}

export interface SearchItemEvent extends ItemEvent {
    type: 'search';
    item: SearchItem;
}

export interface CoverItem {
    title?:          string;
    author?:         string;
    image?:          string;
    description?:    string;
    category?:       string;
    latest?:         string;
    latest_title?:   string;
    latest_url?:     string;
    status?:         string;
}
export interface CvoerItemmEvent extends ItemEvent {
    type: 'cover';
    item: CoverItem;
}
export interface CatalogItem {
    url?:            string;
    title?:          string;
}
export interface CatalogItemEvent extends ItemEvent {
    type: 'catalog';
    item: CatalogItem;
}
export interface ChapterItem {
    title?:          string;
    content?:        string;
}
export interface ChapterItemEvent extends ItemEvent {
    type: 'chapter';
    item: ChapterItem;
}
