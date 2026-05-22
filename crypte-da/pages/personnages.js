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
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'3rem 1.5rem' }}>
        <h1 style={{ color:'var(--gold)', fontSize:'2rem', textAlign:'center', marginBottom:'0.5rem' }}>
          Les Aventuriers
        </h1>
        <div className="divider"><span>🧙</span></div>
        <p style={{ textAlign:'center', color:'var(--ash)', marginBottom:'2.5rem' }}>
          {personnages.length} personnage{personnages.length!==1?'s':''} inscrits dans la Crypte
        </p>

        {/* Filtres */}
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', justifyContent:'center', marginBottom:'1.5rem' }}>
          <button
            onClick={()=>setFiltre('tous')}
            style={{ fontFamily:'Cinzel,serif', fontSize:'0.78rem', letterSpacing:'0.08em', padding:'0.5rem 1.25rem', borderRadius:2, cursor:'pointer', transition:'all 0.2s', background:filtre==='tous'?'rgba(201,168,76,0.2)':'transparent', color:filtre==='tous'?'var(--gold)':'var(--ash)', border:`1px solid ${filtre==='tous'?'rgba(201,168,76,0.6)':'rgba(201,168,76,0.2)'}` }}>
            Tous ({personnages.length})
          </button>
          {jeux.map(j => {
            const count = personnages.filter(p => p.jeu === j).length
            return (
              <button key={j} onClick={()=>setFiltre(j)}
                style={{ fontFamily:'Cinzel,serif', fontSize:'0.78rem', letterSpacing:'0.08em', padding:'0.5rem 1.25rem', borderRadius:2, cursor:'pointer', transition:'all 0.2s', background:filtre===j?'rgba(201,168,76,0.2)':'transparent', color:filtre===j?'var(--gold)':'var(--ash)', border:`1px solid ${filtre===j?'rgba(201,168,76,0.6)':'rgba(201,168,76,0.2)'}` }}>
                {j} ({count})
              </button>
            )
          })}
        </div>

        {/* Recherche */}
        <div style={{ maxWidth:400, margin:'0 auto 2.5rem' }}>
          <input
            className="input-field"
            value={recherche}
            onChange={e=>setRecherche(e.target.value)}
            placeholder="Rechercher un personnage..."
            style={{ textAlign:'center' }}
          />
        </div>

        {/* Grille */}
        {liste.length === 0 ? (
          <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔍</div>
            <p style={{ color:'var(--ash)' }}>Aucun personnage trouvé.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1.25rem' }}>
            {liste.map(p => (
              <div key={p.id} className="card" style={{ padding:'1.5rem', transition:'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.5)' }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.2)' }}>
                {/* Avatar */}
                <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start', marginBottom:'1rem' }}>
                  <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,var(--blood),#3d0000)', border:'2px solid rgba(201,168,76,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', overflow:'hidden', flexShrink:0 }}>
                    {p.avatar_url
                      ? <img src={p.avatar_url} alt={p.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : '🧙'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.95rem', marginBottom:'0.2rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nom}</div>
                    {p.jeu && (
                      <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.62rem', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0.15rem 0.5rem', borderRadius:2, background:'rgba(201,168,76,0.12)', color:'var(--gold)', border:'1px solid rgba(201,168,76,0.3)' }}>
                        🎲 {p.jeu}
                      </span>
                    )}
                  </div>
                </div>

                {/* Infos RPG */}
                {(p.race || p.classe || p.niveau) && (
                  <div style={{ color:'var(--ash)', fontSize:'0.82rem', marginBottom:'0.6rem' }}>
                    {[p.race, p.classe, p.niveau?`Niv.${p.niveau}`:null].filter(Boolean).join(' · ')}
                  </div>
                )}

                {/* Campagne */}
                {p.campagnes && (
                  <div style={{ color:'var(--ash)', fontSize:'0.75rem', marginBottom:'0.6rem', opacity:0.7 }}>
                    📜 {p.campagnes.nom}
                  </div>
                )}

                {/* Joueur */}
                {p.users && (
                  <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.6rem' }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem' }}>
                      {p.users.avatar_url ? <img src={p.users.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '👤'}
                    </div>
                    <span style={{ color:'var(--ash)', fontSize:'0.75rem', opacity:0.8 }}>{p.users.pseudo}</span>
                  </div>
                )}

                {/* Description */}
                {p.description && (
                  <p style={{ color:'var(--ash)', fontSize:'0.82rem', lineHeight:1.5, margin:0, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {p.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign:'center', marginTop:'3rem' }}>
          <Link href="/mon-compte" className="btn-primary">+ Créer mon personnage</Link>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const { data: personnages } = await supabase
    .from('personnages')
    .select('*,campagnes(nom),users(pseudo,avatar_url)')
    .order('created_at', { ascending: false })

  const tous = personnages || []
  const jeux = [...new Set(tous.map(p => p.jeu).filter(Boolean))]

  return { props: { personnages: tous, jeux } }
}
