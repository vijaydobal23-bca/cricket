import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  POPPING_CREASE_Z,
  TEAMS,
  DELIVERY_TYPES,
  createInitialMatchState
} from './constants/cricketData';
import { soundEngine } from './utils/audioEngine';
import { useCricketSimulation } from './hooks/useCricketSimulation';

import ViewportCanvas from './components/ViewportCanvas';
import TopBar from './components/TopBar';
import FieldingRadar from './components/FieldingRadar';
import FeedbackBanner from './components/FeedbackBanner';
import GameplayDeck from './components/GameplayDeck';
import Scorebug from './components/Scorebug';

import SetupModal from './components/modals/SetupModal';
import TossModal from './components/modals/TossModal';
import InningsBreakModal from './components/modals/InningsBreakModal';
import ScorecardModal from './components/modals/ScorecardModal';
import HawkEyeModal from './components/modals/HawkEyeModal';
import ControlsModal from './components/modals/ControlsModal';

export default function App() {
  // --- Game Mode & Setup State ---
  const [gameScreen, setGameScreen] = useState('SETUP'); // 'SETUP' | 'TOSS' | 'PLAYING' | 'INNINGS_BREAK' | 'MATCH_OVER'
  const [gameMode, setGameMode] = useState('QUICK_MATCH'); // 'QUICK_MATCH' | 'PRACTICE' | 'SUPER_OVER'
  const [userTeamCode, setUserTeamCode] = useState('IND');
  const [aiTeamCode, setAiTeamCode] = useState('AUS');
  const [totalOvers, setTotalOvers] = useState(2);
  const [userRole, setUserRole] = useState('BATTING'); // 'BATTING' | 'BOWLING'
  const [tossCall, setTossCall] = useState('HEADS');
  const [tossResult, setTossResult] = useState(null);

  // --- Environment & Camera Settings ---
  const [timeOfDay, setTimeOfDay] = useState('DAY'); // 'DAY' | 'SUNSET' | 'NIGHT'
  const [weather, setWeather] = useState('CLEAR'); // 'CLEAR' | 'RAIN'
  const [cameraMode, setCameraMode] = useState('BROADCAST'); // 'BROADCAST' | 'PRO_BATTER' | 'BOWLER' | 'BALL_FOLLOW'
  const [fieldPreset, setFieldPreset] = useState('Balanced');
  const [muted, setMuted] = useState(false);

  // --- Interactive Gameplay Controls State ---
  const [selectedShot, setSelectedShot] = useState('GROUND'); // 'DEFENSIVE' | 'GROUND' | 'LOFTED' | 'SWEEP'
  const [shotAimAngle, setShotAimAngle] = useState(0); // radians
  const [selectedDelivery, setSelectedDelivery] = useState(DELIVERY_TYPES[0]);
  const [pitchTarget, setPitchTarget] = useState({ x: -0.12, z: 3.6 });
  const [bowlingMeter, setBowlingMeter] = useState({ active: false, value: 50, dir: 1 });

  // --- Live Match Scoreboard State ---
  const [matchState, setMatchState] = useState(() => createInitialMatchState('IND', 'AUS', 2, true));
  const [ballPhase, setBallPhase] = useState('READY'); // 'READY' | 'RUNUP' | 'IN_FLIGHT' | 'IN_PLAY' | 'DEAD_BALL'
  const [feedbackBanner, setFeedbackBanner] = useState({
    title: 'READY TO PLAY',
    subtitle: 'Aim your shot and time the release as the bowler approaches!',
    type: 'neutral',
    visible: true
  });
  const [commentary, setCommentary] = useState(
    'Welcome to the Grand International Cricket Stadium! Players are taking their positions on the field.'
  );
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [showHawkEyeModal, setShowHawkEyeModal] = useState(false);
  const [showControlsHelp, setShowControlsHelp] = useState(false);
  const [lastHawkEyeData, setLastHawkEyeData] = useState(null);
  const [radarState, setRadarState] = useState({
    ball: { x: 0, z: -10.06 },
    fielders: [],
    strikerZ: 8.84,
    nonStrikerZ: -8.84,
    isRunning: false
  });

  // --- Mutable Simulation Ref for 60Hz Three.js Loop ---
  const mountRef = useRef(null);
  const simRef = useRef({
    phase: 'READY',
    timeScale: 1.0,
    userRole: 'BATTING',
    shotType: 'GROUND',
    shotAimAngle: 0,
    delivery: DELIVERY_TYPES[0],
    pitchTarget: { x: -0.12, z: 3.6 },
    fieldPreset: 'Balanced',
    cameraMode: 'BROADCAST',
    timeOfDay: 'DAY',
    weather: 'CLEAR',

    // Ball physics state
    ballPos: new THREE.Vector3(0, 2.05, -9.2),
    ballVel: new THREE.Vector3(0, 0, 0),
    ballSpin: 0,
    ballSwing: 0,
    ballBounced: false,
    ballHitBat: false,
    ballBouncePoint: null,
    ballImpactPoint: null,
    ballTrailPoints: [],
    hawkEyePath: [],

    // Batting swing & timing state
    swingTriggered: false,
    swingTimer: 0,
    swingShotType: 'GROUND',
    swingAimAngle: 0,
    contactEvaluated: false,

    // Bowler run-up state
    bowlerZ: -17.5,
    bowlerReleased: false,

    // Running between wickets state
    strikerZ: POPPING_CREASE_Z,
    nonStrikerZ: -POPPING_CREASE_Z,
    targetRunCount: 0,
    completedRunsThisBall: 0,
    isRunning: false,
    isSprinting: false,

    // Fielding state
    activeChaserIdx: -1,
    ballCollected: false,
    throwInFlight: false,
    throwTargetZ: POPPING_CREASE_Z,
    overthrowAwarded: false,
    celebratingTimer: 0,
  });

  // Sync React controls into mutable simRef
  useEffect(() => { simRef.current.userRole = userRole; }, [userRole]);
  useEffect(() => { simRef.current.shotType = selectedShot; }, [selectedShot]);
  useEffect(() => { simRef.current.shotAimAngle = shotAimAngle; }, [shotAimAngle]);
  useEffect(() => { simRef.current.delivery = selectedDelivery; }, [selectedDelivery]);
  useEffect(() => { simRef.current.pitchTarget = pitchTarget; }, [pitchTarget]);
  useEffect(() => { simRef.current.fieldPreset = fieldPreset; }, [fieldPreset]);
  useEffect(() => { simRef.current.cameraMode = cameraMode; }, [cameraMode]);
  useEffect(() => { simRef.current.timeOfDay = timeOfDay; }, [timeOfDay]);
  useEffect(() => { simRef.current.weather = weather; }, [weather]);

  // Start or Reset Match
  const startNewMatch = useCallback((mode, uTeam, aTeam, overs, userBatsFirst) => {
    const isSuperOver = mode === 'SUPER_OVER';
    const actualUserBats = mode === 'PRACTICE' || isSuperOver ? true : userBatsFirst;
    setUserRole(actualUserBats ? 'BATTING' : 'BOWLING');
    const freshState = createInitialMatchState(uTeam, aTeam, overs, actualUserBats, isSuperOver);
    setMatchState(freshState);
    setGameScreen('PLAYING');
    setBallPhase('READY');
    simRef.current.phase = 'READY';
    setFeedbackBanner({
      title: isSuperOver ? 'SUPER OVER CHASE: 16 NEEDED OFF 6 BALLS!' : 'PLAY BALL!',
      subtitle: actualUserBats
        ? 'You are Batting! Aim with A/D or Mouse, and press Space / Click to play your shot.'
        : 'You are Bowling! Position the pitch target and click Bowl Delivery.',
      type: 'info',
      visible: true
    });
    setCommentary(
      isSuperOver
        ? 'High-pressure Super Over! 16 runs needed off 6 balls to win the trophy!'
        : `${TEAMS[freshState.battingTeamCode].name} open the batting against ${TEAMS[freshState.bowlingTeamCode].name}.`
    );
  }, []);

  // 3D Stadium & 60Hz Physics Simulation Hook
  const {
    triggerBatSwingRef,
    startDeliveryRef,
    triggerRunRef,
    cancelRunRef
  } = useCricketSimulation({
    mountRef,
    simRef,
    userTeamCode,
    aiTeamCode,
    gameMode,
    setBallPhase,
    setFeedbackBanner,
    setCommentary,
    setLastHawkEyeData,
    setRadarState,
    setMatchState,
    setGameScreen,
    setSelectedDelivery,
    setPitchTarget
  });

  // Bowling Power/Accuracy Meter Oscillator
  useEffect(() => {
    if (!bowlingMeter.active) return;
    const interval = setInterval(() => {
      setBowlingMeter((prev) => {
        let nextVal = prev.value + prev.dir * 4.5;
        let nextDir = prev.dir;
        if (nextVal >= 100) {
          nextVal = 100;
          nextDir = -1;
        } else if (nextVal <= 0) {
          nextVal = 0;
          nextDir = 1;
        }
        return { ...prev, value: nextVal, dir: nextDir };
      });
    }, 22);
    return () => clearInterval(interval);
  }, [bowlingMeter.active]);

  const handleBowlButtonPress = useCallback(() => {
    if (ballPhase !== 'READY') return;
    if (userRole === 'BATTING') {
      startDeliveryRef.current(1.0, false);
    } else {
      if (!bowlingMeter.active) {
        setBowlingMeter({ active: true, value: 20, dir: 1 });
      } else {
        // Lock meter: 75..92 is sweet spot, >95 is Overstep No-Ball
        const val = bowlingMeter.value;
        setBowlingMeter({ active: false, value: val, dir: 1 });
        const isNoBall = val > 95;
        const distFromSweet = Math.abs(val - 84);
        const accuracy = Math.max(0.25, 1 - distFromSweet / 75);
        startDeliveryRef.current(accuracy, isNoBall);
      }
    }
  }, [ballPhase, userRole, bowlingMeter, startDeliveryRef]);

  // Desktop Keyboard Controls
  useEffect(() => {
    const onKeyDown = (e) => {
      if (gameScreen !== 'PLAYING') return;
      const key = e.key.toLowerCase();

      if (userRole === 'BATTING') {
        if (key === 'a' || e.key === 'ArrowLeft') {
          setShotAimAngle((prev) => Math.max(-Math.PI * 0.85, prev - 0.16));
        } else if (key === 'd' || e.key === 'ArrowRight') {
          setShotAimAngle((prev) => Math.min(Math.PI * 0.85, prev + 0.16));
        } else if (key === 's') {
          setSelectedShot('DEFENSIVE');
          if (simRef.current.phase === 'IN_FLIGHT' || simRef.current.phase === 'RUNUP') {
            triggerBatSwingRef.current('DEFENSIVE');
          }
        } else if (key === 'w') {
          setSelectedShot('GROUND');
          if (simRef.current.phase === 'IN_FLIGHT' || simRef.current.phase === 'RUNUP') {
            triggerBatSwingRef.current('GROUND');
          }
        } else if (key === 'e') {
          setSelectedShot('LOFTED');
          if (simRef.current.phase === 'IN_FLIGHT' || simRef.current.phase === 'RUNUP') {
            triggerBatSwingRef.current('LOFTED');
          }
        } else if (key === 'q') {
          setSelectedShot('SWEEP');
          if (simRef.current.phase === 'IN_FLIGHT' || simRef.current.phase === 'RUNUP') {
            triggerBatSwingRef.current('SWEEP');
          }
        } else if (e.code === 'Space') {
          e.preventDefault();
          if (simRef.current.phase === 'READY') {
            startDeliveryRef.current(1.0, false);
          } else if (simRef.current.phase === 'RUNUP' || simRef.current.phase === 'IN_FLIGHT') {
            triggerBatSwingRef.current();
          } else if (simRef.current.phase === 'IN_PLAY') {
            triggerRunRef.current();
          }
        } else if (e.key === 'ArrowUp') {
          if (simRef.current.phase === 'IN_PLAY') triggerRunRef.current();
        } else if (e.key === 'ArrowDown') {
          if (simRef.current.phase === 'IN_PLAY') cancelRunRef.current();
        } else if (e.key === 'Shift') {
          simRef.current.isSprinting = true;
        }
      } else {
        // Bowling target movement with WASD / Arrows
        if (key === 'a' || e.key === 'ArrowLeft') {
          setPitchTarget((p) => ({ ...p, x: Math.max(-0.85, p.x - 0.08) }));
        } else if (key === 'd' || e.key === 'ArrowRight') {
          setPitchTarget((p) => ({ ...p, x: Math.min(0.85, p.x + 0.08) }));
        } else if (key === 'w' || e.key === 'ArrowUp') {
          setPitchTarget((p) => ({ ...p, z: Math.max(-2.5, p.z - 0.45) }));
        } else if (key === 's' || e.key === 'ArrowDown') {
          setPitchTarget((p) => ({ ...p, z: Math.min(8.6, p.z + 0.45) }));
        } else if (e.code === 'Space') {
          e.preventDefault();
          handleBowlButtonPress();
        }
      }

      if (key === 'c') {
        const modes = ['BROADCAST', 'PRO_BATTER', 'BOWLER', 'BALL_FOLLOW'];
        setCameraMode((prev) => modes[(modes.indexOf(prev) + 1) % modes.length]);
      }
    };

    const onKeyUp = (e) => {
      if (e.key === 'Shift') simRef.current.isSprinting = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameScreen, userRole, handleBowlButtonPress, triggerBatSwingRef, startDeliveryRef, triggerRunRef, cancelRunRef]);

  // --- Computed Broadcast Stats ---
  const batTeam = TEAMS[matchState.battingTeamCode];
  const bowlTeam = TEAMS[matchState.bowlingTeamCode];
  const striker = matchState.battingCard[matchState.strikerIdx] || matchState.battingCard[0];
  const nonStriker = matchState.battingCard[matchState.nonStrikerIdx] || matchState.battingCard[1];
  const bowler = matchState.bowlingCard[matchState.currentBowlerIdx] || matchState.bowlingCard[9];

  const oversFormatted = `${Math.floor(matchState.legalBalls / 6)}.${matchState.legalBalls % 6}`;
  const crr = matchState.legalBalls > 0 ? ((matchState.score / matchState.legalBalls) * 6).toFixed(2) : '0.00';
  const ballsRemaining = Math.max(0, matchState.totalOvers * 6 - matchState.legalBalls);
  const runsNeeded = matchState.target ? Math.max(0, matchState.target - matchState.score) : null;
  const rrr = runsNeeded !== null && ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : null;

  const toggleMute = () => {
    soundEngine.muted = !muted;
    setMuted(!muted);
  };

  // Handle Second Innings Transition
  const startSecondInnings = () => {
    const newRole = userRole === 'BATTING' ? 'BOWLING' : 'BATTING';
    setUserRole(newRole);
    setMatchState((prev) => {
      const nextBatCode = prev.bowlingTeamCode;
      const nextState = createInitialMatchState(
        userTeamCode,
        aiTeamCode,
        prev.totalOvers,
        nextBatCode === userTeamCode
      );
      nextState.innings = 2;
      nextState.firstInningsScore = prev.score;
      nextState.target = prev.score + 1;
      return nextState;
    });
    setGameScreen('PLAYING');
    setBallPhase('READY');
    simRef.current.phase = 'READY';
    setFeedbackBanner({
      title: `2ND INNINGS • TARGET: ${matchState.score + 1} RUNS`,
      subtitle: newRole === 'BATTING' ? 'Chase down the target to win!' : 'Defend your total and take wickets!',
      type: 'info',
      visible: true
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans select-none text-white">
      {/* 3D WebGL Viewport */}
      <ViewportCanvas
        mountRef={mountRef}
        onClick={() => {
          if (gameScreen !== 'PLAYING') return;
          if (userRole === 'BATTING' && (ballPhase === 'RUNUP' || ballPhase === 'IN_FLIGHT')) {
            triggerBatSwingRef.current();
          }
        }}
      />

      {/* Top Stadium Bar & Controls */}
      <TopBar
        gameMode={gameMode}
        matchState={matchState}
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
        fieldPreset={fieldPreset}
        setFieldPreset={setFieldPreset}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        weather={weather}
        setWeather={setWeather}
        setShowScorecardModal={setShowScorecardModal}
        setShowHawkEyeModal={setShowHawkEyeModal}
        setShowControlsHelp={setShowControlsHelp}
        toggleMute={toggleMute}
        muted={muted}
        setGameScreen={setGameScreen}
      />

      {/* Top-Right 2D Minimap & Aim Cone */}
      <FieldingRadar
        gameScreen={gameScreen}
        fieldPreset={fieldPreset}
        userRole={userRole}
        shotAimAngle={shotAimAngle}
        radarState={radarState}
      />

      {/* Toast Feedback Banner */}
      <FeedbackBanner
        gameScreen={gameScreen}
        feedbackBanner={feedbackBanner}
      />

      {/* Batting / Bowling Gameplay Deck */}
      <GameplayDeck
        gameScreen={gameScreen}
        userRole={userRole}
        selectedShot={selectedShot}
        setSelectedShot={setSelectedShot}
        shotAimAngle={shotAimAngle}
        setShotAimAngle={setShotAimAngle}
        selectedDelivery={selectedDelivery}
        setSelectedDelivery={setSelectedDelivery}
        setPitchTarget={setPitchTarget}
        bowlingMeter={bowlingMeter}
        ballPhase={ballPhase}
        handleBowlButtonPress={handleBowlButtonPress}
        onSwingBat={() => triggerBatSwingRef.current()}
        onCallRun={() => triggerRunRef.current()}
        onCancelRun={() => cancelRunRef.current()}
      />

      {/* Bottom TV Broadcast Scorebug */}
      <Scorebug
        gameScreen={gameScreen}
        batTeam={batTeam}
        matchState={matchState}
        oversFormatted={oversFormatted}
        crr={crr}
        rrr={rrr}
        runsNeeded={runsNeeded}
        ballsRemaining={ballsRemaining}
        striker={striker}
        nonStriker={nonStriker}
        bowler={bowler}
        commentary={commentary}
      />

      {/* Modals */}
      <SetupModal
        gameScreen={gameScreen}
        gameMode={gameMode}
        setGameMode={setGameMode}
        userTeamCode={userTeamCode}
        setUserTeamCode={setUserTeamCode}
        aiTeamCode={aiTeamCode}
        setAiTeamCode={setAiTeamCode}
        totalOvers={totalOvers}
        setTotalOvers={setTotalOvers}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        setTossResult={setTossResult}
        setGameScreen={setGameScreen}
        startNewMatch={startNewMatch}
      />

      <TossModal
        gameScreen={gameScreen}
        userTeamCode={userTeamCode}
        aiTeamCode={aiTeamCode}
        totalOvers={totalOvers}
        tossCall={tossCall}
        setTossCall={setTossCall}
        tossResult={tossResult}
        setTossResult={setTossResult}
        startNewMatch={startNewMatch}
      />

      <InningsBreakModal
        gameScreen={gameScreen}
        batTeam={batTeam}
        matchState={matchState}
        oversFormatted={oversFormatted}
        startSecondInnings={startSecondInnings}
        setShowScorecardModal={setShowScorecardModal}
        setGameScreen={setGameScreen}
      />

      <ScorecardModal
        showScorecardModal={showScorecardModal}
        setShowScorecardModal={setShowScorecardModal}
        batTeam={batTeam}
        bowlTeam={bowlTeam}
        matchState={matchState}
        oversFormatted={oversFormatted}
      />

      <HawkEyeModal
        showHawkEyeModal={showHawkEyeModal}
        setShowHawkEyeModal={setShowHawkEyeModal}
        lastHawkEyeData={lastHawkEyeData}
      />

      <ControlsModal
        showControlsHelp={showControlsHelp}
        setShowControlsHelp={setShowControlsHelp}
      />
    </div>
  );
}