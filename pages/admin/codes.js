import AdminLayout from '../../components/AdminLayout'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function genCode() {
  const words = ['DRAGON','DONJON','OMBRE','CRYPTE','RUNE','EPEE','BOUCLIER','MAGE','SORT','QUETE']
  return words[Math.floor(Math.random()*words.length)] + Math.floor(10+Math.random()*90)
}

export default function AdminCodes() {
  const [codes, setCodes] = useState([])
  const [campagnes, setCampagnes] = useState([])
  const [campagneId, setCampagneId] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => { load() }, [])
  const load = async () => {
    const [{ data: co }, { data: ca }] = await Promise.all([
      supabase.from('codes_invitation').select('*,campagnes(nom)').order('created_at',{ascending:false}),
      supabase.from('campagnes').select('*')
    ])
    setCodes(co||[]); setCampagnes(ca||[])
  }

  const create = async () => {
    setMsg(null)
    if (!campagneId) { setMsg({ type:'error', text:'Choisissez une campagne.' }); return }
    const code = genCode()
    const { error } = await supabase.from('codes_invitation').insert({ code, campagne_id: campagneId, actif: true })
    if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:`Code créé : ${code}` }); load() }
  }

  const toggle = async (id, actif) => { await supabase.from('codes_invitation').update({ actif: !actif }).eq('id',id); load() }
  const del = async (id) => { if (!confirm('Supprimer ce code ?')) return; await supabase.from('codes_invitation').delete().eq('id',id); load() }

  return (
    <AdminLayout title="Codes d'invitation">
      <p style={{ color:'var(--ash)', marginBottom:'2rem', fontSize:'0.95rem', lineHeight:1.6 }}>
        Les codes d'invitation permettent à vos joueurs de commenter les sessions. Donnez un code à chaque groupe de joueurs d'une campagne. Un code désactivé ne peut plus être utilisé.
      </p>

      <div className="card" style={{ padding:'1.5rem', marginBottom:'2rem' }}>
        <h3 style={{ color:'var(--gold)', fontSize:'1rem', marginBottom:'1rem' }}>Générer un nouveau code</h3>
        <div style={{ display:'flex', gap:'1rem', alignItems:'flex-end', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:200 }}>
            <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Campagne</label>
            <select className="input-field" value={campagneId} onChange={e=>setCampagneId(e.target.value)}>
              <option value="">— Choisir une campagne —</option>
              {campagnes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <button className="btn-gold" onClick={create}>🎲 Générer un code</button>
        </div>
        {msg && <div style={{ padding:'0.75rem 1rem', marginTop:'1rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{msg.text}</div>}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {codes.length === 0 && <div className="card" style={{ padding:'2rem', textAlign:'center', color:'var(--ash)' }}>Aucun code généré.</div>}
        {codes.map(c => (
          <div key={c.id} className="card" style={{ padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap', opacity:c.actif?1:0.6 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.25rem' }}>
                <span style={{ fontFamily:'Cinzel,serif', fontSize:'1.1rem', color:'var(--gold)', letterSpacing:'0.12em' }}>{c.code}</span>
                <span style={{ fontSize:'0.65rem', padding:'0.15rem 0.5rem', borderRadius:2, fontFamily:'Cinzel,serif', background:c.actif?'rgba(40,120,40,0.2)':'rgba(100,80,80,0.2)', color:c.actif?'#80d080':'var(--ash)', border:`1px solid ${c.actif?'rgba(40,120,40,0.4)':'rgba(100,80,80,0.3)'}` }}>{c.actif?'Actif':'Inactif'}</span>
              </div>
              {c.campagnes && <div style={{ color:'var(--ash)', fontSize:'0.82rem' }}>📜 {c.campagnes.nom}</div>}
              <div style={{ color:'var(--ash)', fontSize:'0.78rem', opacity:0.7 }}>Créé le {new Date(c.created_at).toLocaleDateString('fr-FR')}</div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
              <button onClick={()=>toggle(c.id,c.actif)} className={c.actif?'btn-primary':'btn-gold'} style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem' }}>{c.actif?'Désactiver':'Activer'}</button>
              <button className="btn-danger" onClick={()=>del(c.id)} style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem' }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
