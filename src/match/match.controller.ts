import { Body, Controller, Get, Post, Headers, Delete, Param, Put, Req, Res } from '@nestjs/common';
import { MatchService } from './match.service';
import { LobbyPlayer, MatchAction, MulliganCards } from './match.dto';
import { User, users } from 'src/user';
import { clients } from 'src/main';

@Controller()
export class MatchController {
    constructor(private readonly matchService: MatchService) { }

    @Post("lobbyplayers")
    async joinMatch(@Body() lobbyPlayer: LobbyPlayer, @Req() req) {
        if (!await this.matchService.joinMatch(lobbyPlayer)) req.socket.destroy();
        return "OK";
    }

    @Delete("lobbyplayers")
    quitMatch(@Body() lobbyPlayer: LobbyPlayer) {
        this.matchService.quit(lobbyPlayer);
        return "{status:200}";
    }

    @Get("matches/v2")
    async checkMatch(@Headers("Authorization") auth: string) {
        const user: User = JSON.parse(await users.get(auth.slice(8)));
        return this.matchService.checkMatch(user.id);
    }

    @Get("matches/v2/:id")
    async get(@Headers("Authorization") auth: string, @Param("id") id: number) {
        return "running";
    }

    @Put("matches/v2/:id")
    async processMatch(@Headers("Authorization") auth: string, @Param("id") id: number, @Body() matchAction) {
        return this.matchService.processMatch(id, matchAction, JSON.parse(await users.get(auth.slice(8))));
    }

    @Put("matches/v2/:id/actions")
    async actions(@Headers("Authorization") auth: string, @Param("id") id: number, @Body() body) {
        return this.matchService.actions(id, JSON.parse(await users.get(auth.slice(8))), body);
    }

    @Post("matches/v2/:id/actions")
    async sendAction(@Headers("Authorization") auth: string, @Param("id") id: number, @Body() matchAction) {
        return this.matchService.processMatch(id, matchAction, JSON.parse(await users.get(auth.slice(8))));
    }

    @Post("matches/v2/:id/mulligan")
    async mulligan(@Headers("Authorization") auth: string, @Param("id") id: number, @Body() mulliganCards: MulliganCards) {
        return this.matchService.mulligan(id, mulliganCards, JSON.parse(await users.get(auth.slice(8))));
    }

    @Get("matches/v2/:id/mulligan/:location")
    async getMulligan(@Param("id") id: number, @Param("location") location: string) {
        return this.matchService.getMulligan(id, location);
    }

    @Get("matches/v2/:id/post")
    async post(@Headers("Authorization") auth: string, @Param("id") id: number) {
        return this.matchService.post(id, JSON.parse(await users.get(auth.slice(8))));
    }
}
