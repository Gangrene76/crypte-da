import AdminLayout from '../../components/AdminLayout'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { nom:'', description:'', image_url:'', univers:'', statut:'active' }

export default function AdminCampagnes() {
  const [campagnes, setCampagnes] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [msg, setMsg] = useState(null)

  useEffect(() => { load() }, [])
  const load = async () => {
    const { data: c } = await supabase.from('campagnes').select('*').order('created_at',{ascending:false})
    setCampagnes(c||[])
  }

  const save = async () => {
    setMsg(null)
    if (!form.nom.trim()) { setMsg({ type:'error', text:'Le nom est requis.' }); return }
    if (editing === 'new') {
      const { error } = await supabase.from('campagnes').insert(form)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Campagne créée !' }); setEditing(null); load() }
    } else {
      const { error } = await supabase.from('campagnes').update(form).eq('id', editing)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Enregistré !' }); setEditing(null); load() }
    }
  }

  const del = async (id) => { if (!confirm('Supprimer cette campagne et toutes ses sessions ?')) return; await supabase.from('campagnes').delete().eq('id',id); load() }
  const startEdit = (c) => { setEditing(c.id); setForm({ nom:c.nom||'', description:c.description||'', image_url:c.image_url||'', univers:c.univers||'', statut:c.statut||'active' }); setMsg(null); window.scrollTo(0,0) }

  return (
    <AdminLayout title="Campagnes">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <span style={{ color:'var(--ash)', fontSize:'0.9rem' }}>{campagnes.length} campagne{campagnes.length!==1?'s':''}</span>
        <button className="btn-gold" onClick={()=>{ setEditing('new'); setForm(EMPTY); setMsg(null); window.scrollTo(0,0) }}>+ Nouvelle campagne</button>
      </div>

      {msg && <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{msg.text}</div>}

      {editing && (
        <div className="card" style={{ padding:'2rem', marginBottom:'2rem' }}>
          <h3 style={{ color:'var(--gold)', marginBottom:'1.5rem', fontSize:'1rem' }}>{editing==='new'?'Nouvelle campagne':'Modifier la campagne'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={{ gridColumn:'1/-1' }}><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Nom de la campagne *</label><input className="input-field" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} placeholder="Ex: La Malédiction de Strahd" /></div>
            <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Statut</label>
              <select className="input-field" value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})}>
                <option value="active">Active</option>
                <option value="pause">En pause</option>
                <option value="terminee">Terminée</option>
              </select>
            </div>
            <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Univers / Système</label><input className="input-field" value={form.univers} onChange={e=>setForm({...form,univers:e.target.value})} placeholder="Ex: D&D 5e, Pathfinder…" /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>URL Image de couverture</label><input className="input-field" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="https://..." /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Description</label><textarea className="input-field" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Résumé de la campagne, ambiance, enjeux..." style={{ minHeight:120 }} /></div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
            <button className="btn-gold" onClick={save}>Enregistrer</button>
            <button className="btn-primary" onClick={()=>setEditing(null)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {campagnes.length === 0 && !editing && <div className="card" style={{ padding:'2rem', textAlign:'center', color:'var(--ash)' }}>Aucune campagne. Commencez par en créer une !</div>}
        {campagnes.map(c => (
          <div key={c.id} className="card" style={{ padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
            <div>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.25rem' }}>
                <span style={{ color:'var(--gold)', fontFamily:'Cinzel,serif' }}>{c.nom}</span>
                <span className={`badge ${c.statut==='active'?'badge-future':c.statut==='terminee'?'badge-past':'badge-past'}`}>{c.statut==='active'?'Active':c.statut==='terminee'?'Terminée':'Pause'}</span>
              </div>
              {c.univers && <div style={{ color:'var(--ash)', fontSize:'0.82rem' }}>🌍 {c.univers}</div>}
            </div>
            <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
              <button className="btn-gold" onClick={()=>startEdit(c)} style={{ fontSize:'0.75rem', padding:'0.35rem 0.75rem' }}>Modifier</button>
              <button className="btn-danger" onClick={()=>del(c.id)} style={{ fontSize:'0.75rem', padding:'0.35rem 0.75rem' }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
