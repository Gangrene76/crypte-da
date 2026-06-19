import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { email } = req.query
  if (!email) return res.status(400).send('Email manquant.')
  await supabase.from('email_subscriptions').update({ actif: false }).eq('email', email.toLowerCase())
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Désinscription</title>
    <style>body{font-family:Georgia,serif;background:#0d0b09;color:#e8d5b0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;}
    .box{max-width:400px;padding:3rem;border:1px solid rgba(201,168,76,0.3);border-radius:4px;}
    h1{color:#c9a84c;font-family:serif;}a{color:#c9a84c;}</style></head>
    <body><div class="box">
      <h1>✅ Désinscription confirmée</h1>
      <p>Tu ne recevras plus de notifications de La Crypte de D&A.</p>
      <p><a href="https://crypte-da.fr">← Retour au site</a></p>
    </div></body></html>
  `)
}
