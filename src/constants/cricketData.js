// ============================================================================
// TEAMS, ROSTERS, FIELD PRESETS & CRICKET CONSTANTS
// ============================================================================

export const PITCH_LENGTH = 20.12; // 22 yards in meters
export const POPPING_CREASE_Z = 8.84; // Distance from center (10.06m - 1.22m)
export const STUMP_Z = 10.06; // Half pitch length
export const BOUNDARY_RADIUS = 68; // 68m international boundary
export const CIRCLE_RADIUS = 27.4; // 30-yard inner circle

export const TEAMS = {
  IND: {
    code: 'IND',
    name: 'India',
    primary: '#1d4ed8',
    secondary: '#f97316',
    kitColor: 0x1e40af,
    padColor: 0x1d4ed8,
    helmetColor: 0x1e3a8a,
    players: [
      { id: 'ind1', name: 'R. Sharma', role: 'BAT', skill: 94, style: 'Right-hand Bat' },
      { id: 'ind2', name: 'Y. Jaiswal', role: 'BAT', skill: 90, style: 'Left-hand Bat' },
      { id: 'ind3', name: 'V. Kohli', role: 'BAT', skill: 96, style: 'Right-hand Bat' },
      { id: 'ind4', name: 'S. Yadav', role: 'BAT', skill: 93, style: 'Right-hand Bat' },
      { id: 'ind5', name: 'R. Pant', role: 'WK', skill: 91, style: 'Left-hand WK' },
      { id: 'ind6', name: 'H. Pandya', role: 'ALL', skill: 90, style: 'Fast-Medium' },
      { id: 'ind7', name: 'R. Jadeja', role: 'ALL', skill: 91, style: 'Slow Left-arm' },
      { id: 'ind8', name: 'K. Yadav', role: 'BOWL', skill: 90, style: 'Wrist Spin' },
      { id: 'ind9', name: 'M. Shami', role: 'BOWL', skill: 92, style: 'Right-arm Fast' },
      { id: 'ind10', name: 'J. Bumrah', role: 'BOWL', skill: 97, style: 'Right-arm Fast' },
      { id: 'ind11', name: 'A. Singh', role: 'BOWL', skill: 89, style: 'Left-arm Fast' },
    ]
  },
  AUS: {
    code: 'AUS',
    name: 'Australia',
    primary: '#eab308',
    secondary: '#15803d',
    kitColor: 0xfacc15,
    padColor: 0x166534,
    helmetColor: 0x14532d,
    players: [
      { id: 'aus1', name: 'T. Head', role: 'BAT', skill: 94, style: 'Left-hand Bat' },
      { id: 'aus2', name: 'D. Warner', role: 'BAT', skill: 91, style: 'Left-hand Bat' },
      { id: 'aus3', name: 'M. Marsh', role: 'ALL', skill: 90, style: 'Right-hand Bat' },
      { id: 'aus4', name: 'S. Smith', role: 'BAT', skill: 94, style: 'Right-hand Bat' },
      { id: 'aus5', name: 'G. Maxwell', role: 'ALL', skill: 92, style: 'Off-Spin' },
      { id: 'aus6', name: 'A. Carey', role: 'WK', skill: 88, style: 'Left-hand WK' },
      { id: 'aus7', name: 'C. Green', role: 'ALL', skill: 87, style: 'Fast-Medium' },
      { id: 'aus8', name: 'P. Cummins', role: 'BOWL', skill: 95, style: 'Right-arm Fast' },
      { id: 'aus9', name: 'M. Starc', role: 'BOWL', skill: 94, style: 'Left-arm Fast' },
      { id: 'aus10', name: 'A. Zampa', role: 'BOWL', skill: 91, style: 'Leg-Spin' },
      { id: 'aus11', name: 'J. Hazlewood', role: 'BOWL', skill: 93, style: 'Right-arm Fast' },
    ]
  },
  ENG: {
    code: 'ENG',
    name: 'England',
    primary: '#dc2626',
    secondary: '#1e3a8a',
    kitColor: 0xdc2626,
    padColor: 0x1e3a8a,
    helmetColor: 0x1e3a8a,
    players: [
      { id: 'eng1', name: 'J. Buttler', role: 'WK', skill: 94, style: 'Right-hand WK' },
      { id: 'eng2', name: 'P. Salt', role: 'BAT', skill: 89, style: 'Right-hand Bat' },
      { id: 'eng3', name: 'J. Root', role: 'BAT', skill: 94, style: 'Right-hand Bat' },
      { id: 'eng4', name: 'H. Brook', role: 'BAT', skill: 91, style: 'Right-hand Bat' },
      { id: 'eng5', name: 'B. Stokes', role: 'ALL', skill: 93, style: 'Fast-Medium' },
      { id: 'eng6', name: 'L. Livingstone', role: 'ALL', skill: 88, style: 'Spin All-round' },
      { id: 'eng7', name: 'M. Ali', role: 'ALL', skill: 87, style: 'Off-Spin' },
      { id: 'eng8', name: 'C. Woakes', role: 'BOWL', skill: 89, style: 'Fast-Medium' },
      { id: 'eng9', name: 'J. Archer', role: 'BOWL', skill: 94, style: 'Right-arm Fast' },
      { id: 'eng10', name: 'A. Rashid', role: 'BOWL', skill: 91, style: 'Leg-Spin' },
      { id: 'eng11', name: 'M. Wood', role: 'BOWL', skill: 92, style: 'Right-arm Express' },
    ]
  },
  RSA: {
    code: 'RSA',
    name: 'South Africa',
    primary: '#16a34a',
    secondary: '#facc15',
    kitColor: 0x15803d,
    padColor: 0x14532d,
    helmetColor: 0x14532d,
    players: [
      { id: 'rsa1', name: 'Q. de Kock', role: 'WK', skill: 92, style: 'Left-hand WK' },
      { id: 'rsa2', name: 'A. Markram', role: 'BAT', skill: 90, style: 'Right-hand Bat' },
      { id: 'rsa3', name: 'R. Hendricks', role: 'BAT', skill: 87, style: 'Right-hand Bat' },
      { id: 'rsa4', name: 'H. Klaasen', role: 'BAT', skill: 94, style: 'Right-hand Bat' },
      { id: 'rsa5', name: 'D. Miller', role: 'BAT', skill: 91, style: 'Left-hand Bat' },
      { id: 'rsa6', name: 'T. Stubbs', role: 'BAT', skill: 88, style: 'Right-hand Bat' },
      { id: 'rsa7', name: 'M. Jansen', role: 'ALL', skill: 89, style: 'Left-arm Fast' },
      { id: 'rsa8', name: 'K. Maharaj', role: 'BOWL', skill: 90, style: 'Slow Left-arm' },
      { id: 'rsa9', name: 'K. Rabada', role: 'BOWL', skill: 95, style: 'Right-arm Fast' },
      { id: 'rsa10', name: 'A. Nortje', role: 'BOWL', skill: 92, style: 'Right-arm Express' },
      { id: 'rsa11', name: 'T. Shamsi', role: 'BOWL', skill: 89, style: 'Wrist Spin' },
    ]
  },
  NZL: {
    code: 'NZL',
    name: 'New Zealand',
    primary: '#27272a',
    secondary: '#06b6d4',
    kitColor: 0x18181b,
    padColor: 0x18181b,
    helmetColor: 0x09090b,
    players: [
      { id: 'nzl1', name: 'D. Conway', role: 'WK', skill: 90, style: 'Left-hand WK' },
      { id: 'nzl2', name: 'F. Allen', role: 'BAT', skill: 87, style: 'Right-hand Bat' },
      { id: 'nzl3', name: 'K. Williamson', role: 'BAT', skill: 94, style: 'Right-hand Bat' },
      { id: 'nzl4', name: 'D. Mitchell', role: 'ALL', skill: 91, style: 'Right-hand Bat' },
      { id: 'nzl5', name: 'G. Phillips', role: 'ALL', skill: 90, style: 'Off-Spin' },
      { id: 'nzl6', name: 'R. Ravindra', role: 'ALL', skill: 90, style: 'Slow Left-arm' },
      { id: 'nzl7', name: 'M. Santner', role: 'ALL', skill: 91, style: 'Slow Left-arm' },
      { id: 'nzl8', name: 'T. Southee', role: 'BOWL', skill: 90, style: 'Right-arm Fast' },
      { id: 'nzl9', name: 'T. Boult', role: 'BOWL', skill: 94, style: 'Left-arm Fast' },
      { id: 'nzl10', name: 'L. Ferguson', role: 'BOWL', skill: 91, style: 'Right-arm Express' },
      { id: 'nzl11', name: 'M. Henry', role: 'BOWL', skill: 90, style: 'Right-arm Fast' },
    ]
  },
  PAK: {
    code: 'PAK',
    name: 'Pakistan',
    primary: '#059669',
    secondary: '#a3e635',
    kitColor: 0x047857,
    padColor: 0x065f46,
    helmetColor: 0x064e3b,
    players: [
      { id: 'pak1', name: 'M. Rizwan', role: 'WK', skill: 92, style: 'Right-hand WK' },
      { id: 'pak2', name: 'B. Azam', role: 'BAT', skill: 94, style: 'Right-hand Bat' },
      { id: 'pak3', name: 'F. Zaman', role: 'BAT', skill: 89, style: 'Left-hand Bat' },
      { id: 'pak4', name: 'S. Ayub', role: 'BAT', skill: 86, style: 'Left-hand Bat' },
      { id: 'pak5', name: 'I. Ahmed', role: 'ALL', skill: 86, style: 'Off-Spin' },
      { id: 'pak6', name: 'S. Khan', role: 'ALL', skill: 89, style: 'Leg-Spin' },
      { id: 'pak7', name: 'I. Wasim', role: 'ALL', skill: 88, style: 'Slow Left-arm' },
      { id: 'pak8', name: 'S. Afridi', role: 'BOWL', skill: 95, style: 'Left-arm Fast' },
      { id: 'pak9', name: 'N. Shah', role: 'BOWL', skill: 92, style: 'Right-arm Fast' },
      { id: 'pak10', name: 'H. Rauf', role: 'BOWL', skill: 91, style: 'Right-arm Express' },
      { id: 'pak11', name: 'A. Jamal', role: 'BOWL', skill: 86, style: 'Fast-Medium' },
    ]
  }
};

