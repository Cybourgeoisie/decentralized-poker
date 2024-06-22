pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MultiplayerCardGameVerifier is ReentrancyGuard {

    enum GameState { CREATED, STARTED, COMPLETED, INVALIDATED }

    struct Game {
        bytes16 gameId;
        uint256 maxPlayers;
        address creator;
        address winner;
        address[] players;
        GameState state;
        uint256 createdAt;
        uint256 startedAt;
        uint256 completedAt;
        uint256 invalidatedAt;
    }

    bytes16[] public openGames;
    mapping(bytes16 => Game) public games;

    event GameRegistered(bytes16 indexed gameId, address indexed creator, uint256 maxPlayers);
    event GameJoined(bytes16 indexed gameId, address indexed player);
    event GameStarted(bytes16 indexed gameId);
    event GameCompleted(bytes16 indexed gameId, address indexed winner);
    event GameInvalidated(bytes16 indexed gameId);

    function registerGame(bytes16 _gameId, uint256 _maxPlayers, address[] memory _players) public nonReentrant {
        require(_maxPlayers >= 2, "Game must have at least 2 players");
        require(games[_gameId].gameId == bytes16(0), "Game ID already exists");

        games[_gameId] = Game({
            gameId: _gameId,
            maxPlayers: _maxPlayers,
            creator: msg.sender,
            winner: address(0),
            players: new address[](0),
            state: GameState.CREATED,
            createdAt: block.timestamp,
            startedAt: 0,
            completedAt: 0,
            invalidatedAt: 0
        });

        games[_gameId].players.push(msg.sender);

        for (uint256 i = 0; i < _players.length; i++) {
            require(_players[i] != address(0), "Invalid player address");
            games[_gameId].players.push(_players[i]);
        }

        emit GameRegistered(_gameId, msg.sender, _maxPlayers);

        if (games[_gameId].players.length == games[_gameId].maxPlayers) {
            _startGame(_gameId);
        } else {
            openGames.push(_gameId);
        }
    }

    function joinGame(bytes16 _gameId) public nonReentrant {
        Game storage game = games[_gameId];

        require(game.state == GameState.CREATED, "Game not in CREATED state");
        require(game.players.length < game.maxPlayers, "Game is full");
        require(!_isPlayerInGame(game, msg.sender), "Player already joined");

        game.players.push(msg.sender);

        emit GameJoined(_gameId, msg.sender);

        if (game.players.length == game.maxPlayers) {
            _startGame(_gameId);
        }
    }

    function getOpenGames() public view returns (bytes16[] memory) {
        return openGames;
    }

    function getPlayersInGame(bytes16 _gameId) public view returns (address[] memory) {
        return games[_gameId].players;
    }

    function startGame(bytes16 _gameId) public {
        Game storage game = games[_gameId];

        require(game.state == GameState.CREATED, "Game not in CREATED state");
        require(game.creator == msg.sender, "Only creator can start the game");
        require(game.players.length >= 2, "Game must have at least 2 players");

        _startGame(_gameId);
    }

    function completeGame(bytes16 _gameId, address _winner) public {
        Game storage game = games[_gameId];

        require(game.state == GameState.STARTED, "Game not in STARTED state");
        require(game.creator == msg.sender, "Only creator can complete the game");
        require(_isPlayerInGame(game, _winner), "Winner must be a player in the game");

        game.state = GameState.COMPLETED;
        game.completedAt = block.timestamp;
        game.winner = _winner;

        emit GameCompleted(_gameId, _winner);
    }

    function invalidateGame(bytes16 _gameId) public {
        Game storage game = games[_gameId];

        require(game.state == GameState.CREATED, "Game not in CREATED state");
        require(game.creator == msg.sender, "Only creator can invalidate the game");

        game.state = GameState.INVALIDATED;
        game.invalidatedAt = block.timestamp;

        _pruneOpenGamesList();

        emit GameInvalidated(_gameId);
    }

    function pruneOpenGamesList() public {
        _pruneOpenGamesList();
    }

    function _startGame(bytes16 _gameId) private {
        Game storage game = games[_gameId];
        game.state = GameState.STARTED;
        game.startedAt = block.timestamp;

        _pruneOpenGamesList();

        emit GameStarted(_gameId);
    }

    function _pruneOpenGamesList() private {
        uint256 currentTime = block.timestamp;
        uint256 timeLimitMinutesAgo = currentTime - 10 minutes;

        for (uint256 i = 0; i < openGames.length;) {
            Game storage game = games[openGames[i]];

            if (game.createdAt < timeLimitMinutesAgo || game.state != GameState.CREATED) {
                openGames[i] = openGames[openGames.length - 1];
                openGames.pop();
            } else {
                i++;
            }
        }
    }

    function _isPlayerInGame(Game storage game, address player) private view returns (bool) {
        for (uint256 i = 0; i < game.players.length; i++) {
            if (game.players[i] == player) {
                return true;
            }
        }
        return false;
    }
}