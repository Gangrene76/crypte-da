import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getUser, logout } from '../lib/auth'
import { useRouter } from 'next/router'

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  useEffect(() => { setUser(getUser()) }, [])
  const deconnexion = () => { logout(); setUser(null); router.push('/') }
  const LOGO = 'https://djvckwngvnwhftdvarwu.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_d03jczd03jczd03j.png'
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <header style={{ background:'linear-gradient(180deg,#0d0b09 0%,rgba(26,23,20,0.97) 100%)', borderBottom:'1px solid rgba(201,168,76,0.3)', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(8px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', height:65 }}>
          <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'0.6rem' }}>
            <img src={LOGO} alt="D&A" style={{ width:34, height:34, objectFit:'contain', filter:'drop-shadow(0 0 6px rgba(201,168,76,0.5))' }} />
            <div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'0.9rem', color:'var(--gold)', letterSpacing:'0.1em', lineHeight:1 }}>La Crypte de D&A</div>
              <div style={{ fontFamily:'Crimson Text,serif', fontSize:'0.65rem', color:'var(--ash)', letterSpacing:'0.15em' }}>DAVID & ARTHUR</div>
            </div>
          </Link>
          <nav style={{ display:'flex', gap:'1.5rem', alignItems:'center' }} className="hidden-mobile">
            <NavLink href="/campagnes">Campagnes</NavLink>
            <NavLink href="/agenda">Agenda</NavLink>
            <NavLink href="/personnages">Aventuriers</NavLink>
            <NavLink href="/news">News</NavLink>
            {user ? (
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <Link href="/mon-compte" style={{ display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none' }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--blood),#3d0000)', border:'1px solid rgba(201,168,76,0.4)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>
                    {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🧙'}
                  </div>
                  <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.75rem', color:'var(--gold)' }}>{user.pseudo}</span>
                </Link>
                <button onClick={deconnexion} style={{ background:'none', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2, color:'var(--ash)', fontFamily:'Cinzel,serif', fontSize:'0.7rem', padding:'0.3rem 0.5rem', cursor:'pointer' }}>Quitter</button>
              </div>
            ) : <NavLink href="/compte">Connexion</NavLink>}
          </nav>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{ background:'none', border:'none', color:'var(--gold)', fontSize:'1.4rem', cursor:'pointer', padding:'0.4rem' }} className="show-mobile">
            {menuOpen?'✕':'☰'}
          </button>
        </div>
        {menuOpen && (
          <div style={{ background:'#0d0b09', borderTop:'1px solid rgba(201,168,76,0.2)', padding:'1rem 1.25rem', display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            {[['/campagnes','Campagnes'],['/agenda','Agenda'],['/personnages','Aventuriers'],['/news','News']].map(([href,label])=>(
              <Link key={href} href={href} onClick={()=>setMenuOpen(false)} style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', letterSpacing:'0.1em', color:'var(--parchment)', textDecoration:'none', textTransform:'uppercase' }}>{label}</Link>
            ))}
            {user ? (
              <>
                <Link href="/mon-compte" onClick={()=>setMenuOpen(false)} style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', color:'var(--gold)', textDecoration:'none' }}>🧙 {user.pseudo}</Link>
                <button onClick={()=>{deconnexion();setMenuOpen(false)}} style={{ background:'none', border:'none', color:'var(--ash)', fontFamily:'Cinzel,serif', fontSize:'0.85rem', textAlign:'left', cursor:'pointer' }}>Déconnexion</button>
              </>
            ) : <Link href="/compte" onClick={()=>setMenuOpen(false)} style={{ fontFamily:'Cinzel,serif', fontSize:'0.85rem', color:'var(--gold)', textDecoration:'none' }}>Connexion</Link>}
          </div>
        )}
      </header>
      <main style={{ flex:1 }}>{children}</main>
      <footer style={{ borderTop:'1px solid rgba(201,168,76,0.2)', padding:'2rem 1.25rem', textAlign:'center', background:'linear-gradient(0deg,#0d0b09 0%,transparent 100%)' }}>
        <div style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', color:'var(--ash)', letterSpacing:'0.15em' }}>✦ LA CRYPTE DE D&A ✦</div>
        <div style={{ fontFamily:'Crimson Text,serif', fontSize:'0.85rem', color:'var(--ash)', marginTop:'0.4rem', opacity:0.6 }}>David & Arthur — Maîtres du Jeu</div>
      </footer>
      <style jsx global>{`
        .hidden-mobile { display: flex; }
        .show-mobile { display: none; }
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } .show-mobile { display: block !important; } }
      `}</style>
    </div>
  )
}

function NavLink({ href, children, onClick }) {
  return (
    <Link href={href} onClick={onClick} style={{ fontFamily:'Cinzel,serif', fontSize:'0.78rem', letterSpacing:'0.1em', color:'var(--parchment)', textDecoration:'none', textTransform:'uppercase', transition:'color 0.2s', opacity:0.85 }}
      onMouseEnter={e=>e.target.style.color='var(--gold)'}
      onMouseLeave={e=>e.target.style.color='var(--parchment)'}>
      {children}
    </Link>
  )
}