// 9 Specialist Outfield Positions (Plus Bowler at #0 and Wicketkeeper at #1 = 11 Fielders)
// Batter stands at +Z (approx +8.84m), looking toward -Z (Bowler at -10.06m).
// Right-handed batter's OFF SIDE is -X, LEG SIDE is +X.
export const FIELD_PRESETS = {
  Attacking: [
    { name: '1st Slip', x: -2.4, z: 12.8 },
    { name: '2nd Slip', x: -3.6, z: 12.4 },
    { name: 'Gully', x: -7.5, z: 10.2 },
    { name: 'Point', x: -16.0, z: 8.2 },
    { name: 'Cover', x: -17.5, z: -2.5 },
    { name: 'Mid-Off', x: -9.5, z: -15.5 },
    { name: 'Mid-On', x: 9.5, z: -15.5 },
    { name: 'Mid-Wicket', x: 16.5, z: 1.5 },
    { name: 'Fine Leg', x: 14.0, z: 24.0 },
  ],
  Balanced: [
    { name: '1st Slip', x: -2.6, z: 12.8 },
    { name: 'Third Man', x: -28.0, z: 38.0 },
    { name: 'Point', x: -19.0, z: 7.5 },
    { name: 'Extra Cover', x: -21.0, z: -6.0 },
    { name: 'Mid-Off', x: -11.0, z: -19.0 },
    { name: 'Long-On', x: 20.0, z: -48.0 },
    { name: 'Deep Mid-Wicket', x: 48.0, z: -6.0 },
    { name: 'Square Leg', x: 18.0, z: 8.5 },
    { name: 'Fine Leg', x: 18.0, z: 26.0 },
  ],
  Defensive: [
    { name: 'Third Man', x: -34.0, z: 42.0 },
    { name: 'Deep Point', x: -54.0, z: 10.0 },
    { name: 'Cover', x: -19.0, z: -4.0 },
    { name: 'Long-Off', x: -22.0, z: -52.0 },
    { name: 'Long-On', x: 22.0, z: -52.0 },
    { name: 'Mid-Wicket', x: 18.0, z: -2.0 },
    { name: 'Deep Mid-Wicket', x: 54.0, z: -8.0 },
    { name: 'Deep Square Leg', x: 54.0, z: 14.0 },
    { name: 'Fine Leg', x: 24.0, z: 44.0 },
  ]
};

