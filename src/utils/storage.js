export const KEYS = {
  PLAYERS: 'ea26_players',
  GROUPS: 'ea26_groups',
  GROUPS_LOCKED: 'ea26_groups_locked',
  FIXTURES: 'ea26_fixtures',
  FIXTURE_CONFIG: 'ea26_fixture_config',
  FIXTURES_LOCKED: 'ea26_fixtures_locked',
  QUALIFIER_CONFIG: 'ea26_qualifier_config',
  KNOCKOUT_BRACKET: 'ea26_knockout_bracket',
  TOURNAMENT_FORMAT: 'ea26_tournament_format',
  SETTINGS: 'ea26_settings',
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}