import Layout from '../../components/Layout'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'

const REACTIONS = ['❤️','🔥','😂','😮','👏','🎲']

export default function NewsDetail({ article, commentaires: initCommentaires, reactions: initReactions }) {
  const [user, setUser] = useState(null)
  const [commentaires, setCommentaires] = useState(initCommentaires)
  const [reactions, setReactions] = useState(initReactions)
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState(null)
  const [maReaction, setMaReaction] = useState(null)

  useEffect(() => {
    const u = getUser()
    setUser(u)
    if (u) {
      const existing = initReactions.find(r => r.user_id === u.id)
      if (existing) setMaReaction(existing.reaction)
    }
  }, [])

  if (!article) return <Layout><div style={{padding:'3rem',textAlign:'center',color:'var(--ash)'}}>Article introuvable.</div></Layout>

  const reactionsCount = REACTIONS.reduce((acc, r) => {
    acc[r] = reactions.filter(x => x.reaction === r).length
    return acc
  }, {})

  const voter = async (emoji) => {
    if (!user) { setMsg({ type:'error', text:'Connecte-toi pour réagir.' }); return }
    if (maReaction === emoji) {
      await supabase.from('news_reactions').delete().eq('news_id', article.id).eq('user_id', user.id)
      setReactions(r => r.filter(x => x.user_id !== user.id))
      setMaReaction(null)
    } else {
      await supabase.from('news_reactions').upsert({ news_id:article.id, user_id:user.id, reaction:emoji }, { onConflict:'news_id,user_id' })
      setReactions(r => [...r.filter(x => x.user_id !== user.id), { news_id:article.id, user_id:user.id, reaction:emoji }])
      setMaReaction(emoji)
    }
  }

  const commenter = async () => {
    if (!user) { setMsg({ type:'error', text:'Connecte-toi pour commenter.' }); return }
    if (!contenu.trim()) { setMsg({ type:'error', text:'Le commentaire ne peut pas être vide.' }); return }
    setSending(true); setMsg(null)
    const { data, error } = await supabase.from('news_commentaires').insert({ news_id:article.id, user_id:user.id, contenu:contenu.trim() }).select('*,users(pseudo,avatar_url)').single()
    if (error) setMsg({ type:'error', text:'Erreur lors de l\'envoi.' })
    else { setCommentaires(c => [...c, data]); setContenu('') }
    setSending(false)
  }

  return (
    <Layout>
      <div style={{ maxWidth:860, margin:'0 auto', padding:'3rem 1.5rem 4rem' }}>
        <div style={{ marginBottom:'1.5rem' }}>
          <Link href="/news" style={{ color:'var(--ash)', fontSize:'0.85rem', textDecoration:'none', fontFamily:'Cinzel,serif' }}>← Toutes les nouvelles</Link>
        </div>

        {article.image_url && (
          <div style={{ height:'clamp(200px,40vw,360px)', overflow:'hidden', borderRadius:2, marginBottom:'2rem', border:'1px solid rgba(201,168,76,0.2)' }}>
            <img src={article.image_url} alt={article.titre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        )}

        <div style={{ marginBottom:'2rem' }}>
          <h1 style={{ color:'var(--gold)', fontSize:'clamp(1.5rem,4vw,2.2rem)', lineHeight:1.2, marginBottom:'0.75rem' }}>{article.titre}</h1>
          <div style={{ color:'var(--ash)', fontSize:'0.85rem', display:'flex', gap:'1.25rem', flexWrap:'wrap' }}>
            {article.mj && <span>🎭 {article.mj.prenom}</span>}
            <span>📅 {new Date(article.created_at).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
          </div>
        </div>

        <div className="card" style={{ padding:'2rem', marginBottom:'2.5rem' }}>
          <p style={{ color:'var(--parchment)', lineHeight:1.9, fontSize:'1.05rem', whiteSpace:'pre-wrap' }}>{article.contenu}</p>
        </div>

        {/* Réactions */}
        <div style={{ marginBottom:'2.5rem' }}>
          <h3 style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.9rem', marginBottom:'1rem', letterSpacing:'0.08em' }}>RÉACTIONS</h3>
          <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
            {REACTIONS.map(emoji => (
              <button key={emoji} onClick={()=>voter(emoji)} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 0.9rem', borderRadius:20, cursor:'pointer', transition:'all 0.2s', background:maReaction===emoji?'rgba(201,168,76,0.25)':'rgba(255,255,255,0.05)', border:`1px solid ${maReaction===emoji?'rgba(201,168,76,0.6)':'rgba(201,168,76,0.2)'}`, fontSize:'1.1rem' }}>
                {emoji}
                {reactionsCount[emoji] > 0 && <span style={{ color:'var(--parchment)', fontSize:'0.82rem', fontFamily:'Cinzel,serif' }}>{reactionsCount[emoji]}</span>}
              </button>
            ))}
          </div>
          {!user && <p style={{ color:'var(--ash)', fontSize:'0.82rem', marginTop:'0.75rem' }}>
            <Link href="/compte" style={{ color:'var(--gold)' }}>Connecte-toi</Link> pour réagir.
          </p>}
        </div>

        {/* Commentaires */}
        <div className="divider"><span>💬</span></div>
        <h3 style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'1rem', marginBottom:'1.25rem' }}>
          {commentaires.length} commentaire{commentaires.length!==1?'s':''}
        </h3>

        {commentaires.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'2rem' }}>
            {commentaires.map(c => (
              <div key={c.id} className="card" style={{ padding:'1.25rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.6rem' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--blood),#3d0000)', border:'1px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', overflow:'hidden', flexShrink:0 }}>
                    {c.users?.avatar_url ? <img src={c.users.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🧙'}
                  </div>
                  <div>
                    <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.85rem' }}>{c.users?.pseudo || 'Aventurier'}</div>
                    <div style={{ color:'var(--ash)', fontSize:'0.75rem' }}>{new Date(c.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</div>
                  </div>
                </div>
                <p style={{ color:'var(--parchment)', lineHeight:1.7, margin:0, whiteSpace:'pre-wrap' }}>{c.contenu}</p>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire commentaire */}
        {user ? (
          <div className="card" style={{ padding:'1.5rem' }}>
            <h4 style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.9rem', marginBottom:'1rem' }}>Laisser un commentaire</h4>
            <textarea className="input-field" value={contenu} onChange={e=>setContenu(e.target.value)} placeholder="Ton commentaire..." style={{ marginBottom:'0.75rem' }} />
            {msg && <div style={{ padding:'0.6rem 1rem', marginBottom:'0.75rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.88rem' }}>{msg.text}</div>}
            <button className="btn-primary" onClick={commenter} disabled={sending}>{sending?'Envoi...':'Commenter'}</button>
          </div>
        ) : (
          <div className="card" style={{ padding:'1.5rem', textAlign:'center' }}>
            <p style={{ color:'var(--ash)', marginBottom:'1rem' }}>Connecte-toi pour laisser un commentaire.</p>
            <Link href="/compte" className="btn-primary">Se connecter</Link>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  const { id } = params
  const [{ data: article }, { data: commentaires }, { data: reactions }] = await Promise.all([
    supabase.from('news').select('*,mj(prenom)').eq('id', id).single(),
    supabase.from('news_commentaires').select('*,users(pseudo,avatar_url)').eq('news_id', id).order('created_at',{ascending:true}),
    supabase.from('news_reactions').select('*').eq('news_id', id)
  ])
  return { props: { article:article||null, commentaires:commentaires||[], reactions:reactions||[] } }
}
