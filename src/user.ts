import { Level } from "level";
import { CreateDeck } from "./players/create_deck.dto";
import { deckCodeIDsTable } from "./config";
import { MatchCard } from "./match/match.dto";

export type main_faction = "Germany" | "Britain" | "Soviet" | "USA" | "Japan";
export type ally_faction = main_faction | "France" | "Italy" | "Poland" | "Finland";

export type location = "deck_left" | "deck_right" | "board_hqleft" | "board_hqright" | "hand_left" | "hand_right"

export class Deck {
    constructor(deck_action: CreateDeck, player_id: number) {
        this.name = deck_action.name;
        this.main_faction = deck_action.main_faction;
        this.ally_faction = deck_action.ally_faction;
        this.card_back = "cardback_starter_" + deck_action.main_faction.toLowerCase();
        this.deck_code = deck_action.deck_code;
        this.favorite = false;
        this.id = Math.floor(Math.random() * 900000) + 100000;
        this.player_id = player_id;
        this.last_played = new Date();
        this.create_date = new Date();
        this.modify_date = new Date();
    }
    getCards(start_id: number, is_left: boolean) {
        const cards_code = this.deck_code.replace(/~[^|]*/g, "").split("|")[1].split(";");
        const cards: MatchCard[] = [];
        let location = {
            card_id: start_id,
            faction: this.main_faction.toLowerCase(),
            is_gold: true,
            location: is_left ? "board_hqleft" : "board_hqright",
            location_number: 0,
            name: deckCodeIDsTable[this.deck_code.split("|")[2].slice(0, 2)].card
        };
        for (const i of [0, 1, 2, 3]) {
            cards_code[i].match(/.{1,2}/g)?.forEach((code) => {
                for (let j = 0; j <= i; j++) {
                    cards.push({
                        card_id: ++start_id,
                        is_gold: true,
                        location: is_left ? "deck_left" : "deck_right",
                        location_number: 0,
                        name: deckCodeIDsTable[code].card
                    });
                }
            });
        }
        for (let i = 0; i < cards.length; i++) {
            const randomIndex = Math.floor(Math.random() * (cards.length - i)) + i;
            [cards[i], cards[randomIndex]] = [cards[randomIndex], cards[i]];
        }
        cards.forEach((c, i) => c.location_number = i);
        return {
            cards,
            location
        }
    }
    isVaild() {
        const cards_code = this.deck_code.replace(/~[^|]*/g, "").split("|")[1].split(";");
        const cards = {};
        let result = true;
        for (const i of [0, 1, 2, 3]) {
            cards_code[i].match(/.{1,2}/g)?.forEach((code) => {
                if (!cards[code]) cards[code] = i+1;
                else cards[code] += i+1;
                if (cards[code] > 4) result = false;
            });
        }
        return result;
    }
    name: string;
    main_faction: main_faction;
    ally_faction: ally_faction;
    card_back: string;
    deck_code: string;
    favorite: boolean;
    id: number;
    player_id: number;
    last_played: Date;
    create_date: Date;
    modify_date: Date;
}

export class Item {
    faction: string;
    item_id: string
    slot: string;
}

export const users = new Level("./db/users.db");

export class User {
    constructor(user_name: string) {
        this.id = Math.floor(Math.random() * 900000) + 100000;
        this.user_name = user_name;
        this.name = "<anon>";
        this.tag = Math.floor(Math.random() * 9000) + 1000;
        this.locale = "zh-Hans";
        this.decks = {};
        this.equipped_item = [];
        this.items = [];
        this.banned = false;
    }
    async store() {
        await users.put(this.user_name, JSON.stringify(this));
        await users.put("" + this.id, JSON.stringify(this));
    }
    id: number;
    user_name: string;
    name: string;
    locale: string;
    tag: number;
    decks: { [key: number]: Deck };
    equipped_item: Item[];
    items;
    banned: boolean;
}

export class Action {
    action: string;
    value: string;
    deck_code: string;
}