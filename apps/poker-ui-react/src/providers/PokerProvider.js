import React, { createContext, useContext, useReducer, useCallback } from "react";
import pokersolver from "pokersolver";

const Suits = ["d", "c", "h", "s"];
const Ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

const getNewDeck = () => {
	return Suits.flatMap((suit) => Ranks.map((rank) => `${rank}${suit}`));
};

// Define the initial state
const initialState = {
	gameId: null,
	players: [],
	communityCards: [],
	pot: 0,
	currentTurn: null,
	gameStage: "waiting", // waiting, preflop, flop, turn, river, showdown
};

// Define action types
const SET_GAME_ID = "SET_GAME_ID";
const ADD_PLAYER = "ADD_PLAYER";
const REMOVE_PLAYER = "REMOVE_PLAYER";
const SET_PLAYER_HAND = "SET_PLAYER_HAND";
const SET_COMMUNITY_CARDS = "SET_COMMUNITY_CARDS";
const SET_POT = "SET_POT";
const SET_CURRENT_TURN = "SET_CURRENT_TURN";
const SET_GAME_STAGE = "SET_GAME_STAGE";
const SET_DECK = "SET_DECK";

// Reducer function
function pokerReducer(state, action) {
	switch (action.type) {
		case SET_GAME_ID:
			return { ...state, gameId: action.payload };
		case ADD_PLAYER:
			return { ...state, players: [...state.players, action.payload] };
		case REMOVE_PLAYER:
			return { ...state, players: state.players.filter((player) => player.id !== action.payload) };
		case SET_PLAYER_HAND:
			return {
				...state,
				players: state.players.map((player) => (player.id === action.payload.playerId ? { ...player, hand: action.payload.hand } : player)),
			};
		case SET_COMMUNITY_CARDS:
			return { ...state, communityCards: action.payload };
		case SET_POT:
			return { ...state, pot: action.payload };
		case SET_CURRENT_TURN:
			return { ...state, currentTurn: action.payload };
		case SET_GAME_STAGE:
			return { ...state, gameStage: action.payload };
		case SET_DECK:
			return { ...state, deck: action.payload };
		default:
			return state;
	}
}

// Create the context
const PokerContext = createContext();

// Provider component
export function PokerProvider({ children }) {
	const [state, dispatch] = useReducer(pokerReducer, initialState);

	// Functions to interact with the game state
	const setGameId = useCallback((gameId) => {
		dispatch({ type: SET_GAME_ID, payload: gameId });
	}, []);

	const addPlayer = useCallback((player) => {
		dispatch({ type: ADD_PLAYER, payload: player });
	}, []);

	const removePlayer = useCallback((playerId) => {
		dispatch({ type: REMOVE_PLAYER, payload: playerId });
	}, []);

	const setPlayerHand = useCallback((playerId, hand) => {
		dispatch({ type: SET_PLAYER_HAND, payload: { playerId, hand } });
	}, []);

	const setCommunityCards = useCallback((cards) => {
		dispatch({ type: SET_COMMUNITY_CARDS, payload: cards });
	}, []);

	const setPot = useCallback((amount) => {
		dispatch({ type: SET_POT, payload: amount });
	}, []);

	const setCurrentTurn = useCallback((playerId) => {
		dispatch({ type: SET_CURRENT_TURN, payload: playerId });
	}, []);

	const setGameStage = useCallback((stage) => {
		dispatch({ type: SET_GAME_STAGE, payload: stage });
	}, []);

	const setNewDeck = useCallback(() => {
		const deck = getNewDeck();
		deck.sort(() => Math.random() - 0.5);
		dispatch({ type: SET_DECK, payload: deck });
	}, []);

	// Function to get a player's hand
	const getPlayerHand = useCallback(
		(playerId) => {
			const player = state.players.find((p) => p.id === playerId);
			return player ? player.hand : [];
		},
		[state.players],
	);

	const dealHand = useCallback(
		(deck, playerId) => {
			const hand = [deck.pop(), deck.pop()];
			setPlayerHand(playerId, hand);
		},
		[setPlayerHand],
	);

	const dealCommunityCards = useCallback(
		(deck) => {
			const communityCards = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];
			setCommunityCards(communityCards);
		},
		[setCommunityCards],
	);

	const evaluateHand = useCallback((playerHand, communityCards) => {
		if (!playerHand || !communityCards || (playerHand.length === 0 && communityCards.length === 0)) return { descr: "No hand" };
		const hand = pokersolver.Hand.solve([...playerHand, ...communityCards]);
		return hand;
	}, []);

	// Value object to be provided
	const value = {
		gameId: state.gameId,
		players: state.players,
		evaluateHand,
		deck: state.deck,
		setNewDeck,
		dealHand,
		dealCommunityCards,
		communityCards: state.communityCards,
		pot: state.pot,
		currentTurn: state.currentTurn,
		gameStage: state.gameStage,
		setGameId,
		addPlayer,
		removePlayer,
		setPlayerHand,
		setCommunityCards,
		setPot,
		setCurrentTurn,
		setGameStage,
		getPlayerHand,
	};

	return <PokerContext.Provider value={value}>{children}</PokerContext.Provider>;
}

// Custom hook to use the poker context
export function usePoker() {
	const context = useContext(PokerContext);
	if (!context) {
		throw new Error("usePoker must be used within a PokerProvider");
	}
	return context;
}
