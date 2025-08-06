import { ForbiddenException, Injectable } from '@nestjs/common';
import { LobbyPlayer, MatchAction, MatchCard, MatchInfo, MulliganCards } from './match.dto';
import { Deck, User, users } from 'src/user';
import { ban_cheat, server_address } from 'src/config';
import { clients } from 'src/main';

@Injectable()
export class MatchService {
    static waitingPlayers1: LobbyPlayer[] = [];
    static waitingPlayers2: LobbyPlayer[] = [];
    static battaleCodePlayers: { [key: string]: LobbyPlayer[] } = {}
    static matchedPairs: { [key: string]: MatchInfo } = {};
    async joinMatch(lobbyPlayer: LobbyPlayer) {
        const user: User = JSON.parse(await users.get("" + lobbyPlayer.player_id));
        if (user.name == "<anon>") {
            clients[user.id]?.client.send(JSON.stringify({
                message: "请改名",
                channel: "disconnect",
                context: null,
                timestamp: "",
                sender: "Server",
                receiver: null
            }));
            return;
        }
        if (lobbyPlayer.extra_data.startsWith("battle_code:")) {
            if (!MatchService.battaleCodePlayers[lobbyPlayer.extra_data]) MatchService.battaleCodePlayers[lobbyPlayer.extra_data] = [];
            const players = MatchService.battaleCodePlayers[lobbyPlayer.extra_data];
            players.push(lobbyPlayer);
            if (players.length >= 2) {
                const match_id = Math.floor(Math.random() * 900000) + 100000;
                //@ts-ignore
                const match_info = new MatchInfo(match_id, players.shift(), players.shift());
                MatchService.matchedPairs[match_id] = match_info;
            }
            return true;
        }
        if (!Deck.prototype.isVaild.call(user.decks[lobbyPlayer.deck_id])) return false;
        if (lobbyPlayer.extra_data == "") {
            MatchService.waitingPlayers1.push(lobbyPlayer);
            if (MatchService.waitingPlayers1.length >= 2) {
                const match_id = Math.floor(Math.random() * 900000) + 100000;
                //@ts-ignore
                const match_info = new MatchInfo(match_id, MatchService.waitingPlayers1.shift(), MatchService.waitingPlayers1.shift());
                MatchService.matchedPairs[match_id] = match_info;
            }
        } else {
            MatchService.waitingPlayers2.push(lobbyPlayer);
            if (MatchService.waitingPlayers2.length >= 2) {
                const match_id = Math.floor(Math.random() * 900000) + 100000;
                //@ts-ignore
                const match_info = new MatchInfo(match_id, MatchService.waitingPlayers2.shift(), MatchService.waitingPlayers2.shift());
                MatchService.matchedPairs[match_id] = match_info;
            }
        }
        return true;
    }
    async checkMatch(player_id: number) {
        let match: MatchInfo | null = null;
        for (const key in MatchService.matchedPairs) {
            if (!MatchService.matchedPairs[key].winner_side && MatchService.matchedPairs[key].hasPlayer(player_id)) match = MatchService.matchedPairs[key];
        }
        if (match === null) return "null";
        return await this.makeMatchStartingInfo(player_id, match);
    }

