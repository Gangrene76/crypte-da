import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email invalide.' })

  const { error } = await supabase.from('email_subscriptions').upsert({ email: email.toLowerCase().trim(), actif: true }, { onConflict: 'email' })
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ success: true })
}
