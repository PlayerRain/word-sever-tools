import { location } from "src/user";

export class LobbyPlayer {
    player_id: number;
    deck_id: number;
    extra_data: string;
}

export class MatchAction {
    action: string;
    action_type: string;
    action_id: number;
}

export class MulliganCards {
    discarded_card_ids: number[];
}

export class MatchCard {
    card_id: number;
    is_gold: boolean;
    location: location;
    location_number: number;
    name: string
}

export class MatchInfo {
    constructor(match_id: number, left: LobbyPlayer, right: LobbyPlayer) {
        this.match_id = match_id;
        this.left = left;
        this.right = right;
        this.left_actions = [];
        this.right_actions = [];
        this.player_status_left = "not_done";
        this.player_status_right = "not_done";
        this.left_minactionid = 0;
        this.right_minactionid = 0;
    }
    hasPlayer(player_id: number): boolean {
        return this.left.player_id == player_id || this.right.player_id == player_id
    }
    getPlayerById(player_id: number): LobbyPlayer {
        return this.left.player_id == player_id ? this.left : this.right;
    }
    getActionsById(player_id: number) {
        return this.left.player_id == player_id ? this.left_actions : this.right_actions;
    }
    match_id: number;
    matchStartingInfo;
    left: LobbyPlayer;
    right: LobbyPlayer;
    left_actions: MatchAction[];
    right_actions: MatchAction[];
    player_status_left: "not_done" | "mulligan_done" | "end_match";
    player_status_right: "not_done" | "mulligan_done" | "end_match";
    mulligan_left: { deck: MatchCard[], replacement_cards: MatchCard[] }
    mulligan_right: { deck: MatchCard[], replacement_cards: MatchCard[] }
    left_deck: MatchCard[];
    right_deck: MatchCard[];
    left_hand: MatchCard[];
    right_hand: MatchCard[];
    left_minactionid: number;
    right_minactionid: number;
    winner_side: string;
}