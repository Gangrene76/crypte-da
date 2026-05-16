import Layout from '../components/Layout'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home({ sessions, campagnes, mjs }) {
  const sessionsFutures = sessions.filter(s => s.statut === 'future').slice(0, 3)
  const sessionsPassees = sessions.filter(s => s.statut === 'passee').slice(0, 6)

  return (
    <Layout>
      <section style={{ minHeight:'55vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 1.5rem',background:'linear-gradient(180deg,#0d0b09 0%,var(--stone) 100%)',position:'relative' }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(ellipse at center,rgba(139,0,0,0.08) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'relative',maxWidth:700 }} className="fade-in">
<<<<<<< HEAD
          <img src="https://djvckwngvnwhftdvarwu.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_d03jczd03jczd03j.png" alt="D&A Logo" style={{ width:320, maxWidth:'85%', margin:'0 auto 1.5rem', display:'block', filter:'drop-shadow(0 0 30px rgba(201,168,76,0.5))' }} />
=======
          <div style={{ fontSize:'3rem',marginBottom:'1rem' }}/><img src="https://djvckwngvnwhftdvarwu.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_d03jczd03jczd03j.png" alt="logo" style={{width:320,maxWidth:'85%',margin:'0 auto 1.5rem',display:'block'}} />
>>>>>>> 20d5713e42e69af18c9dcaf56a56aaac58e64aee
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)',color:'var(--gold)',marginBottom:'0.5rem',lineHeight:1.1 }}>La Crypte de D&A</h1>
          <div style={{ fontFamily:'Cinzel,serif',fontSize:'0.8rem',letterSpacing:'0.3em',color:'var(--ash)',marginBottom:'2rem',textTransform:'uppercase' }}>David & Arthur — Maîtres du Jeu</div>
          <p style={{ color:'var(--parchment)',opacity:0.8,fontSize:'1.1rem',lineHeight:1.7,marginBottom:'2.5rem' }}>Bienvenue dans notre antre. Ici s'écrivent les chroniques de nos aventures, les récits de nos campagnes, les hauts faits et les trépas de nos héros.</p>
          <div style={{ display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap' }}>
            <Link href="/campagnes" className="btn-primary">Voir les campagnes</Link>
            <Link href="/agenda" className="btn-gold">Prochaines sessions</Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth:1200,margin:'0 auto',padding:'3rem 1.5rem' }}>
        <h2 style={{ textAlign:'center',color:'var(--gold)',fontSize:'1.4rem',marginBottom:'0.5rem' }}>Les Maîtres du Jeu</h2>
        <div className="divider"><span>✦</span></div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',marginTop:'2rem' }}>
          {mjs.map(mj => (
            <div key={mj.id} className="card" style={{ padding:'2rem',textAlign:'center' }}>
              <div style={{ width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,var(--blood) 0%,#3d0000 100%)',border:'2px solid rgba(201,168,76,0.4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',fontSize:'2rem',overflow:'hidden' }}>
                {mj.avatar_url ? <img src={mj.avatar_url} alt={mj.prenom} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : '🎭'}
              </div>
              <h3 style={{ color:'var(--gold)',fontSize:'1.2rem',marginBottom:'0.5rem' }}>{mj.prenom}</h3>
              <p style={{ color:'var(--ash)',fontSize:'0.95rem',lineHeight:1.6 }}>{mj.bio || 'Maître du Jeu'}</p>
            </div>
          ))}
        </div>
      </section>

      {sessionsFutures.length > 0 && (
        <section style={{ maxWidth:1200,margin:'0 auto',padding:'1rem 1.5rem 3rem' }}>
          <h2 style={{ textAlign:'center',color:'var(--gold)',fontSize:'1.4rem',marginBottom:'0.5rem' }}>Prochaines Sessions</h2>
          <div className="divider"><span>📅</span></div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1rem',marginTop:'1.5rem' }}>
            {sessionsFutures.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
          <div style={{ textAlign:'center',marginTop:'2rem' }}><Link href="/agenda" className="btn-gold">Voir tout l'agenda</Link></div>
        </section>
      )}

      {sessionsPassees.length > 0 && (
        <section style={{ maxWidth:1200,margin:'0 auto',padding:'1rem 1.5rem 4rem' }}>
          <h2 style={{ textAlign:'center',color:'var(--gold)',fontSize:'1.4rem',marginBottom:'0.5rem' }}>Dernières Chroniques</h2>
          <div className="divider"><span>📜</span></div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1rem',marginTop:'1.5rem' }}>
            {sessionsPassees.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
          <div style={{ textAlign:'center',marginTop:'2rem' }}><Link href="/campagnes" className="btn-primary">Toutes les campagnes</Link></div>
        </section>
      )}

      {sessions.length === 0 && (
        <section style={{ maxWidth:600,margin:'2rem auto',padding:'3rem 1.5rem',textAlign:'center' }}>
          <div className="card" style={{ padding:'3rem' }}>
            <div style={{ fontSize:'3rem',marginBottom:'1rem' }}>🗺️</div>
            <h3 style={{ color:'var(--gold)',marginBottom:'1rem' }}>L'aventure commence...</h3>
            <p style={{ color:'var(--ash)',marginBottom:'2rem' }}>Aucune session n'a encore été ajoutée. Rendez-vous dans l'espace admin pour créer vos premières campagnes.</p>
            <Link href="/admin" className="btn-primary">Accéder à l'admin</Link>
          </div>
        </section>
      )}
    </Layout>
  )
}

function SessionCard({ session }) {
  return (
    <Link href={`/sessions/${session.id}`} style={{ textDecoration:'none' }}>
      <div className="card" style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem' }}>
          <span className={`badge ${session.statut==='future'?'badge-future':'badge-past'}`}>{session.statut==='future'?'📅 À venir':'📜 Passée'}</span>
          {session.numero && <span style={{ color:'var(--ash)',fontSize:'0.8rem' }}>#{session.numero}</span>}
        </div>
        <h3 style={{ color:'var(--parchment)',fontSize:'1.1rem',marginBottom:'0.5rem',lineHeight:1.3 }}>{session.titre}</h3>
        {session.campagnes && <div style={{ color:'var(--gold)',fontSize:'0.8rem',fontFamily:'Cinzel,serif',marginBottom:'0.5rem',opacity:0.8 }}>{session.campagnes.nom}</div>}
        {session.date_session && <div style={{ color:'var(--ash)',fontSize:'0.85rem' }}>{new Date(session.date_session).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</div>}
        {session.resume && <p style={{ color:'var(--ash)',fontSize:'0.9rem',marginTop:'0.75rem',lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical' }}>{session.resume}</p>}
      </div>
    </Link>
  )
}

export async function getServerSideProps() {
  const [{ data: mjs }, { data: campagnes }, { data: sessions }] = await Promise.all([
    supabase.from('mj').select('*'),
    supabase.from('campagnes').select('*'),
    supabase.from('sessions').select('*,campagnes(nom)').order('date_session',{ ascending:false })
  ])
  return { props: { mjs:mjs||[], campagnes:campagnes||[], sessions:sessions||[] } }
}