    async makeMatchStartingInfo(my_id: number, match: MatchInfo) {
        let other: LobbyPlayer;
        if (match.left.player_id == my_id) other = match.right;
        else other = match.left;
        if (match.matchStartingInfo) {
            match.matchStartingInfo.action_player_id = other.player_id;
            match.matchStartingInfo.action_side = other.player_id == match.left.player_id ? "left" : "right";
            return match.matchStartingInfo;
        }
        const left: User = JSON.parse(await users.get("" + match.left.player_id));
        const right: User = JSON.parse(await users.get("" + match.right.player_id));
        const left_deck = Deck.prototype.getCards.call(left.decks[match.left.deck_id], 1, true);
        const right_deck = Deck.prototype.getCards.call(right.decks[match.right.deck_id], 41, false);
        match.left_deck = left_deck.cards;
        match.right_deck = right_deck.cards;
        match.left_hand = left_deck.cards.splice(0, 4);
        match.right_hand = right_deck.cards.splice(0, 5);
        match.left_hand.forEach((c) => c.location = "hand_left");
        match.right_hand.forEach((c) => c.location = "hand_right");
        match.matchStartingInfo = {
            "local_subactions": true,
            "match_and_starting_data": {
                "match": {
                    "action_player_id": other.player_id,
                    "action_side": other.player_id == match.left.player_id ? "left" : "right",
                    "actions": [],
                    "actions_url": server_address + "/matches/v2/" + match.match_id + "/actions",
                    "current_action_id": 0,
                    "current_turn": 1,
                    "deck_id_left": match.left.deck_id,
                    "deck_id_right": match.right.deck_id,
                    "left_is_online": 1,
                    "match_id": match.match_id,
                    "match_type": "battle",
                    "match_url": server_address + "/matches/v2/" + match.match_id,
                    "modify_date": JSON.stringify(new Date()),
                    "notifications": [],
                    "player_id_left": left.id,
                    "player_id_right": right.id,
                    "player_status_left": "not_done",
                    "player_status_right": "not_done",
                    "right_is_online": 1,
                    "start_side": "left",
                    "status": "pending",
                    "winner_id": 0,
                    "winner_side": ""
                },
                "starting_data": {
                    "ally_faction_left": left.decks[match.left.deck_id].ally_faction.toLowerCase(),
                    "ally_faction_right": right.decks[match.right.deck_id].ally_faction.toLowerCase(),
                    "card_back_left": left.decks[match.left.deck_id].card_back,
                    "card_back_right": right.decks[match.right.deck_id].card_back,
                    "starting_hand_left": match.left_hand,
                    "starting_hand_right": match.right_hand,
                    "deck_left": left_deck.cards,
                    "deck_right": right_deck.cards,
                    "equipment_left": left.equipped_item.map((i) => i.item_id),
                    "equipment_right": right.equipped_item.map((i) => i.item_id),
                    "is_ai_match": false,
                    "left_player_name": left.name,
                    "left_player_officer": false,
                    "left_player_tag": left.tag,
                    "location_card_left": left_deck.location,
                    "location_card_right": right_deck.location,
                    "player_id_left": left.id,
                    "player_id_right": right.id,
                    "player_stars_left": 120,
                    "player_stars_right": 120,
                    "right_player_name": right.name,
                    "right_player_officer": false,
                    "right_player_tag": right.tag
                }
            }
        };
        return match.matchStartingInfo;
    }

    processMatch(match_id: number, action: MatchAction, player: User) {
        const match = MatchService.matchedPairs[match_id];
        if (ban_cheat && action.action_type == "XActionCheat") {
            clients[player.id].client.send(JSON.stringify({
                message: "该账户已被封禁",
                channel: "disconnect",
                context: null,
                timestamp: "",
                sender: "Server",
                receiver: null
            }));
            player.banned = true;
            User.prototype.store.call(player);
            match.winner_side = player.id == match.left.player_id ? "right" : "left";
            return;
        }
        if (action.action == "lvl-loaded") return { "otherPlayerReady": 1 };
        if (action.action == "end-match" && !match.winner_side) {
            //@ts-ignore
            match.winner_side = action.value.winner_side;
        }
        if (action.action_type || action.action) {
            if (action.action_id) {
                if (player.id == match.left.player_id && action.action_id >= match.left_minactionid) match.left_minactionid = action.action_id;
                else if (action.action_id >= match.right_minactionid) match.right_minactionid = action.action_id;
            }
            if (match.left.player_id == player.id) match.right_actions.push(action);
            else match.left_actions.push(action);
        }
        return "OK";
    }

