import { Body, Controller, Delete, Get, Param, Post, Put, Headers } from '@nestjs/common';
import { PlayersService } from './players.service';
import { library } from 'src/library';
import { ChangeDeck, CreateDeck } from './create_deck.dto';
import { Action, User, users } from 'src/user';

@Controller('players')
export class PlayersController {
    constructor(private readonly playersService: PlayersService) { }

    @Get(":id/librarynew")
    getLibrary() {
        return library;
    }

    @Post(":id/decks")
    createDeck(@Body() create_deck: CreateDeck, @Param("id") player_id: string) {
        return this.playersService.createDeck(create_deck, player_id);
    }

    @Put(":player_id/decks/:deck_id")
    decksAction(@Body() deck_action: Action, @Param("player_id") player_id: string, @Param("deck_id") deck_id: number) {
        return this.playersService.decksAction(deck_action, player_id, deck_id);
    }

    @Put(":player_id/decks/")
    changeDeck(@Body() deck_action: ChangeDeck, @Param("player_id") player_id: string) {
        return this.playersService.changeDeck(deck_action, player_id);
    }

    @Delete(":player_id/decks/:deck_id")
    async deleteDeck(@Param("player_id") player_id: string, @Param("deck_id") deck_id: number) {
        const user: User = JSON.parse(await users.get(player_id + ""));
        delete user.decks[deck_id];
        User.prototype.store.call(user);
    }

    @Put(":id/heartbeat")
    @Delete(":id/heartbeat")
    heartbeat() {
        return {}
    }
}
