import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { getUser, logout } from '../lib/auth'

const HERO = 'https://djvckwngvnwhftdvarwu.supabase.co/storage/v1/object/public/images/hero.png'
const LOGO = 'https://djvckwngvnwhftdvarwu.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_d03jczd03jczd03j.png'

export default function Home({ sessions, mjs, newsArticles }) {
  const [scrolled, setScrolled] = useState(false)
  const [subEmail, setSubEmail] = useState('')
  const [subMsg, setSubMsg] = useState(null)
  const [subLoading, setSubLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => { setUser(getUser()) }, [])

  const sAbonner = async () => {
    if (!subEmail.includes('@')) { setSubMsg({ type:'error', text:'Email invalide.' }); return }
    setSubLoading(true)
    const r = await fetch('/api/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:subEmail }) })
    setSubLoading(false)
    if (r.ok) { setSubMsg({ type:'success', text:'✅ Inscription confirmée ! Tu recevras les prochaines nouvelles.' }); setSubEmail('') }
    else setSubMsg({ type:'error', text:'Une erreur est survenue.' })
  }
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => {
    const parallax = () => {
      const el = document.getElementById('hero-bg')
      if (el) el.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.02)`
    }
    window.addEventListener('scroll', parallax, { passive: true })
    return () => window.removeEventListener('scroll', parallax)
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
        .btn-outline { background:transparent; color:#c9a84c; font-family:'Cinzel',serif; font-size:0.8rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.8rem 2rem; border:1px solid #c9a84c; border-radius:2px; cursor:pointer; text-decoration:none; display:inline-block; transition:all 0.25s; }
        .card-hover { transition:transform 0.3s, border-color 0.3s; }
        .card-hover:hover { transform:translateY(-6px); border-color:rgba(201,168,76,0.6) !important; }
        .section-title { font-family:'Cinzel',serif; font-size:clamp(1.4rem,3vw,2.2rem); color:#c9a84c; letter-spacing:0.06em; }
        .divider-gold { display:flex; align-items:center; gap:1rem; margin:1rem 0 2rem; }
        .divider-gold::before,.divider-gold::after { content:''; flex:1; height:1px; background:linear-gradient(to right,transparent,#c9a84c,transparent); }
        .divider-gold span { color:#c9a84c; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.8s ease forwards; }
        .fade-up-2 { animation:fadeUp 0.8s 0.2s ease both; }
        .badge { font-family:'Cinzel',serif; font-size:0.62rem; letter-spacing:0.1em; text-transform:uppercase; padding:0.2rem 0.6rem; border-radius:2px; }
        .badge-future { background:rgba(201,168,76,0.15); color:#c9a84c; border:1px solid rgba(201,168,76,0.4); }
        .badge-past { background:rgba(100,80,80,0.2); color:#c09090; border:1px solid rgba(139,0,0,0.3); }
        .nav-desktop { display:flex; }
        .nav-burger { display:none; }
        .nav-mobile-menu { display:none; }
        @media(max-width:768px){
          .nav-desktop { display:none !important; }
          .nav-burger { display:block !important; }
          .nav-mobile-menu { display:flex !important; }
          .perso-grid { grid-template-columns:1fr !important; }
          .perso-img { min-height:220px !important; }
          .camp-grid { grid-template-columns:1fr !important; }
          .sess-grid { grid-template-columns:1fr !important; }
          .mj-grid { grid-template-columns:1fr !important; }
          .agenda-row { flex-direction:column; gap:0.5rem; }
          .card-hover:hover { transform:none !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'0 1.5rem', height:65, display:'flex', alignItems:'center', justifyContent:'space-between', background:scrolled||menuOpen?'rgba(13,11,9,0.97)':'transparent', borderBottom:(scrolled||menuOpen)?'1px solid rgba(201,168,76,0.2)':'none', backdropFilter:(scrolled||menuOpen)?'blur(12px)':'none', transition:'all 0.3s' }}>
        <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <img src={LOGO} alt="D&A" style={{ width:34, height:34, objectFit:'contain', filter:'drop-shadow(0 0 6px rgba(201,168,76,0.5))' }} />
          <div>
            <div className="cinzel" style={{ fontSize:'0.9rem', color:'#c9a84c', letterSpacing:'0.1em', lineHeight:1 }}>La Crypte de D&A</div>
            <div style={{ fontSize:'0.6rem', color:'#9a9090', letterSpacing:'0.15em' }}>DAVID & ARTHUR</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="nav-desktop" style={{ gap:'1.75rem', alignItems:'center' }}>
          <Link href="/campagnes" className="nav-link">Campagnes</Link>
          <Link href="/agenda" className="nav-link">Agenda</Link>
          <Link href="/personnages" className="nav-link">Aventuriers</Link>
          <Link href="/news" className="nav-link">News</Link>
          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <Link href="/mon-compte" style={{ display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none' }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#8B0000,#3d0000)', border:'1px solid rgba(201,168,76,0.4)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>
                  {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🧙'}
                </div>
                <span className="cinzel" style={{ fontSize:'0.75rem', color:'#c9a84c' }}>{user.pseudo}</span>
              </Link>
              <button onClick={()=>{ logout(); setUser(null) }} style={{ background:'none', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2, color:'#9a9090', fontFamily:'Cinzel,serif', fontSize:'0.7rem', padding:'0.3rem 0.6rem', cursor:'pointer' }}>Quitter</button>
            </div>
          ) : (
            <Link href="/compte" className="nav-link">Connexion</Link>
          )}
        </div>

        {/* Burger mobile */}
        <button className="nav-burger" onClick={()=>setMenuOpen(!menuOpen)} style={{ background:'none', border:'none', color:'#c9a84c', fontSize:'1.4rem', cursor:'pointer', padding:'0.5rem' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{ position:'fixed', top:65, left:0, right:0, zIndex:99, background:'#0d0b09', borderBottom:'1px solid rgba(201,168,76,0.2)', padding:'1.25rem 1.5rem', flexDirection:'column', gap:'1rem' }}>
          {[['/',  'Accueil'], ['/campagnes','Campagnes'], ['/agenda','Agenda'], ['/personnages','Aventuriers'], ['/news','News']].map(([href,label]) => (
            <Link key={href} href={href} onClick={()=>setMenuOpen(false)} style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', letterSpacing:'0.1em', color:'#e8d5b0', textDecoration:'none', textTransform:'uppercase', padding:'0.3rem 0' }}>{label}</Link>
          ))}
          {user ? (
            <>
              <Link href="/mon-compte" onClick={()=>setMenuOpen(false)} style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', color:'#c9a84c', textDecoration:'none', padding:'0.3rem 0' }}>🧙 {user.pseudo}</Link>
              <button onClick={()=>{ logout(); setUser(null); setMenuOpen(false) }} style={{ background:'none', border:'none', color:'#9a9090', fontFamily:'Cinzel,serif', fontSize:'0.85rem', textAlign:'left', cursor:'pointer', padding:'0.3rem 0' }}>Déconnexion</button>
            </>
          ) : (
            <Link href="/compte" onClick={()=>setMenuOpen(false)} style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', color:'#c9a84c', textDecoration:'none', padding:'0.3rem 0' }}>Connexion</Link>
          )}
        </div>
      )}

      {/* HERO */}
      <section style={{ position:'relative', overflow:'hidden', background:'#0d0b09' }}>
        <img id="hero-bg" src={HERO} alt="" style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'contain', objectPosition:'center top', filter:'brightness(0.85)', willChange:'transform', display:'block' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(13,11,9,0.15) 0%, rgba(13,11,9,0.05) 50%, rgba(13,11,9,0.92) 100%)' }} />
        <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'5rem 1.5rem 5rem', minHeight:'85vh' }}>
          <div className="fade-up" style={{ marginBottom:'1.5rem' }}>
            <img src={LOGO} alt="Logo D&A" style={{ width:'clamp(160px,28vw,520px)', filter:'drop-shadow(0 0 40px rgba(201,168,76,0.7))' }} />
          </div>
          <h1 className="cinzel fade-up-2" style={{ fontSize:'clamp(2rem,6vw,5rem)', color:'#fff', lineHeight:1.1, marginBottom:'1rem', textShadow:'0 2px 40px rgba(0,0,0,0.8)', fontWeight:900 }}>
            La Crypte de D&A
          </h1>
          <p className="fade-up-2" style={{ fontSize:'clamp(0.95rem,2vw,1.25rem)', color:'rgba(232,213,176,0.85)', maxWidth:580, lineHeight:1.7, letterSpacing:'0.02em' }}>
            Les chroniques de nos aventures. Les campagnes de David & Arthur, Maîtres du Jeu.
          </p>
        </div>
      </section>

            {/* NEWS */}
      {newsArticles.length > 0 && (
        <section style={{ padding:'4rem 1.5rem 5rem', background:'rgba(0,0,0,0.3)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'1rem' }}>
              <p className="cinzel" style={{ fontSize:'0.72rem', letterSpacing:'0.3em', color:'#c9a84c', marginBottom:'0.75rem', opacity:0.8 }}>ACTUALITÉS</p>
              <h2 className="section-title">Dernières Nouvelles</h2>
            </div>
            <div className="divider-gold"><span>📰</span></div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap:'1.25rem' }}>
              {newsArticles.map(a => (
                <a key={a.id} href={`/news/${a.id}`} style={{ textDecoration:'none' }}>
                  <div className="card-hover" style={{ background:'#1a1714', border:'1px solid rgba(201,168,76,0.15)', borderRadius:2, overflow:'hidden' }}>
                    {a.image_url && (
                      <div style={{ height:160, overflow:'hidden', position:'relative' }}>
                        <img src={a.image_url} alt={a.titre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(26,23,20,0.8) 0%,transparent 60%)' }} />
                      </div>
                    )}
                    <div style={{ padding:'1.25rem' }}>
                      <h3 className="cinzel" style={{ color:'#c9a84c', fontSize:'0.95rem', marginBottom:'0.4rem', lineHeight:1.3 }}>{a.titre}</h3>
                      <div style={{ color:'#9a9090', fontSize:'0.78rem', marginBottom:'0.5rem', display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                        {a.mj && <span>🎭 {a.mj.prenom}</span>}
                        <span>📅 {new Date(a.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</span>
                      </div>
                      <p style={{ color:'#9a9090', fontSize:'0.88rem', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{a.contenu}</p>
                      {a.sondage_question && <div style={{ marginTop:'0.5rem', fontSize:'0.75rem', color:'#c9a84c', fontFamily:'Cinzel,serif' }}>📊 Sondage en cours</div>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div style={{ textAlign:'center', marginTop:'2rem' }}>
              <a href="/news" className="btn-outline">Toutes les nouvelles</a>
            </div>
          </div>
        </section>
      )}

{/* AGENDA */}
      {sessionsFutures.length > 0 && (
        <section style={{ padding:'4rem 1.5rem 5rem', background:'rgba(0,0,0,0.3)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'1rem' }}>
              <p className="cinzel" style={{ fontSize:'0.72rem', letterSpacing:'0.3em', color:'#c9a84c', marginBottom:'0.75rem', opacity:0.8 }}>À VENIR</p>
              <h2 className="section-title">Prochaines Sessions</h2>
            </div>
            <div className="divider-gold"><span>📅</span></div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {sessionsFutures.map(s => (
                <Link key={s.id} href={`/sessions/${s.id}`} style={{ textDecoration:'none' }}>
                  <div className="card-hover" style={{ background:'#1a1714', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2, padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                    <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }} className="agenda-row">
                      {s.date_session && (
                        <div style={{ textAlign:'center', minWidth:46, background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:2, padding:'0.4rem 0.5rem', flexShrink:0 }}>
                          <div className="cinzel" style={{ fontSize:'1.1rem', color:'#c9a84c', lineHeight:1 }}>{new Date(s.date_session).getDate()}</div>
                          <div className="cinzel" style={{ fontSize:'0.6rem', color:'#9a9090', textTransform:'uppercase' }}>{new Date(s.date_session).toLocaleDateString('fr-FR',{month:'short'})}</div>
                        </div>
                      )}
                      <div>
                        <div className="cinzel" style={{ color:'#e8d5b0', fontSize:'0.9rem' }}>{s.titre}</div>
                        {s.campagnes && <div style={{ color:'#c9a84c', fontSize:'0.75rem', opacity:0.8 }}>{s.campagnes.nom}</div>}
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
          </div>
        </section>
      )}

      {/* SESSIONS RÉCENTES */}
      {sessionsPassees.length > 0 && (
        <section style={{ padding:'4rem 1.5rem 5rem' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'1rem' }}>
              <p className="cinzel" style={{ fontSize:'0.72rem', letterSpacing:'0.3em', color:'#c9a84c', marginBottom:'0.75rem', opacity:0.8 }}>LE LIVRE DES CHRONIQUES</p>
              <h2 className="section-title">Dernières Sessions</h2>
            </div>
            <div className="divider-gold"><span>📜</span></div>
            <div className="sess-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
              {sessionsPassees.map(s => (
                <Link key={s.id} href={`/sessions/${s.id}`} style={{ textDecoration:'none' }}>
                  <div className="card-hover" style={{ background:'#1a1714', border:'1px solid rgba(201,168,76,0.15)', borderRadius:2, overflow:'hidden' }}>
                    {s.image_url && (
                      <div style={{ height:150, overflow:'hidden', position:'relative' }}>
                        <img src={s.image_url} alt={s.titre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(26,23,20,0.8) 0%, transparent 60%)' }} />
                      </div>
                    )}
                    <div style={{ padding:'1.25rem' }}>
                      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.6rem', alignItems:'center', flexWrap:'wrap' }}>
                        <span className="badge badge-past">📜 Passée</span>
                        {s.numero && <span style={{ color:'#9a9090', fontSize:'0.8rem' }}>#{s.numero}</span>}
                      </div>
                      <h3 className="cinzel" style={{ color:'#e8d5b0', fontSize:'0.95rem', marginBottom:'0.4rem', lineHeight:1.3 }}>{s.titre}</h3>
                      {s.campagnes && <div style={{ color:'#c9a84c', fontSize:'0.75rem', opacity:0.8 }}>{s.campagnes.nom}</div>}
                      {s.date_session && <div style={{ color:'#9a9090', fontSize:'0.8rem', marginTop:'0.3rem' }}>📅 {new Date(s.date_session).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</div>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MJs */}
      <section style={{ padding:'5rem 1.5rem', background:'rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'1rem' }}>
            <p className="cinzel" style={{ fontSize:'0.72rem', letterSpacing:'0.3em', color:'#c9a84c', marginBottom:'0.75rem', opacity:0.8 }}>LES MAÎTRES DU JEU</p>
            <h2 className="section-title">David & Arthur</h2>
          </div>
          <div className="divider-gold"><span>✦</span></div>
          <div className="mj-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1.5rem', marginTop:'1rem' }}>
            {mjs.map(mj => (
              <div key={mj.id} style={{ background:'rgba(26,23,20,0.8)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2, padding:'2rem', textAlign:'center' }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#8B0000,#3d0000)', border:'2px solid rgba(201,168,76,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:'2.2rem', overflow:'hidden' }}>
                  {mj.avatar_url ? <img src={mj.avatar_url} alt={mj.prenom} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🎭'}
                </div>
                <h3 className="cinzel" style={{ color:'#c9a84c', fontSize:'1.2rem', marginBottom:'0.6rem' }}>{mj.prenom}</h3>
                <p style={{ color:'#9a9090', lineHeight:1.7, fontSize:'0.95rem' }}>{mj.bio || 'Maître du Jeu'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABONNEMENT */}
      <section style={{ padding:'3.5rem 1.5rem', background:'rgba(0,0,0,0.4)', textAlign:'center' }}>
        <div style={{ maxWidth:540, margin:'0 auto' }}>
          <p style={{ fontFamily:'Cinzel,sans-serif', fontSize:'0.72rem', letterSpacing:'0.3em', color:'#c9a84c', marginBottom:'0.75rem', opacity:0.8 }}>RESTEZ INFORMÉ</p>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(1.2rem,3vw,1.6rem)', color:'#c9a84c', marginBottom:'0.75rem' }}>Notifications par email</h2>
          <p style={{ color:'#9a9090', marginBottom:'1.5rem', lineHeight:1.7 }}>Reçois une notification dès qu'une nouvelle est publiée sur la Crypte.</p>
          <div style={{ display:'flex', gap:'0.75rem', maxWidth:420, margin:'0 auto', flexWrap:'wrap', justifyContent:'center' }}>
            <input style={{ flex:1, minWidth:220, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:2, color:'#e8d5b0', padding:'0.7rem 1rem', fontFamily:'Georgia,serif', fontSize:'1rem', outline:'none' }} value={subEmail} onChange={e=>{ setSubEmail(e.target.value); setSubMsg(null) }} onKeyDown={e=>e.key==='Enter'&&sAbonner()} placeholder="ton@email.fr" type="email" />
            <button onClick={sAbonner} disabled={subLoading} className="btn-red" style={{ flexShrink:0, padding:'0.7rem 1.5rem' }}>{subLoading?'...':'S'abonner'}</button>
          </div>
          {subMsg && <div style={{ marginTop:'1rem', color:subMsg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{subMsg.text}</div>}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(201,168,76,0.15)', padding:'2.5rem 1.5rem', textAlign:'center', background:'linear-gradient(0deg,#0a0805,transparent)' }}>
        <img src={LOGO} alt="logo" style={{ width:50, opacity:0.7, marginBottom:'0.75rem' }} />
        <div className="cinzel" style={{ fontSize:'0.7rem', color:'#9a9090', letterSpacing:'0.2em', marginBottom:'0.4rem' }}>✦ LA CRYPTE DE D&A ✦</div>
        <div style={{ fontSize:'0.85rem', color:'#9a9090', opacity:0.5 }}>David & Arthur — Maîtres du Jeu</div>
      </footer>
    </div>
  )
}

export async function getServerSideProps() {
  const [{ data: mjs }, { data: sessions }, { data: newsArticles }] = await Promise.all([
    supabase.from('mj').select('*'),
    supabase.from('sessions').select('*,campagnes(nom)').order('date_session',{ascending:false}),
    supabase.from('news').select('*,mj(prenom)').eq('publie',true).order('created_at',{ascending:false}).limit(3)
  ])
  return { props: { mjs:mjs||[], sessions:sessions||[], newsArticles:newsArticles||[] } }
}
