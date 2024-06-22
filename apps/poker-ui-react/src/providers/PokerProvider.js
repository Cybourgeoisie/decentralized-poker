import React, { createContext, useContext, useReducer, useCallback } from "react";
import pokersolver from "pokersolver";

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

	// Function to get a player's hand
	const getPlayerHand = useCallback(
		(playerId) => {
			const player = state.players.find((p) => p.id === playerId);
			return player ? player.hand : null;
		},
		[state.players],
	);

	// Function to evaluate a hand
	const evaluateHand = useCallback(
		(playerId) => {
			const playerHand = getPlayerHand(playerId);
			const communityCards = state.communityCards;
			if (playerHand && communityCards.length === 5) {
				const hand = [...playerHand, ...communityCards];
				const result = pokersolver.Hand.solve(hand);
				return result;
			}
			return null;
		},
		[getPlayerHand, state.communityCards],
	);

	// Value object to be provided
	const value = {
		gameId: state.gameId,
		players: state.players,
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
		evaluateHand,
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
