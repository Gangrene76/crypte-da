import AdminLayout from '../../components/AdminLayout'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const JEUX = ['D&D','Jeu de plateau','Pathfinder','Warhammer','Call of Cthulhu','Starfinder','Shadowrun','Vampire: la Mascarade','Star Wars RPG','Autre']
const EMPTY = { nom:'', classe:'', race:'', niveau:'', jeu:'', avatar_url:'', description:'', campagne_id:'' }

function Field({ label, value, onChange, placeholder, type='text', span }) {
  return (
    <div style={{ gridColumn:span?'1/-1':undefined }}>
      <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>{label}</label>
      <input className="input-field" type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />
    </div>
  )
}

export default function AdminPersonnages() {
  const [personnages, setPersonnages] = useState([])
  const [campagnes, setCampagnes] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [msg, setMsg] = useState(null)

  useEffect(() => { load() }, [])
  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('personnages').select('*,campagnes(nom),users(pseudo)').order('nom'),
      supabase.from('campagnes').select('*')
    ])
    setPersonnages(p||[]); setCampagnes(c||[])
  }

  const setField = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

  const save = async () => {
    setMsg(null)
    if (!form.nom.trim()) { setMsg({ type:'error', text:'Le nom est requis.' }); return }
    const data = { ...form, niveau: form.niveau?parseInt(form.niveau):null, campagne_id: form.campagne_id||null }
    if (editing === 'new') {
      const { error } = await supabase.from('personnages').insert(data)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Personnage créé !' }); setEditing(null); load() }
    } else {
      const { error } = await supabase.from('personnages').update(data).eq('id', editing)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Enregistré !' }); setEditing(null); load() }
    }
  }

  const del = async (id) => { if (!confirm('Supprimer ce personnage ?')) return; await supabase.from('personnages').delete().eq('id',id); load() }
  const startEdit = (p) => {
    setEditing(p.id)
    setForm({ nom:p.nom||'', classe:p.classe||'', race:p.race||'', niveau:p.niveau||'', jeu:p.jeu||'', avatar_url:p.avatar_url||'', description:p.description||'', campagne_id:p.campagne_id||'' })
    setMsg(null); window.scrollTo(0,0)
  }

  return (
    <AdminLayout title="Personnages">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <span style={{ color:'var(--ash)', fontSize:'0.9rem' }}>{personnages.length} personnage{personnages.length!==1?'s':''}</span>
        <button className="btn-gold" onClick={()=>{ setEditing('new'); setForm(EMPTY); setMsg(null); window.scrollTo(0,0) }}>+ Nouveau personnage</button>
      </div>

      {msg && <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{msg.text}</div>}

      {editing && (
        <div className="card" style={{ padding:'2rem', marginBottom:'2rem' }}>
          <h3 style={{ color:'var(--gold)', marginBottom:'1.5rem', fontSize:'1rem' }}>{editing==='new'?'Nouveau personnage':'Modifier le personnage'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <Field label="Nom *" span value={form.nom} onChange={setField('nom')} placeholder="Ex: Thalindra Ombrelune" />
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Jeu / Système</label>
              <select className="input-field" value={form.jeu} onChange={e=>setField('jeu')(e.target.value)}>
                <option value="">— Choisir —</option>
                {JEUX.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            {form.jeu !== 'Jeu de plateau' && <>
              <Field label="Classe" value={form.classe} onChange={setField('classe')} placeholder="Ex: Rôdeur" />
              <Field label="Race" value={form.race} onChange={setField('race')} placeholder="Ex: Elfe" />
              <Field label="Niveau" type="number" value={form.niveau} onChange={setField('niveau')} placeholder="1-20" />
            </>}
            <div>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Campagne</label>
              <select className="input-field" value={form.campagne_id} onChange={e=>setField('campagne_id')(e.target.value)}>
                <option value="">— Choisir —</option>
                {campagnes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <Field label="URL Avatar" value={form.avatar_url} onChange={setField('avatar_url')} placeholder="https://..." />
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Description</label>
              <textarea className="input-field" value={form.description} onChange={e=>setField('description')(e.target.value)} placeholder="Histoire, traits, motivations..." />
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
            <button className="btn-gold" onClick={save}>Enregistrer</button>
            <button className="btn-primary" onClick={()=>setEditing(null)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
        {personnages.length === 0 && !editing && <div className="card" style={{ padding:'2rem', textAlign:'center', color:'var(--ash)', gridColumn:'1/-1' }}>Aucun personnage enregistré.</div>}
        {personnages.map(p => (
          <div key={p.id} className="card" style={{ padding:'1.25rem' }}>
            <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', marginBottom:'0.75rem' }}>
              <div style={{ width:50, height:50, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', overflow:'hidden', flexShrink:0 }}>
                {p.avatar_url ? <img src={p.avatar_url} alt={p.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🧙'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.9rem' }}>{p.nom}</div>
                {p.jeu && <div style={{ color:'var(--gold)', fontSize:'0.72rem', opacity:0.7 }}>🎲 {p.jeu}</div>}
                <div style={{ color:'var(--ash)', fontSize:'0.8rem', marginTop:'0.15rem' }}>{[p.race, p.classe, p.niveau?`Niv.${p.niveau}`:null].filter(Boolean).join(' · ')}</div>
                {p.users && <div style={{ color:'var(--ash)', fontSize:'0.72rem', marginTop:'0.15rem' }}>👤 {p.users.pseudo}</div>}
                {p.campagnes && <div style={{ color:'var(--ash)', fontSize:'0.72rem', marginTop:'0.15rem' }}>📜 {p.campagnes.nom}</div>}
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button className="btn-gold" onClick={()=>startEdit(p)} style={{ fontSize:'0.72rem', padding:'0.3rem 0.6rem' }}>Modifier</button>
              <button className="btn-danger" onClick={()=>del(p.id)} style={{ fontSize:'0.72rem', padding:'0.3rem 0.6rem' }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
