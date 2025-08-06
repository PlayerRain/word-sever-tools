import { ally_faction, main_faction } from "src/user";

export class CreateDeck {
    readonly name: string;
    readonly main_faction: main_faction;
    readonly ally_faction: ally_faction;
    readonly deck_code: string;
}

export class ChangeDeck {
    readonly id: number;
    readonly name:string;
    readonly action: string;
}