import Layout from '../../components/Layout'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'

export default function SessionDetail({ session, campagne, medias, commentaires: initCommentaires, inscriptions: initInscriptions }) {
  const [commentaires, setCommentaires] = useState(initCommentaires)
  const [inscriptions, setInscriptions] = useState(initInscriptions)
  const [user, setUser] = useState(null)
  const [mesPersonnages, setMesPersonnages] = useState([])
  const [persoCommentId, setPersoCommentId] = useState('')
  const [persoInscritId, setPersoInscritId] = useState('')
  const [note, setNote] = useState(0)
  const [contenu, setContenu] = useState('')
  const [msg, setMsg] = useState(null)
  const [msgInscrit, setMsgInscrit] = useState(null)
  const [sending, setSending] = useState(false)
  const [dejaInscrit, setDejaInscrit] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (u) {
      setUser(u)
      loadMesPersonnages(u.id)
      if (session?.statut === 'future') {
        setDejaInscrit(inscriptions.some(i => i.user_id === u.id))
      }
    }
  }, [])

  const loadMesPersonnages = async (userId) => {
    const { data } = await supabase.from('personnages').select('*').eq('user_id', userId)
    setMesPersonnages(data||[])
  }

  if (!session) return <Layout><div style={{padding:'3rem',textAlign:'center',color:'var(--ash)'}}>Session introuvable.</div></Layout>

  const approuves = commentaires.filter(c => c.approuve)
  const moyenneNote = approuves.filter(c=>c.note).length > 0
    ? (approuves.filter(c=>c.note).reduce((acc,c)=>acc+c.note,0)/approuves.filter(c=>c.note).length).toFixed(1) : null

  // Inscription à une session future
  const sInscrire = async () => {
    setMsgInscrit(null)
    if (!user) { setMsgInscrit({ type:'error', text:'Connectez-vous pour vous inscrire.' }); return }
    setSending(true)
    const { error } = await supabase.from('session_inscriptions').insert({ session_id:session.id, user_id:user.id, personnage_id:persoInscritId||null })
    if (error) setMsgInscrit({ type:'error', text:'Erreur lors de l\'inscription.' })
    else {
      const { data } = await supabase.from('session_inscriptions').select('*,users(pseudo,avatar_url),personnages(nom,classe,race,avatar_url)').eq('session_id', session.id)
      setInscriptions(data||[])
      setDejaInscrit(true)
      setMsgInscrit({ type:'success', text:'✅ Inscription confirmée !' })
    }
    setSending(false)
  }

  const seDesinscrire = async () => {
    setSending(true)
    await supabase.from('session_inscriptions').delete().eq('session_id', session.id).eq('user_id', user.id)
    const { data } = await supabase.from('session_inscriptions').select('*,users(pseudo,avatar_url),personnages(nom,classe,race,avatar_url)').eq('session_id', session.id)
    setInscriptions(data||[])
    setDejaInscrit(false)
    setSending(false)
  }

  // Commenter
  const handleSubmit = async () => {
    if (!user) { setMsg({ type:'error', text:'Connectez-vous pour commenter.' }); return }
    setSending(true); setMsg(null)
    const perso = mesPersonnages.find(p => p.id === persoCommentId)
    const { error } = await supabase.from('commentaires').insert({
      session_id:session.id, pseudo:perso?.nom||user.pseudo,
      note:note||null, contenu:contenu.trim()||null,
      personnage_id:persoCommentId||null, approuve:false
    })
    if (error) setMsg({ type:'error', text:'Erreur lors de l\'envoi.' })
    else { setMsg({ type:'success', text:'Merci ! Votre retour sera visible après validation par le MJ.' }); setNote(0); setContenu(''); setPersoCommentId('') }
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
            {moyenneNote && <span style={{ color:'var(--gold)', fontSize:'0.9rem' }}>{'🎲'.repeat(Math.round(moyenneNote))} {moyenneNote}/5</span>}
          </div>
          <h1 style={{ color:'var(--gold)', fontSize:'clamp(1.5rem,3vw,2.2rem)', lineHeight:1.2, marginBottom:'0.75rem' }}>{session.titre}</h1>
          {session.date_session && <div style={{ color:'var(--ash)', fontSize:'0.9rem', fontFamily:'Cinzel,serif' }}>📅 {new Date(session.date_session).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>}
        </div>

        {/* Image */}
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

        {/* INSCRIPTIONS (sessions futures) */}
        {session.statut === 'future' && (
          <div className="card" style={{ padding:'2rem', marginBottom:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'1.25rem' }}>
              Aventuriers inscrits {inscriptions.length > 0 && <span style={{ color:'var(--ash)', fontSize:'0.85rem', fontFamily:'Crimson Text,serif' }}>({inscriptions.length})</span>}
            </h2>

            {inscriptions.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem', marginBottom:'1.5rem' }}>
                {inscriptions.map(i => (
                  <div key={i.id} style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2, padding:'0.5rem 0.75rem' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', overflow:'hidden', background:'rgba(201,168,76,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {i.personnages?.avatar_url ? <img src={i.personnages.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:'1rem' }}>🧙</span>}
                    </div>
                    <div>
                      <div style={{ color:'var(--parchment)', fontFamily:'Cinzel,serif', fontSize:'0.8rem' }}>{i.personnages?.nom || i.users?.pseudo}</div>
                      {i.personnages?.classe && <div style={{ color:'var(--ash)', fontSize:'0.7rem' }}>{i.personnages.classe}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!user ? (
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                <p style={{ color:'var(--ash)', fontSize:'0.9rem' }}>Connectez-vous pour vous inscrire à cette session.</p>
                <Link href="/compte" className="btn-primary" style={{ fontSize:'0.8rem' }}>Se connecter</Link>
              </div>
            ) : dejaInscrit ? (
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                <span style={{ color:'#80d080', fontSize:'0.9rem' }}>✅ Vous êtes inscrit à cette session</span>
                <button onClick={seDesinscrire} disabled={sending} className="btn-danger" style={{ fontSize:'0.75rem', padding:'0.35rem 0.75rem' }}>Se désinscrire</button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.4rem' }}>Avec quel personnage ? (facultatif)</label>
                  <select className="input-field" value={persoInscritId} onChange={e=>setPersoInscritId(e.target.value)} style={{ maxWidth:340 }}>
                    <option value="">— Sans personnage spécifique —</option>
                    {mesPersonnages.map(p => <option key={p.id} value={p.id}>{p.nom}{p.classe?` (${p.classe})`:''}</option>)}
                  </select>
                </div>
                {msgInscrit && <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:msgInscrit.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msgInscrit.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{msgInscrit.text}</div>}
                <button className="btn-gold" onClick={sInscrire} disabled={sending}>⚔️ S'inscrire à cette session</button>
              </div>
            )}
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

        {/* Formulaire commentaire */}
        {session.statut === 'passee' && (
          <div className="card" style={{ padding:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'1.5rem' }}>Laisser un retour</h2>
            {!user ? (
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                <p style={{ color:'var(--ash)' }}>Connectez-vous pour laisser un retour.</p>
                <Link href="/compte" className="btn-primary">Se connecter</Link>
              </div>
            ) : (
              <>
                {mesPersonnages.length > 0 && (
                  <div style={{ marginBottom:'1rem' }}>
                    <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.4rem' }}>Avec quel personnage ? (facultatif)</label>
                    <select className="input-field" value={persoCommentId} onChange={e=>setPersoCommentId(e.target.value)} style={{ maxWidth:340 }}>
                      <option value="">— Commenter en tant que {user.pseudo} —</option>
                      {mesPersonnages.map(p => <option key={p.id} value={p.id}>{p.nom}{p.classe?` (${p.classe})`:''}</option>)}
                    </select>
                  </div>
                )}
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
                <p style={{ color:'var(--ash)', fontSize:'0.8rem', marginTop:'0.75rem' }}>Votre retour sera visible après validation par le MJ.</p>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  const { id } = params
  const [{ data: session }, { data: medias }, { data: commentaires }, { data: inscriptions }] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', id).single(),
    supabase.from('medias').select('*').eq('session_id', id),
    supabase.from('commentaires').select('*').eq('session_id', id).order('created_at',{ascending:true}),
    supabase.from('session_inscriptions').select('*,users(pseudo,avatar_url),personnages(nom,classe,race,avatar_url)').eq('session_id', id)
  ])
  let campagne = null
  if (session?.campagne_id) {
    const { data: c } = await supabase.from('campagnes').select('*').eq('id', session.campagne_id).single()
    campagne = c
  }
  return { props: { session:session||null, campagne:campagne||null, medias:medias||[], commentaires:commentaires||[], inscriptions:inscriptions||[] } }
}
