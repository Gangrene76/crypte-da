import AdminLayout from '../../components/AdminLayout'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { titre:'', numero:'', date_session:'', resume:'', statut:'passee', campagne_id:'' }

export default function AdminSessions() {
  const [sessions, setSessions] = useState([])
  const [campagnes, setCampagnes] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [medias, setMedias] = useState([])
  const [newMedia, setNewMedia] = useState({ url:'', legende:'', type:'photo' })
  const [msg, setMsg] = useState(null)

  useEffect(() => { load() }, [])
  const load = async () => {
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from('sessions').select('*,campagnes(nom)').order('date_session',{ascending:false}),
      supabase.from('campagnes').select('*')
    ])
    setSessions(s||[]); setCampagnes(c||[])
  }

  const startEdit = async (s) => {
    setEditing(s.id)
    setForm({ titre:s.titre||'', numero:s.numero||'', date_session:s.date_session||'', resume:s.resume||'', statut:s.statut||'passee', campagne_id:s.campagne_id||'' })
    const { data: m } = await supabase.from('medias').select('*').eq('session_id',s.id)
    setMedias(m||[]); setMsg(null); window.scrollTo(0,0)
  }

  const save = async () => {
    setMsg(null)
    if (!form.titre.trim()) { setMsg({ type:'error', text:'Le titre est requis.' }); return }
    const data = { ...form, numero: form.numero?parseInt(form.numero):null, campagne_id: form.campagne_id||null }
    if (editing === 'new') {
      const { error } = await supabase.from('sessions').insert(data)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Session créée !' }); setEditing(null); load() }
    } else {
      const { error } = await supabase.from('sessions').update(data).eq('id', editing)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Enregistré !' }); load() }
    }
  }

  const addMedia = async () => {
    if (!newMedia.url.trim()) return
    const { error } = await supabase.from('medias').insert({ ...newMedia, session_id: editing })
    if (!error) { const { data: m } = await supabase.from('medias').select('*').eq('session_id',editing); setMedias(m||[]); setNewMedia({ url:'', legende:'', type:'photo' }) }
  }

  const delMedia = async (id) => { await supabase.from('medias').delete().eq('id',id); const { data: m } = await supabase.from('medias').select('*').eq('session_id',editing); setMedias(m||[]) }
  const del = async (id) => { if (!confirm('Supprimer cette session ?')) return; await supabase.from('sessions').delete().eq('id',id); load() }

  return (
    <AdminLayout title="Sessions">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <span style={{ color:'var(--ash)', fontSize:'0.9rem' }}>{sessions.length} session{sessions.length!==1?'s':''}</span>
        <button className="btn-gold" onClick={()=>{ setEditing('new'); setForm(EMPTY); setMedias([]); setMsg(null); window.scrollTo(0,0) }}>+ Nouvelle session</button>
      </div>

      {msg && <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{msg.text}</div>}

      {editing && (
        <div className="card" style={{ padding:'2rem', marginBottom:'2rem' }}>
          <h3 style={{ color:'var(--gold)', marginBottom:'1.5rem', fontSize:'1rem' }}>{editing==='new'?'Nouvelle session':'Modifier la session'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{ gridColumn:'1/-1' }}><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Titre *</label><input className="input-field" value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} placeholder="Ex: La Nuit des Ombres" /></div>
            <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Campagne</label>
              <select className="input-field" value={form.campagne_id} onChange={e=>setForm({...form,campagne_id:e.target.value})}>
                <option value="">— Choisir —</option>
                {campagnes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Statut</label>
              <select className="input-field" value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})}>
                <option value="passee">Passée</option>
                <option value="future">À venir</option>
              </select>
            </div>
            <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Numéro de session</label><input className="input-field" type="number" value={form.numero} onChange={e=>setForm({...form,numero:e.target.value})} placeholder="Ex: 3" /></div>
            <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Date</label><input className="input-field" type="date" value={form.date_session} onChange={e=>setForm({...form,date_session:e.target.value})} /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Résumé / Chronique</label><textarea className="input-field" value={form.resume} onChange={e=>setForm({...form,resume:e.target.value})} placeholder="Le récit de la session, les événements marquants..." style={{ minHeight:160 }} /></div>
          </div>

          {/* Médias (uniquement si édition d'une session existante) */}
          {editing !== 'new' && (
            <div style={{ marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(201,168,76,0.15)' }}>
              <h4 style={{ color:'var(--gold)', fontSize:'0.9rem', marginBottom:'1rem' }}>Médias (photos, cartes, illustrations)</h4>
              {medias.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'1rem' }}>
                  {medias.map(m => (
                    <div key={m.id} style={{ position:'relative', width:100, height:80, overflow:'hidden', borderRadius:2, border:'1px solid rgba(201,168,76,0.2)' }}>
                      <img src={m.url} alt={m.legende||''} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      <button onClick={()=>delMedia(m.id)} style={{ position:'absolute', top:2, right:2, background:'rgba(139,0,0,0.85)', border:'none', color:'white', width:18, height:18, borderRadius:'50%', cursor:'pointer', fontSize:'0.7rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr auto', gap:'0.5rem', alignItems:'end' }}>
                <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.75rem', fontFamily:'Cinzel,serif', marginBottom:'0.25rem' }}>URL du média</label><input className="input-field" value={newMedia.url} onChange={e=>setNewMedia({...newMedia,url:e.target.value})} placeholder="https://..." /></div>
                <div><label style={{ display:'block', color:'var(--ash)', fontSize:'0.75rem', fontFamily:'Cinzel,serif', marginBottom:'0.25rem' }}>Légende</label><input className="input-field" value={newMedia.legende} onChange={e=>setNewMedia({...newMedia,legende:e.target.value})} placeholder="Facultatif" /></div>
                <button className="btn-gold" onClick={addMedia} style={{ padding:'0.6rem 1rem', fontSize:'0.75rem' }}>Ajouter</button>
              </div>
            </div>
          )}
          {editing === 'new' && <p style={{ color:'var(--ash)', fontSize:'0.82rem', marginTop:'0.5rem' }}>💡 Les médias pourront être ajoutés après la création de la session.</p>}

          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
            <button className="btn-gold" onClick={save}>Enregistrer</button>
            <button className="btn-primary" onClick={()=>setEditing(null)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {sessions.length === 0 && !editing && <div className="card" style={{ padding:'2rem', textAlign:'center', color:'var(--ash)' }}>Aucune session. Créez-en une !</div>}
        {sessions.map(s => (
          <div key={s.id} className="card" style={{ padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
            <div>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.25rem', flexWrap:'wrap' }}>
                {s.numero && <span style={{ color:'var(--ash)', fontSize:'0.8rem', fontFamily:'Cinzel,serif' }}>#{s.numero}</span>}
                <span style={{ color:'var(--gold)', fontFamily:'Cinzel,serif' }}>{s.titre}</span>
                <span className={`badge ${s.statut==='future'?'badge-future':'badge-past'}`}>{s.statut==='future'?'À venir':'Passée'}</span>
              </div>
              {s.campagnes && <div style={{ color:'var(--ash)', fontSize:'0.82rem' }}>📜 {s.campagnes.nom}</div>}
              {s.date_session && <div style={{ color:'var(--ash)', fontSize:'0.82rem' }}>📅 {new Date(s.date_session).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</div>}
            </div>
            <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
              <button className="btn-gold" onClick={()=>startEdit(s)} style={{ fontSize:'0.75rem', padding:'0.35rem 0.75rem' }}>Modifier</button>
              <button className="btn-danger" onClick={()=>del(s.id)} style={{ fontSize:'0.75rem', padding:'0.35rem 0.75rem' }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
