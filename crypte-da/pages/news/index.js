import { useState } from 'react'
import Layout from '../../components/Layout'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function News({ articles }) {
  const [subEmail, setSubEmail] = useState('')
  const [subMsg, setSubMsg] = useState(null)
  const [subLoading, setSubLoading] = useState(false)

  const sAbonner = async () => {
    if (!subEmail.includes('@')) { setSubMsg({ type:'error', text:"Email invalide." }); return }
    setSubLoading(true)
    const r = await fetch('/api/subscribe', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email: subEmail })
    })
    setSubLoading(false)
    if (r.ok) {
      setSubMsg({ type:'success', text:"Inscription confirmee ! Tu recevras les prochaines nouvelles." })
      setSubEmail('')
    } else {
      setSubMsg({ type:'error', text:"Une erreur est survenue." })
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'3rem 1.5rem 4rem' }}>
        <h1 style={{ color:'var(--gold)', fontSize:'clamp(1.5rem,4vw,2rem)', textAlign:'center', marginBottom:'0.5rem' }}>Chroniques & Nouvelles</h1>
        <div className="divider"><span>📰</span></div>
        <p style={{ textAlign:'center', color:'var(--ash)', marginBottom:'3rem' }}>Les annonces et récits de la Crypte de D&A</p>

        {articles.length === 0 ? (
          <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📜</div>
            <p style={{ color:'var(--ash)' }}>Aucune nouvelle pour le moment. Revenez bientôt...</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
            {articles.map(a => (
              <Link key={a.id} href={`/news/${a.id}`} style={{ textDecoration:'none' }}>
                <div className="card" style={{ overflow:'hidden', transition:'transform 0.2s, border-color 0.2s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.5)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.2)' }}>
                  {a.image_url && (
                    <div style={{ height:220, overflow:'hidden', position:'relative' }}>
                      <img src={a.image_url} alt={a.titre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(26,23,20,0.8) 0%, transparent 60%)' }} />
                    </div>
                  )}
                  <div style={{ padding:'1.75rem' }}>
                    <h2 style={{ color:'var(--gold)', fontSize:'1.2rem', fontFamily:'Cinzel,serif', marginBottom:'0.5rem', lineHeight:1.3 }}>{a.titre}</h2>
                    <div style={{ color:'var(--ash)', fontSize:'0.82rem', display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.75rem' }}>
                      {a.mj && <span>🎭 {a.mj.prenom}</span>}
                      <span>📅 {new Date(a.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</span>
                      {a.nb_commentaires > 0 && <span>💬 {a.nb_commentaires} commentaire{a.nb_commentaires > 1 ? 's' : ''}</span>}
                    </div>
                    <p style={{ color:'var(--parchment)', lineHeight:1.7, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' }}>{a.contenu}</p>
                    {a.reactions_count && Object.keys(a.reactions_count).length > 0 && (
                      <div style={{ display:'flex', gap:'0.5rem', marginTop:'1rem', flexWrap:'wrap' }}>
                        {Object.entries(a.reactions_count).map(([emoji, count]) => count > 0 && (
                          <span key={emoji} style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:20, padding:'0.2rem 0.6rem', fontSize:'0.85rem', color:'var(--parchment)' }}>{emoji} {count}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop:'1rem', color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.78rem', letterSpacing:'0.1em' }}>Lire la suite →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Abonnement */}
      <div style={{ background:'rgba(0,0,0,0.4)', padding:'3.5rem 1.5rem', textAlign:'center' }}>
        <div style={{ maxWidth:500, margin:'0 auto' }}>
          <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.3em', color:'var(--gold)', marginBottom:'0.75rem', opacity:0.8 }}>RESTEZ INFORMÉ</p>
          <h2 style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'clamp(1.2rem,3vw,1.5rem)', marginBottom:'0.75rem' }}>Notifications par email</h2>
          <p style={{ color:'var(--ash)', marginBottom:'1.5rem', lineHeight:1.7 }}>Reçois un email dès qu'une nouvelle est publiée sur la Crypte.</p>
          <div style={{ display:'flex', gap:'0.75rem', maxWidth:420, margin:'0 auto', flexWrap:'wrap', justifyContent:'center' }}>
            <input
              className="input-field"
              type="email"
              value={subEmail}
              onChange={e=>{ setSubEmail(e.target.value); setSubMsg(null) }}
              onKeyDown={e=>e.key==='Enter'&&sAbonner()}
              placeholder="ton@email.fr"
              style={{ flex:1, minWidth:200 }}
            />
            <button className="btn-primary" onClick={sAbonner} disabled={subLoading} style={{ flexShrink:0 }}>
              {subLoading ? '...' : "S'abonner"}
            </button>
          </div>
          {subMsg && (
            <div style={{ marginTop:'1rem', color:subMsg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>
              {subMsg.text}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const { data: articles } = await supabase
    .from('news')
    .select('*,mj(prenom)')
    .eq('publie', true)
    .order('created_at', { ascending: false })

  const enriched = await Promise.all((articles||[]).map(async a => {
    const [{ count: nb_commentaires }, { data: reactions }] = await Promise.all([
      supabase.from('news_commentaires').select('*', { count:'exact', head:true }).eq('news_id', a.id),
      supabase.from('news_reactions').select('reaction').eq('news_id', a.id)
    ])
    const reactions_count = (reactions||[]).reduce((acc, r) => {
      acc[r.reaction] = (acc[r.reaction]||0) + 1
      return acc
    }, {})
    return { ...a, nb_commentaires: nb_commentaires||0, reactions_count }
  }))

  return { props: { articles: enriched } }
}
