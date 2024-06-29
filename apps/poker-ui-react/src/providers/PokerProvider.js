import React, { createContext, useContext, useReducer, useCallback } from "react";
import { Player } from "../classes/Player";

// Define the initial state
const initialState = {
	gameId: null,
	dealer: null,
	deck: [],
	players: [],
	communityCards: [],
	history: [],
	currentTurn: null,
	gameStage: "waiting", // waiting, preflop, flop, turn, river, showdown
};

// Define action types
const SET_GAME_ID = "SET_GAME_ID";
const ADD_PLAYER = "ADD_PLAYER";
const UPDATE_PLAYER = "UPDATE_PLAYER";
const REMOVE_PLAYER = "REMOVE_PLAYER";
const SET_PLAYER_HAND = "SET_PLAYER_HAND";
const SET_COMMUNITY_CARDS = "SET_COMMUNITY_CARDS";
const SET_CURRENT_TURN = "SET_CURRENT_TURN";
const SET_HISTORY = "SET_HISTORY";
const SET_GAME_STAGE = "SET_GAME_STAGE";
const SET_DECK = "SET_DECK";
const SET_DEALER = "SET_DEALER";
const SET_KEYS = "SET_KEYS";

// Reducer function
function pokerReducer(state, action) {
	switch (action.type) {
		case SET_GAME_ID:
			return { ...state, gameId: action.payload };
		case ADD_PLAYER:
			// Do not add duplicate players by ID
			if (state.players.find((player) => player.getId() === action.payload.id)) {
				return state;
			}
			return { ...state, players: [...state.players, new Player(action.payload)] };
		case UPDATE_PLAYER:
			return {
				...state,
				players: state.players.map((player) => (player.getId() === action.payload.id ? player.update(action.payload) : player)),
			};
		case REMOVE_PLAYER:
			return { ...state, players: state.players.filter((player) => player.getId() !== action.payload) };
		case SET_PLAYER_HAND:
			return {
				...state,
				players: state.players.map((player) => (player.getId() === action.payload.id ? player.setHand(action.payload.hand) : player)),
			};
		case SET_COMMUNITY_CARDS:
			return { ...state, communityCards: action.payload };
		case SET_CURRENT_TURN:
			return { ...state, currentTurn: action.payload };
		case SET_HISTORY:
			return { ...state, history: action.payload };
		case SET_GAME_STAGE:
			return { ...state, gameStage: action.payload };
		case SET_DECK:
			return { ...state, deck: action.payload };
		case SET_DEALER:
			return { ...state, dealer: action.payload };
		/*
			console.log("Setting dealer:", action.payload, "compared to", JSON.stringify(state.players));
			return {
				...state,
				players: state.players.map((player) => (player.getAddress() === action.payload.id ? player.setIdDealer(true) : player.setIsDealer(false))),
			};
			*/
		case SET_KEYS:
			return { ...state, keys: action.payload };
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

	const updatePlayer = useCallback((player) => {
		dispatch({ type: UPDATE_PLAYER, payload: player });
	}, []);

	const removePlayer = useCallback((playerId) => {
		dispatch({ type: REMOVE_PLAYER, payload: playerId });
	}, []);

	const setPlayerHand = useCallback((playerId, hand) => {
		dispatch({ type: SET_PLAYER_HAND, payload: { id: playerId, hand } });
	}, []);

	const setCommunityCards = useCallback((cards) => {
		dispatch({ type: SET_COMMUNITY_CARDS, payload: cards });
	}, []);

	const setCurrentTurn = useCallback((playerId) => {
		dispatch({ type: SET_CURRENT_TURN, payload: playerId });
	}, []);

	const setHistory = useCallback((history) => {
		dispatch({ type: SET_HISTORY, payload: history });
	}, []);

	const addToHistory = useCallback(
		(event) => {
			dispatch({ type: SET_HISTORY, payload: [...state.history, event] });
		},
		[state.history],
	);

	const setGameStage = useCallback((stage) => {
		dispatch({ type: SET_GAME_STAGE, payload: stage });
	}, []);

	const setKeys = useCallback((keys) => {
		dispatch({ type: SET_KEYS, payload: keys });
	}, []);

	/*
	const setNewDeck = useCallback(() => {
		const deck = getNewDeck();
		deck.sort(() => Math.random() - 0.5);
		dispatch({ type: SET_DECK, payload: deck });
	}, []);
	*/

	const setDealerByAddress = useCallback((dealer) => {
		dispatch({ type: SET_DEALER, payload: dealer });
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

	// Value object to be provided
	const value = {
		gameId: state.gameId,
		players: state.players,
		deck: state.deck,
		dealer: state.dealer,
		communityCards: state.communityCards,
		currentTurn: state.currentTurn,
		gameStage: state.gameStage,
		keys: state.keys,
		history: state.history,
		setHistory,
		addToHistory,
		setKeys,
		//setNewDeck,
		setDealerByAddress,
		dealHand,
		dealCommunityCards,
		setGameId,
		addPlayer,
		updatePlayer,
		removePlayer,
		setPlayerHand,
		setCommunityCards,
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
