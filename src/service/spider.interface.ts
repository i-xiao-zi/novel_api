export interface ItemEvent {
    type: 'book' | 'chapter' | 'error' | 'complete' | 'close';
    data: CoverItem | ChapterItem | undefined | string;
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
    type: 'book';
    item: CoverItem;
}
export interface CatalogItem {
    url?:            string;
    title?:          string;
}

export interface ChapterItem {
    title?:          string;
    content?:        string;
}
export interface ChapterItemEvent extends ItemEvent {
    type: 'chapter';
    item: ChapterItem;
}
