import { createClient } from '@supabase/supabase-js'

// ── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Keys ─────────────────────────────────────────────────────────────────────
export const KEYS = {
  PLAYERS:           'ea26_players',
  GROUPS:            'ea26_groups',
  GROUPS_LOCKED:     'ea26_groups_locked',
  FIXTURES:          'ea26_fixtures',
  FIXTURE_CONFIG:    'ea26_fixture_config',
  FIXTURES_LOCKED:   'ea26_fixtures_locked',
  QUALIFIER_CONFIG:  'ea26_qualifier_config',
  KNOCKOUT_BRACKET:  'ea26_knockout_bracket',
  TOURNAMENT_FORMAT: 'ea26_tournament_format',
  SETTINGS:          'ea26_settings',
}

// ── Load all keys in one round-trip (used on app startup) ────────────────────
export async function loadAll() {
  const { data, error } = await supabase
    .from('tournament_data')
    .select('key, value')

  if (error) {
    console.error('Supabase loadAll error:', error.message)
    return {}
  }

  const result = {}
  for (const row of data) {
    result[row.key] = row.value
  }
  return result
}

// ── Save a single key (upsert) ───────────────────────────────────────────────
export async function save(key, value) {
  const { error } = await supabase
    .from('tournament_data')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) {
    console.error(`Supabase save error [${key}]:`, error.message)
  }
}

// ── Delete all tournament keys (full reset) ──────────────────────────────────
export async function removeAll() {
  const { error } = await supabase
    .from('tournament_data')
    .delete()
    .in('key', Object.values(KEYS))

  if (error) {
    console.error('Supabase removeAll error:', error.message)
  }
}

// ── ID generator ─────────────────────────────────────────────────────────────
export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}