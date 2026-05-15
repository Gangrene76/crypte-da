import Layout from '../../components/Layout'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SessionDetail({ session, campagne, medias, commentaires: initCommentaires, personnages }) {
  const [commentaires, setCommentaires] = useState(initCommentaires)
  const [pseudo, setPseudo] = useState('')
  const [note, setNote] = useState(0)
  const [contenu, setContenu] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState(null)

  if (!session) return <Layout><div style={{padding:'3rem',textAlign:'center',color:'var(--ash)'}}>Session introuvable.</div></Layout>

  const approuves = commentaires.filter(c => c.approuve)
  const moyenneNote = approuves.filter(c => c.note).length > 0
    ? (approuves.filter(c=>c.note).reduce((acc,c) => acc+c.note, 0) / approuves.filter(c=>c.note).length).toFixed(1)
    : null

  const handleSubmit = async () => {
    if (!pseudo.trim() || !code.trim()) { setMsg({ type:'error', text:'Pseudo et code d\'invitation requis.' }); return }
    setSending(true); setMsg(null)
    const { data: codeData } = await supabase.from('codes_invitation').select('*').eq('code', code.trim().toUpperCase()).eq('campagne_id', campagne.id).eq('actif', true).single()
    if (!codeData) { setMsg({ type:'error', text:'Code d\'invitation invalide ou inactif.' }); setSending(false); return }
    const { error } = await supabase.from('commentaires').insert({ session_id: session.id, pseudo: pseudo.trim(), note: note||null, contenu: contenu.trim()||null, code_utilise: code.trim().toUpperCase(), approuve: false })
    if (error) { setMsg({ type:'error', text:'Erreur lors de l\'envoi.' }) }
    else { setMsg({ type:'success', text:'Merci ! Votre retour sera visible après validation par le MJ.' }); setPseudo(''); setNote(0); setContenu(''); setCode('') }
    setSending(false)
  }

  return (
    <Layout>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'3rem 1.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom:'1.5rem', display:'flex', gap:'0.5rem', alignItems:'center', fontSize:'0.85rem', color:'var(--ash)', fontFamily:'Cinzel,serif' }}>
          <Link href="/campagnes" style={{ color:'var(--ash)', textDecoration:'none' }}>Campagnes</Link>
          <span>›</span>
          {campagne && <Link href={`/campagnes/${campagne.id}`} style={{ color:'var(--ash)', textDecoration:'none' }}>{campagne.nom}</Link>}
          <span>›</span>
          <span style={{ color:'var(--gold)' }}>{session.titre}</span>
        </div>

        {/* Header session */}
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap' }}>
            <span className={`badge ${session.statut==='future'?'badge-future':'badge-past'}`}>{session.statut==='future'?'📅 À venir':'📜 Session passée'}</span>
            {session.numero && <span style={{ color:'var(--ash)', fontFamily:'Cinzel,serif', fontSize:'0.85rem' }}>Session #{session.numero}</span>}
            {moyenneNote && (
              <span style={{ display:'flex', alignItems:'center', gap:'0.3rem', color:'var(--gold)', fontSize:'0.9rem' }}>
                {'🎲'.repeat(Math.round(moyenneNote))} {moyenneNote}/5
                <span style={{ color:'var(--ash)', fontSize:'0.75rem' }}>({approuves.filter(c=>c.note).length} vote{approuves.filter(c=>c.note).length>1?'s':''})</span>
              </span>
            )}
          </div>
          <h1 style={{ color:'var(--gold)', fontSize:'clamp(1.5rem,3vw,2.2rem)', lineHeight:1.2, marginBottom:'0.75rem' }}>{session.titre}</h1>
          {session.date_session && (
            <div style={{ color:'var(--ash)', fontSize:'0.9rem', fontFamily:'Cinzel,serif' }}>
              📅 {new Date(session.date_session).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </div>
          )}
        </div>

        {/* Résumé */}
        {session.resume && (
          <div className="card" style={{ padding:'2rem', marginBottom:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'1rem' }}>Chronique</h2>
            <p style={{ color:'var(--parchment)', lineHeight:1.9, fontSize:'1.05rem', whiteSpace:'pre-wrap' }}>{session.resume}</p>
          </div>
        )}

        {/* Personnages impliqués */}
        {personnages.length > 0 && (
          <div style={{ marginBottom:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'0.75rem' }}>Héros présents</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem' }}>
              {personnages.map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2, padding:'0.4rem 0.75rem' }}>
                  <span style={{ fontSize:'1rem' }}>{p.avatar_url ? <img src={p.avatar_url} alt={p.nom} style={{ width:24, height:24, borderRadius:'50%', objectFit:'cover' }} /> : '🧙'}</span>
                  <span style={{ color:'var(--parchment)', fontSize:'0.85rem', fontFamily:'Cinzel,serif' }}>{p.nom}</span>
                  {p.classe && <span style={{ color:'var(--ash)', fontSize:'0.75rem' }}>({p.classe})</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Médias */}
        {medias.length > 0 && (
          <div style={{ marginBottom:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'0.75rem' }}>Illustrations & Cartes</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'0.75rem' }}>
              {medias.map(m => (
                <a key={m.id} href={m.url} target="_blank" rel="noreferrer">
                  <div style={{ borderRadius:2, overflow:'hidden', border:'1px solid rgba(201,168,76,0.2)', aspectRatio:'4/3' }}>
                    <img src={m.url} alt={m.legende||'Illustration'} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s' }}
                      onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                      onMouseLeave={e=>e.target.style.transform='scale(1)'} />
                  </div>
                  {m.legende && <div style={{ color:'var(--ash)', fontSize:'0.75rem', marginTop:'0.3rem', textAlign:'center' }}>{m.legende}</div>}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Commentaires */}
        <div className="divider"><span>💬</span></div>

        {/* Commentaires approuvés */}
        {approuves.length > 0 && (
          <div style={{ marginBottom:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'1rem' }}>Retours des Aventuriers</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {approuves.map(c => (
                <div key={c.id} className="card" style={{ padding:'1.25rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.5rem' }}>
                    <span style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.9rem' }}>⚔️ {c.pseudo}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      {c.note && <span style={{ color:'var(--gold)' }}>{'🎲'.repeat(c.note)}</span>}
                      <span style={{ color:'var(--ash)', fontSize:'0.75rem' }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  {c.contenu && <p style={{ color:'var(--parchment)', lineHeight:1.7, margin:0 }}>{c.contenu}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire */}
        {session.statut === 'passee' && (
          <div className="card" style={{ padding:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'1.5rem' }}>Laisser un retour</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
              <div>
                <label style={{ display:'block', color:'var(--ash)', fontSize:'0.8rem', fontFamily:'Cinzel,serif', marginBottom:'0.4rem', letterSpacing:'0.08em' }}>Votre pseudo *</label>
                <input className="input-field" value={pseudo} onChange={e=>setPseudo(e.target.value)} placeholder="Nom de votre personnage..." />
              </div>
              <div>
                <label style={{ display:'block', color:'var(--ash)', fontSize:'0.8rem', fontFamily:'Cinzel,serif', marginBottom:'0.4rem', letterSpacing:'0.08em' }}>Code d'invitation *</label>
                <input className="input-field" value={code} onChange={e=>setCode(e.target.value)} placeholder="Ex: DRAGON42" style={{ textTransform:'uppercase' }} />
              </div>
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.8rem', fontFamily:'Cinzel,serif', marginBottom:'0.4rem', letterSpacing:'0.08em' }}>Note (facultatif)</label>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={()=>setNote(note===n?0:n)} style={{ fontSize:'1.5rem', background:'none', border:'none', cursor:'pointer', opacity:n<=note?1:0.3, transition:'opacity 0.2s' }}>🎲</button>
                ))}
                {note > 0 && <span style={{ color:'var(--ash)', fontSize:'0.85rem', alignSelf:'center' }}>{note}/5</span>}
              </div>
            </div>
            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.8rem', fontFamily:'Cinzel,serif', marginBottom:'0.4rem', letterSpacing:'0.08em' }}>Votre retour (facultatif)</label>
              <textarea className="input-field" value={contenu} onChange={e=>setContenu(e.target.value)} placeholder="Racontez votre ressenti sur cette session..." />
            </div>
            {msg && (
              <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', border:`1px solid ${msg.type==='error'?'rgba(139,0,0,0.4)':'rgba(40,120,40,0.4)'}`, color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>
                {msg.text}
              </div>
            )}
            <button className="btn-primary" onClick={handleSubmit} disabled={sending}>{sending?'Envoi...':'Envoyer mon retour'}</button>
            <p style={{ color:'var(--ash)', fontSize:'0.8rem', marginTop:'0.75rem' }}>Votre retour sera visible après validation par le Maître du Jeu.</p>
          </div>
        )}

        {session.statut === 'future' && (
          <div className="card" style={{ padding:'2rem', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>⏳</div>
            <p style={{ color:'var(--ash)' }}>Les retours seront disponibles après la session.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  const { id } = params
  const [{ data: session }, { data: medias }, { data: commentaires }] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', id).single(),
    supabase.from('medias').select('*').eq('session_id', id),
    supabase.from('commentaires').select('*').eq('session_id', id).order('created_at', { ascending: true })
  ])
  let campagne = null, personnages = []
  if (session?.campagne_id) {
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from('campagnes').select('*').eq('id', session.campagne_id).single(),
      supabase.from('personnages').select('*').eq('campagne_id', session.campagne_id)
    ])
    campagne = c; personnages = p||[]
  }
  return { props: { session:session||null, campagne:campagne||null, medias:medias||[], commentaires:commentaires||[], personnages } }
}
