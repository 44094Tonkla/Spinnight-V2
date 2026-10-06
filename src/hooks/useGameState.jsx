import { createContext, useContext, useMemo, useState } from 'react';
import useRoom from './useRoom';
import { DEFAULT_CARD_RULES } from '../utils/cardDeck';

const GameContext = createContext();

const MOCK_DEMO_PLAYERS = [
  { id: 'host-1', name: 'NANA (HOST)', avatar: '1', avatarId: '1', isHost: true, isReady: true, score: 25 },
  { id: 'player-2', name: 'POND', avatar: '2', avatarId: '2', isHost: false, isReady: true, score: 30 },
  { id: 'player-3', name: 'MINT', avatar: '3', avatarId: '3', isHost: false, isReady: true, score: 15 },
  { id: 'player-4', name: 'BOSS', avatar: '4', avatarId: '4', isHost: false, isReady: false, score: 20 },
  { id: 'player-5', name: 'MAY', avatar: '5', avatarId: '5', isHost: false, isReady: false, score: 10 }
];

export const GameProvider = ({ children }) => {
  const roomHook = useRoom();
  const { roomData, roomCode, currentUser, loading, error } = roomHook;

  // Local state for demo/fallback testing mode if no live Firestore room is active
  const [localDemoState, setLocalDemoState] = useState({
    roomCode: 'SPIN99',
    roomName: 'FRIDAY NIGHT CHAOS',
    mode: 'CLASSIC',
    rounds: 5,
    status: 'PLAYING',
    rawStatus: 'playing',
    players: MOCK_DEMO_PLAYERS,
    hostId: 'host-1',
    gameType: 'SPIN',
    gameStatus: 'LOBBY',
    currentRound: 1,
    scores: { 'host-1': 25, 'player-2': 30, 'player-3': 15, 'player-4': 20, 'player-5': 10 },
    cardRules: DEFAULT_CARD_RULES,
    remainingDeck: [],
    currentCard: null,
    drawnHistory: [],
    currentTurnPlayerId: 'host-1',
    currentAskerId: 'host-1',
    currentQuestion: 'เคยแอบชอบเพื่อนในห้องนี้',
    votes: {},
    roundStatus: 'SELECTING_ASKER',
    currentHolderId: 'host-1',
    explodeAt: null,
    durationSec: 20,
    showTimerVisible: true,
    isExploded: false,
    loserId: null,
    bombStatus: 'READY'
  });

  // Derive unified gameState from Firestore roomData or fallback to local demo state
  const gameState = useMemo(() => {
    if (!roomData) {
      // Return local fallback/demo state so users can test every page and game screen
      return localDemoState;
    }

    const gs = roomData.gameState || {};

    let mappedStatus = "LOBBY";
    if (roomData.status === "playing") mappedStatus = "PLAYING";
    else if (roomData.status === "finished") mappedStatus = "FINISHED";
    else if (roomData.status === "waiting") mappedStatus = "LOBBY";

    return {
      roomCode: roomData.roomCode || roomCode || 'SPIN99',
      roomName: roomData.roomName || "FRIDAY NIGHT PARTY",
      mode: roomData.mode || "CLASSIC",
      rounds: roomData.rounds || 5,
      status: mappedStatus,
      rawStatus: roomData.status || 'waiting',
      players: (roomData.players && roomData.players.length > 0) ? roomData.players : MOCK_DEMO_PLAYERS,
      selectedPlayerId: gs.selectedPlayerId || null,
      selectedPlayer: gs.selectedPlayer || null,
      currentChallenge: gs.currentChallenge || null,
      currentRound: gs.currentRound || 1,
      gameStatus: gs.gameStatus || 'LOBBY',
      scores: gs.scores || {},
      currentTurn: gs.currentTurn || 0,
      spinResult: gs.spinResult || null,
      boardState: gs.boardState || {},
      hostId: roomData.hostId || 'host-1',
      // Card Game state
      gameType: gs.gameType || 'SPIN',
      cardRules: gs.cardRules || DEFAULT_CARD_RULES,
      remainingDeck: gs.remainingDeck || [],
      currentCard: gs.currentCard || null,
      drawnHistory: gs.drawnHistory || [],
      currentTurnPlayerId: gs.currentTurnPlayerId || (roomData.players && roomData.players.length > 0 ? roomData.players[0].id : 'host-1'),
      // Never Have I Ever state
      currentAskerId: gs.currentAskerId || 'host-1',
      currentQuestion: gs.currentQuestion || '',
      votes: gs.votes || {},
      roundStatus: gs.roundStatus || 'SELECTING_ASKER',
      // Bomb Roulette state
      currentHolderId: gs.currentHolderId || 'host-1',
      explodeAt: gs.explodeAt || null,
      durationSec: gs.durationSec || 20,
      showTimerVisible: gs.showTimerVisible !== undefined ? gs.showTimerVisible : true,
      isExploded: gs.isExploded || false,
      loserId: gs.loserId || null,
      bombStatus: gs.bombStatus || 'READY'
    };
  }, [roomData, roomCode, localDemoState]);

  const updateGameState = (action) => {
    if (typeof action === 'function') {
      const nextState = action(gameState);
      setLocalDemoState(prev => ({ ...prev, ...nextState }));
      if (roomData && roomHook.updateGameState) {
        roomHook.updateGameState(nextState);
      }
    } else {
      setLocalDemoState(prev => ({ ...prev, ...action }));
      if (roomData && roomHook.updateGameState) {
        roomHook.updateGameState(action);
      }
    }
  };

  const setGameType = (type) => {
    updateGameState({ gameType: type });
    if (roomData && roomHook.setGameType) {
      roomHook.setGameType(type);
    }
  };

  const startGame = async () => {
    updateGameState({ status: 'PLAYING', rawStatus: 'playing', gameStatus: 'LOBBY' });
    if (roomData && roomHook.startGame) {
      await roomHook.startGame();
    }
  };

  const backToLobby = async () => {
    updateGameState({ status: 'LOBBY', rawStatus: 'waiting', gameStatus: 'LOBBY' });
    if (roomData && roomHook.backToLobby) {
      await roomHook.backToLobby();
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState: updateGameState,
        currentUser: currentUser || { uid: 'host-1', isAnonymous: true },
        loading: false,
        error: null,
        createRoom: roomHook.createRoom,
        joinRoom: roomHook.joinRoom,
        updateGameState,
        setGameType,
        updateCardRules: roomHook.updateCardRules || ((rules) => updateGameState({ cardRules: rules })),
        drawCard: roomHook.drawCard || (() => {}),
        resetDeck: roomHook.resetDeck || (() => {}),
        pickAsker: roomHook.pickAsker || (() => {}),
        submitQuestion: roomHook.submitQuestion || (() => {}),
        submitVote: roomHook.submitVote || (() => {}),
        revealResults: roomHook.revealResults || (() => {}),
        startBombGame: roomHook.startBombGame || (() => {}),
        toggleBombTimerVisibility: roomHook.toggleBombTimerVisibility || (() => {}),
        passBomb: roomHook.passBomb || (() => {}),
        triggerExplosion: roomHook.triggerExplosion || (() => {}),
        backToLobby,
        leaveRoom: roomHook.leaveRoom || (() => {}),
        toggleReady: roomHook.toggleReady || (() => {}),
        startGame,
        roomCode: gameState.roomCode
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
};

export default useGameState;
