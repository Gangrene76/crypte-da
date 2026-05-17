import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

const HERO = 'https://djvckwngvnwhftdvarwu.supabase.co/storage/v1/object/public/images/hero.png'
const LOGO = 'https://djvckwngvnwhftdvarwu.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_d03jczd03jczd03j.png'

export default function Home({ sessions, campagnes, mjs, personnages }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const sessionsFutures = sessions.filter(s => s.statut === 'future').slice(0, 3)
  const sessionsPassees = sessions.filter(s => s.statut === 'passee').slice(0, 6)

  return (
    <div style={{ minHeight:'100vh', background:'#0d0b09', color:'#e8d5b0', fontFamily:"'Crimson Text', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --gold: #c9a84c; --blood: #8B0000; --stone: #1a1714; --ash: #9a9090; --parchment: #e8d5b0; }
        html { scroll-behavior: smooth; }
        .cinzel { font-family: 'Cinzel', serif; }
        .nav-link { font-family:'Cinzel',serif; font-size:0.78rem; letter-spacing:0.12em; text-transform:uppercase; color:#e8d5b0; text-decoration:none; opacity:0.8; transition:all 0.2s; }
        .nav-link:hover { color:#c9a84c; opacity:1; }
        .btn-red { background:linear-gradient(135deg,#8B0000,#6b0000); color:#e8d5b0; font-family:'Cinzel',serif; font-size:0.8rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.8rem 2rem; border:1px solid rgba(201,168,76,0.3); border-radius:2px; cursor:pointer; text-decoration:none; display:inline-block; transition:all 0.25s; }
        .btn-red:hover { background:linear-gradient(135deg,#c0392b,#8B0000); border-color:#c9a84c; transform:translateY(-2px); }
        .btn-outline { background:transparent; color:#c9a84c; font-family:'Cinzel',serif; font-size:0.8rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.8rem 2rem; border:1px solid #c9a84c; border-radius:2px; cursor:pointer; text-decoration:none; display:inline-block; transition:all 0.25s; }
        .btn-outline:hover { background:rgba(201,168,76,0.1); transform:translateY(-2px); }
        .card-hover { transition:transform 0.3s, border-color 0.3s; }
        .card-hover:hover { transform:translateY(-6px); border-color:rgba(201,168,76,0.6) !important; }
        .perso-card:hover { transform:translateY(-4px); }
        .perso-card { transition:transform 0.25s; }
        .section-title { font-family:'Cinzel',serif; font-size:clamp(1.6rem,3vw,2.2rem); color:#c9a84c; letter-spacing:0.06em; }
        .divider-gold { display:flex; align-items:center; gap:1rem; margin:1rem 0 2.5rem; }
        .divider-gold::before,.divider-gold::after { content:''; flex:1; height:1px; background:linear-gradient(to right,transparent,#c9a84c,transparent); }
        .divider-gold span { color:#c9a84c; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.8s ease forwards; }
        .fade-up-2 { animation:fadeUp 0.8s 0.2s ease both; }
        .fade-up-3 { animation:fadeUp 0.8s 0.4s ease both; }
        .badge { font-family:'Cinzel',serif; font-size:0.62rem; letter-spacing:0.1em; text-transform:uppercase; padding:0.2rem 0.6rem; border-radius:2px; }
        .badge-future { background:rgba(201,168,76,0.15); color:#c9a84c; border:1px solid rgba(201,168,76,0.4); }
        .badge-past { background:rgba(100,80,80,0.2); color:#c09090; border:1px solid rgba(139,0,0,0.3); }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'0 2rem', height:70, display:'flex', alignItems:'center', justifyContent:'space-between', background: scrolled?'rgba(13,11,9,0.97)':'transparent', borderBottom: scrolled?'1px solid rgba(201,168,76,0.2)':'none', backdropFilter: scrolled?'blur(12px)':'none', transition:'all 0.3s' }}>
        <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <img src={LOGO} alt="D&A" style={{ width:42, height:42, objectFit:'contain', filter:'drop-shadow(0 0 8px rgba(201,168,76,0.5))' }} />
          <div>
            <div className="cinzel" style={{ fontSize:'0.95rem', color:'#c9a84c', letterSpacing:'0.1em', lineHeight:1 }}>La Crypte de D&A</div>
            <div style={{ fontSize:'0.65rem', color:'#9a9090', letterSpacing:'0.18em', marginTop:2 }}>DAVID & ARTHUR</div>
          </div>
        </Link>
        <div style={{ display:'flex', gap:'2rem', alignItems:'center' }}>
          <Link href="/campagnes" className="nav-link">Campagnes</Link>
          <Link href="/agenda" className="nav-link">Agenda</Link>
          <Link href="/mon-personnage" className="nav-link">Mon Personnage</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position:'relative', height:'100vh', minHeight:600, overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url(${HERO})`, backgroundSize:'cover', backgroundPosition:'center 30%', filter:'brightness(0.55)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(13,11,9,0.1) 0%, rgba(13,11,9,0.3) 50%, rgba(13,11,9,0.95) 100%)' }} />
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 1.5rem' }}>
          <div className="fade-up" style={{ marginBottom:'1.5rem' }}>
            <img src={LOGO} alt="Logo D&A" style={{ width:140, filter:'drop-shadow(0 0 30px rgba(201,168,76,0.6))' }} />
          </div>
          <h1 className="cinzel fade-up-2" style={{ fontSize:'clamp(2.5rem,7vw,5rem)', color:'#fff', lineHeight:1.1, marginBottom:'1rem', textShadow:'0 2px 40px rgba(0,0,0,0.8)', fontWeight:900 }}>
            La Crypte de D&A
          </h1>
          <p className="fade-up-2" style={{ fontSize:'clamp(1rem,2vw,1.25rem)', color:'rgba(232,213,176,0.85)', maxWidth:580, lineHeight:1.7, marginBottom:'2.5rem', letterSpacing:'0.02em' }}>
            Les chroniques de nos aventures. Les campagnes de David & Arthur, Maîtres du Jeu.
          </p>
          <div className="fade-up-3" style={{ display:'flex', gap:'1rem', flexWrap:'wrap', justifyContent:'center' }}>
            <Link href="/campagnes" className="btn-red">Voir les campagnes</Link>
            <Link href="/agenda" className="btn-outline">Prochaines sessions</Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:'2rem', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem', opacity:0.5 }}>
          <div className="cinzel" style={{ fontSize:'0.65rem', letterSpacing:'0.2em', color:'#c9a84c' }}>DÉFILER</div>
          <div style={{ width:1, height:40, background:'linear-gradient(to bottom, #c9a84c, transparent)' }} />
        </div>
      </section>

      {/* MJs */}
      <section style={{ padding:'6rem 1.5rem', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'1rem' }}>
          <p className="cinzel" style={{ fontSize:'0.75rem', letterSpacing:'0.3em', color:'#c9a84c', marginBottom:'0.75rem', opacity:0.8 }}>LES MAÎTRES DU JEU</p>
          <h2 className="section-title">David & Arthur</h2>
        </div>
        <div className="divider-gold"><span>✦</span></div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'1.5rem' }}>
          {mjs.map(mj => (
            <div key={mj.id} style={{ background:'rgba(26,23,20,0.8)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2, padding:'2.5rem', textAlign:'center', backdropFilter:'blur(8px)' }}>
              <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,#8B0000,#3d0000)', border:'2px solid rgba(201,168,76,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', fontSize:'2.5rem', overflow:'hidden' }}>
                {mj.avatar_url ? <img src={mj.avatar_url} alt={mj.prenom} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🎭'}
              </div>
              <h3 className="cinzel" style={{ color:'#c9a84c', fontSize:'1.3rem', marginBottom:'0.75rem' }}>{mj.prenom}</h3>
              <p style={{ color:'#9a9090', lineHeight:1.7 }}>{mj.bio || 'Maître du Jeu'}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CAMPAGNES */}
      {campagnes.length > 0 && (
        <section style={{ padding:'4rem 1.5rem 6rem', background:'rgba(0,0,0,0.3)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'1rem' }}>
              <p className="cinzel" style={{ fontSize:'0.75rem', letterSpacing:'0.3em', color:'#c9a84c', marginBottom:'0.75rem', opacity:0.8 }}>NOS ÉPOPÉES</p>
              <h2 className="section-title">Les Campagnes</h2>
            </div>
            <div className="divider-gold"><span>⚔️</span></div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'1.5rem' }}>
              {campagnes.map(c => (
                <Link key={c.id} href={`/campagnes/${c.id}`} style={{ textDecoration:'none' }}>
                  <div className="card-hover" style={{ background:'#1a1714', border:'1px solid rgba(201,168,76,0.15)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:200, background:c.image_url?`url(${c.image_url}) center/cover`:'linear-gradient(135deg,#2a1505,#0d0b09)', position:'relative' }}>
                      {!c.image_url && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4rem', opacity:0.3 }}>⚔️</div>}
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(26,23,20,0.9) 0%, transparent 60%)' }} />
                      <div style={{ position:'absolute', bottom:'1rem', left:'1rem' }}>
                        <span className={`badge ${c.statut==='active'?'badge-future':'badge-past'}`}>{c.statut==='active'?'Active':'Terminée'}</span>
                      </div>
                    </div>
                    <div style={{ padding:'1.25rem 1.5rem' }}>
                      <h3 className="cinzel" style={{ color:'#c9a84c', fontSize:'1.05rem', marginBottom:'0.5rem' }}>{c.nom}</h3>
                      {c.univers && <div style={{ color:'#9a9090', fontSize:'0.8rem', marginBottom:'0.5rem', fontFamily:'Cinzel,serif' }}>🌍 {c.univers}</div>}
                      {c.description && <p style={{ color:'#9a9090', fontSize:'0.9rem', lineHeight:1.6, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{c.description}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign:'center', marginTop:'2.5rem' }}>
              <Link href="/campagnes" className="btn-outline">Toutes les campagnes</Link>
            </div>
          </div>
        </section>
      )}

      {/* PERSONNAGES */}
      {personnages.length > 0 && (
        <section style={{ padding:'6rem 1.5rem', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'1rem' }}>
            <p className="cinzel" style={{ fontSize:'0.75rem', letterSpacing:'0.3em', color:'#c9a84c', marginBottom:'0.75rem', opacity:0.8 }}>LES HÉROS</p>
            <h2 className="section-title">Nos Aventuriers</h2>
          </div>
          <div className="divider-gold"><span>🧙</span></div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'1.25rem', justifyContent:'center' }}>
            {personnages.slice(0,12).map(p => (
              <div key={p.id} className="perso-card" style={{ textAlign:'center', width:130 }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#2a1505,#0d0b09)', border:'2px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.75rem', overflow:'hidden', fontSize:'2rem' }}>
                  {p.avatar_url ? <img src={p.avatar_url} alt={p.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🧙'}
                </div>
                <div className="cinzel" style={{ color:'#e8d5b0', fontSize:'0.82rem', marginBottom:'0.2rem' }}>{p.nom}</div>
                {p.classe && <div style={{ color:'#9a9090', fontSize:'0.72rem' }}>{p.race?`${p.race} `:''}{p.classe}</div>}
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:'2.5rem' }}>
            <Link href="/mon-personnage" className="btn-outline">Créer mon personnage</Link>
          </div>
        </section>
      )}

      {/* SESSIONS RÉCENTES */}
      {sessionsPassees.length > 0 && (
        <section style={{ padding:'4rem 1.5rem 6rem', background:'rgba(0,0,0,0.3)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'1rem' }}>
              <p className="cinzel" style={{ fontSize:'0.75rem', letterSpacing:'0.3em', color:'#c9a84c', marginBottom:'0.75rem', opacity:0.8 }}>LE LIVRE DES CHRONIQUES</p>
              <h2 className="section-title">Dernières Sessions</h2>
            </div>
            <div className="divider-gold"><span>📜</span></div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
              {sessionsPassees.map(s => (
                <Link key={s.id} href={`/sessions/${s.id}`} style={{ textDecoration:'none' }}>
                  <div className="card-hover" style={{ background:'#1a1714', border:'1px solid rgba(201,168,76,0.15)', borderRadius:2, padding:'1.5rem' }}>
                    <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem', alignItems:'center' }}>
                      <span className="badge badge-past">📜 Passée</span>
                      {s.numero && <span style={{ color:'#9a9090', fontSize:'0.8rem' }}>#{s.numero}</span>}
                    </div>
                    <h3 className="cinzel" style={{ color:'#e8d5b0', fontSize:'1rem', marginBottom:'0.5rem', lineHeight:1.3 }}>{s.titre}</h3>
                    {s.campagnes && <div style={{ color:'#c9a84c', fontSize:'0.78rem', marginBottom:'0.5rem', opacity:0.8 }}>{s.campagnes.nom}</div>}
                    {s.date_session && <div style={{ color:'#9a9090', fontSize:'0.82rem' }}>📅 {new Date(s.date_session).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</div>}
                    {s.resume && <p style={{ color:'#9a9090', fontSize:'0.88rem', marginTop:'0.75rem', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{s.resume}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AGENDA */}
      {sessionsFutures.length > 0 && (
        <section style={{ padding:'6rem 1.5rem', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'1rem' }}>
            <p className="cinzel" style={{ fontSize:'0.75rem', letterSpacing:'0.3em', color:'#c9a84c', marginBottom:'0.75rem', opacity:0.8 }}>À VENIR</p>
            <h2 className="section-title">Prochaines Sessions</h2>
          </div>
          <div className="divider-gold"><span>📅</span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {sessionsFutures.map(s => (
              <Link key={s.id} href={`/sessions/${s.id}`} style={{ textDecoration:'none' }}>
                <div className="card-hover" style={{ background:'#1a1714', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2, padding:'1.25rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
                    {s.date_session && (
                      <div style={{ textAlign:'center', minWidth:48, background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:2, padding:'0.4rem 0.6rem' }}>
                        <div className="cinzel" style={{ fontSize:'1.2rem', color:'#c9a84c', lineHeight:1 }}>{new Date(s.date_session).getDate()}</div>
                        <div className="cinzel" style={{ fontSize:'0.6rem', color:'#9a9090', textTransform:'uppercase' }}>{new Date(s.date_session).toLocaleDateString('fr-FR',{month:'short'})}</div>
                      </div>
                    )}
                    <div>
                      <div className="cinzel" style={{ color:'#e8d5b0', fontSize:'0.95rem' }}>{s.titre}</div>
                      {s.campagnes && <div style={{ color:'#c9a84c', fontSize:'0.78rem', opacity:0.8 }}>{s.campagnes.nom}</div>}
                    </div>
                  </div>
                  <span className="badge badge-future">📅 À venir</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:'2rem' }}>
            <Link href="/agenda" className="btn-outline">Voir tout l'agenda</Link>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(201,168,76,0.15)', padding:'3rem 1.5rem', textAlign:'center', background:'linear-gradient(0deg,#0a0805,transparent)' }}>
        <img src={LOGO} alt="logo" style={{ width:60, opacity:0.7, marginBottom:'1rem' }} />
        <div className="cinzel" style={{ fontSize:'0.75rem', color:'#9a9090', letterSpacing:'0.2em', marginBottom:'0.5rem' }}>✦ LA CRYPTE DE D&A ✦</div>
        <div style={{ fontSize:'0.85rem', color:'#9a9090', opacity:0.5 }}>David & Arthur — Maîtres du Jeu</div>
      </footer>
    </div>
  )
}

export async function getServerSideProps() {
  const [{ data: mjs }, { data: campagnes }, { data: sessions }, { data: personnages }] = await Promise.all([
    supabase.from('mj').select('*'),
    supabase.from('campagnes').select('*').order('created_at',{ascending:false}),
    supabase.from('sessions').select('*,campagnes(nom)').order('date_session',{ascending:false}),
    supabase.from('personnages').select('*').limit(12)
  ])
  return { props: { mjs:mjs||[], campagnes:campagnes||[], sessions:sessions||[], personnages:personnages||[] } }
}
