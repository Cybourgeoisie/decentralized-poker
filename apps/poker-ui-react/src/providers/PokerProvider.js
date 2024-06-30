import React, { createContext, useContext, useReducer, useCallback } from "react";
import { Player } from "../classes/Player";

// Define the initial state
const initialState = {
	gameId: null,
	dealer: null,
	players: [],
};

// Define action types
const SET_GAME_ID = "SET_GAME_ID";
const ADD_PLAYER = "ADD_PLAYER";
const UPDATE_PLAYER = "UPDATE_PLAYER";
const REMOVE_PLAYER = "REMOVE_PLAYER";
const SET_DEALER = "SET_DEALER";
const RESET_ALL = "RESET_ALL";

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
		case SET_DEALER:
			return { ...state, dealer: action.payload };
		case RESET_ALL:
			return { ...initialState };
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

	const setDealerByAddress = useCallback((dealer) => {
		dispatch({ type: SET_DEALER, payload: dealer });
	}, []);

	const resetAll = useCallback(() => {
		dispatch({ type: RESET_ALL });
	}, []);

	// Value object to be provided
	const value = {
		gameId: state.gameId,
		players: state.players,
		dealer: state.dealer,
		setDealerByAddress,
		setGameId,
		addPlayer,
		updatePlayer,
		removePlayer,
		resetAll,
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
