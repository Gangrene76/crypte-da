import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function AdminLayout({ children, title }) {
  const [auth, setAuth] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (sessionStorage.getItem('crypte_admin') === 'ok') setAuth(true)
    else router.push('/admin')
  }, [])

  if (!auth) return null

  return (
    <div style={{ minHeight:'100vh', background:'var(--stone)', display:'flex' }}>
      {/* Sidebar */}
      <aside style={{ width:220, background:'#0d0b09', borderRight:'1px solid rgba(201,168,76,0.2)', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'1.25rem 1rem', borderBottom:'1px solid rgba(201,168,76,0.2)' }}>
          <Link href="/admin" style={{ textDecoration:'none' }}>
            <div style={{ fontFamily:'Cinzel,serif', color:'var(--gold)', fontSize:'0.85rem', letterSpacing:'0.1em' }}>🎲 Crypte de D&A</div>
            <div style={{ color:'var(--ash)', fontSize:'0.7rem', marginTop:'0.2rem' }}>Administration</div>
          </Link>
        </div>
        <nav style={{ flex:1, padding:'1rem 0' }}>
          {[
            { href:'/admin', icon:'🏠', label:'Dashboard' },
            { href:'/admin/mj', icon:'🎭', label:'Maîtres du Jeu' },
            { href:'/admin/campagnes', icon:'⚔️', label:'Campagnes' },
            { href:'/admin/sessions', icon:'📜', label:'Sessions' },
            { href:'/admin/personnages', icon:'🧙', label:'Personnages' },
            { href:'/admin/codes', icon:'🔑', label:'Codes invitation' },
            { href:'/admin/commentaires', icon:'💬', label:'Commentaires' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.65rem 1rem', color: router.pathname===item.href?'var(--gold)':'var(--ash)', background: router.pathname===item.href?'rgba(201,168,76,0.08)':'transparent', borderLeft: router.pathname===item.href?'2px solid var(--gold)':'2px solid transparent', fontSize:'0.85rem', fontFamily:'Cinzel,serif', transition:'all 0.2s' }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding:'1rem', borderTop:'1px solid rgba(201,168,76,0.2)', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          <Link href="/" style={{ color:'var(--ash)', fontSize:'0.75rem', textDecoration:'none', fontFamily:'Cinzel,serif' }}>← Voir le site</Link>
          <button onClick={()=>{ sessionStorage.removeItem('crypte_admin'); router.push('/admin') }} style={{ background:'none', border:'none', color:'var(--ash)', fontSize:'0.75rem', cursor:'pointer', textAlign:'left', fontFamily:'Cinzel,serif' }}>Déconnexion</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1, padding:'2rem 2.5rem', overflow:'auto' }}>
        {title && <h1 style={{ color:'var(--gold)', fontSize:'1.5rem', marginBottom:'2rem', fontFamily:'Cinzel,serif' }}>{title}</h1>}
        {children}
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        * { box-sizing: border-box; }
        body { background: var(--stone); color: var(--parchment); font-family: 'Crimson Text', Georgia, serif; margin: 0; }
        :root { --blood:#8B0000; --blood-light:#c0392b; --gold:#c9a84c; --gold-light:#f0d080; --stone:#1a1714; --stone-mid:#2a2522; --stone-light:#3d3530; --parchment:#e8d5b0; --ash:#9a9090; }
        h1,h2,h3 { font-family: 'Cinzel', serif; }
        .card { background: var(--stone-mid); border: 1px solid rgba(201,168,76,0.2); border-radius: 2px; transition: border-color 0.3s; }
        .btn-primary { background: linear-gradient(135deg,var(--blood) 0%,#6b0000 100%); color: var(--parchment); font-family: 'Cinzel',serif; font-size: 0.8rem; letter-spacing: 0.1em; padding: 0.6rem 1.5rem; border: 1px solid rgba(201,168,76,0.3); border-radius: 2px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; display: inline-block; }
        .btn-gold { background: linear-gradient(135deg,var(--gold) 0%,#a07830 100%); color: var(--stone); font-family: 'Cinzel',serif; font-size: 0.8rem; letter-spacing: 0.1em; padding: 0.6rem 1.5rem; border-radius: 2px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; display: inline-block; }
        .btn-danger { background: rgba(139,0,0,0.3); color: #e07070; font-family: 'Cinzel',serif; font-size: 0.8rem; letter-spacing: 0.1em; padding: 0.5rem 1rem; border: 1px solid rgba(139,0,0,0.5); border-radius: 2px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; display: inline-block; }
        .input-field { background: rgba(255,255,255,0.05); border: 1px solid rgba(201,168,76,0.3); border-radius: 2px; color: var(--parchment); padding: 0.6rem 1rem; font-family: 'Crimson Text',serif; font-size: 1rem; width: 100%; transition: border-color 0.2s; }
        .input-field:focus { outline: none; border-color: var(--gold); }
        .input-field::placeholder { color: var(--ash); }
        textarea.input-field { resize: vertical; min-height: 90px; }
        select.input-field option { background: var(--stone-mid); color: var(--parchment); }
        .badge { font-family: 'Cinzel',serif; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 2px; }
        .badge-future { background: rgba(201,168,76,0.2); color: var(--gold); border: 1px solid rgba(201,168,76,0.4); }
        .badge-past { background: rgba(100,80,80,0.3); color: #c09090; border: 1px solid rgba(139,0,0,0.3); }
      `}</style>
    </div>
  )
}
