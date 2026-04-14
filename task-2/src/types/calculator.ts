export type Operator = '+' | '-' | '/' | '*'

export interface HistoryEntry {
    expression: string;
    result: string;
    timestamp: number;
}

export type ConversionCategory = 'length' | 'weight' | 'temperature';