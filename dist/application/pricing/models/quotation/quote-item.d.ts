import { Money } from "../money";
export interface QuoteItem {
    readonly code: string;
    readonly label: string;
    readonly amount: Money;
    readonly quantity: number;
}
export declare function createQuoteItem(item: QuoteItem): QuoteItem;
//# sourceMappingURL=quote-item.d.ts.map