import { useState, useEffect, useCallback } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, ensureAnonymousAuth, auth } from '../config/firebase';
import { generateRoomCode } from '../utils/generateRoomCode';
import { generateDeck, DEFAULT_CARD_RULES } from '../utils/cardDeck';

export const useRoom = (initialRoomCode = null) => {
  const [roomCode, setRoomCode] = useState(() => {
    return initialRoomCode || sessionStorage.getItem('spinnight_room_code') || null;
  });
  const [roomData, setRoomData] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const savedId = sessionStorage.getItem('spinnight_player_id');
    return auth.currentUser || (savedId ? { uid: savedId } : null);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authenticate user on mount if needed
  useEffect(() => {
    ensureAnonymousAuth()
      .then(user => {
        setCurrentUser(user);
        sessionStorage.setItem('spinnight_player_id', user.uid);
      })
      .catch(err => console.error("Auth error:", err));
  }, []);

  // Listen to Firestore room changes in real-time using onSnapshot
  useEffect(() => {
    if (!roomCode) {
      setRoomData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const roomRef = doc(db, 'rooms', roomCode);

    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setRoomData(data);
          setError(null);
        } else {
          setRoomData(null);
          setError('ไม่พบห้องนี้หรือห้องถูกลบไปแล้ว');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  /**
   * Create a new room in Cloud Firestore
   */
  const createRoom = useCallback(async ({ playerName, roomName, avatarId, avatar, mode, rounds }) => {
    try {
      setLoading(true);
      setError(null);

      const user = await ensureAnonymousAuth();
      setCurrentUser(user);

      const newRoomCode = generateRoomCode();
      const selectedAvatar = avatar || avatarId || '1';

      const creatorPlayer = {
        id: user.uid,
        name: playerName || 'Host',
        avatar: selectedAvatar,
        avatarId: selectedAvatar,
        isHost: true,
        isReady: true,
        score: 0,
      };

      const initialDeck = generateDeck();

      const roomPayload = {
        roomCode: newRoomCode,
        hostId: user.uid,
        roomName: roomName || 'Friday Night Party',
        mode: mode || 'CLASSIC',
        rounds: Number(rounds) || 5,
        status: 'waiting',
        players: [creatorPlayer],
        gameState: {
          gameType: 'SPIN', // 'SPIN', 'CARD', 'NEVER', 'BOMB'
          currentTurn: 0,
          spinResult: null,
          boardState: {},
          selectedPlayerId: null,
          selectedPlayer: null,
          gameStatus: 'LOBBY',
          currentRound: 0,
          scores: {},
          // Card Game state
          cardRules: DEFAULT_CARD_RULES,
          remainingDeck: initialDeck,
          currentCard: null,
          drawnHistory: [],
          currentTurnPlayerId: user.uid,
          // Never Have I Ever state
          currentAskerId: null,
          currentQuestion: '',
          votes: {},
          roundStatus: 'SELECTING_ASKER',
          // Bomb Roulette state
          currentHolderId: null,
          explodeAt: null,
          durationSec: 20,
          showTimerVisible: true,
          isExploded: false,
          loserId: null,
          bombStatus: 'READY'
        },
        createdAt: serverTimestamp()
      };

      const roomRef = doc(db, 'rooms', newRoomCode);
      await setDoc(roomRef, roomPayload);

      setRoomCode(newRoomCode);
      sessionStorage.setItem('spinnight_room_code', newRoomCode);
      sessionStorage.setItem('spinnight_player_id', user.uid);

      return newRoomCode;
    } catch (err) {
      console.error('Error in createRoom:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Join an existing room using roomCode
   */
  const joinRoom = useCallback(async (code, playerName, avatarId, avatar) => {
    try {
      setLoading(true);
      setError(null);

      const normalizedCode = code.trim().toUpperCase();
      const user = await ensureAnonymousAuth();
      setCurrentUser(user);

      const roomRef = doc(db, 'rooms', normalizedCode);
      const snap = await getDoc(roomRef);

      if (!snap.exists()) {
        throw new Error('ไม่พบห้องที่มีรหัสนี้ (ROOM NOT FOUND)');
      }

      const data = snap.data();

      if (data.status === 'playing' || data.status === 'finished') {
        throw new Error('เกมในห้องนี้เริ่มไปแล้วหรือจบลงแล้ว (GAME ALREADY STARTED)');
      }

      if (data.players && data.players.length >= 12) {
        throw new Error('ห้องนี้มีผู้เล่นเต็มแล้ว (ROOM FULL)');
      }

      const selectedAvatar = avatar || avatarId || '1';
      const existingPlayerIndex = (data.players || []).findIndex(p => p.id === user.uid);

      let updatedPlayers = [...(data.players || [])];

      if (existingPlayerIndex >= 0) {
        updatedPlayers[existingPlayerIndex] = {
          ...updatedPlayers[existingPlayerIndex],
          name: playerName || updatedPlayers[existingPlayerIndex].name,
          avatar: selectedAvatar,
          avatarId: selectedAvatar
        };
      } else {
        const newPlayer = {
          id: user.uid,
          name: playerName || `Player ${updatedPlayers.length + 1}`,
          avatar: selectedAvatar,
          avatarId: selectedAvatar,
          isHost: false,
          isReady: false,
          score: 0,
        };
        updatedPlayers.push(newPlayer);
      }

      await updateDoc(roomRef, {
        players: updatedPlayers
      });

      setRoomCode(normalizedCode);
      sessionStorage.setItem('spinnight_room_code', normalizedCode);
      sessionStorage.setItem('spinnight_player_id', user.uid);

      return normalizedCode;
    } catch (err) {
      console.error('Error in joinRoom:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update game state in Firestore
   */
  const updateGameState = useCallback(async (gameStateUpdates) => {
    if (!roomCode) return;
    try {
      const roomRef = doc(db, 'rooms', roomCode);
      const updatePayload = {};

      if (gameStateUpdates.status) {
        updatePayload.status = gameStateUpdates.status;
      }
      if (gameStateUpdates.players) {
        updatePayload.players = gameStateUpdates.players;
      }

      for (const [key, value] of Object.entries(gameStateUpdates)) {
        if (key !== 'status' && key !== 'players') {
          updatePayload[`gameState.${key}`] = value;
        }
      }

      await updateDoc(roomRef, updatePayload);
    } catch (err) {
      console.error('Error updating game state:', err);
      setError(err.message);
    }
  }, [roomCode]);

  /**
   * Return all players in room back to Lobby to select a new game
   */
  const backToLobby = useCallback(async () => {
    if (!roomCode || !roomData) return;
    const currentUid = currentUser?.uid || sessionStorage.getItem('spinnight_player_id');
    const isHost = roomData.hostId === currentUid || (roomData.players || []).find(p => p.id === currentUid)?.isHost;
    if (!isHost) {
      console.warn("Unauthorized: Only Host can return to lobby");
      throw new Error("เฉพาะ Host เท่านั้นที่มีสิทธิ์กลับหน้า Lobby / เปลี่ยนเกม");
    }
    try {
      const roomRef = doc(db, 'rooms', roomCode);
      await updateDoc(roomRef, {
        status: 'waiting',
        'gameState.gameStatus': 'LOBBY',
        'gameState.bombStatus': 'READY',
        'gameState.roundStatus': 'SELECTING_ASKER'
      });
    } catch (err) {
      console.error('Error going back to lobby:', err);
    }
  }, [roomCode, roomData, currentUser]);

  /**
   * Change Game Type (SPIN, CARD, NEVER, BOMB) in Firestore
   */
  const setGameType = useCallback(async (gameType) => {
    if (!roomCode || !roomData) return;
    const currentUid = currentUser?.uid || sessionStorage.getItem('spinnight_player_id');
    const isHost = roomData.hostId === currentUid || (roomData.players || []).find(p => p.id === currentUid)?.isHost;
    if (!isHost) {
      console.warn("Unauthorized: Only Host can change game type");
      throw new Error("เฉพาะ Host เท่านั้นที่มีสิทธิ์เปลี่ยนเกมได้");
    }
    try {
      const roomRef = doc(db, 'rooms', roomCode);
      const playersList = roomData.players || [];
      const randomIndex = playersList.length > 0 
        ? Math.floor(Math.random() * playersList.length) 
        : -1;
      const initialTurnPlayerId = randomIndex >= 0 ? playersList[randomIndex].id : null;

      const updates = {
        'gameState.gameType': gameType,
        'gameState.currentTurnPlayerId': initialTurnPlayerId
      };

      if (gameType === 'CARD') {
        updates['gameState.remainingDeck'] = generateDeck();
        updates['gameState.currentCard'] = null;
        updates['gameState.drawnHistory'] = [];
      }

      await updateDoc(roomRef, updates);
    } catch (err) {
      console.error('Error setting game type:', err);
    }
  }, [roomCode, roomData, currentUser]);

  /**
   * Update Card Rules in Firestore
   */
  const updateCardRules = useCallback(async (newRules) => {
    if (!roomCode || !roomData) return;
    const currentUid = currentUser?.uid || sessionStorage.getItem('spinnight_player_id');
    const isHost = roomData.hostId === currentUid || (roomData.players || []).find(p => p.id === currentUid)?.isHost;
    if (!isHost) {
      console.warn("Unauthorized: Only Host can update card rules");
      throw new Error("เฉพาะ Host เท่านั้นที่มีสิทธิ์แก้ไขกฎของไพ่");
    }
    try {
      const roomRef = doc(db, 'rooms', roomCode);
      await updateDoc(roomRef, {
        'gameState.cardRules': newRules
      });
    } catch (err) {
      console.error('Error updating card rules:', err);
    }
  }, [roomCode, roomData, currentUser]);

  /**
   * Card Game: Turn-based Draw Card function with strict turn authorization and circular index order
   */
  const drawCard = useCallback(async () => {
    if (!roomCode || !roomData) return;
    const gs = roomData.gameState || {};
    const playersList = roomData.players || [];
    if (playersList.length === 0) return;

    const currentUid = currentUser?.uid || sessionStorage.getItem('spinnight_player_id');
    const currentTurnId = gs.currentTurnPlayerId || playersList[0].id;

    // Check turn authorization: only currentTurnPlayerId can draw
    if (currentUid && currentTurnId && currentUid !== currentTurnId) {
      console.warn("Not your turn to draw cards!");
      return;
    }

    let deck = gs.remainingDeck || [];
    if (deck.length === 0) {
      deck = generateDeck();
    }
    if (deck.length === 0) return;

    const drawnCard = deck[0];
    const newRemainingDeck = deck.slice(1);
    const history = gs.drawnHistory || [];

    // Circular Index Order: nextIndex = (currentIndex + 1) % players.length
    const currentIndex = playersList.findIndex(p => p.id === currentTurnId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % playersList.length : 0;
    const nextTurnPlayer = playersList[nextIndex];

    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      'gameState.remainingDeck': newRemainingDeck,
      'gameState.currentCard': drawnCard,
      'gameState.drawnHistory': [...history, drawnCard],
      'gameState.currentTurnPlayerId': nextTurnPlayer ? nextTurnPlayer.id : null
    });
  }, [roomCode, roomData, currentUser]);

  /**
   * Reshuffle & reset deck in Firestore and randomly select starting player
   */
  const resetDeck = useCallback(async () => {
    if (!roomCode || !roomData) return;
    const playersList = roomData.players || [];
    const randomIndex = playersList.length > 0 
      ? Math.floor(Math.random() * playersList.length)
      : -1;
    const randomStarter = randomIndex >= 0 ? playersList[randomIndex] : null;

    const newDeck = generateDeck();
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      'gameState.remainingDeck': newDeck,
      'gameState.currentCard': null,
      'gameState.drawnHistory': [],
      'gameState.currentTurnPlayerId': randomStarter ? randomStarter.id : null
    });
  }, [roomCode, roomData]);

  /**
   * Never Have I Ever: Pick random asker
   */
  const pickAsker = useCallback(async () => {
    if (!roomCode || !roomData) return;
    const playersList = roomData.players || [];
    if (playersList.length === 0) return;

    const randomPlayer = playersList[Math.floor(Math.random() * playersList.length)];
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      'gameState.currentAskerId': randomPlayer.id,
      'gameState.currentQuestion': '',
      'gameState.votes': {},
      'gameState.roundStatus': 'TYPING'
    });
  }, [roomCode, roomData]);

  /**
   * Never Have I Ever: Submit Question
   */
  const submitQuestion = useCallback(async (questionText) => {
    if (!roomCode) return;
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      'gameState.currentQuestion': questionText,
      'gameState.votes': {},
      'gameState.roundStatus': 'VOTING'
    });
  }, [roomCode]);

  /**
   * Never Have I Ever: Submit Vote (EVER or NEVER)
   */
  const submitVote = useCallback(async (voteChoice) => {
    const currentUid = currentUser?.uid || sessionStorage.getItem('spinnight_player_id');
    if (!roomCode || !roomData || !currentUid) return;

    const gs = roomData.gameState || {};
    const existingVotes = gs.votes || {};
    const updatedVotes = {
      ...existingVotes,
      [currentUid]: voteChoice
    };

    const playersList = roomData.players || [];
    const allVoted = Object.keys(updatedVotes).length >= playersList.length;

    const roomRef = doc(db, 'rooms', roomCode);
    const updates = {
      'gameState.votes': updatedVotes
    };

    if (allVoted) {
      updates['gameState.roundStatus'] = 'REVEAL';
    }

    await updateDoc(roomRef, updates);
  }, [roomCode, roomData, currentUser]);

  /**
   * Never Have I Ever: Reveal Results manually
   */
  const revealResults = useCallback(async () => {
    if (!roomCode) return;
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      'gameState.roundStatus': 'REVEAL'
    });
  }, [roomCode]);

  /**
   * Bomb Roulette: Start Bomb Game with secret timer
   */
  const startBombGame = useCallback(async () => {
    if (!roomCode || !roomData) return;
    const playersList = roomData.players || [];
    if (playersList.length === 0) return;

    const secretDurationSec = Math.floor(Math.random() * (35 - 15 + 1)) + 15;
    const explodeAt = Date.now() + secretDurationSec * 1000;

    const initialHolder = playersList[Math.floor(Math.random() * playersList.length)];

    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      'gameState.explodeAt': explodeAt,
      'gameState.durationSec': secretDurationSec,
      'gameState.currentHolderId': initialHolder.id,
      'gameState.isExploded': false,
      'gameState.loserId': null,
      'gameState.bombStatus': 'ACTIVE'
    });
  }, [roomCode, roomData]);

  /**
   * Bomb Roulette: Toggle Timer Visibility (Host choice)
   */
  const toggleBombTimerVisibility = useCallback(async (visible) => {
    if (!roomCode) return;
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      'gameState.showTimerVisible': visible
    });
  }, [roomCode]);

  /**
   * Bomb Roulette: Pass bomb to next player
   */
  const passBomb = useCallback(async () => {
    if (!roomCode || !roomData) return;
    const gs = roomData.gameState || {};
    if (gs.isExploded) return;

    const playersList = roomData.players || [];
    if (playersList.length === 0) return;

    const currentHolderId = gs.currentHolderId;
    const currentIndex = playersList.findIndex(p => p.id === currentHolderId);
    const nextIndex = (currentIndex + 1) % playersList.length;
    const nextHolder = playersList[nextIndex];

    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      'gameState.currentHolderId': nextHolder.id
    });
  }, [roomCode, roomData]);

  /**
   * Bomb Roulette: Trigger explosion when secret timer expires
   */
  const triggerExplosion = useCallback(async (loserUid) => {
    if (!roomCode || !roomData) return;
    const gs = roomData.gameState || {};
    if (gs.isExploded) return;

    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      'gameState.isExploded': true,
      'gameState.loserId': loserUid || gs.currentHolderId,
      'gameState.bombStatus': 'EXPLODED'
    });
  }, [roomCode, roomData]);

  /**
   * Leave the current room
   */
  const leaveRoom = useCallback(async () => {
    const currentUid = currentUser?.uid || sessionStorage.getItem('spinnight_player_id');
    if (!roomCode || !currentUid) {
      setRoomCode(null);
      sessionStorage.removeItem('spinnight_room_code');
      return;
    }

    try {
      const roomRef = doc(db, 'rooms', roomCode);
      const snap = await getDoc(roomRef);

      if (snap.exists()) {
        const data = snap.data();
        const updatedPlayers = (data.players || []).filter(p => p.id !== currentUid);

        if (updatedPlayers.length === 0) {
          await deleteDoc(roomRef);
        } else {
          let hostId = data.hostId;
          if (data.hostId === currentUid) {
            hostId = updatedPlayers[0].id;
            updatedPlayers[0].isHost = true;
          }
          await updateDoc(roomRef, {
            players: updatedPlayers,
            hostId: hostId
          });
        }
      }
    } catch (err) {
      console.error('Error in leaveRoom:', err);
    } finally {
      setRoomCode(null);
      setRoomData(null);
      sessionStorage.removeItem('spinnight_room_code');
    }
  }, [roomCode, currentUser]);

  /**
   * Toggle ready status for a player
   */
  const toggleReady = useCallback(async (targetPlayerId) => {
    if (!roomCode || !roomData) return;
    const pid = targetPlayerId || currentUser?.uid || sessionStorage.getItem('spinnight_player_id');
    const updatedPlayers = (roomData.players || []).map(p =>
      p.id === pid ? { ...p, isReady: !p.isReady } : p
    );
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, { players: updatedPlayers });
  }, [roomCode, roomData, currentUser]);

  /**
   * Host starts the game
   */
  const startGame = useCallback(async () => {
    if (!roomCode || !roomData) return;
    const currentUid = currentUser?.uid || sessionStorage.getItem('spinnight_player_id');
    const isHost = roomData.hostId === currentUid || (roomData.players || []).find(p => p.id === currentUid)?.isHost;
    if (!isHost) {
      console.warn("Unauthorized: Only Host can start the game");
      throw new Error("เฉพาะ Host เท่านั้นที่มีสิทธิ์เริ่มเกมได้");
    }
    const playersList = roomData.players || [];
    const randomIndex = playersList.length > 0 
      ? Math.floor(Math.random() * playersList.length) 
      : -1;
    const randomStarter = randomIndex >= 0 ? playersList[randomIndex] : null;

    const roomRef = doc(db, 'rooms', roomCode);
    const updates = {
      status: 'playing',
      'gameState.gameStatus': 'LOBBY',
      'gameState.currentRound': 1,
      'gameState.currentTurnPlayerId': randomStarter ? randomStarter.id : null
    };

    if (roomData.gameState?.gameType === 'CARD') {
      updates['gameState.remainingDeck'] = generateDeck();
      updates['gameState.currentCard'] = null;
      updates['gameState.drawnHistory'] = [];
      if (randomStarter) {
        updates['gameState.currentTurnPlayerId'] = randomStarter.id;
      }
    }

    await updateDoc(roomRef, updates);
  }, [roomCode, roomData, currentUser]);

  return {
    roomCode,
    roomData,
    currentUser,
    loading,
    error,
    createRoom,
    joinRoom,
    updateGameState,
    setGameType,
    updateCardRules,
    drawCard,
    resetDeck,
    pickAsker,
    submitQuestion,
    submitVote,
    revealResults,
    startBombGame,
    toggleBombTimerVisibility,
    passBomb,
    triggerExplosion,
    backToLobby,
    leaveRoom,
    toggleReady,
    startGame,
    setRoomCode
  };
};

export default useRoom;
