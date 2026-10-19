import * as THREE from 'three';
import { soundEngine } from '../utils/audioEngine';

// ============================================================================
// PROCEDURAL TEXTURES & ARTICULATED 3D CHARACTER BUILDER
// ============================================================================

export function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1f6f34' : '#257d3d';
    ctx.fillRect(0, i * 32, 512, 32);
  }
  // Subtle turf noise
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  return tex;
}

export function createPitchTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, '#c2a67d');
  grad.addColorStop(0.5, '#d3ba93');
  grad.addColorStop(1, '#c2a67d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1024);

  // Worn footmarks and clay patches
  for (let i = 0; i < 3500; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(110,85,55,0.06)' : 'rgba(255,245,220,0.05)';
    ctx.fillRect(Math.random() * 256, Math.random() * 1024, 3, 6);
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Builds an articulated 3D Cricketer with limbs, helmet/cap, pads, and bat
export function createCricketerModel({
  kitColor = 0x1e40af,
  padColor = 0x1d4ed8,
  helmetColor = 0x1e3a8a,
  hasBat = false,
  hasPads = false,
  isKeeper = false
}) {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd99b72, roughness: 0.6 });
  const kitMat = new THREE.MeshStandardMaterial({ color: kitColor, roughness: 0.5 });
  const pantMat = new THREE.MeshStandardMaterial({ color: kitColor, roughness: 0.6 });
  const padMat = new THREE.MeshStandardMaterial({ color: padColor, roughness: 0.35 });
  const helmetMat = new THREE.MeshStandardMaterial({ color: helmetColor, metalness: 0.3, roughness: 0.3 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xd4a359, roughness: 0.4 });
  const gripMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.62, 0.24), kitMat);
  torso.position.y = 1.12;
  torso.castShadow = true;
  root.add(torso);

  // Head & Helmet
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.44, 0);
  torso.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 16), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), helmetMat);
  helmet.position.y = 0.02;
  headGroup.add(helmet);

  // Peak / Grille
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.14), helmetMat);
  visor.position.set(0, 0.05, 0.12);
  headGroup.add(visor);

  if (hasBat || isKeeper) {
    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(0.21, 0.1, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, wireframe: true })
    );
    grille.position.set(0, -0.04, 0.11);
    headGroup.add(grille);
  }

  // Shoulders & Arms
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.27, 0.26, 0);
  torso.add(leftArmPivot);
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.56, 0.12), kitMat);
  leftArm.position.y = -0.24;
  leftArm.castShadow = true;
  leftArmPivot.add(leftArm);
  const leftGlove = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), whiteMat);
  leftGlove.position.y = -0.52;
  leftArmPivot.add(leftGlove);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.27, 0.26, 0);
  torso.add(rightArmPivot);
  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.56, 0.12), kitMat);
  rightArm.position.y = -0.24;
  rightArm.castShadow = true;
  rightArmPivot.add(rightArm);
  const rightGlove = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), whiteMat);
  rightGlove.position.y = -0.52;
  rightArmPivot.add(rightGlove);

  // Bat Group attached to right hand if batter
  const batPivot = new THREE.Group();
  batPivot.position.set(0, -0.52, 0.04);
  rightArmPivot.add(batPivot);

  if (hasBat) {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.30, 8), gripMat);
    handle.position.y = -0.12;
    batPivot.add(handle);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.58, 0.042), woodMat);
    blade.position.y = -0.54;
    blade.castShadow = true;
    batPivot.add(blade);
  }

  // Legs & Pads
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.12, -0.30, 0);
  torso.add(leftLegPivot);
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.76, 0.15), pantMat);
  leftLeg.position.y = -0.38;
  leftLeg.castShadow = true;
  leftLegPivot.add(leftLeg);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.12, -0.30, 0);
  torso.add(rightLegPivot);
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.76, 0.15), pantMat);
  rightLeg.position.y = -0.38;
  rightLeg.castShadow = true;
  rightLegPivot.add(rightLeg);

  if (hasPads || isKeeper) {
    const lPad = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.50, 0.10), padMat);
    lPad.position.set(0, -0.46, 0.06);
    leftLegPivot.add(lPad);

    const rPad = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.50, 0.10), padMat);
    rPad.position.set(0, -0.46, 0.06);
    rightLegPivot.add(rPad);
  }

  const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 0.24), whiteMat);
  lShoe.position.set(0, -0.76, 0.04);
  leftLegPivot.add(lShoe);

  const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 0.24), whiteMat);
  rShoe.position.set(0, -0.76, 0.04);
  rightLegPivot.add(rShoe);

  root.userData = {
    torso,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    batPivot,
    leftLegPivot,
    rightLegPivot
  };

  return root;
}

// Builds a set of 3 wooden stumps + 2 removable bails at a given Z coordinate
export function createWicketSet(zPos) {
  const group = new THREE.Group();
  group.position.set(0, 0, zPos);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.35 });
  const bailMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });

  const stumps = [];
  const xOffsets = [-0.114, 0, 0.114]; // 9 inches total width (22.86cm)
  xOffsets.forEach((x) => {
    const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.71, 10), woodMat);
    stump.position.set(x, 0.355, 0);
    stump.castShadow = true;
    stump.userData = { homePos: new THREE.Vector3(x, 0.355, 0), vel: new THREE.Vector3(), rotVel: new THREE.Vector3() };
    group.add(stump);
    stumps.push(stump);
  });

  const bails = [];
  [-0.057, 0.057].forEach((x) => {
    const bail = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.108, 8), bailMat);
    bail.rotation.z = Math.PI / 2;
    bail.position.set(x, 0.72, 0);
    bail.userData = { homePos: new THREE.Vector3(x, 0.72, 0), vel: new THREE.Vector3(), rotVel: new THREE.Vector3() };
    group.add(bail);
    bails.push(bail);
  });

  group.userData = { stumps, bails, broken: false };
  return group;
}

export function resetWicketSet(wicketGroup) {
  wicketGroup.userData.broken = false;
  wicketGroup.userData.stumps.forEach((s) => {
    s.position.copy(s.userData.homePos);
    s.rotation.set(0, 0, 0);
    s.userData.vel.set(0, 0, 0);
    s.userData.rotVel.set(0, 0, 0);
  });
  wicketGroup.userData.bails.forEach((b) => {
    b.position.copy(b.userData.homePos);
    b.rotation.set(0, 0, Math.PI / 2);
    b.userData.vel.set(0, 0, 0);
    b.userData.rotVel.set(0, 0, 0);
  });
}

export function shatterWicketSet(wicketGroup, impactVelocity) {
  if (wicketGroup.userData.broken) return;
  wicketGroup.userData.broken = true;
  soundEngine.playWicketStumps();

  wicketGroup.userData.stumps.forEach((s, idx) => {
    if (idx === 1 || Math.random() > 0.25) {
      s.userData.vel.set(
        (Math.random() - 0.5) * 3.5,
        2.2 + Math.random() * 2.5,
        Math.sign(impactVelocity.z || 1) * (3.5 + Math.random() * 4)
      );
      s.userData.rotVel.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 14
      );
    }
  });

  wicketGroup.userData.bails.forEach((b) => {
    b.userData.vel.set(
      (Math.random() - 0.5) * 5,
      4.5 + Math.random() * 3.5,
      Math.sign(impactVelocity.z || 1) * (4 + Math.random() * 5)
    );
    b.userData.rotVel.set(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 22
    );
  });
}
