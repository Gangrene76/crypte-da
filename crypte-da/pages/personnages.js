import Layout from '../components/Layout'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Personnages({ personnages, jeux }) {
  const [filtre, setFiltre] = useState('tous')
  const [recherche, setRecherche] = useState('')
  const liste = personnages.filter(p => {
    const matchJeu = filtre === 'tous' || p.jeu === filtre
    const matchRecherche = !recherche || p.nom.toLowerCase().includes(recherche.toLowerCase())
    return matchJeu && matchRecherche
  })
  return (
    <Layout>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'3rem 1rem 4rem' }}>
        <h1 style={{ color:'var(--gold)', fontSize:'clamp(1.5rem,4vw,2rem)', textAlign:'center', marginBottom:'0.5rem' }}>Les Aventuriers</h1>
        <div className="divider"><span>🧙</span></div>
        <p style={{ textAlign:'center', color:'var(--ash)', marginBottom:'2rem' }}>{personnages.length} personnage{personnages.length!==1?'s':''} inscrits</p>
        {/* Filtres */}
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', justifyContent:'center', marginBottom:'1.25rem' }}>
          {['tous', ...jeux].map(j => {
            const count = j === 'tous' ? personnages.length : personnages.filter(p => p.jeu === j).length
            return (
              <button key={j} onClick={()=>setFiltre(j)} style={{ fontFamily:'Cinzel,serif', fontSize:'0.75rem', letterSpacing:'0.06em', padding:'0.45rem 1rem', borderRadius:2, cursor:'pointer', transition:'all 0.2s', background:filtre===j?'rgba(201,168,76,0.2)':'transparent', color:filtre===j?'var(--gold)':'var(--ash)', border:`1px solid ${filtre===j?'rgba(201,168,76,0.6)':'rgba(201,168,76,0.2)'}` }}>
                {j === 'tous' ? 'Tous' : j} ({count})
              </button>
            )
          })}
        </div>
        {/* Recherche */}
        <div style={{ maxWidth:380, margin:'0 auto 2rem' }}>
          <input className="input-field" value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="Rechercher un personnage..." style={{ textAlign:'center' }} />
        </div>
        {/* Grille */}
        {liste.length === 0 ? (
          <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🔍</div>
            <p style={{ color:'var(--ash)' }}>Aucun personnage trouvé.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,240px),1fr))', gap:'1rem' }}>
            {liste.map(p => (
              <div key={p.id} className="card" style={{ padding:'1.25rem' }}>
                <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                  <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,var(--blood),#3d0000)', border:'2px solid rgba(201,168,76,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', overflow:'hidden', flexShrink:0 }}>
                    {p.avatar_url ? <img src={p.avatar_url} alt={p.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🧙'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nom}</div>
                    {p.jeu && <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.6rem', letterSpacing:'0.08em', padding:'0.12rem 0.45rem', borderRadius:2, background:'rgba(201,168,76,0.12)', color:'var(--gold)', border:'1px solid rgba(201,168,76,0.3)', display:'inline-block', marginTop:'0.2rem' }}>🎲 {p.jeu}</span>}
                  </div>
                </div>
                {(p.race || p.classe || p.niveau) && <div style={{ color:'var(--ash)', fontSize:'0.8rem', marginBottom:'0.4rem' }}>{[p.race,p.classe,p.niveau?`Niv.${p.niveau}`:null].filter(Boolean).join(' · ')}</div>}
                {p.campagnes && <div style={{ color:'var(--ash)', fontSize:'0.72rem', opacity:0.7, marginBottom:'0.4rem' }}>📜 {p.campagnes.nom}</div>}
                {p.users && <div style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}><span style={{ fontSize:'0.75rem' }}>👤</span><span style={{ color:'var(--ash)', fontSize:'0.72rem' }}>{p.users.pseudo}</span></div>}
                {p.description && <p style={{ color:'var(--ash)', fontSize:'0.8rem', lineHeight:1.5, marginTop:'0.5rem', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{p.description}</p>}
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign:'center', marginTop:'2.5rem' }}>
          <Link href="/mon-compte" className="btn-primary">+ Créer mon personnage</Link>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const { data: personnages } = await supabase.from('personnages').select('*,campagnes(nom),users(pseudo,avatar_url)').order('created_at',{ascending:false})
  const tous = personnages || []
  const jeux = [...new Set(tous.map(p => p.jeu).filter(Boolean))]
  return { props: { personnages: tous, jeux } }
}
