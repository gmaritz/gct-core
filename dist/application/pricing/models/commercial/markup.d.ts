import { Money } from "../money";
export interface Markup {
    readonly code: string;
    readonly label: string;
    readonly amount: Money;
}
export declare function createMarkup(markup: Markup): Markup;
//# sourceMappingURL=markup.d.ts.map