// Generate a consistent color from a player name
const AVATAR_COLORS = [
  { bg: '#1a3a6a', text: '#6aaeff' },
  { bg: '#1a5a2a', text: '#6adf8a' },
  { bg: '#5a1a1a', text: '#e06a6a' },
  { bg: '#4a2a6a', text: '#c06aee' },
  { bg: '#5a3a1a', text: '#e0a06a' },
  { bg: '#1a4a5a', text: '#6ad0e0' },
  { bg: '#3a1a5a', text: '#a06ae0' },
  { bg: '#2a4a1a', text: '#a0d06a' },
  { bg: '#5a1a3a', text: '#e06aaa' },
  { bg: '#1a5a4a', text: '#6ae0c0' },
]

export function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function Avatar({ name = '', size = 32, className = '' }) {
  const color = getAvatarColor(name)
  const initials = getInitials(name)
  return {
    style: {
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color.bg}, ${color.bg}cc)`,
      color: color.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Bebas Neue, sans-serif',
      fontSize: size * 0.4,
      letterSpacing: '0.5px',
      flexShrink: 0,
      border: `1.5px solid ${color.text}40`,
      boxShadow: `0 0 8px ${color.bg}80`,
    },
    initials,
  }
}