import Link from 'next/link'
import { useState } from 'react'

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(180deg, #0d0b09 0%, rgba(26,23,20,0.95) 100%)',
        borderBottom: '1px solid rgba(201,168,76,0.3)',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.8rem', lineHeight: 1 }}/><img src="https://djvckwngvnwhftdvarwu.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_d03jczd03jczd03j.png" alt="logo" style={{width:40,height:40,objectFit:'contain'}} />
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: 'var(--gold)', letterSpacing: '0.1em', lineHeight: 1 }}>La Crypte de D&A</div>
                <div style={{ fontFamily: 'Crimson Text, serif', fontSize: '0.75rem', color: 'var(--ash)', letterSpacing: '0.15em' }}>DAVID & ARTHUR — MAÎTRES DU JEU</div>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="hidden-mobile">
            <NavLink href="/">Accueil</NavLink>
            <NavLink href="/campagnes">Campagnes</NavLink>
            <NavLink href="/agenda">Agenda</NavLink>
          </nav>

          {/* Mobile burger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '1.5rem', cursor: 'pointer' }} className="show-mobile">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: '#0d0b09', borderTop: '1px solid rgba(201,168,76,0.2)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <NavLink href="/" onClick={() => setMenuOpen(false)}>Accueil</NavLink>
            <NavLink href="/campagnes" onClick={() => setMenuOpen(false)}>Campagnes</NavLink>
            <NavLink href="/agenda" onClick={() => setMenuOpen(false)}>Agenda</NavLink>
          </div>
        )}
      </header>

      {/* Main */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(201,168,76,0.2)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        background: 'linear-gradient(0deg, #0d0b09 0%, transparent 100%)'
      }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--ash)', letterSpacing: '0.15em' }}>
          ✦ LA CRYPTE DE D&A ✦
        </div>
        <div style={{ fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', color: 'var(--ash)', marginTop: '0.5rem', opacity: 0.6 }}>
          Les aventures de David & Arthur — Maîtres du Jeu
        </div>
      </footer>

      <style jsx global>{`
        .hidden-mobile { display: flex; }
        .show-mobile { display: none; }
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </div>
  )
}

function NavLink({ href, children, onClick }) {
  return (
    <Link href={href} onClick={onClick} style={{
      fontFamily: 'Cinzel, serif',
      fontSize: '0.8rem',
      letterSpacing: '0.12em',
      color: 'var(--parchment)',
      textDecoration: 'none',
      textTransform: 'uppercase',
      transition: 'color 0.2s',
      opacity: 0.85
    }}
    onMouseEnter={e => e.target.style.color = 'var(--gold)'}
    onMouseLeave={e => e.target.style.color = 'var(--parchment)'}
    >
      {children}
    </Link>
  )
}
