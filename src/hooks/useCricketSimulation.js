import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  POPPING_CREASE_Z, STUMP_Z, BOUNDARY_RADIUS, CIRCLE_RADIUS,
  TEAMS, FIELD_PRESETS, DELIVERY_TYPES, SHOT_TYPES
} from '../constants/cricketData';
import { soundEngine } from '../utils/audioEngine';
import {
  createGrassTexture, createPitchTexture, createCricketerModel,
  createWicketSet, resetWicketSet, shatterWicketSet
} from '../game3d/builders';

// ============================================================================
// THREE.JS 3D STADIUM, PLAYERS & 60HZ PHYSICS SIMULATION HOOK
// ============================================================================

export function useCricketSimulation({
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
  setPitchTarget,
}) {
  const triggerBatSwingRef = useRef(() => {});
  const startDeliveryRef = useRef(() => {});
  const triggerRunRef = useRef(() => {});
  const cancelRunRef = useRef(() => {});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE, CAMERA, RENDERER ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x68b5e8);
    scene.fog = new THREE.FogExp2(0x88c9f2, 0.0028);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 450);
    camera.position.set(0, 8.8, -26.5);
    camera.lookAt(0, 1.0, 6.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- 2. LIGHTING & FLOODLIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    sunLight.position.set(45, 75, 35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 180;
    const d = 55;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // --- 3. STADIUM ARCHITECTURE, OUTFIELD & PITCH ---
    const grassTex = createGrassTexture();
    const outfieldGeo = new THREE.CircleGeometry(BOUNDARY_RADIUS + 14, 72);
    outfieldGeo.rotateX(-Math.PI / 2);
    const outfieldMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.85 });
    const outfield = new THREE.Mesh(outfieldGeo, outfieldMat);
    outfield.receiveShadow = true;
    scene.add(outfield);

    // 30-Yard Inner Circle (Dashed White Ring)
    const innerCircleGeo = new THREE.RingGeometry(CIRCLE_RADIUS - 0.18, CIRCLE_RADIUS + 0.18, 64);
    innerCircleGeo.rotateX(-Math.PI / 2);
    const innerCircleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 });
    const innerCircle = new THREE.Mesh(innerCircleGeo, innerCircleMat);
    innerCircle.position.y = 0.015;
    scene.add(innerCircle);

    // Boundary Rope (Glowing White/Cyan Cushion Rope at 68m)
    const boundaryGeo = new THREE.TorusGeometry(BOUNDARY_RADIUS, 0.28, 12, 96);
    boundaryGeo.rotateX(Math.PI / 2);
    const boundaryMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      roughness: 0.3
    });
    const boundaryRope = new THREE.Mesh(boundaryGeo, boundaryMat);
    boundaryRope.position.y = 0.25;
    scene.add(boundaryRope);

    // LED Perimeter Advertising Boards
    const adBoardGeo = new THREE.CylinderGeometry(BOUNDARY_RADIUS + 3.2, BOUNDARY_RADIUS + 3.2, 1.25, 64, 1, true);
    const adBoardMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide
    });
    const adBoard = new THREE.Mesh(adBoardGeo, adBoardMat);
    adBoard.position.y = 0.62;
    scene.add(adBoard);

    // Concrete Stadium Bowl & Tiered Grandstands
    const standTier1 = new THREE.Mesh(
      new THREE.CylinderGeometry(BOUNDARY_RADIUS + 24, BOUNDARY_RADIUS + 6, 13, 64, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide, roughness: 0.7 })
    );
    standTier1.position.y = 6.5;
    scene.add(standTier1);

    const standRoof = new THREE.Mesh(
      new THREE.RingGeometry(BOUNDARY_RADIUS + 10, BOUNDARY_RADIUS + 26, 64),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, side: THREE.DoubleSide, roughness: 0.5 })
    );
    standRoof.rotateX(Math.PI / 2);
    standRoof.position.y = 14.5;
    scene.add(standRoof);

    // Sight Screens behind both ends
    [-BOUNDARY_RADIUS - 2, BOUNDARY_RADIUS + 2].forEach((zPos) => {
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(14, 5.5, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
      );
      screen.position.set(0, 2.75, zPos);
      scene.add(screen);
    });

    // 4 Towering Stadium Floodlight Pylons
    const floodlightSpots = [];
    const pylonAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    pylonAngles.forEach((ang) => {
      const px = Math.cos(ang) * (BOUNDARY_RADIUS + 22);
      const pz = Math.sin(ang) * (BOUNDARY_RADIUS + 22);
      const pylonGroup = new THREE.Group();
      pylonGroup.position.set(px, 0, pz);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 1.2, 42, 12),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 })
      );
      pole.position.y = 21;
      pylonGroup.add(pole);

      const headRack = new THREE.Mesh(
        new THREE.BoxGeometry(9, 4.8, 1.2),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xfef9c3,
          emissiveIntensity: 1.5
        })
      );
      headRack.position.y = 42;
      headRack.lookAt(0, 0, 0);
      pylonGroup.add(headRack);

      const spot = new THREE.SpotLight(0xfffbeb, 0.3, 180, Math.PI / 3, 0.5);
      spot.position.set(px, 42, pz);
      scene.add(spot);
      floodlightSpots.push({ spot, headRack });
      scene.add(pylonGroup);
    });

    // Instanced Animated 3D Crowd (1,800 spectators in the stands)
    const crowdCount = 1800;
    const specGeo = new THREE.BoxGeometry(0.55, 0.95, 0.55);
    const specMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const crowdMesh = new THREE.InstancedMesh(specGeo, specMat, crowdCount);
    const dummy = new THREE.Object3D();
    const specColors = [
      new THREE.Color(0x2563eb),
      new THREE.Color(0xfacc15),
      new THREE.Color(0xef4444),
      new THREE.Color(0x10b981),
      new THREE.Color(0xf97316),
      new THREE.Color(0xf8fafc)
    ];
    const crowdBaseData = [];
    for (let i = 0; i < crowdCount; i++) {
      const ang = (i / crowdCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
      // Leave gap for sightscreens at 0 and PI
      if (Math.abs(Math.sin(ang)) < 0.12) {
        dummy.position.set(0, -50, 0);
        dummy.updateMatrix();
        crowdMesh.setMatrixAt(i, dummy.matrix);
        crowdBaseData.push({ x: 0, y: -50, z: 0, phase: 0 });
        continue;
      }
      const row = Math.floor(Math.random() * 10);
      const radius = BOUNDARY_RADIUS + 7.5 + row * 1.65;
      const x = Math.cos(ang) * radius;
      const z = Math.sin(ang) * radius;
      const y = 1.8 + row * 1.15;
      dummy.position.set(x, y, z);
      dummy.lookAt(0, 1, 0);
      dummy.updateMatrix();
      crowdMesh.setMatrixAt(i, dummy.matrix);
      crowdMesh.setColorAt(i, specColors[i % specColors.length]);
      crowdBaseData.push({ x, y, z, phase: Math.random() * Math.PI * 2 });
    }
    crowdMesh.instanceMatrix.needsUpdate = true;
    if (crowdMesh.instanceColor) crowdMesh.instanceColor.needsUpdate = true;
    scene.add(crowdMesh);

    // --- 4. CENTRAL 22-YARD CRICKET PITCH & CREASE MARKINGS ---
    const pitchTex = createPitchTexture();
    const pitchGeo = new THREE.PlaneGeometry(3.05, 22.6);
    pitchGeo.rotateX(-Math.PI / 2);
    const pitchMat = new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.88 });
    const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
    pitchMesh.position.y = 0.02;
    pitchMesh.receiveShadow = true;
    scene.add(pitchMesh);

    // White Crease Lines at both ends
    const creaseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const addCreaseLine = (w, l, x, z) => {
      const g = new THREE.PlaneGeometry(w, l);
      g.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(g, creaseMat);
      m.position.set(x, 0.03, z);
      scene.add(m);
    };
    // Striker End (+Z) and Bowler End (-Z)
    [1, -1].forEach((dir) => {
      // Bowling crease at +/- 10.06m
      addCreaseLine(2.64, 0.05, 0, dir * STUMP_Z);
      // Popping crease at +/- 8.84m
      addCreaseLine(3.05, 0.05, 0, dir * POPPING_CREASE_Z);
      // Return creases
      addCreaseLine(0.05, 2.44, -1.32, dir * (STUMP_Z - 0.02));
      addCreaseLine(0.05, 2.44, 1.32, dir * (STUMP_Z - 0.02));
    });

    // Wicket Sets (Stumps + Bails) at both ends
    const strikerWickets = createWicketSet(STUMP_Z);
    const bowlerWickets = createWicketSet(-STUMP_Z);
    scene.add(strikerWickets);
    scene.add(bowlerWickets);

    // --- 5. PITCH TARGET RING & SHOT AIM DIRECTION CONE ---
    const targetRingGroup = new THREE.Group();
    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.36, 32),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide })
    );
    outerRing.rotateX(-Math.PI / 2);
    const innerDot = new THREE.Mesh(
      new THREE.CircleGeometry(0.11, 24),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide })
    );
    innerDot.rotateX(-Math.PI / 2);
    targetRingGroup.add(outerRing, innerDot);
    targetRingGroup.position.set(-0.12, 0.04, 3.6);
    scene.add(targetRingGroup);

    // Batter Shot Direction Aim Arrow on Turf
    const aimArrowGroup = new THREE.Group();
    aimArrowGroup.position.set(0, 0.05, POPPING_CREASE_Z);
    const aimBeamGeo = new THREE.PlaneGeometry(0.32, 7.5);
    aimBeamGeo.translate(0, 3.75, 0);
    aimBeamGeo.rotateX(-Math.PI / 2);
    const aimBeamMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const aimBeam = new THREE.Mesh(aimBeamGeo, aimBeamMat);
    aimArrowGroup.add(aimBeam);
    scene.add(aimArrowGroup);

    // --- 6. 3D LEATHER CRICKET BALL, SHADOW & RIBBON TRAIL ---
    const ballGroup = new THREE.Group();
    const ballMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 20, 20), // Slightly scaled for crisp broadcast visibility
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.28, metalness: 0.15 })
    );
    ballMesh.castShadow = true;
    const seamMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.0555, 0.004, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    ballGroup.add(ballMesh, seamMesh);
    ballGroup.position.set(0, 2.05, -9.2);
    scene.add(ballGroup);

    // Dynamic Ground Shadow Blob directly under the ball for depth perception
    const ballShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 })
    );
    ballShadow.rotateX(-Math.PI / 2);
    ballShadow.position.y = 0.035;
    scene.add(ballShadow);

    // Ball Flight Trail Line
    const maxTrailPts = 36;
    const trailPositions = new Float32Array(maxTrailPts * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailLine = new THREE.Line(
      trailGeo,
      new THREE.LineBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.75 })
    );
    scene.add(trailLine);

    // Pitch Bounce Dust / Sweet Spot Particle Pool
    const particles = [];
    const particleGeo = new THREE.SphereGeometry(0.06, 8, 8);
    for (let i = 0; i < 24; i++) {
      const pMesh = new THREE.Mesh(
        particleGeo,
        new THREE.MeshBasicMaterial({ color: 0xd6c5a3, transparent: true, opacity: 0 })
      );
      pMesh.visible = false;
      pMesh.userData = { vel: new THREE.Vector3(), life: 0 };
      scene.add(pMesh);
      particles.push(pMesh);
    }

    const spawnParticles = (pos, colorHex = 0xd6c5a3, count = 12, speed = 2.5) => {
      let spawned = 0;
      for (let i = 0; i < particles.length && spawned < count; i++) {
        const p = particles[i];
        if (p.userData.life <= 0) {
          p.visible = true;
          p.position.copy(pos);
          p.material.color.setHex(colorHex);
          p.material.opacity = 0.85;
          p.userData.life = 0.45;
          p.userData.vel.set(
            (Math.random() - 0.5) * speed,
            Math.random() * speed * 0.9 + 0.5,
            (Math.random() - 0.5) * speed
          );
          spawned++;
        }
      }
    };

    // Rain Particles
    const rainCount = 600;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 90;
      rainPos[i * 3 + 1] = Math.random() * 35;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainSystem = new THREE.Points(
      rainGeo,
      new THREE.PointsMaterial({ color: 0xcbd5e1, size: 0.18, transparent: true, opacity: 0.55 })
    );
    rainSystem.visible = false;
    scene.add(rainSystem);

    // --- 7. ARTICULATED 3D PLAYERS (2 BATTERS + 11 FIELDERS + 2 UMPIRES) ---
    const batTeamKit = TEAMS[userTeamCode];
    const bowlTeamKit = TEAMS[aiTeamCode];

    // Striker & Non-Striker
    const strikerModel = createCricketerModel({
      kitColor: batTeamKit.kitColor,
      padColor: batTeamKit.padColor,
      helmetColor: batTeamKit.helmetColor,
      hasBat: true,
      hasPads: true
    });
    strikerModel.position.set(0.28, 0, POPPING_CREASE_Z);
    strikerModel.rotation.y = Math.PI; // Facing -Z toward bowler
    scene.add(strikerModel);

    const nonStrikerModel = createCricketerModel({
      kitColor: batTeamKit.kitColor,
      padColor: batTeamKit.padColor,
      helmetColor: batTeamKit.helmetColor,
      hasBat: true,
      hasPads: true
    });
    nonStrikerModel.position.set(-0.95, 0, -POPPING_CREASE_Z);
    nonStrikerModel.rotation.y = 0; // Facing +Z toward striker
    scene.add(nonStrikerModel);

    // Bowler (#0)
    const bowlerModel = createCricketerModel({
      kitColor: bowlTeamKit.kitColor,
      padColor: bowlTeamKit.padColor,
      helmetColor: bowlTeamKit.helmetColor,
      hasBat: false,
      hasPads: false
    });
    bowlerModel.position.set(0.45, 0, -17.5);
    bowlerModel.rotation.y = 0; // Facing +Z
    scene.add(bowlerModel);

    // Wicketkeeper (#1)
    const keeperModel = createCricketerModel({
      kitColor: bowlTeamKit.kitColor,
      padColor: bowlTeamKit.padColor,
      helmetColor: bowlTeamKit.helmetColor,
      hasBat: false,
      hasPads: true,
      isKeeper: true
    });
    keeperModel.position.set(0, 0, 13.8);
    keeperModel.rotation.y = Math.PI;
    scene.add(keeperModel);

    // 9 Outfielders (#2..#10)
    const outfieldModels = [];
    const presetCoords = FIELD_PRESETS.Balanced;
    for (let i = 0; i < 9; i++) {
      const fm = createCricketerModel({
        kitColor: bowlTeamKit.kitColor,
        padColor: bowlTeamKit.padColor,
        helmetColor: bowlTeamKit.helmetColor,
        hasBat: false,
        hasPads: false
      });
      fm.position.set(presetCoords[i].x, 0, presetCoords[i].z);
      fm.lookAt(0, 0, POPPING_CREASE_Z);
      fm.userData.homeX = presetCoords[i].x;
      fm.userData.homeZ = presetCoords[i].z;
      fm.userData.roleName = presetCoords[i].name;
      scene.add(fm);
      outfieldModels.push(fm);
    }

    // Umpires (Bowler's End & Square Leg)
    const umpire1 = createCricketerModel({ kitColor: 0xe11d48, padColor: 0x0f172a, helmetColor: 0xf8fafc });
    umpire1.position.set(0, 0, -11.4);
    umpire1.rotation.y = 0;
    scene.add(umpire1);

    const umpire2 = createCricketerModel({ kitColor: 0xe11d48, padColor: 0x0f172a, helmetColor: 0xf8fafc });
    umpire2.position.set(17.5, 0, POPPING_CREASE_Z);
    umpire2.lookAt(0, 0, POPPING_CREASE_Z);
    scene.add(umpire2);

    // Helper: Reset positions for next delivery
    const resetPositionsForNextBall = () => {
      const s = simRef.current;
      s.phase = 'READY';
      s.timeScale = 1.0;
      s.bowlerZ = -17.5;
      s.bowlerReleased = false;
      s.ballBounced = false;
      s.ballHitBat = false;
      s.ballBouncePoint = null;
      s.ballImpactPoint = null;
      s.swingTriggered = false;
      s.swingTimer = 0;
      s.contactEvaluated = false;
      s.strikerZ = POPPING_CREASE_Z;
      s.nonStrikerZ = -POPPING_CREASE_Z;
      s.targetRunCount = 0;
      s.completedRunsThisBall = 0;
      s.isRunning = false;
      s.isSprinting = false;
      s.activeChaserIdx = -1;
      s.ballCollected = false;
      s.throwInFlight = false;
      s.overthrowAwarded = false;
      s.ballTrailPoints = [];
      s.hawkEyePath = [];

      s.ballPos.set(0.45, 2.05, -17.5);
      s.ballVel.set(0, 0, 0);
      ballGroup.position.copy(s.ballPos);

      resetWicketSet(strikerWickets);
      resetWicketSet(bowlerWickets);

      const coords = FIELD_PRESETS[s.fieldPreset] || FIELD_PRESETS.Balanced;
      outfieldModels.forEach((fm, idx) => {
        fm.position.set(coords[idx].x, 0, coords[idx].z);
        fm.lookAt(0, 0, POPPING_CREASE_Z);
        fm.userData.homeX = coords[idx].x;
        fm.userData.homeZ = coords[idx].z;
        fm.userData.roleName = coords[idx].name;
      });

      bowlerModel.position.set(0.45, 0, -17.5);
      bowlerModel.rotation.y = 0;
      keeperModel.position.set(0, 0, 13.8);
      keeperModel.rotation.y = Math.PI;
      strikerModel.position.set(0.28, 0, POPPING_CREASE_Z);
      strikerModel.rotation.y = Math.PI;
      nonStrikerModel.position.set(-0.95, 0, -POPPING_CREASE_Z);
      nonStrikerModel.rotation.y = 0;

      setBallPhase('READY');
    };

    // --- 8. GAMEPLAY TRIGGER CALLBACKS ---

    // Start Bowler Run-up
    startDeliveryRef.current = (customAccuracy = 1.0, isNoBallOverstep = false) => {
      const s = simRef.current;
      if (s.phase !== 'READY') return;
      soundEngine.init();
      resetPositionsForNextBall();

      // If AI is bowling, pick smart delivery & pitch target
      if (s.userRole === 'BATTING') {
        const aiDeliv = DELIVERY_TYPES[Math.floor(Math.random() * DELIVERY_TYPES.length)];
        s.delivery = aiDeliv;
        s.pitchTarget = {
          x: (Math.random() - 0.5) * 0.52,
          z: aiDeliv.defaultZ + (Math.random() - 0.5) * 1.4
        };
        setSelectedDelivery(aiDeliv);
        setPitchTarget(s.pitchTarget);
      } else {
        // Apply user bowling accuracy scatter
        const scatter = (1 - customAccuracy) * 0.65;
        s.pitchTarget = {
          x: s.pitchTarget.x + (Math.random() - 0.5) * scatter,
          z: s.pitchTarget.z + (Math.random() - 0.5) * scatter * 2.5
        };
      }

      s.isNoBallDelivery = isNoBallOverstep;
      s.phase = 'RUNUP';
      setBallPhase('RUNUP');
      setFeedbackBanner({
        title: `${s.delivery.name.toUpperCase()} (${s.delivery.speedKph} KM/H)`,
        subtitle: s.userRole === 'BATTING' ? 'Watch the ball onto the bat and press SPACE or CLICK to swing!' : 'Bowler running in...',
        type: 'info',
        visible: true
      });
    };

    // Trigger Batter Shot Swing
    triggerBatSwingRef.current = (overrideShotType) => {
      const s = simRef.current;
      if (s.phase !== 'RUNUP' && s.phase !== 'IN_FLIGHT') return;
      if (s.swingTriggered) return;

      s.swingTriggered = true;
      s.swingTimer = 0;
      s.swingShotType = overrideShotType || s.shotType;
      s.swingAimAngle = s.shotAimAngle;
    };

    // Trigger Running Between Wickets
    triggerRunRef.current = () => {
      const s = simRef.current;
      if (s.phase !== 'IN_PLAY') return;
      if (s.targetRunCount < 4) {
        s.targetRunCount += 1;
        s.isRunning = true;
      }
    };

    cancelRunRef.current = () => {
      const s = simRef.current;
      if (s.phase !== 'IN_PLAY' || !s.isRunning) return;
      if (s.targetRunCount > s.completedRunsThisBall) {
        s.targetRunCount = s.completedRunsThisBall;
      }
    };

    // --- 9. CONCLUDE DELIVERY & UPDATE SCOREBOARD ENGINE ---
    const concludeDelivery = (outcome) => {
      const s = simRef.current;
      if (s.phase === 'DEAD_BALL') return;
      s.phase = 'DEAD_BALL';
      setBallPhase('DEAD_BALL');

      // Store Hawk-Eye Ball Tracker data if available
      if (s.hawkEyePath.length > 2) {
        setLastHawkEyeData({
          path: [...s.hawkEyePath],
          pitchPoint: s.ballBouncePoint ? { x: s.ballBouncePoint.x, z: s.ballBouncePoint.z } : { x: 0, z: 4.0 },
          impactPoint: s.ballImpactPoint ? { x: s.ballImpactPoint.x, y: s.ballImpactPoint.y, z: s.ballImpactPoint.z } : { x: 0, y: 0.45, z: 8.8 },
          deliveryName: s.delivery.name,
          speedKph: s.delivery.speedKph,
          outcomeTitle: outcome.title,
          isLBW: outcome.wicketType === 'LBW'
        });
      }

      if (outcome.runs >= 4 || outcome.isWicket) {
        s.celebratingTimer = 2.8;
        soundEngine.playCrowdCheer(outcome.runs === 6 || outcome.isWicket ? 1.2 : 0.9, 2.6);
      }

      setFeedbackBanner({
        title: outcome.title,
        subtitle: outcome.subtitle,
        type: outcome.isWicket ? 'wicket' : outcome.runs >= 4 ? 'boundary' : 'info',
        visible: true
      });
      setCommentary(outcome.commentary);

      // Update Match Scoreboard State
      setMatchState((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        const striker = next.battingCard[next.strikerIdx];
        const bowler = next.bowlingCard[next.currentBowlerIdx];

        const isWide = outcome.extraType === 'WIDE';
        const isNoBall = outcome.extraType === 'NOBALL' || s.isNoBallDelivery;
        const isLegal = !isWide && !isNoBall;

        // Free hit immunity check (only Run Out allowed on Free Hit)
        let actualWicket = outcome.isWicket;
        if (actualWicket && (next.freeHit || isNoBall) && outcome.wicketType !== 'RUN OUT') {
          actualWicket = false;
        }

        const totalRunsAdded = outcome.runs + (isWide || isNoBall ? 1 : 0);
        next.score += totalRunsAdded;
        next.partnership.runs += totalRunsAdded;

        if (isWide) {
          next.extras.wides += 1 + outcome.runs;
        } else if (isNoBall) {
          next.extras.noBalls += 1;
          striker.runs += outcome.runs;
          striker.balls += 1;
        } else {
          striker.runs += outcome.runs;
          striker.balls += 1;
          next.partnership.balls += 1;
        }

        if (outcome.runs === 4 && !isWide) striker.fours += 1;
        if (outcome.runs === 6 && !isWide) striker.sixes += 1;

        if (outcome.runs > 0 && s.ballHitBat) {
          next.wagonWheel.push({
            angle: s.swingAimAngle,
            dist: outcome.runs >= 4 ? BOUNDARY_RADIUS : Math.min(BOUNDARY_RADIUS - 6, 18 + outcome.runs * 14),
            runs: outcome.runs
          });
        }

        // Bowler figures
        bowler.runsConceded += totalRunsAdded;
        if (isLegal) {
          bowler.ballsBowled += 1;
          next.legalBalls += 1;
        }

        // Pill badge
        let pill = `${outcome.runs}`;
        if (actualWicket) pill = 'W';
        else if (isWide) pill = outcome.runs > 0 ? `${outcome.runs + 1}wd` : 'WD';
        else if (isNoBall) pill = outcome.runs > 0 ? `${outcome.runs + 1}nb` : 'NB';
        next.thisOver.push(pill);

        // Next ball Free Hit status
        next.freeHit = isNoBall;

        // Strike rotation on odd runs
        if (outcome.runs % 2 === 1) {
          const tmp = next.strikerIdx;
          next.strikerIdx = next.nonStrikerIdx;
          next.nonStrikerIdx = tmp;
        }

        // Handle Wicket
        if (actualWicket) {
          next.wickets += 1;
          if (outcome.wicketType !== 'RUN OUT') {
            bowler.wickets += 1;
          }
          striker.status = 'out';
          striker.outDesc = outcome.outDesc || `b ${bowler.name}`;
          next.fallOfWickets.push({
            score: next.score,
            wicket: next.wickets,
            over: `${Math.floor(next.legalBalls / 6)}.${next.legalBalls % 6}`,
            player: striker.name
          });
          next.partnership = { runs: 0, balls: 0 };

          // Bring in next batter
          const nextBatterIdx = next.battingCard.findIndex((p) => p.status === 'yet to bat');
          if (nextBatterIdx !== -1) {
            next.battingCard[nextBatterIdx].status = 'not out';
            next.strikerIdx = nextBatterIdx;
          }
        }

        // End of Over (every 6 legal balls)
        const maxBalls = next.totalOvers * 6;
        if (isLegal && next.legalBalls % 6 === 0 && next.legalBalls < maxBalls) {
          // Rotate strike at end of over
          const tmp = next.strikerIdx;
          next.strikerIdx = next.nonStrikerIdx;
          next.nonStrikerIdx = tmp;
          next.thisOver = [];
          // Rotate bowler among top 5 bowlers (indices 6..10)
          next.currentBowlerIdx = 6 + ((next.currentBowlerIdx - 5) % 5);
        }

        // Check Innings / Match End conditions (Skip in Practice Mode)
        if (gameMode !== 'PRACTICE') {
          const allOut = next.wickets >= 10 || (gameMode === 'SUPER_OVER' && next.wickets >= 2);
          const oversDone = next.legalBalls >= maxBalls;
          const targetChased = next.innings === 2 && next.target && next.score >= next.target;

          if (targetChased || allOut || oversDone) {
            if (next.innings === 1) {
              next.firstInningsScore = next.score;
              next.target = next.score + 1;
              setTimeout(() => setGameScreen('INNINGS_BREAK'), 2200);
            } else {
              if (next.score >= next.target) {
                const wktsLeft = (gameMode === 'SUPER_OVER' ? 2 : 10) - next.wickets;
                next.winnerText = `${TEAMS[next.battingTeamCode].name} won by ${wktsLeft} wicket${wktsLeft === 1 ? '' : 's'}!`;
              } else if (next.score === next.target - 1) {
                next.winnerText = 'Match Tied! What a thriller!';
              } else {
                const margin = next.target - 1 - next.score;
                next.winnerText = `${TEAMS[next.bowlingTeamCode].name} won by ${margin} run${margin === 1 ? '' : 's'}!`;
              }
              setTimeout(() => setGameScreen('MATCH_OVER'), 2400);
            }
          }
        }

        return next;
      });

      // Auto-reset to READY after 2.7 seconds
      setTimeout(() => {
        resetPositionsForNextBall();
      }, 2700);
    };

    // --- 10. MAIN 60HZ ANIMATION & PHYSICS LOOP ---
    let animFrameId;
    let lastTime = performance.now();
    let radarTick = 0;

    const animate = (now) => {
      animFrameId = requestAnimationFrame(animate);
      const rawDt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const s = simRef.current;
      const dt = rawDt * s.timeScale;

      // 1. Update Atmosphere & Weather
      if (s.timeOfDay === 'DAY') {
        scene.background.setHex(0x68b5e8);
        scene.fog.color.setHex(0x88c9f2);
        sunLight.intensity = 1.35;
        sunLight.color.setHex(0xfffbeb);
        ambientLight.intensity = 0.72;
        floodlightSpots.forEach((f) => { f.spot.intensity = 0.1; });
      } else if (s.timeOfDay === 'SUNSET') {
        scene.background.setHex(0xf97316);
        scene.fog.color.setHex(0xfb923c);
        sunLight.intensity = 1.1;
        sunLight.color.setHex(0xfdba74);
        ambientLight.intensity = 0.55;
        floodlightSpots.forEach((f) => { f.spot.intensity = 0.8; });
      } else {
        scene.background.setHex(0x090d16);
        scene.fog.color.setHex(0x0f172a);
        sunLight.intensity = 0.25;
        ambientLight.intensity = 0.42;
        floodlightSpots.forEach((f) => { f.spot.intensity = 1.65; });
      }

      rainSystem.visible = s.weather === 'RAIN';
      if (rainSystem.visible) {
        const rArr = rainSystem.geometry.attributes.position.array;
        for (let i = 0; i < rainCount; i++) {
          rArr[i * 3 + 1] -= 24 * rawDt;
          if (rArr[i * 3 + 1] < 0) rArr[i * 3 + 1] = 35;
        }
        rainSystem.geometry.attributes.position.needsUpdate = true;
      }

      // 2. Update Pitch Target Marker & Shot Aim Cone
      targetRingGroup.position.set(s.pitchTarget.x, 0.04, s.pitchTarget.z);
      targetRingGroup.visible = s.phase === 'READY' || s.phase === 'RUNUP' || s.phase === 'IN_FLIGHT';
      aimArrowGroup.rotation.y = Math.PI + s.shotAimAngle;
      aimArrowGroup.visible = s.userRole === 'BATTING' && (s.phase === 'READY' || s.phase === 'RUNUP' || s.phase === 'IN_FLIGHT');

      // 3. Animate Instanced Crowd during Celebrations
      if (s.celebratingTimer > 0) {
        s.celebratingTimer -= rawDt;
        for (let i = 0; i < crowdCount; i++) {
          const cd = crowdBaseData[i];
          if (cd.y < 0) continue;
          const jump = Math.abs(Math.sin(now * 0.012 + cd.phase)) * 0.45;
          dummy.position.set(cd.x, cd.y + jump, cd.z);
          dummy.lookAt(0, 1, 0);
          dummy.updateMatrix();
          crowdMesh.setMatrixAt(i, dummy.matrix);
        }
        crowdMesh.instanceMatrix.needsUpdate = true;
      }

      // 4. Update Particles & Broken Wickets
      particles.forEach((p) => {
        if (p.userData.life > 0) {
          p.userData.life -= rawDt;
          p.position.addScaledVector(p.userData.vel, rawDt);
          p.userData.vel.y -= 9.8 * rawDt;
          p.material.opacity = Math.max(0, p.userData.life * 2);
          if (p.userData.life <= 0) p.visible = false;
        }
      });

      [strikerWickets, bowlerWickets].forEach((wg) => {
        if (wg.userData.broken) {
          [...wg.userData.stumps, ...wg.userData.bails].forEach((part) => {
            if (part.position.y > 0.04 || part.userData.vel.lengthSq() > 0.01) {
              part.position.addScaledVector(part.userData.vel, rawDt);
              part.rotation.x += part.userData.rotVel.x * rawDt;
              part.rotation.y += part.userData.rotVel.y * rawDt;
              part.rotation.z += part.userData.rotVel.z * rawDt;
              part.userData.vel.y -= 14.0 * rawDt;
              if (part.position.y < 0.04) {
                part.position.y = 0.04;
                part.userData.vel.multiplyScalar(0.3);
                part.userData.vel.y = 0;
                part.userData.rotVel.multiplyScalar(0.4);
              }
            }
          });
        }
      });

      // 5. PHASE: BOWLER RUN-UP & RELEASE
      if (s.phase === 'RUNUP') {
        const runSpeed = 6.6;
        s.bowlerZ += runSpeed * dt;
        bowlerModel.position.set(0.42, 0, s.bowlerZ);

        // Procedural running limbs
        const stride = Math.sin(now * 0.022) * 0.75;
        bowlerModel.userData.leftLegPivot.rotation.x = stride;
        bowlerModel.userData.rightLegPivot.rotation.x = -stride;

        // Windmill bowling arm gather near crease
        if (s.bowlerZ > -11.8) {
          const gatherProg = (s.bowlerZ + 11.8) / 2.6;
          bowlerModel.userData.rightArmPivot.rotation.x = -gatherProg * Math.PI * 1.85;
          bowlerModel.userData.leftArmPivot.rotation.x = Math.sin(gatherProg * Math.PI) * 1.1;
        } else {
          bowlerModel.userData.rightArmPivot.rotation.x = -stride * 0.8;
          bowlerModel.userData.leftArmPivot.rotation.x = stride * 0.8;
        }

        s.ballPos.set(0.42, 1.98, s.bowlerZ + 0.25);

        // Release Ball at Popping Crease (-8.84m)
        if (s.bowlerZ >= -POPPING_CREASE_Z) {
          s.phase = 'IN_FLIGHT';
          setBallPhase('IN_FLIGHT');
          s.bowlerReleased = true;

          // Calculate Ballistic Release Vector to hit s.pitchTarget
          const releasePos = new THREE.Vector3(0.36, 2.08, -POPPING_CREASE_Z);
          s.ballPos.copy(releasePos);

          const speedMps = (s.delivery.speedKph / 3.6) * 0.56; // Broadcast playable scale
          const dz = s.pitchTarget.z - releasePos.z;
          const flightTime = Math.max(0.28, dz / speedMps);
          const gravity = 9.81;

          // Compensate for lateral swing acceleration in flight
          const swingAccelX = s.delivery.swing * 2.2;
          const vx = (s.pitchTarget.x - releasePos.x - 0.5 * swingAccelX * flightTime * flightTime) / flightTime;
          const vy = (0.055 - releasePos.y + 0.5 * gravity * flightTime * flightTime) / flightTime;
          const vz = dz / flightTime;

          s.ballVel.set(vx, vy, vz);
          s.ballSwing = swingAccelX;
          s.ballSpin = s.delivery.seam * 3.4;
        }
      }

      // 6. BATTER IDLE STANCE & SWING ANIMATION
      if (s.phase === 'READY' || s.phase === 'RUNUP' || s.phase === 'IN_FLIGHT') {
        const st = strikerModel.userData;
        if (!s.swingTriggered) {
          // Idle rhythmic bat tap
          const tap = Math.abs(Math.sin(now * 0.005)) * 0.22;
          st.rightArmPivot.rotation.set(-0.45 - tap, 0, -0.15);
          st.leftArmPivot.rotation.set(-0.45 - tap, 0, 0.15);
          st.batPivot.rotation.set(0.25 + tap * 0.5, 0, 0);
          st.leftLegPivot.rotation.x = 0;
          st.rightLegPivot.rotation.x = 0;
        } else {
          // Active Bat Swing Arc
          s.swingTimer += dt;
          const swingPhase = Math.min(1, s.swingTimer / 0.28);
          const arc = Math.sin(swingPhase * Math.PI);
          const followThrough = swingPhase > 0.5 ? 1.15 : arc * 1.15;

          st.torso.rotation.y = -s.swingAimAngle * 0.45;
          st.rightArmPivot.rotation.set(-1.35 * followThrough, -s.swingAimAngle * 0.3, 0);
          st.leftArmPivot.rotation.set(-1.25 * followThrough, -s.swingAimAngle * 0.3, 0);
          st.batPivot.rotation.set(-0.85 * followThrough, 0, 0);
          // Front foot stride
          st.leftLegPivot.rotation.x = -0.38 * Math.min(1, swingPhase * 2);
        }
      }

      // 7. PHASE: BALL IN FLIGHT (BOWLING TO BATTER)
      if (s.phase === 'IN_FLIGHT') {
        // AI Batter Auto-Swing Logic when User is Bowling
        if (s.userRole === 'BOWLING' && !s.swingTriggered && s.ballPos.z > 5.4) {
          const shots = ['DEFENSIVE', 'GROUND', 'GROUND', 'LOFTED'];
          const chosenShot = shots[Math.floor(Math.random() * shots.length)];
          s.shotAimAngle = (Math.random() - 0.5) * 2.1;
          triggerBatSwingRef.current(chosenShot);
        }

        // Sub-stepped ballistic integration for crisp collision detection
        const subSteps = 4;
        const subDt = dt / subSteps;

        for (let step = 0; step < subSteps; step++) {
          if (s.phase !== 'IN_FLIGHT') break;

          // Aerodynamic swing before pitch bounce
          if (!s.ballBounced) {
            s.ballVel.x += s.ballSwing * subDt;
          }
          s.ballVel.y -= 9.81 * subDt;
          s.ballPos.addScaledVector(s.ballVel, subDt);

          // Record Hawk-Eye path
          if (step === 0) {
            s.hawkEyePath.push({ x: s.ballPos.x, y: s.ballPos.y, z: s.ballPos.z });
          }

          // Pitch Bounce Detection
          if (!s.ballBounced && s.ballPos.y <= 0.055) {
            s.ballPos.y = 0.055;
            s.ballBounced = true;
            s.ballBouncePoint = s.ballPos.clone();
            s.ballVel.y = Math.abs(s.ballVel.y) * s.delivery.bounce;
            s.ballVel.x += s.ballSpin; // Lateral seam / spin off the deck
            s.ballVel.z *= 0.89;
            soundEngine.playPitchBounce();
            spawnParticles(s.ballPos, 0xd6c5a3, 10, 2.2);
          }

          // Bat-Ball Contact Window Evaluation (around popping crease z = 8.4m .. 9.3m)
          if (s.swingTriggered && !s.contactEvaluated && s.ballPos.z >= 7.8 && s.ballPos.z <= 9.55) {
            const idealZ = POPPING_CREASE_Z - 0.15;
            const zDiff = s.ballPos.z - idealZ; // negative = early swing, positive = late swing
            const lateralReach = Math.abs(s.ballPos.x - 0.05);

            // Check if swing timer is active and ball is within playable reach
            if (s.swingTimer > 0.02 && s.swingTimer < 0.34 && lateralReach < 0.72 && Math.abs(zDiff) < 0.82) {
              s.contactEvaluated = true;
              s.ballHitBat = true;
              s.phase = 'IN_PLAY';
              setBallPhase('IN_PLAY');

              const shotDef = SHOT_TYPES.find((st) => st.id === s.swingShotType) || SHOT_TYPES[1];
              const timingError = Math.abs(zDiff);

              let timingLabel;
              let qualityMult;
              let isEdge = false;

              if (timingError < 0.22 && lateralReach < 0.38) {
                timingLabel = 'PERFECT SWEET SPOT!';
                qualityMult = 1.12;
                spawnParticles(s.ballPos, 0xfef08a, 16, 4.5);
              } else if (timingError < 0.46 && lateralReach < 0.52) {
                timingLabel = 'GOOD CONTACT';
                qualityMult = 0.88;
              } else {
                timingLabel = zDiff < 0 ? 'EARLY SHOT • EDGE!' : 'LATE SHOT • EDGE!';
                qualityMult = 0.45;
                isEdge = true;
              }

              soundEngine.playBatHit(shotDef.powerMult * qualityMult, isEdge);

              // Calculate 3D Outgoing Launch Velocity
              let outAngle = s.swingAimAngle + zDiff * 0.65;
              let elevRad = THREE.MathUtils.degToRad(shotDef.loftDeg);
              let exitSpeed = (21 + s.delivery.speedKph * 0.095) * shotDef.powerMult * qualityMult;

              if (isEdge) {
                // Deflect toward slips / third man / keeper
                outAngle = (Math.random() > 0.3 ? -1 : 1) * (Math.PI * 0.72 + (Math.random() - 0.5) * 0.35);
                elevRad = THREE.MathUtils.degToRad(16 + Math.random() * 22);
                exitSpeed = 14 + Math.random() * 8;
              }

              const horizSpeed = exitSpeed * Math.cos(elevRad);
              // Angle 0 = straight down ground (-Z), -PI/2 = Off side (-X), +PI/2 = Leg side (+X)
              s.ballVel.set(
                Math.sin(outAngle) * horizSpeed,
                exitSpeed * Math.sin(elevRad),
                -Math.cos(outAngle) * horizSpeed
              );
              s.ballBounced = false; // Reset to track whether ball hits turf after bat contact

              // Assign Nearest Fielder to Intercept
              let bestIdx = 0;
              let bestDist = Infinity;
              const estLandingX = s.ballPos.x + s.ballVel.x * 1.4;
              const estLandingZ = s.ballPos.z + s.ballVel.z * 1.4;
              outfieldModels.forEach((fm, idx) => {
                const dist = Math.hypot(fm.position.x - estLandingX, fm.position.z - estLandingZ);
                if (dist < bestDist) {
                  bestDist = dist;
                  bestIdx = idx;
                }
              });
              s.activeChaserIdx = bestIdx;

              const exitKph = Math.round(exitSpeed * 3.6);
              setFeedbackBanner({
                title: `${timingLabel} • ${exitKph} KM/H`,
                subtitle: s.userRole === 'BATTING' ? 'Press SPACE or RUN button to run between the wickets!' : 'Fielders chasing the ball!',
                type: isEdge ? 'warning' : 'info',
                visible: true
              });

              // If AI is batting and hits into space, trigger AI run
              if (s.userRole === 'BOWLING' && !isEdge && exitSpeed > 14) {
                setTimeout(() => {
                  if (simRef.current.phase === 'IN_PLAY') triggerRunRef.current();
                }, 320);
              }
              break;
            }
          }

          // Check LBW (Pad Impact before Stumps when missed)
          if (
            !s.ballHitBat &&
            s.ballPos.z >= POPPING_CREASE_Z + 0.15 &&
            s.ballPos.z <= STUMP_Z - 0.15 &&
            Math.abs(s.ballPos.x) < 0.16 &&
            s.ballPos.y < 0.68
          ) {
            // Project line to Z = STUMP_Z
            const remZ = STUMP_Z - s.ballPos.z;
            const projX = s.ballPos.x + (s.ballVel.x / Math.max(1, s.ballVel.z)) * remZ;
            const pitchedInLineOrOff = !s.ballBouncePoint || s.ballBouncePoint.x <= 0.13;

            if (pitchedInLineOrOff && Math.abs(projX) <= 0.125) {
              s.ballImpactPoint = s.ballPos.clone();
              soundEngine.playPitchBounce();
              concludeDelivery({
                runs: 0,
                isWicket: true,
                wicketType: 'LBW',
                outDesc: `lbw b ${TEAMS[aiTeamCode].players[9].name}`,
                title: 'OUT! PLUMB LBW!',
                subtitle: 'Trapped right in front of the stumps! Check DRS Hawk-Eye Replay!',
                commentary: 'HUGE APPEAL AND GIVEN! Dead plumb in front of middle stump — LBW!'
              });
              break;
            }
          }

          // Check Clean Bowled (Stump Collision at Z = STUMP_Z)
          if (!s.ballHitBat && Math.abs(s.ballPos.z - STUMP_Z) < 0.18) {
            if (Math.abs(s.ballPos.x) <= 0.135 && s.ballPos.y <= 0.73) {
              shatterWicketSet(strikerWickets, s.ballVel);
              concludeDelivery({
                runs: 0,
                isWicket: true,
                wicketType: 'BOWLED',
                title: 'OUT! CLEAN BOWLED!',
                subtitle: 'Timber! The stumps and bails go flying!',
                commentary: 'BOWLED HIM! What a jaffa! Crashes straight through the gate into the woodwork!'
              });
              break;
            }
          }

          // Ball Reaches Wicketkeeper Behind Stumps (Z >= 13.4m)
          if (!s.ballHitBat && s.ballPos.z >= 13.4) {
            soundEngine.playKeeperGloves();
            keeperModel.position.x = THREE.MathUtils.clamp(s.ballPos.x, -2.2, 2.2);

            const isWideDelivery = Math.abs(s.ballPos.x) > 0.78;
            if (isWideDelivery) {
              concludeDelivery({
                runs: 0,
                isWicket: false,
                extraType: 'WIDE',
                title: 'WIDE BALL (+1 EXTRA)',
                subtitle: 'Signaled wide by the umpire — extra run and re-bowl.',
                commentary: 'Bowled too far wide of the tramline. The umpire stretches both arms for a Wide.'
              });
            } else if (s.isNoBallDelivery) {
              concludeDelivery({
                runs: 0,
                isWicket: false,
                extraType: 'NOBALL',
                title: 'NO BALL! FREE HIT NEXT!',
                subtitle: 'Overstepped the popping crease! Next delivery is a Free Hit.',
                commentary: 'Siren goes off! The bowler overstepped the front line — No Ball and a Free Hit coming up!'
              });
            } else {
              concludeDelivery({
                runs: 0,
                isWicket: false,
                title: s.swingTriggered ? 'SWING & MISS • DOT BALL' : 'LEFT ALONE • DOT BALL',
                subtitle: 'Collected cleanly by the wicketkeeper behind the stumps.',
                commentary: s.swingTriggered
                  ? 'Beaten all ends up! Zipping past the outside edge into the keeper’s gloves.'
                  : 'Good leave by the batter, watching it closely into the wicketkeeper’s gloves.'
              });
            }
            break;
          }
        }
      }

      // 8. PHASE: BALL IN PLAY (OUTFIELD PHYSICS, FIELDERS, CATCHES, BOUNDARIES & RUNNING)
      if (s.phase === 'IN_PLAY') {
        if (!s.ballCollected) {
          s.ballVel.y -= 9.81 * dt;
          // Air drag
          s.ballVel.multiplyScalar(1 - 0.12 * dt);
          s.ballPos.addScaledVector(s.ballVel, dt);

          // Outfield bounce & rolling turf friction
          if (s.ballPos.y <= 0.055) {
            s.ballPos.y = 0.055;
            if (Math.abs(s.ballVel.y) > 1.2) {
              s.ballVel.y = Math.abs(s.ballVel.y) * 0.42;
              s.ballVel.x *= 0.78;
              s.ballVel.z *= 0.78;
            } else {
              s.ballVel.y = 0;
              // Grass rolling resistance
              s.ballVel.x *= 1 - 1.35 * dt;
              s.ballVel.z *= 1 - 1.35 * dt;
            }
            s.ballBounced = true;
          }

          // Check Boundary Rope Crossing (68m radius)
          const radialDist = Math.hypot(s.ballPos.x, s.ballPos.z);
          if (radialDist >= BOUNDARY_RADIUS) {
            const isSix = !s.ballBounced;
            const distMeters = Math.round(radialDist + (isSix ? Math.abs(s.ballVel.length()) * 1.4 : 0));
            concludeDelivery({
              runs: isSix ? 6 : 4,
              isWicket: false,
              title: isSix ? `MAXIMUM SIX! (${distMeters}m)` : 'CRACKING FOUR!',
              subtitle: isSix
                ? 'Launched high into the stands! Massive hit!'
                : 'Races across the lush green turf into the boundary boards!',
              commentary: isSix
                ? `HUGE SIX! Out of the screws and ${distMeters} meters into the roaring crowd!`
                : 'FOUR RUNS! Threaded perfectly through the gap and races away to the fence!'
            });
          }

          // Fielder Interception & Catching AI
          outfieldModels.forEach((fm, idx) => {
            fm.lookAt(s.ballPos.x, 0, s.ballPos.z);
            const distToBall = Math.hypot(fm.position.x - s.ballPos.x, fm.position.z - s.ballPos.z);

            // Chaser or close fielder sprints toward ball
            if (idx === s.activeChaserIdx || distToBall < 18) {
              const dirX = (s.ballPos.x - fm.position.x) / Math.max(0.1, distToBall);
              const dirZ = (s.ballPos.z - fm.position.z) / Math.max(0.1, distToBall);
              const fSpeed = idx === s.activeChaserIdx ? 7.8 : 5.4;
              fm.position.x += dirX * fSpeed * dt;
              fm.position.z += dirZ * fSpeed * dt;

              const runCycle = Math.sin(now * 0.024 + idx) * 0.7;
              fm.userData.leftLegPivot.rotation.x = runCycle;
              fm.userData.rightLegPivot.rotation.x = -runCycle;
            }

            // Catch or Ground Stop Check
            if (distToBall < 1.35 && s.ballPos.y < 2.55 && !s.ballCollected && s.phase === 'IN_PLAY') {
              if (!s.ballBounced) {
                // CAUGHT ON THE FULL!
                s.ballCollected = true;
                s.ballPos.set(fm.position.x, 1.45, fm.position.z);
                concludeDelivery({
                  runs: 0,
                  isWicket: true,
                  wicketType: 'CAUGHT',
                  outDesc: `c ${fm.userData.roleName} b Bowler`,
                  title: `OUT! CAUGHT AT ${fm.userData.roleName.toUpperCase()}!`,
                  subtitle: 'Safe hands! Taken cleanly on the full!',
                  commentary: `OUT! Straight to ${fm.userData.roleName} who pouches a sharp catch!`
                });
              } else {
                // Ground Ball Fielded -> Throw back to Stumps
                s.ballCollected = true;
                s.throwInFlight = true;
                // Throw toward the end the batters are running to
                s.throwTargetZ = Math.abs(s.strikerZ - POPPING_CREASE_Z) > Math.abs(s.strikerZ + POPPING_CREASE_Z)
                  ? -STUMP_Z
                  : STUMP_Z;
                const dx = 0 - fm.position.x;
                const dz = s.throwTargetZ - fm.position.z;
                const throwDist = Math.hypot(dx, dz);
                const throwTime = Math.max(0.35, throwDist / 26);
                s.ballPos.set(fm.position.x, 1.35, fm.position.z);
                s.ballVel.set(dx / throwTime, (0.5 - 1.35 + 0.5 * 9.81 * throwTime * throwTime) / throwTime, dz / throwTime);
              }
            }
          });
        } else if (s.throwInFlight) {
          // Ball Thrown by Fielder toward Stumps
          s.ballVel.y -= 9.81 * dt;
          s.ballPos.addScaledVector(s.ballVel, dt);

          const distToTargetStumps = Math.hypot(s.ballPos.x, s.ballPos.z - s.throwTargetZ);
          if (distToTargetStumps < 0.85 || s.ballPos.y <= 0.08) {
            s.throwInFlight = false;
            soundEngine.playKeeperGloves();

            // Check if batters are mid-pitch (Run Out!)
            const strikerSafe = Math.abs(Math.abs(s.strikerZ) - POPPING_CREASE_Z) < 0.45;
            const nonStrikerSafe = Math.abs(Math.abs(s.nonStrikerZ) - POPPING_CREASE_Z) < 0.45;

            if (s.isRunning && (!strikerSafe || !nonStrikerSafe)) {
              shatterWicketSet(s.throwTargetZ > 0 ? strikerWickets : bowlerWickets, s.ballVel);
              concludeDelivery({
                runs: s.completedRunsThisBall,
                isWicket: true,
                wicketType: 'RUN OUT',
                outDesc: 'run out (Direct Hit)',
                title: 'OUT! DIRECT HIT RUN OUT!',
                subtitle: 'Caught short of the crease by a rocket throw from the deep!',
                commentary: 'DIRECT HIT! Brilliant piece of fielding — the batter is caught well short of the crease!'
              });
            } else {
              const r = s.completedRunsThisBall;
              concludeDelivery({
                runs: r,
                isWicket: false,
                title: r > 0 ? `${r} RUN${r > 1 ? 'S' : ''} COMPLETED` : 'WELL FIELDED • DOT BALL',
                subtitle: r > 0 ? 'Good running between the wickets!' : 'Cut off sharply in the ring — no run.',
                commentary: r > 0
                  ? `Quick running between the wickets! They hustle back for ${r} run${r > 1 ? 's' : ''}.`
                  : 'Crisp stop by the fielder inside the circle. Dot ball.'
              });
            }
          }
        }

        // Batters Running Between the Wickets Logic
        if (s.isRunning && s.completedRunsThisBall < s.targetRunCount) {
          const runNumber = s.completedRunsThisBall + 1;
          const strikerDestZ = runNumber % 2 === 1 ? -POPPING_CREASE_Z : POPPING_CREASE_Z;
          const nonStrikerDestZ = runNumber % 2 === 1 ? POPPING_CREASE_Z : -POPPING_CREASE_Z;
          const bSpeed = s.isSprinting ? 8.2 : 6.5;

          const dirS = Math.sign(strikerDestZ - s.strikerZ);
          const dirNS = Math.sign(nonStrikerDestZ - s.nonStrikerZ);

          s.strikerZ += dirS * bSpeed * dt;
          s.nonStrikerZ += dirNS * bSpeed * dt;

          strikerModel.position.set(0.45, 0, s.strikerZ);
          strikerModel.rotation.y = dirS > 0 ? 0 : Math.PI;
          nonStrikerModel.position.set(-0.65, 0, s.nonStrikerZ);
          nonStrikerModel.rotation.y = dirNS > 0 ? 0 : Math.PI;

          const legSwing = Math.sin(now * 0.028) * 0.75;
          strikerModel.userData.leftLegPivot.rotation.x = legSwing;
          strikerModel.userData.rightLegPivot.rotation.x = -legSwing;
          nonStrikerModel.userData.leftLegPivot.rotation.x = -legSwing;
          nonStrikerModel.userData.rightLegPivot.rotation.x = legSwing;

          if (Math.abs(s.strikerZ - strikerDestZ) < 0.35) {
            s.strikerZ = strikerDestZ;
            s.nonStrikerZ = nonStrikerDestZ;
            s.completedRunsThisBall += 1;
            if (s.completedRunsThisBall >= s.targetRunCount) {
              s.isRunning = false;
              // If ball is already dead/collected, finish delivery
              if (s.ballCollected && !s.throwInFlight) {
                const r = s.completedRunsThisBall;
                concludeDelivery({
                  runs: r,
                  isWicket: false,
                  title: `${r} RUN${r > 1 ? 'S' : ''} COMPLETED!`,
                  subtitle: 'Safe in the crease!',
                  commentary: `Good call and sharp running — ${r} run${r > 1 ? 's' : ''} added to the total.`
                });
              }
            }
          }
        }
      }

      // 9. UPDATE 3D BALL MESH, SHADOW & TRAIL RIBBON
      ballGroup.position.copy(s.ballPos);
      ballGroup.rotation.x += s.ballVel.z * 0.25;
      ballGroup.rotation.z -= s.ballVel.x * 0.25;

      ballShadow.position.set(s.ballPos.x, 0.035, s.ballPos.z);
      const shadowScale = Math.max(0.35, 1.2 - s.ballPos.y * 0.12);
      ballShadow.scale.set(shadowScale, shadowScale, 1);

      if (s.phase === 'IN_FLIGHT' || s.phase === 'IN_PLAY') {
        s.ballTrailPoints.unshift(s.ballPos.clone());
        if (s.ballTrailPoints.length > maxTrailPts) s.ballTrailPoints.pop();
        for (let i = 0; i < maxTrailPts; i++) {
          const pt = s.ballTrailPoints[Math.min(i, s.ballTrailPoints.length - 1)] || s.ballPos;
          trailPositions[i * 3] = pt.x;
          trailPositions[i * 3 + 1] = pt.y;
          trailPositions[i * 3 + 2] = pt.z;
        }
        trailGeo.attributes.position.needsUpdate = true;
        trailLine.visible = true;
      } else {
        trailLine.visible = false;
      }

      // 10. CAMERA SYSTEM & SMOOTH CINEMATIC TRACKING
      const targetCamPos = new THREE.Vector3();
      const targetLookAt = new THREE.Vector3();

      if (s.phase === 'IN_PLAY') {
        // Dynamic Broadcast Ball-Follow Zoom when ball is hit into the outfield
        targetCamPos.set(s.ballPos.x * 0.42, Math.max(7.5, s.ballPos.y * 0.7 + 7.5), s.ballPos.z * 0.42 - 22);
        targetLookAt.set(s.ballPos.x * 0.75, Math.max(0.8, s.ballPos.y * 0.5), s.ballPos.z * 0.75);
      } else if (s.cameraMode === 'PRO_BATTER') {
        targetCamPos.set(0, 3.3, 15.8);
        targetLookAt.set(s.pitchTarget.x * 0.4, 0.9, -6.5);
      } else if (s.cameraMode === 'BOWLER') {
        targetCamPos.set(0.3, 3.4, -22.5);
        targetLookAt.set(0, 1.0, 9.0);
      } else if (s.cameraMode === 'BALL_FOLLOW' && s.phase === 'IN_FLIGHT') {
        targetCamPos.set(s.ballPos.x * 0.5, 4.5, s.ballPos.z - 8.5);
        targetLookAt.copy(s.ballPos);
      } else {
        // Default Classic TV Broadcast View (Elevated behind Bowler's arm)
        targetCamPos.set(0, 8.8, -26.5);
        targetLookAt.set(0, 1.1, 4.8);
      }

      camera.position.lerp(targetCamPos, 0.09);
      camera.lookAt(targetLookAt);

      // Update 2D Radar Minimap every 6 frames to keep React UI silky smooth
      radarTick++;
      if (radarTick % 6 === 0) {
        setRadarState({
          ball: { x: s.ballPos.x, z: s.ballPos.z },
          fielders: outfieldModels.map((fm) => ({ x: fm.position.x, z: fm.position.z, name: fm.userData.roleName })),
          strikerZ: s.strikerZ,
          nonStrikerZ: s.nonStrikerZ,
          isRunning: s.isRunning
        });
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTeamCode, aiTeamCode, gameMode]);

  return {
    triggerBatSwingRef,
    startDeliveryRef,
    triggerRunRef,
    cancelRunRef
  };
}