export const DELIVERY_TYPES = [
  { id: 'FAST', name: 'Fast Seam', speedKph: 146, swing: 0.05, seam: 0.08, bounce: 0.62, defaultZ: 3.2, color: '#ef4444' },
  { id: 'INSWING', name: 'Inswinger', speedKph: 141, swing: 0.68, seam: 0.18, bounce: 0.58, defaultZ: 4.5, color: '#f97316' },
  { id: 'OUTSWING', name: 'Outswinger', speedKph: 140, swing: -0.68, seam: -0.20, bounce: 0.58, defaultZ: 4.2, color: '#eab308' },
  { id: 'YORKER', name: 'Toe-Crushing Yorker', speedKph: 145, swing: 0.28, seam: 0.05, bounce: 0.45, defaultZ: 8.4, color: '#ec4899' },
  { id: 'BOUNCER', name: 'Short Bouncer', speedKph: 147, swing: -0.1, seam: 0.12, bounce: 0.78, defaultZ: -0.8, color: '#dc2626' },
  { id: 'OFFSPIN', name: 'Off-Spin', speedKph: 89, swing: -0.05, seam: 0.65, bounce: 0.56, defaultZ: 4.8, color: '#06b6d4' },
  { id: 'LEGSPIN', name: 'Leg-Spin', speedKph: 86, swing: 0.06, seam: -0.78, bounce: 0.60, defaultZ: 4.4, color: '#8b5cf6' },
];

