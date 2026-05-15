import Layout from '../components/Layout'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Agenda({ sessions }) {
  const futures = sessions.filter(s => s.statut === 'future').sort((a,b) => new Date(a.date_session)-new Date(b.date_session))
  const passees = sessions.filter(s => s.statut === 'passee').sort((a,b) => new Date(b.date_session)-new Date(a.date_session)).slice(0,10)

  return (
    <Layout>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'3rem 1.5rem' }}>
        <h1 style={{ color:'var(--gold)', fontSize:'2rem', textAlign:'center', marginBottom:'0.5rem' }}>Agenda des Sessions</h1>
        <div className="divider"><span>📅</span></div>

        <section style={{ marginBottom:'3rem' }}>
          <h2 style={{ color:'var(--gold)', fontSize:'1.2rem', marginBottom:'1.25rem' }}>À venir</h2>
          {futures.length === 0 ? (
            <div className="card" style={{ padding:'2rem', textAlign:'center' }}>
              <p style={{ color:'var(--ash)' }}>Aucune session planifiée pour le moment. Revenez bientôt...</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {futures.map(s => <AgendaCard key={s.id} session={s} future />)}
            </div>
          )}
        </section>

        {passees.length > 0 && (
          <section>
            <h2 style={{ color:'var(--gold)', fontSize:'1.2rem', marginBottom:'1.25rem' }}>Sessions récentes</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {passees.map(s => <AgendaCard key={s.id} session={s} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}

function AgendaCard({ session, future }) {
  const d = session.date_session ? new Date(session.date_session) : null
  return (
    <Link href={`/sessions/${session.id}`} style={{ textDecoration:'none' }}>
      <div className="card" style={{ padding:'1.25rem 1.5rem', display:'flex', gap:'1.5rem', alignItems:'center' }}>
        {d && (
          <div style={{ textAlign:'center', minWidth:56, background: future?'rgba(201,168,76,0.1)':'rgba(100,80,80,0.2)', border:`1px solid ${future?'rgba(201,168,76,0.3)':'rgba(139,0,0,0.3)'}`, borderRadius:2, padding:'0.5rem' }}>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'1.3rem', color: future?'var(--gold)':'var(--ash)', lineHeight:1 }}>{d.getDate()}</div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'0.65rem', color:'var(--ash)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              {d.toLocaleDateString('fr-FR',{month:'short'})}
            </div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'0.65rem', color:'var(--ash)', opacity:0.7 }}>{d.getFullYear()}</div>
          </div>
        )}
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.3rem', flexWrap:'wrap' }}>
            <span className={`badge ${future?'badge-future':'badge-past'}`}>{future?'À venir':'Passée'}</span>
            {session.numero && <span style={{ color:'var(--ash)', fontSize:'0.8rem' }}>#{session.numero}</span>}
          </div>
          <div style={{ color:'var(--parchment)', fontFamily:'Cinzel,serif', fontSize:'0.95rem' }}>{session.titre}</div>
          {session.campagnes && <div style={{ color:'var(--gold)', fontSize:'0.78rem', marginTop:'0.2rem', opacity:0.8 }}>{session.campagnes.nom}</div>}
          {session.resume && !future && <div style={{ color:'var(--ash)', fontSize:'0.85rem', marginTop:'0.3rem', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>{session.resume}</div>}
        </div>
        <div style={{ color:'var(--gold)', opacity:0.5, fontSize:'1.2rem', flexShrink:0 }}>›</div>
      </div>
    </Link>
  )
}

export async function getServerSideProps() {
  const { data: sessions } = await supabase.from('sessions').select('*,campagnes(nom)').order('date_session',{ascending:false})
  return { props: { sessions: sessions||[] } }
}
