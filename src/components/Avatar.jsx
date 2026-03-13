import { getAvatarColor, getInitials } from '../utils/avatar'

export default function Avatar({ name = '', size = 30 }) {
  const color    = getAvatarColor(name)
  const initials = getInitials(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color.bg}, ${color.bg}bb)`,
      color: color.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Bebas Neue, sans-serif',
      fontSize: Math.round(size * 0.38),
      letterSpacing: '0.5px',
      flexShrink: 0,
      border: `1.5px solid ${color.text}50`,
      boxShadow: `0 0 10px ${color.bg}90`,
      userSelect: 'none',
    }}>
      {initials}
    </div>
  )
}