export const colors = {
  bg: '#060910',
  bgSoft: '#0A1020',
  card: '#0F1626',
  cardSoft: '#141D30',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  text: '#F4F7FB',
  textMuted: '#95A3B8',
  textDim: '#64748B',
  accent: '#8CFFB8',
  accentSoft: 'rgba(140,255,184,0.14)',
  accentInk: '#04120A',
  violet: '#9B8CFF',
  violetSoft: 'rgba(155,140,255,0.16)',
  pink: '#FF8AD1',
  amber: '#FFC46B',
  amberSoft: 'rgba(255,196,107,0.16)',
  danger: '#FF7A7A',
  dangerSoft: 'rgba(255,122,122,0.14)',
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const absoluteFill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;

export const gradients = {
  screen: ['#0B1324', '#070B14', '#05070C'] as [string, string, string],
  accent: ['#8CFFB8', '#5CE1C6'] as [string, string],
  violet: ['#9B8CFF', '#FF8AD1'] as [string, string],
};