export const SHOT_TYPES = [
  { id: 'DEFENSIVE', key: 'S', label: 'Defensive Block', powerMult: 0.25, loftDeg: 2, risk: 0.02, desc: 'Safe ground block' },
  { id: 'GROUND', key: 'W', label: 'Crisp Ground Drive', powerMult: 0.88, loftDeg: 7, risk: 0.12, desc: 'High-speed carpet shot' },
  { id: 'LOFTED', key: 'E', label: 'Lofted Power Shot', powerMult: 1.24, loftDeg: 33, risk: 0.32, desc: 'Clear the ropes for SIX!' },
  { id: 'SWEEP', key: 'Q', label: 'Sweep / Ramp', powerMult: 0.96, loftDeg: 18, risk: 0.20, desc: 'Fine leg & square angles' },
];

// Helper to create initial match state
export function createInitialMatchState(userCode, aiCode, oversCount, userBatsFirst, isSuperOver = false) {
  const batTeamCode = userBatsFirst ? userCode : aiCode;
  const bowlTeamCode = userBatsFirst ? aiCode : userCode;
  const batTeam = TEAMS[batTeamCode];
  const bowlTeam = TEAMS[bowlTeamCode];

  const battingCard = batTeam.players.map((p, idx) => ({
    ...p,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    status: idx === 0 || idx === 1 ? 'not out' : 'yet to bat',
    outDesc: ''
  }));

  const bowlingCard = bowlTeam.players.map((p) => ({
    ...p,
    ballsBowled: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0
  }));

  return {
    innings: isSuperOver ? 2 : 1,
    totalOvers: isSuperOver ? 1 : oversCount,
    battingTeamCode: batTeamCode,
    bowlingTeamCode: bowlTeamCode,
    score: 0,
    wickets: 0,
    legalBalls: 0,
    target: isSuperOver ? 16 : null,
    firstInningsScore: isSuperOver ? 15 : 0,
    strikerIdx: 0,
    nonStrikerIdx: 1,
    currentBowlerIdx: 9, // Lead fast bowler
    thisOver: [],
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    partnership: { runs: 0, balls: 0 },
    fallOfWickets: [],
    freeHit: false,
    battingCard,
    bowlingCard,
    wagonWheel: [], // [{ angle, dist, runs }]
    winnerText: ''
  };
}
