import AdminLayout from '../../components/AdminLayout'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminMJ() {
  const [mjs, setMjs] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ prenom:'', bio:'', avatar_url:'' })
  const [msg, setMsg] = useState(null)

  useEffect(() => { load() }, [])
  const load = async () => { const { data } = await supabase.from('mj').select('*'); setMjs(data||[]) }

  const save = async () => {
    setMsg(null)
    if (editing === 'new') {
      const { error } = await supabase.from('mj').insert(form)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'MJ ajouté !' }); setEditing(null); load() }
    } else {
      const { error } = await supabase.from('mj').update(form).eq('id', editing)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Enregistré !' }); setEditing(null); load() }
    }
  }
  const del = async (id) => { if (!confirm('Supprimer ce MJ ?')) return; await supabase.from('mj').delete().eq('id',id); load() }
  const startEdit = (mj) => { setEditing(mj.id); setForm({ prenom:mj.prenom||'', bio:mj.bio||'', avatar_url:mj.avatar_url||'' }); setMsg(null) }

  return (
    <AdminLayout title="Maîtres du Jeu">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ color:'var(--gold)', fontSize:'1.2rem' }}>Maîtres du Jeu</h2>
        <button className="btn-gold" onClick={()=>{ setEditing('new'); setForm({ prenom:'', bio:'', avatar_url:'' }); setMsg(null) }}>+ Ajouter un MJ</button>
      </div>
      {msg && <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{msg.text}</div>}
      {editing && (
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1.5rem' }}>
          <h3 style={{ color:'var(--gold)', marginBottom:'1rem', fontSize:'1rem' }}>{editing==='new'?'Nouveau MJ':'Modifier le MJ'}</h3>
          <div style={{ display:'grid', gap:'0.75rem' }}>
            <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Prénom *</label><input className="input-field" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} placeholder="Ex: David" /></div>
            <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Bio</label><textarea className="input-field" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Quelques mots sur ce MJ..." /></div>
            <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>URL Avatar (facultatif)</label><input className="input-field" value={form.avatar_url} onChange={e=>setForm({...form,avatar_url:e.target.value})} placeholder="https://..." /></div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.25rem' }}>
            <button className="btn-gold" onClick={save}>Enregistrer</button>
            <button className="btn-primary" onClick={()=>setEditing(null)}>Annuler</button>
          </div>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {mjs.map(mj => (
          <div key={mj.id} className="card" style={{ padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', overflow:'hidden', flexShrink:0 }}>
                {mj.avatar_url ? <img src={mj.avatar_url} alt={mj.prenom} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🎭'}
              </div>
              <div>
                <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif' }}>{mj.prenom}</div>
                {mj.bio && <div style={{ color:'var(--ash)', fontSize:'0.85rem', marginTop:'0.2rem' }}>{mj.bio.slice(0,80)}{mj.bio.length>80?'…':''}</div>}
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
              <button className="btn-gold" onClick={()=>startEdit(mj)} style={{ fontSize:'0.75rem', padding:'0.35rem 0.75rem' }}>Modifier</button>
              <button className="btn-danger" onClick={()=>del(mj.id)} style={{ fontSize:'0.75rem', padding:'0.35rem 0.75rem' }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
