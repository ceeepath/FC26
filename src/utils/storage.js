export const KEYS = {
  PLAYERS: 'ea26_players',
  GROUPS: 'ea26_groups',
  GROUPS_LOCKED: 'ea26_groups_locked',
  SETTINGS: 'ea26_settings',
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
