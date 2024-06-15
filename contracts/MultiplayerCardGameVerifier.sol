pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MultiplayerCardGameVerifier {

    // Game state
    enum GameState {
        CREATED,
        STARTED,
        COMPLETED,
        INVALIDATED
    }

    // Game struct
    struct Game {
        // Creation details
        uint256 id;
        uint256 maxPlayers;

        // Player details
        address creator;
        address winner;
        address[] players;

        // Gameplay state
        GameState state;
        uint256 createdAt;
        uint256 startedAt;
        uint256 completedAt;
        uint256 invalidatedAt;
    }

    // Mapping of game id to game
    mapping(uint256 => Game) public games;

    // Current game ID
    uint256 public currentGameId;

    // Constructor
    constructor() {
        currentGameId = 0;
    }

    // Modifier: only allow EOAs to play
    modifier onlyEOA() {
        require(msg.sender == tx.origin, "Only EOAs allowed");
        _;
    }

    // Register a new game
    function registerGame(
        uint256 _maxPlayers
    )
        public onlyEOA nonReentrant
    {
        currentGameId++;

        games[currentGameId] = Game(
            currentGameId,
            _maxPlayers,
            msg.sender,
            address(0),
            new address[](0),
            GameState.CREATED,
            block.timestamp,
            0,
            0,
            0
        );
    }

    // Join a game
    function joinGame(uint256 _gameId)
        public onlyEOA nonReentrant
    {
        Game storage game = games[_gameId];

        require(game.state == GameState.CREATED, "Game not in CREATED state");
        require(game.players.length < game.maxPlayers, "Game is full");

        // Only allow a player to join once
        for (uint256 i = 0; i < game.players.length; i++) {
            require(game.players[i] != msg.sender, "Player already joined");
        }

        game.players.push(msg.sender);
    }

    // Start a game
    function startGame(uint256 _gameId)
        public onlyEOA
    {
        Game storage game = games[_gameId];

        require(game.state == GameState.CREATED, "Game not in CREATED state");
        require(game.creator == msg.sender, "Only creator can start the game");

        game.state = GameState.STARTED;
        game.startedAt = block.timestamp;
    }

    // Complete a game
    function completeGame(uint256 _gameId, address _winner)
        public onlyEOA
    {
        Game storage game = games[_gameId];

        require(game.state == GameState.STARTED, "Game not in STARTED state");
        require(game.creator == msg.sender, "Only creator can complete the game");

        game.state = GameState.COMPLETED;
        game.completedAt = block.timestamp;
        game.winner = _winner;
    }

    // Invalidate a game
    function invalidateGame(uint256 _gameId)
        public onlyEOA
    {
        Game storage game = games[_gameId];

        require(game.state == GameState.CREATED, "Game not in CREATED state");
        require(game.creator == msg.sender, "Only creator can invalidate the game");

        game.state = GameState.INVALIDATED;
        game.invalidatedAt = block.timestamp;
    }
}
