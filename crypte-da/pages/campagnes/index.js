import Layout from '../../components/Layout'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Campagnes({ campagnes, mjs }) {
  const mjMap = Object.fromEntries((mjs||[]).map(m => [m.id, m]))
  return (
    <Layout>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'3rem 1.5rem 4rem' }}>
        <h1 style={{ color:'var(--gold)', fontSize:'clamp(1.5rem,4vw,2rem)', textAlign:'center', marginBottom:'0.5rem' }}>Les Campagnes</h1>
        <div className="divider"><span>⚔️</span></div>
        <p style={{ textAlign:'center', color:'var(--ash)', marginBottom:'2.5rem', fontSize:'1rem' }}>Les épopées de David & Arthur, Maîtres du Jeu</p>
        {campagnes.length === 0 ? (
          <div className="card" style={{ padding:'3rem', textAlign:'center' }}><p style={{ color:'var(--ash)' }}>Aucune campagne disponible.</p></div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap:'1.5rem' }}>
            {campagnes.map(c => (
              <Link key={c.id} href={`/campagnes/${c.id}`} style={{ textDecoration:'none' }}>
                <div className="card" style={{ padding:0, overflow:'hidden' }}>
                  {c.image_url && (
                    <div style={{ height:180, overflow:'hidden' }}>
                      <img src={c.image_url} alt={c.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    </div>
                  )}
                  <div style={{ padding:'1.25rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem', gap:'0.5rem', flexWrap:'wrap' }}>
                      <h2 style={{ color:'var(--gold)', fontSize:'1.05rem', lineHeight:1.3 }}>{c.nom}</h2>
                      <span className={`badge ${c.statut==='active'?'badge-active':'badge-terminee'}`}>{c.statut==='active'?'Active':'Terminée'}</span>
                    </div>
                    {c.univers && <div style={{ fontFamily:'Cinzel,serif', fontSize:'0.75rem', color:'var(--ash)', marginBottom:'0.5rem' }}>🌍 {c.univers}</div>}
                    {mjMap[c.mj_id] && <div style={{ color:'var(--ash)', fontSize:'0.85rem', marginBottom:'0.5rem' }}>MJ : <span style={{ color:'var(--gold)' }}>{mjMap[c.mj_id].prenom}</span></div>}
                    {c.description && <p style={{ color:'var(--ash)', fontSize:'0.88rem', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' }}>{c.description}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const [{ data: campagnes }, { data: mjs }] = await Promise.all([
    supabase.from('campagnes').select('*').order('created_at',{ascending:false}),
    supabase.from('mj').select('*')
  ])
  return { props: { campagnes:campagnes||[], mjs:mjs||[] } }
}
