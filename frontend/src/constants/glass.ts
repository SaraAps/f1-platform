export const GLASS_EMPTY = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 18,
}

export const GLASS_NEUTRAL = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderTop: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 18,
  boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
}

// hex = 6-char hex like '#3671C6'
export function glassTinted(hex: string) {
  return {
    background: `linear-gradient(135deg, ${hex}33 0%, ${hex}11 100%)`,
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: `1px solid ${hex}44`,
    borderTop: `1px solid ${hex}66`,
    borderRadius: 18,
    boxShadow: `0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 ${hex}22`,
  }
}
