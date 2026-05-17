import Layout from '../../components/Layout'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SessionDetail({ session, campagne, medias, commentaires: initCommentaires, personnages }) {
  const [commentaires, setCommentaires] = useState(initCommentaires)
  const [persoId, setPersoId] = useState('')
  const [mdp, setMdp] = useState('')
  const [note, setNote] = useState(0)
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState(null)
  const [etape, setEtape] = useState(1) // 1=choisir perso, 2=note+commentaire

  if (!session) return <Layout><div style={{padding:'3rem',textAlign:'center',color:'var(--ash)'}}>Session introuvable.</div></Layout>

  const approuves = commentaires.filter(c => c.approuve)
  const moyenneNote = approuves.filter(c=>c.note).length > 0
    ? (approuves.filter(c=>c.note).reduce((acc,c)=>acc+c.note,0)/approuves.filter(c=>c.note).length).toFixed(1) : null

  const persoSelectionne = personnages.find(p => p.id === persoId)

  const validerPerso = async () => {
    setMsg(null)
    if (!persoId) { setMsg({ type:'error', text:'Choisissez votre personnage.' }); return }
    if (!mdp) { setMsg({ type:'error', text:'Entrez votre mot de passe.' }); return }
    const { data } = await supabase.from('personnages').select('id,mot_de_passe').eq('id', persoId).single()
    if (!data || data.mot_de_passe !== mdp) { setMsg({ type:'error', text:'Mot de passe incorrect.' }); return }
    setEtape(2); setMsg(null)
  }

  const handleSubmit = async () => {
    setSending(true); setMsg(null)
    const { error } = await supabase.from('commentaires').insert({
      session_id: session.id,
      pseudo: persoSelectionne?.nom || 'Aventurier',
      note: note||null,
      contenu: contenu.trim()||null,
      personnage_id: persoId||null,
      approuve: false
    })
    if (error) setMsg({ type:'error', text:'Erreur lors de l\'envoi.' })
    else {
      setMsg({ type:'success', text:'Merci ! Votre retour sera visible après validation par le MJ.' })
      setPersoId(''); setMdp(''); setNote(0); setContenu(''); setEtape(1)
    }
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

        {/* Header */}
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
          {session.date_session && <div style={{ color:'var(--ash)', fontSize:'0.9rem', fontFamily:'Cinzel,serif' }}>📅 {new Date(session.date_session).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>}
        </div>

        {/* Image de couverture */}
        {session.image_url && (
          <div style={{ height:320, overflow:'hidden', borderRadius:2, marginBottom:'2rem', border:'1px solid rgba(201,168,76,0.2)', position:'relative' }}>
            <img src={session.image_url} alt={session.titre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(26,23,20,0.6) 0%, transparent 50%)' }} />
          </div>
        )}

        {/* Résumé */}
        {session.resume && (
          <div className="card" style={{ padding:'2rem', marginBottom:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'1rem' }}>Chronique</h2>
            <p style={{ color:'var(--parchment)', lineHeight:1.9, fontSize:'1.05rem', whiteSpace:'pre-wrap' }}>{session.resume}</p>
          </div>
        )}

        {/* Personnages présents */}
        {personnages.length > 0 && (
          <div style={{ marginBottom:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'0.75rem' }}>Héros présents</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem' }}>
              {personnages.map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2, padding:'0.4rem 0.75rem' }}>
                  {p.avatar_url ? <img src={p.avatar_url} alt={p.nom} style={{ width:24, height:24, borderRadius:'50%', objectFit:'cover' }} /> : <span>🧙</span>}
                  <span style={{ color:'var(--parchment)', fontSize:'0.85rem', fontFamily:'Cinzel,serif' }}>{p.nom}</span>
                  {p.classe && <span style={{ color:'var(--ash)', fontSize:'0.75rem' }}>({[p.race,p.classe,p.niveau?`niv.${p.niveau}`:null].filter(Boolean).join(' ')})</span>}
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
                    <img src={m.url} alt={m.legende||''} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                  {m.legende && <div style={{ color:'var(--ash)', fontSize:'0.75rem', marginTop:'0.3rem', textAlign:'center' }}>{m.legende}</div>}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Commentaires */}
        <div className="divider"><span>💬</span></div>
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

        {/* Formulaire commentaire */}
        {session.statut === 'passee' && (
          <div className="card" style={{ padding:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'1.5rem' }}>Laisser un retour</h2>

            {/* Étape 1 : choisir personnage */}
            {etape === 1 && (
              <>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.5rem' }}>Votre personnage *</label>
                  {personnages.length > 0 ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                      {personnages.map(p => (
                        <button key={p.id} onClick={()=>{ setPersoId(p.id); setMsg(null) }} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', borderRadius:2, cursor:'pointer', transition:'all 0.2s', background:persoId===p.id?'rgba(201,168,76,0.15)':'rgba(255,255,255,0.02)', border:`1px solid ${persoId===p.id?'rgba(201,168,76,0.6)':'rgba(201,168,76,0.15)'}`, textAlign:'left', width:'100%' }}>
                          {p.avatar_url ? <img src={p.avatar_url} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} /> : <span style={{ fontSize:'1.5rem', flexShrink:0 }}>🧙</span>}
                          <div>
                            <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.9rem' }}>{p.nom}</div>
                            <div style={{ color:'var(--ash)', fontSize:'0.78rem' }}>{[p.race,p.classe,p.niveau?`Niv.${p.niveau}`:null].filter(Boolean).join(' · ')}</div>
                          </div>
                          {persoId===p.id && <span style={{ marginLeft:'auto', color:'var(--gold)' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color:'var(--ash)', fontSize:'0.9rem', padding:'1rem', background:'rgba(255,255,255,0.02)', borderRadius:2, border:'1px solid rgba(201,168,76,0.15)' }}>
                      Aucun personnage dans cette campagne.
                    </div>
                  )}
                  <div style={{ marginTop:'0.75rem', textAlign:'center' }}>
                    <Link href="/mon-personnage" style={{ color:'var(--gold)', fontSize:'0.85rem', fontFamily:'Cinzel,serif', opacity:0.8 }}>
                      + Créer mon personnage
                    </Link>
                  </div>
                </div>
                <div style={{ marginBottom:'1.25rem' }}>
                  <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Mot de passe *</label>
                  <input className="input-field" type="password" value={mdp} onChange={e=>setMdp(e.target.value)} placeholder="Votre mot de passe personnage..." />
                </div>
                {msg && <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:'rgba(139,0,0,0.2)', color:'#e07070', fontSize:'0.9rem' }}>{msg.text}</div>}
                <button className="btn-primary" onClick={validerPerso}>Continuer →</button>
              </>
            )}

            {/* Étape 2 : note + commentaire */}
            {etape === 2 && (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem', background:'rgba(201,168,76,0.08)', padding:'0.75rem 1rem', borderRadius:2 }}>
                  {persoSelectionne?.avatar_url ? <img src={persoSelectionne.avatar_url} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover' }} /> : <span style={{ fontSize:'1.5rem' }}>🧙</span>}
                  <span style={{ color:'var(--gold)', fontFamily:'Cinzel,serif' }}>{persoSelectionne?.nom}</span>
                  <button onClick={()=>{ setEtape(1); setMsg(null) }} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--ash)', cursor:'pointer', fontSize:'0.8rem', fontFamily:'Cinzel,serif' }}>Changer</button>
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.4rem' }}>Note (facultatif)</label>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={()=>setNote(note===n?0:n)} style={{ fontSize:'1.5rem', background:'none', border:'none', cursor:'pointer', opacity:n<=note?1:0.3, transition:'opacity 0.2s' }}>🎲</button>
                    ))}
                    {note > 0 && <span style={{ color:'var(--ash)', fontSize:'0.85rem', alignSelf:'center' }}>{note}/5</span>}
                  </div>
                </div>
                <div style={{ marginBottom:'1.25rem' }}>
                  <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.4rem' }}>Votre retour (facultatif)</label>
                  <textarea className="input-field" value={contenu} onChange={e=>setContenu(e.target.value)} placeholder="Racontez votre ressenti sur cette session..." />
                </div>
                {msg && <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{msg.text}</div>}
                <button className="btn-primary" onClick={handleSubmit} disabled={sending}>{sending?'Envoi...':'Envoyer mon retour'}</button>
              </>
            )}
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
    supabase.from('commentaires').select('*').eq('session_id', id).order('created_at',{ascending:true})
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
