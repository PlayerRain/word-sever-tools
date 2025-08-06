import { Injectable } from '@nestjs/common';
import { ChangeDeck, CreateDeck } from './create_deck.dto';
import { Action, Deck, User, users } from 'src/user';

@Injectable()
export class PlayersService {
    async createDeck(create_deck: CreateDeck, player_id: string) {
        const deck = new Deck(create_deck, parseInt(player_id));
        const user: User = JSON.parse(await users.get(player_id));
        user.decks[deck.id] = deck;
        User.prototype.store.call(user);
        return deck;
    }

    async decksAction(deck_action: Action, player_id: string, deck_id: number) {
        const user: User = JSON.parse(await users.get(player_id));
        switch (deck_action.action) {
            case "fill":
                const deck: Deck | undefined = user.decks[deck_id];
                if (deck) {
                    deck.deck_code = deck_action.deck_code;
                }
                break;
        }
        User.prototype.store.call(user);
    }

    async changeDeck(action: ChangeDeck, player_id: string) {
        const user: User = JSON.parse(await users.get(player_id));
        switch (action.action) {
            case "rename":
                user.decks[action.id].name = action.name;
                break;
            case "change_card_back":
                user.decks[action.id].card_back = action.name;
                break;
        }
        User.prototype.store.call(user);
    }
}
