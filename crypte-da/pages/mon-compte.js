import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { getUser, logout } from '../lib/auth'

const EMPTY_FORM = { nom:'', classe:'', race:'', niveau:'', jeu:'', description:'', avatar_url:'' }

// Composant champ défini HORS du composant principal pour éviter le bug de refocus
function Field({ label, value, onChange, placeholder, type='text', span, as='input' }) {
  return (
    <div style={{ gridColumn:span?'1/-1':undefined }}>
      <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>{label}</label>
      {as === 'textarea'
        ? <textarea className="input-field" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />
        : <input className="input-field" type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />
      }
    </div>
  )
}

export default function MonCompte() {
  const router = useRouter()
  const [user, setUserState] = useState(null)
  const [personnages, setPersonnages] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/compte'); return }
    setUserState(u)
    loadPersonnages(u.id)
  }, [])

  const loadPersonnages = async (userId) => {
    const { data } = await supabase.from('personnages').select('*,campagnes(nom)').eq('user_id', userId)
    setPersonnages(data||[])
  }

  const setField = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

  const sauvegarder = async () => {
    setMsg(null)
    if (!form.nom.trim()) { setMsg({ type:'error', text:'Le nom est requis.' }); return }
    setLoading(true)
    const payload = { ...form, niveau: form.niveau ? parseInt(form.niveau) : null, user_id: user.id }
    if (editing === 'new') {
      const { error } = await supabase.from('personnages').insert(payload)
      if (error) setMsg({ type:'error', text:error.message })
      else { setMsg({ type:'success', text:'Personnage créé !' }); setEditing(null); loadPersonnages(user.id) }
    } else {
      const { error } = await supabase.from('personnages').update(payload).eq('id', editing)
      if (error) setMsg({ type:'error', text:error.message })
      else { setMsg({ type:'success', text:'Enregistré !' }); setEditing(null); loadPersonnages(user.id) }
    }
    setLoading(false)
  }

  const startEdit = (p) => {
    setEditing(p.id)
    setForm({ nom:p.nom||'', classe:p.classe||'', race:p.race||'', niveau:p.niveau||'', jeu:p.jeu||'', description:p.description||'', avatar_url:p.avatar_url||'' })
    setMsg(null); window.scrollTo(0,0)
  }

  const del = async (id) => {
    if (!confirm('Supprimer ce personnage ?')) return
    await supabase.from('personnages').delete().eq('id', id)
    loadPersonnages(user.id)
  }

  const deconnexion = () => { logout(); router.push('/') }

  if (!user) return null

  return (
    <Layout>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'3rem 1.5rem' }}>

        {/* Header profil */}
        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2rem', flexWrap:'wrap' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,var(--blood),#3d0000)', border:'2px solid rgba(201,168,76,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', overflow:'hidden', flexShrink:0 }}>
            {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🧙'}
          </div>
          <div style={{ flex:1 }}>
            <h1 style={{ color:'var(--gold)', fontSize:'1.8rem', fontFamily:'Cinzel,serif' }}>{user.pseudo}</h1>
            <p style={{ color:'var(--ash)', fontSize:'0.9rem' }}>{personnages.length} personnage{personnages.length!==1?'s':''}</p>
          </div>
          <button onClick={deconnexion} className="btn-danger" style={{ fontSize:'0.78rem' }}>Déconnexion</button>
        </div>

        <div className="divider"><span>⚔️</span></div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ color:'var(--gold)', fontSize:'1.2rem' }}>Mes Personnages</h2>
          <button className="btn-gold" onClick={()=>{ setEditing('new'); setForm(EMPTY_FORM); setMsg(null) }}>+ Nouveau</button>
        </div>

        {msg && (
          <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>
            {msg.text}
          </div>
        )}

        {/* Formulaire */}
        {editing && (
          <div className="card" style={{ padding:'2rem', marginBottom:'2rem' }}>
            <h3 style={{ color:'var(--gold)', marginBottom:'1.5rem', fontSize:'1rem' }}>
              {editing==='new' ? 'Nouveau personnage' : 'Modifier le personnage'}
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <Field label="Nom *" span value={form.nom} onChange={setField('nom')} placeholder="Ex: Thalindra Ombrelune" />
              <Field label="Jeu / Système" span value={form.jeu} onChange={setField('jeu')} placeholder="Ex: D&D 5e, Pathfinder, Warhammer..." />
              <Field label="Classe" value={form.classe} onChange={setField('classe')} placeholder="Ex: Rôdeur" />
              <Field label="Race" value={form.race} onChange={setField('race')} placeholder="Ex: Elfe" />
              <Field label="Niveau" type="number" value={form.niveau} onChange={setField('niveau')} placeholder="1-20" />
              <Field label="URL Avatar" value={form.avatar_url} onChange={setField('avatar_url')} placeholder="https://..." />
              <Field label="Description" span as="textarea" value={form.description} onChange={setField('description')} placeholder="Histoire, traits, motivations..." />
            </div>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
              <button className="btn-gold" onClick={sauvegarder} disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button className="btn-primary" onClick={()=>setEditing(null)}>Annuler</button>
            </div>
          </div>
        )}

        {/* Liste personnages */}
        {personnages.length === 0 && !editing ? (
          <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🧙</div>
            <p style={{ color:'var(--ash)', marginBottom:'1.5rem' }}>Vous n'avez pas encore de personnage.</p>
            <button className="btn-gold" onClick={()=>{ setEditing('new'); setForm(EMPTY_FORM) }}>
              Créer mon premier personnage
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' }}>
            {personnages.map(p => (
              <div key={p.id} className="card" style={{ padding:'1.25rem' }}>
                <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                  <div style={{ width:50, height:50, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', overflow:'hidden', flexShrink:0 }}>
                    {p.avatar_url ? <img src={p.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🧙'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.95rem' }}>{p.nom}</div>
                    <div style={{ color:'var(--ash)', fontSize:'0.8rem', marginTop:'0.2rem' }}>
                      {[p.race, p.classe, p.niveau?`Niv.${p.niveau}`:null].filter(Boolean).join(' · ')}
                    </div>
                    {p.jeu && <div style={{ color:'var(--gold)', fontSize:'0.72rem', marginTop:'0.2rem', opacity:0.7 }}>🎲 {p.jeu}</div>}
                    {p.campagnes && <div style={{ color:'var(--ash)', fontSize:'0.72rem', marginTop:'0.2rem', opacity:0.7 }}>📜 {p.campagnes.nom}</div>}
                  </div>
                </div>
                {p.description && (
                  <p style={{ color:'var(--ash)', fontSize:'0.82rem', lineHeight:1.5, marginBottom:'0.75rem', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {p.description}
                  </p>
                )}
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <button className="btn-gold" onClick={()=>startEdit(p)} style={{ fontSize:'0.72rem', padding:'0.3rem 0.6rem' }}>Modifier</button>
                  <button className="btn-danger" onClick={()=>del(p.id)} style={{ fontSize:'0.72rem', padding:'0.3rem 0.6rem' }}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
