import AdminLayout from '../../components/AdminLayout'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { nom:'', classe:'', race:'', niveau:'', joueur_nom:'', avatar_url:'', description:'', campagne_id:'', mot_de_passe:'' }

export default function AdminPersonnages() {
  const [personnages, setPersonnages] = useState([])
  const [campagnes, setCampagnes] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [msg, setMsg] = useState(null)

  useEffect(() => { load() }, [])
  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('personnages').select('*,campagnes(nom)'),
      supabase.from('campagnes').select('*')
    ])
    setPersonnages(p||[]); setCampagnes(c||[])
  }

  const save = async () => {
    setMsg(null)
    if (!form.nom.trim()) { setMsg({ type:'error', text:'Le nom est requis.' }); return }
    const data = { ...form, niveau: form.niveau?parseInt(form.niveau):null, campagne_id: form.campagne_id||null }
    if (editing === 'new') {
      const { error } = await supabase.from('personnages').insert(data)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Personnage créé !' }); setEditing(null); load() }
    } else {
      const updates = { ...data }
      if (!form.mot_de_passe) delete updates.mot_de_passe
      const { error } = await supabase.from('personnages').update(updates).eq('id', editing)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Enregistré !' }); setEditing(null); load() }
    }
  }

  const del = async (id) => { if (!confirm('Supprimer ce personnage ?')) return; await supabase.from('personnages').delete().eq('id',id); load() }
  const startEdit = (p) => {
    setEditing(p.id)
    setForm({ nom:p.nom||'', classe:p.classe||'', race:p.race||'', niveau:p.niveau||'', joueur_nom:p.joueur_nom||'', avatar_url:p.avatar_url||'', description:p.description||'', campagne_id:p.campagne_id||'', mot_de_passe:'' })
    setMsg(null); window.scrollTo(0,0)
  }

  const F = ({ label, value, onChange, placeholder, type='text', span }) => (
    <div style={{ gridColumn: span?'1/-1':undefined }}>
      <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>{label}</label>
      <input className="input-field" type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />
    </div>
  )

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
            <F label="Nom du personnage *" span value={form.nom} onChange={v=>setForm({...form,nom:v})} placeholder="Ex: Thalindra Ombrelune" />
            <F label="Classe" value={form.classe} onChange={v=>setForm({...form,classe:v})} placeholder="Ex: Rôdeur" />
            <F label="Race" value={form.race} onChange={v=>setForm({...form,race:v})} placeholder="Ex: Elfe" />
            <F label="Niveau" type="number" value={form.niveau} onChange={v=>setForm({...form,niveau:v})} placeholder="1-20" />
            <F label="Joué par" value={form.joueur_nom} onChange={v=>setForm({...form,joueur_nom:v})} placeholder="Prénom du joueur" />
            <div>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Campagne</label>
              <select className="input-field" value={form.campagne_id} onChange={e=>setForm({...form,campagne_id:e.target.value})}>
                <option value="">— Choisir —</option>
                {campagnes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <F label="URL Avatar" span value={form.avatar_url} onChange={v=>setForm({...form,avatar_url:v})} placeholder="https://..." />
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Description</label>
              <textarea className="input-field" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Histoire, traits, motivations..." />
            </div>
            <div style={{ gridColumn:'1/-1', borderTop:'1px solid rgba(201,168,76,0.15)', paddingTop:'1rem', marginTop:'0.5rem' }}>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>
                {editing==='new'?'Mot de passe':'Nouveau mot de passe (laisser vide = inchangé)'}
              </label>
              <input className="input-field" type="password" value={form.mot_de_passe} onChange={e=>setForm({...form,mot_de_passe:e.target.value})} placeholder="Mot de passe du joueur..." />
              <p style={{ color:'var(--ash)', fontSize:'0.78rem', marginTop:'0.4rem' }}>Le joueur utilisera ce mot de passe pour commenter et modifier sa fiche.</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
            <button className="btn-gold" onClick={save}>Enregistrer</button>
            <button className="btn-primary" onClick={()=>setEditing(null)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
        {personnages.length === 0 && !editing && <div className="card" style={{ padding:'2rem', textAlign:'center', color:'var(--ash)', gridColumn:'1/-1' }}>Aucun personnage enregistré.</div>}
        {personnages.map(p => (
          <div key={p.id} className="card" style={{ padding:'1.25rem' }}>
            <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', marginBottom:'0.75rem' }}>
              <div style={{ width:50, height:50, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', overflow:'hidden', flexShrink:0 }}>
                {p.avatar_url ? <img src={p.avatar_url} alt={p.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🧙'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.9rem' }}>{p.nom}</div>
                <div style={{ color:'var(--ash)', fontSize:'0.8rem', marginTop:'0.2rem' }}>{[p.race, p.classe, p.niveau?`Niv.${p.niveau}`:null].filter(Boolean).join(' · ')}</div>
                {p.joueur_nom && <div style={{ color:'var(--parchment)', fontSize:'0.78rem', opacity:0.7 }}>par {p.joueur_nom}</div>}
                {p.campagnes && <div style={{ color:'var(--ash)', fontSize:'0.75rem', marginTop:'0.2rem' }}>📜 {p.campagnes.nom}</div>}
                <div style={{ color:'var(--ash)', fontSize:'0.72rem', marginTop:'0.2rem' }}>🔐 {p.mot_de_passe ? 'Mot de passe défini' : 'Pas de mot de passe'}</div>
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
