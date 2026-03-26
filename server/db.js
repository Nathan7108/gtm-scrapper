const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')

// Determine storage mode
const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)

let supabase = null
if (useSupabase) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  console.log('[DB] Using Supabase for persistence')
} else {
  console.log('[DB] Using local JSON files for persistence')
}

// --- JSON file helpers ---

function readJSONFile(file) {
  const filePath = path.join(dataDir, file)
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJSONFile(file, data) {
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2))
}

// --- Unified data access ---

const db = {
  async getPosts() {
    if (!useSupabase) return readJSONFile('posts.json')
    const { data, error } = await supabase.from('posts').select('*').order('score', { ascending: false })
    if (error) throw error
    return data
  },

  async savePosts(posts) {
    if (!useSupabase) { writeJSONFile('posts.json', posts); return }
    const { error } = await supabase.from('posts').upsert(posts, { onConflict: 'id' })
    if (error) throw error
  },

  async getAccounts() {
    if (!useSupabase) return readJSONFile('accounts.json')
    const { data, error } = await supabase.from('accounts').select('*')
    if (error) throw error
    return data
  },

  async saveAccounts(accounts) {
    if (!useSupabase) { writeJSONFile('accounts.json', accounts); return }
    // Replace all accounts
    await supabase.from('accounts').delete().neq('handle', '')
    const { error } = await supabase.from('accounts').insert(accounts)
    if (error) throw error
  },

  async getTopics() {
    if (!useSupabase) return readJSONFile('topics.json')
    const { data, error } = await supabase.from('topics').select('keyword')
    if (error) throw error
    return data.map((t) => t.keyword)
  },

  async saveTopics(topics) {
    if (!useSupabase) { writeJSONFile('topics.json', topics); return }
    await supabase.from('topics').delete().neq('keyword', '')
    const { error } = await supabase.from('topics').insert(topics.map((k) => ({ keyword: k })))
    if (error) throw error
  },
}

module.exports = { db, useSupabase }

/*
Supabase table setup (run in Supabase SQL editor):

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  tweet_id TEXT,
  text TEXT,
  author TEXT,
  handle TEXT,
  avatar TEXT,
  date TEXT,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  url TEXT,
  source TEXT,
  source_value TEXT,
  score INTEGER,
  tier TEXT,
  insight TEXT,
  category TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  scored_at TIMESTAMPTZ
);

CREATE TABLE accounts (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE topics (
  keyword TEXT PRIMARY KEY
);
*/
