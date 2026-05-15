import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [stats, setStats] = useState({})

  useEffect(() => {
    if (sessionStorage.getItem('crypte_admin') === 'ok') { setAuth(true); loadStats() }
  }, [])

  const login = () => {
    if (pw === 'CrypteDa2024!') { sessionStorage.setItem('crypte_admin','ok'); setAuth(true); loadStats() }
    else setErr('Mot de passe incorrect.')
  }

  const loadStats = async () => {
    const [{ count: nbC }, { count: nbS }, { count: nbCom }] = await Promise.all([
      supabase.from('campagnes').select('*',{count:'exact',head:true}),
      supabase.from('sessions').select('*',{count:'exact',head:true}),
      supabase.from('commentaires').select('*',{count:'exact',head:true}).eq('approuve',false)
    ])
    setStats({ campagnes:nbC, sessions:nbS, commentairesEnAttente:nbCom })
  }

  if (!auth) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0d0b09' }}>
      <div style={{ width:'100%', maxWidth:400, padding:'2rem' }}>
        <div className="card" style={{ padding:'2.5rem', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔐</div>
          <h1 style={{ fontFamily:'Cinzel,serif', color:'var(--gold)', fontSize:'1.4rem', marginBottom:'0.5rem' }}>Espace Maîtres du Jeu</h1>
          <p style={{ color:'var(--ash)', fontSize:'0.9rem', marginBottom:'2rem' }}>La Crypte de D&A — Administration</p>
          <input className="input-field" type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr('')}} onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Mot de passe..." style={{ marginBottom:'1rem' }} />
          {err && <div style={{ color:'#e07070', fontSize:'0.85rem', marginBottom:'0.75rem' }}>{err}</div>}
          <button className="btn-primary" onClick={login} style={{ width:'100%' }}>Entrer dans la Crypte</button>
        </div>
        <div style={{ textAlign:'center', marginTop:'1rem' }}><Link href="/" style={{ color:'var(--ash)', fontSize:'0.8rem', textDecoration:'none', fontFamily:'Cinzel,serif' }}>← Retour au site</Link></div>
      </div>
      <style jsx global>{`body{font-family:'Crimson Text',Georgia,serif;} h1,h2{font-family:'Cinzel',serif;}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--stone)' }}>
      <header style={{ background:'#0d0b09', borderBottom:'1px solid rgba(201,168,76,0.3)', padding:'0 1.5rem', height:65, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'Cinzel,serif', color:'var(--gold)', fontSize:'1rem', letterSpacing:'0.1em' }}>🎲 La Crypte de D&A — Admin</div>
        <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
          <Link href="/" style={{ color:'var(--ash)', fontSize:'0.8rem', textDecoration:'none', fontFamily:'Cinzel,serif' }}>Voir le site</Link>
          <button onClick={()=>{sessionStorage.removeItem('crypte_admin');setAuth(false)}} className="btn-danger" style={{ fontSize:'0.7rem', padding:'0.3rem 0.75rem' }}>Déconnexion</button>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'2.5rem 1.5rem' }}>
        <h1 style={{ color:'var(--gold)', fontSize:'1.6rem', marginBottom:'2rem' }}>Tableau de bord</h1>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'2.5rem' }}>
          {[
            { label:'Campagnes', value:stats.campagnes??'…', icon:'⚔️' },
            { label:'Sessions', value:stats.sessions??'…', icon:'📜' },
            { label:'Commentaires en attente', value:stats.commentairesEnAttente??'…', icon:'💬', alert:stats.commentairesEnAttente>0 },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:'1.5rem', textAlign:'center', borderColor:s.alert?'rgba(201,168,76,0.5)':'rgba(201,168,76,0.2)' }}>
              <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{s.icon}</div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'2rem', color:s.alert?'var(--gold)':'var(--parchment)' }}>{s.value}</div>
              <div style={{ color:'var(--ash)', fontSize:'0.8rem', marginTop:'0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Navigation admin */}
        <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'1.25rem' }}>Gestion du contenu</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
          {[
            { href:'/admin/mj', icon:'🎭', label:'Maîtres du Jeu', desc:'Modifier les profils MJ' },
            { href:'/admin/campagnes', icon:'⚔️', label:'Campagnes', desc:'Créer et gérer les campagnes' },
            { href:'/admin/sessions', icon:'📜', label:'Sessions', desc:'Ajouter des sessions, médias' },
            { href:'/admin/personnages', icon:'🧙', label:'Personnages', desc:'Gérer les personnages' },
            { href:'/admin/codes', icon:'🔑', label:'Codes d\'invitation', desc:'Générer des codes joueurs' },
            { href:'/admin/commentaires', icon:'💬', label:'Commentaires', desc:'Modérer les retours', alert:stats.commentairesEnAttente>0, badge:stats.commentairesEnAttente },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration:'none' }}>
              <div className="card" style={{ padding:'1.5rem', height:'100%', borderColor:item.alert?'rgba(201,168,76,0.5)':'rgba(201,168,76,0.2)' }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>{item.icon}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.3rem' }}>
                  <span style={{ fontFamily:'Cinzel,serif', color:'var(--gold)', fontSize:'0.95rem' }}>{item.label}</span>
                  {item.badge > 0 && <span style={{ background:'var(--blood)', color:'white', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:'bold' }}>{item.badge}</span>}
                </div>
                <div style={{ color:'var(--ash)', fontSize:'0.85rem' }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
