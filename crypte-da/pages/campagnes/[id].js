import Layout from '../../components/Layout'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function CampagneDetail({ campagne, mj, sessions, personnages }) {
  if (!campagne) return <Layout><div style={{padding:'3rem',textAlign:'center',color:'var(--ash)'}}>Campagne introuvable.</div></Layout>

  const sessionsFutures = sessions.filter(s => s.statut === 'future')
  const sessionsPassees = sessions.filter(s => s.statut === 'passee')

  return (
    <Layout>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'3rem 1.5rem' }}>
        {/* Header campagne */}
        <div style={{ marginBottom:'2rem' }}>
          <Link href="/campagnes" style={{ color:'var(--ash)', fontSize:'0.85rem', textDecoration:'none', fontFamily:'Cinzel,serif' }}>← Toutes les campagnes</Link>
        </div>
        {campagne.image_url && (
          <div style={{ height:280, overflow:'hidden', borderRadius:2, marginBottom:'2rem', border:'1px solid rgba(201,168,76,0.2)' }}>
            <img src={campagne.image_url} alt={campagne.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        )}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom:'1.5rem' }}>
          <div>
            <h1 style={{ color:'var(--gold)', fontSize:'clamp(1.5rem,3vw,2.2rem)', marginBottom:'0.5rem' }}>{campagne.nom}</h1>
            {campagne.univers && <div style={{ fontFamily:'Cinzel,serif', fontSize:'0.8rem', color:'var(--ash)', letterSpacing:'0.1em' }}>🌍 {campagne.univers}</div>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5rem' }}>
            <span className={`badge ${campagne.statut==='active'?'badge-active':campagne.statut==='terminee'?'badge-terminee':'badge-past'}`}>
              {campagne.statut==='active'?'Active':campagne.statut==='terminee'?'Terminée':'En pause'}
            </span>
            {mj && <span style={{ color:'var(--gold)', fontSize:'0.85rem', fontFamily:'Cinzel,serif' }}>MJ : {mj.prenom}</span>}
          </div>
        </div>
        {campagne.description && (
          <div className="card" style={{ padding:'1.5rem', marginBottom:'2rem' }}>
            <p style={{ color:'var(--parchment)', lineHeight:1.8, fontSize:'1.05rem' }}>{campagne.description}</p>
          </div>
        )}

        {/* Personnages */}
        {personnages.length > 0 && (
          <section style={{ marginBottom:'3rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.2rem', marginBottom:'0.5rem' }}>Personnages</h2>
            <div className="divider"><span>🧙</span></div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', marginTop:'1rem' }}>
              {personnages.map(p => (
                <div key={p.id} className="card" style={{ padding:'1rem', minWidth:160, textAlign:'center' }}>
                  <div style={{ width:50, height:50, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.5rem', fontSize:'1.4rem', overflow:'hidden' }}>
                    {p.avatar_url ? <img src={p.avatar_url} alt={p.nom} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} /> : '🧙'}
                  </div>
                  <div style={{ color:'var(--parchment)', fontFamily:'Cinzel,serif', fontSize:'0.85rem' }}>{p.nom}</div>
                  {p.classe && <div style={{ color:'var(--ash)', fontSize:'0.75rem', marginTop:'0.2rem' }}>{p.classe}</div>}
                  {p.joueur_nom && <div style={{ color:'var(--gold)', fontSize:'0.7rem', marginTop:'0.2rem', opacity:0.8 }}>Joué par {p.joueur_nom}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sessions futures */}
        {sessionsFutures.length > 0 && (
          <section style={{ marginBottom:'3rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.2rem', marginBottom:'0.5rem' }}>Prochaines Sessions</h2>
            <div className="divider"><span>📅</span></div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginTop:'1rem' }}>
              {sessionsFutures.map(s => <SessionRow key={s.id} session={s} />)}
            </div>
          </section>
        )}

        {/* Sessions passées */}
        {sessionsPassees.length > 0 && (
          <section>
            <h2 style={{ color:'var(--gold)', fontSize:'1.2rem', marginBottom:'0.5rem' }}>Chroniques</h2>
            <div className="divider"><span>📜</span></div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginTop:'1rem' }}>
              {sessionsPassees.map(s => <SessionRow key={s.id} session={s} />)}
            </div>
          </section>
        )}

        {sessions.length === 0 && (
          <div className="card" style={{ padding:'2rem', textAlign:'center' }}>
            <p style={{ color:'var(--ash)' }}>Aucune session pour cette campagne pour le moment.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

function SessionRow({ session }) {
  return (
    <Link href={`/sessions/${session.id}`} style={{ textDecoration:'none' }}>
      <div className="card" style={{ padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          {session.numero && <span style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.9rem', minWidth:30 }}>#{session.numero}</span>}
          <div>
            <div style={{ color:'var(--parchment)', fontFamily:'Cinzel,serif', fontSize:'0.95rem' }}>{session.titre}</div>
            {session.resume && <div style={{ color:'var(--ash)', fontSize:'0.85rem', marginTop:'0.2rem', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>{session.resume}</div>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexShrink:0 }}>
          {session.date_session && <span style={{ color:'var(--ash)', fontSize:'0.82rem' }}>{new Date(session.date_session).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}</span>}
          <span className={`badge ${session.statut==='future'?'badge-future':'badge-past'}`}>{session.statut==='future'?'À venir':'Passée'}</span>
        </div>
      </div>
    </Link>
  )
}

export async function getServerSideProps({ params }) {
  const { id } = params
  const [{ data: campagne }, { data: sessions }, { data: personnages }] = await Promise.all([
    supabase.from('campagnes').select('*').eq('id', id).single(),
    supabase.from('sessions').select('*').eq('campagne_id', id).order('date_session', { ascending: false }),
    supabase.from('personnages').select('*').eq('campagne_id', id)
  ])
  let mj = null
  if (campagne?.mj_id) {
    const { data } = await supabase.from('mj').select('*').eq('id', campagne.mj_id).single()
    mj = data
  }
  return { props: { campagne: campagne||null, mj: mj||null, sessions: sessions||[], personnages: personnages||[] } }
}
