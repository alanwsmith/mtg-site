/* tslint:disable */
/* eslint-disable */

export class Card {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export class CardCard {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export class Deck {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static active_card(): string | undefined;
    static active_category(): string;
    static active_filter(): number;
    static card_category(uid: string): string;
    static card_filter(uid: string): number;
    static card_in_out_maybe(uid: string): string;
    static card_quantity(uid: string): number;
    static card_visibility(uid: string): string;
    static cards_in_category(category: string): string[];
    static categories(): string[];
    static is_last_card_in_category(uid: string): boolean;
    static load_json(content: string): void;
    static set_active_card(uid: string): void;
    static set_active_filter(filter: number): void;
    static set_card_filter(uid: string, filter: number): void;
}

export class OracleCard {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_card_free: (a: number, b: number) => void;
    readonly __wbg_cardcard_free: (a: number, b: number) => void;
    readonly __wbg_deck_free: (a: number, b: number) => void;
    readonly __wbg_oraclecard_free: (a: number, b: number) => void;
    readonly deck_active_card: () => [number, number, number, number];
    readonly deck_active_category: () => [number, number, number, number];
    readonly deck_active_filter: () => [number, number, number];
    readonly deck_card_category: (a: number, b: number) => [number, number, number, number];
    readonly deck_card_filter: (a: number, b: number) => [number, number, number];
    readonly deck_card_in_out_maybe: (a: number, b: number) => [number, number, number, number];
    readonly deck_card_quantity: (a: number, b: number) => [number, number, number];
    readonly deck_card_visibility: (a: number, b: number) => [number, number, number, number];
    readonly deck_cards_in_category: (a: number, b: number) => [number, number, number, number];
    readonly deck_categories: () => [number, number, number, number];
    readonly deck_is_last_card_in_category: (a: number, b: number) => [number, number, number];
    readonly deck_load_json: (a: number, b: number) => [number, number];
    readonly deck_set_active_card: (a: number, b: number) => [number, number];
    readonly deck_set_active_filter: (a: number) => [number, number];
    readonly deck_set_card_filter: (a: number, b: number, c: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
