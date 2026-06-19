import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { newsId } = req.body
  if (!newsId) return res.status(400).json({ error: 'newsId manquant.' })

  // Récupérer la news
  const { data: news } = await supabase.from('news').select('*,mj(prenom)').eq('id', newsId).single()
  if (!news) return res.status(404).json({ error: 'News introuvable.' })

  // Récupérer les abonnés actifs
  const { data: abonnes } = await supabase.from('email_subscriptions').select('email').eq('actif', true)
  if (!abonnes || abonnes.length === 0) return res.status(200).json({ sent: 0 })

  const SITE_URL = 'https://crypte-da.fr'
  let sent = 0, errors = 0

  for (const { email } of abonnes) {
    const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`
    const newsUrl = `${SITE_URL}/news/${news.id}`

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#0d0b09;font-family:Georgia,serif;color:#e8d5b0;}
  .wrap{max-width:600px;margin:0 auto;background:#1a1714;border:1px solid rgba(201,168,76,0.3);}
  .header{background:#0d0b09;padding:2rem;text-align:center;border-bottom:1px solid rgba(201,168,76,0.3);}
  .header h1{color:#c9a84c;font-size:1.4rem;margin:0.5rem 0 0;letter-spacing:0.1em;}
  .header p{color:#9a9090;font-size:0.8rem;margin:0.25rem 0 0;letter-spacing:0.15em;}
  .body{padding:2rem;}
  .title{color:#c9a84c;font-size:1.3rem;margin:0 0 0.75rem;}
  .meta{color:#9a9090;font-size:0.85rem;margin-bottom:1.25rem;}
  .excerpt{color:#e8d5b0;line-height:1.7;font-size:1rem;}
  .btn{display:inline-block;margin-top:1.5rem;padding:0.8rem 2rem;background:#8B0000;color:#e8d5b0;text-decoration:none;font-size:0.85rem;letter-spacing:0.1em;text-transform:uppercase;border:1px solid rgba(201,168,76,0.3);}
  .footer{background:#0d0b09;padding:1.25rem 2rem;text-align:center;border-top:1px solid rgba(201,168,76,0.2);}
  .footer p{color:#9a9090;font-size:0.75rem;margin:0;}
  .footer a{color:#c9a84c;}
  ${news.image_url ? `.img{width:100%;height:200px;object-fit:cover;display:block;}` : ''}
</style></head>
<body><div class="wrap">
  <div class="header">
    <p>LA CRYPTE DE D&A</p>
    <h1>📰 Nouvelle publication</h1>
  </div>
  ${news.image_url ? `<img class="img" src="${news.image_url}" alt="${news.titre}" />` : ''}
  <div class="body">
    <h2 class="title">${news.titre}</h2>
    <p class="meta">${news.mj ? `🎭 ${news.mj.prenom} · ` : ''}📅 ${new Date(news.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</p>
    <p class="excerpt">${news.contenu.slice(0, 300)}${news.contenu.length > 300 ? '...' : ''}</p>
    ${news.sondage_question ? `<p style="color:#c9a84c;font-size:0.9rem;margin-top:1rem;">📊 Un sondage t'attend : <em>${news.sondage_question}</em></p>` : ''}
    <a class="btn" href="${newsUrl}">Lire la suite →</a>
  </div>
  <div class="footer">
    <p>Tu reçois cet email car tu es abonné aux notifications de <a href="${SITE_URL}">La Crypte de D&A</a>.</p>
    <p style="margin-top:0.5rem;"><a href="${unsubscribeUrl}">Se désinscrire</a></p>
  </div>
</div></body></html>`

    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'La Crypte de D&A <noreply@crypte-da.fr>',
          to: email,
          subject: `📰 ${news.titre} — La Crypte de D&A`,
          html
        })
      })
      if (r.ok) sent++; else errors++
    } catch { errors++ }
  }

  return res.status(200).json({ sent, errors, total: abonnes.length })
}
