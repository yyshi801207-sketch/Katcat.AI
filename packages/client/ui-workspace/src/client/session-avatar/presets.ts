/** The seven approved Katcat cat-head silhouettes; color is selected separately. */
export const CAT_HEADS = [
  { id: 'classic', path: 'M10 28C9 22 9 13 12 10C14 9 21 13 24 16C29 14 35 14 40 16C44 13 51 9 53 10C56 13 55 22 54 28C59 35 59 42 55 48C50 56 40 59 32 59C22 59 13 56 8 49C3 42 4 34 10 28Z', transform: undefined },
  { id: 'round', path: 'M12 24C10 19 11 11 15 10C18 10 22 14 25 17C30 16 35 16 40 17C43 14 48 10 51 11C54 13 53 21 52 25C59 30 62 37 59 45C56 55 45 60 32 60C19 60 8 55 5 46C2 37 5 29 12 24Z', transform: undefined },
  { id: 'point', path: 'M11 27C10 22 9 8 12 3C14 1 24 13 26 17C30 16 35 16 39 17C42 11 51 1 53 3C56 8 54 22 53 27C58 33 60 39 56 47C52 54 41 60 32 60C23 60 12 54 8 47C4 39 6 33 11 27Z', transform: undefined },
  { id: 'fold', path: 'M12 23C8 20 5 19 4 23C3 27 5 32 9 34C5 39 6 47 12 52C18 57 25 59 32 59C41 59 49 56 54 50C58 45 58 38 55 33C59 30 61 25 58 22C55 19 50 21 47 23C43 18 37 16 31 16C23 16 17 18 12 23Z', transform: undefined },
  { id: 'tilt', path: 'M10 28C9 22 9 13 12 10C14 9 21 13 24 16C29 14 35 14 40 16C44 13 51 9 53 10C56 13 55 22 54 28C59 35 59 42 55 48C50 56 40 59 32 59C22 59 13 56 8 49C3 42 4 34 10 28Z', transform: 'rotate(-17 32 33)' },
  { id: 'fluffy', path: 'M11 25L9 10Q10 6 16 9L25 16Q33 13 41 16L51 9Q56 7 55 14L54 26L60 30L57 35L62 41L56 45L56 51L49 52L45 58L38 57L32 61L26 57L19 58L15 53L8 52L8 46L2 41L7 35L4 30Z', transform: undefined },
  { id: 'slim', path: 'M17 27L15 7Q16 2 20 6L27 16Q33 14 38 16L46 6Q50 3 50 8L48 28C53 33 54 41 50 49C46 57 40 62 32 62C24 62 17 57 14 49C10 40 12 32 17 27Z', transform: undefined },
] as const

/** Stable silhouette identifier stored with a session avatar. */
export type CatHead = typeof CAT_HEADS[number]['id']
