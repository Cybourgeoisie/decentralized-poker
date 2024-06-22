module.exports = [
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes16",
				"name": "gameId",
				"type": "bytes16",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "winner",
				"type": "address",
			},
		],
		"name": "GameCompleted",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes16",
				"name": "gameId",
				"type": "bytes16",
			},
		],
		"name": "GameInvalidated",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes16",
				"name": "gameId",
				"type": "bytes16",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address",
			},
		],
		"name": "GameJoined",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes16",
				"name": "gameId",
				"type": "bytes16",
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address",
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "maxPlayers",
				"type": "uint256",
			},
		],
		"name": "GameRegistered",
		"type": "event",
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes16",
				"name": "gameId",
				"type": "bytes16",
			},
		],
		"name": "GameStarted",
		"type": "event",
	},
	{
		"inputs": [
			{
				"internalType": "bytes16",
				"name": "_gameId",
				"type": "bytes16",
			},
			{
				"internalType": "address",
				"name": "_winner",
				"type": "address",
			},
		],
		"name": "completeGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bytes16",
				"name": "",
				"type": "bytes16",
			},
		],
		"name": "games",
		"outputs": [
			{
				"internalType": "bytes16",
				"name": "gameId",
				"type": "bytes16",
			},
			{
				"internalType": "uint256",
				"name": "maxPlayers",
				"type": "uint256",
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address",
			},
			{
				"internalType": "address",
				"name": "winner",
				"type": "address",
			},
			{
				"internalType": "enum MultiplayerCardGameVerifier.GameState",
				"name": "state",
				"type": "uint8",
			},
			{
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "startedAt",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "completedAt",
				"type": "uint256",
			},
			{
				"internalType": "uint256",
				"name": "invalidatedAt",
				"type": "uint256",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "getOpenGames",
		"outputs": [
			{
				"internalType": "bytes16[]",
				"name": "",
				"type": "bytes16[]",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bytes16",
				"name": "_gameId",
				"type": "bytes16",
			},
		],
		"name": "getPlayersInGame",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bytes16",
				"name": "_gameId",
				"type": "bytes16",
			},
		],
		"name": "invalidateGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bytes16",
				"name": "_gameId",
				"type": "bytes16",
			},
		],
		"name": "joinGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
		],
		"name": "openGames",
		"outputs": [
			{
				"internalType": "bytes16",
				"name": "",
				"type": "bytes16",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "pruneOpenGamesList",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bytes16",
				"name": "_gameId",
				"type": "bytes16",
			},
			{
				"internalType": "uint256",
				"name": "_maxPlayers",
				"type": "uint256",
			},
			{
				"internalType": "address[]",
				"name": "_players",
				"type": "address[]",
			},
		],
		"name": "registerGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bytes16",
				"name": "_gameId",
				"type": "bytes16",
			},
		],
		"name": "startGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
];