    actions(match_id: number, player: User, body) {
        const match = MatchService.matchedPairs[match_id];
        const result: any = {};
        const actions = match.getActionsById(player.id);
        if (actions.length != 0 && actions.findIndex((a) => a.action_id == body.min_action_id || a.action) != -1 && actions.sort((a, b) => a.action_id - b.action_id).every((a, i) => a.action || i == 0 || a.action_id - 1 == actions[i - 1].action_id)) result.actions = match.getActionsById(player.id).splice(0);
        result.match = {
            player_status_left: match.player_status_left,
            player_status_right: match.player_status_right,
            status: "running"
        };
        result.opponent_polling = true;
        if (match.winner_side) {
            result.match.status = "finished"
            result.actions = [{
                "action_type": "XActionCheat",
                "player_id": match.left.player_id == player.id ? match.right.player_id : match.left.player_id,
                "action_data": {
                    "0": "DamageCard",
                    "1": match.winner_side == "left" ? "41" : "1",
                    "2": "99",
                    "playerID": match.left.player_id == player.id ? match.right.player_id : match.left.player_id
                },
                "action_id": match.left.player_id == player.id ? match.right_minactionid + 1 : match.left_minactionid + 1,
                "local_subactions": 1
            }].concat(result.actions);
            result.match = {
                player_status_left: "mulligan_done",
                player_status_right: "mulligan_done",
                status: "finished"
            };
            if (match.left.player_id == player.id) {
                match.right_minactionid = result.actions[0].action_id;
            } else {
                match.left_minactionid = result.actions[0].action_id;
            }
        };
        return result;
    }

    mulligan(match_id: number, mulliganCards: MulliganCards, player: User) {
        const match = MatchService.matchedPairs[match_id];
        let deck: MatchCard[], hand: MatchCard[];
        if (match.left.player_id == player.id) {
            deck = match.left_deck;
            hand = match.left_hand;
            match.player_status_left = "mulligan_done";
        }
        else {
            deck = match.right_deck;
            hand = match.right_hand;
            match.player_status_right = "mulligan_done";
        }
        const result: { deck: MatchCard[], replacement_cards: MatchCard[] } = { deck, replacement_cards: [] };
        for (const id of mulliganCards.discarded_card_ids) {
            hand.forEach((card) => {
                if (card.card_id == id) {
                    const random_index = Math.floor(Math.random() * result.deck.length);
                    [result.deck[random_index].location, card.location] = [card.location, result.deck[random_index].location];
                    [result.deck[random_index].location_number, card.location_number] = [card.location_number, result.deck[random_index].location_number];
                    result.replacement_cards.push(result.deck[random_index]);
                    result.deck[random_index] = card;
                }
            });
        }
        //console.log(hand);
        if (match.left.player_id == player.id) match.mulligan_left = result
        else match.mulligan_right = result;
        return result;
    }

    getMulligan(match_id: number, location: string) {
        return MatchService.matchedPairs[match_id]["mulligan_" + location] ?? "null";
    }

    post(match_id: number, user: User) {
        const match = MatchService.matchedPairs[match_id];
        if (match.left.player_id == user.id) match.player_status_left = "end_match";
        else match.player_status_right = "end_match";
        if (match.player_status_left == "end_match" && match.player_status_right == "end_match") delete MatchService.matchedPairs[match_id]
        if (match[match.winner_side].player_id == user.id) {
            return {
                faction: user.decks[match.getPlayerById(user.id).deck_id].main_faction,
                winner: true
            }
        } else {
            return {
                faction: user.decks[match.getPlayerById(user.id).deck_id].main_faction,
                winner: false
            }
        }
    }

    quit(player: LobbyPlayer) {
        let i = MatchService.waitingPlayers1.findIndex((p) => p.player_id == player.player_id);
        if (i != -1) MatchService.waitingPlayers1.splice(i, 1);
        i = MatchService.waitingPlayers2.findIndex((p) => p.player_id == player.player_id);
        if (i != -1) MatchService.waitingPlayers2.splice(i, 1);
        for (const code in MatchService.battaleCodePlayers) {
            i = MatchService.battaleCodePlayers[code].findIndex((p) => p.player_id == player.player_id);
            if (i != -1) MatchService.battaleCodePlayers[code].splice(i, 1);
        }
    }
}
