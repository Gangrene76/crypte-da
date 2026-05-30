import AdminLayout from '../../components/AdminLayout'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { titre:'', contenu:'', image_url:'', mj_id:'', publie:true, sondage_question:'', sondage_choix:['','','',''] }

function Field({ label, value, onChange, placeholder, type='text', span }) {
  return (
    <div style={{ gridColumn:span?'1/-1':undefined }}>
      <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>{label}</label>
      <input className="input-field" type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />
    </div>
  )
}

export default function AdminNews() {
  const [articles, setArticles] = useState([])
  const [mjs, setMjs] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [msg, setMsg] = useState(null)

  useEffect(() => { load() }, [])
  const load = async () => {
    const [{ data: a }, { data: m }] = await Promise.all([
      supabase.from('news').select('*,mj(prenom)').order('created_at',{ascending:false}),
      supabase.from('mj').select('*')
    ])
    setArticles(a||[]); setMjs(m||[])
  }

  const setField = key => val => setForm(f => ({ ...f, [key]: val }))

  const save = async () => {
    setMsg(null)
    if (!form.titre.trim() || !form.contenu.trim()) { setMsg({ type:'error', text:'Titre et contenu requis.' }); return }
    const choixFiltres = (form.sondage_choix||[]).filter(c => c.trim())
    const data = {
      titre: form.titre, contenu: form.contenu, image_url: form.image_url||null,
      mj_id: form.mj_id||null, publie: form.publie,
      sondage_question: form.sondage_question||null,
      sondage_choix: form.sondage_question && choixFiltres.length >= 2 ? choixFiltres : null
    }
    if (editing === 'new') {
      const { error } = await supabase.from('news').insert(data)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Article publié !' }); setEditing(null); load() }
    } else {
      const { error } = await supabase.from('news').update(data).eq('id', editing)
      if (error) setMsg({ type:'error', text:error.message }); else { setMsg({ type:'success', text:'Enregistré !' }); setEditing(null); load() }
    }
  }

  const del = async (id) => { if (!confirm('Supprimer cet article ?')) return; await supabase.from('news').delete().eq('id',id); load() }
  const startEdit = (a) => {
    setEditing(a.id)
    setForm({ titre:a.titre||'', contenu:a.contenu||'', image_url:a.image_url||'', mj_id:a.mj_id||'', publie:a.publie!==false, sondage_question:a.sondage_question||'', sondage_choix:a.sondage_choix||['','','',''] })
    setMsg(null); window.scrollTo(0,0)
  }
  const togglePublie = async (id, publie) => { await supabase.from('news').update({ publie:!publie }).eq('id',id); load() }

  return (
    <AdminLayout title="News & Chroniques">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <span style={{ color:'var(--ash)', fontSize:'0.9rem' }}>{articles.length} article{articles.length!==1?'s':''}</span>
        <button className="btn-gold" onClick={()=>{ setEditing('new'); setForm(EMPTY); setMsg(null); window.scrollTo(0,0) }}>+ Nouvel article</button>
      </div>

      {msg && <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{msg.text}</div>}

      {editing && (
        <div className="card" style={{ padding:'2rem', marginBottom:'2rem' }}>
          <h3 style={{ color:'var(--gold)', marginBottom:'1.5rem', fontSize:'1rem' }}>{editing==='new'?'Nouvel article':'Modifier l\'article'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <Field label="Titre *" span value={form.titre} onChange={setField('titre')} placeholder="Ex: Nouvelle campagne annoncée !" />
            <div>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Auteur (MJ)</label>
              <select className="input-field" value={form.mj_id} onChange={e=>setField('mj_id')(e.target.value)}>
                <option value="">— Choisir —</option>
                {mjs.map(m => <option key={m.id} value={m.id}>{m.prenom}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0' }}>
              <label style={{ color:'var(--ash)', fontFamily:'Cinzel,serif', fontSize:'0.78rem' }}>Publié</label>
              <button onClick={()=>setField('publie')(!form.publie)} style={{ width:42, height:24, borderRadius:12, background:form.publie?'rgba(40,120,40,0.5)':'rgba(100,80,80,0.3)', border:`1px solid ${form.publie?'rgba(40,120,40,0.6)':'rgba(139,0,0,0.4)'}`, cursor:'pointer', position:'relative', transition:'all 0.2s' }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:form.publie?'#80d080':'#e07070', position:'absolute', top:2, left:form.publie?20:2, transition:'left 0.2s' }} />
              </button>
              <span style={{ color:form.publie?'#80d080':'#e07070', fontSize:'0.8rem' }}>{form.publie?'Visible':'Masqué'}</span>
            </div>
            <Field label="URL Image (facultatif)" value={form.image_url} onChange={setField('image_url')} placeholder="https://..." />
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Contenu *</label>
              <textarea className="input-field" value={form.contenu} onChange={e=>setField('contenu')(e.target.value)} placeholder="Le texte de ton article..." style={{ minHeight:200 }} />
            </div>

            {/* SONDAGE */}
            <div style={{ gridColumn:'1/-1', paddingTop:'1.25rem', borderTop:'1px solid rgba(201,168,76,0.15)' }}>
              <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.88rem', marginBottom:'1rem' }}>📊 Sondage (facultatif)</div>
              <div style={{ marginBottom:'0.75rem' }}>
                <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Question du sondage</label>
                <input className="input-field" value={form.sondage_question} onChange={e=>setField('sondage_question')(e.target.value)} placeholder="Ex: Quelle campagne voulez-vous rejoindre ?" />
              </div>
              {form.sondage_question.trim() && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                  {[0,1,2,3].map(i => (
                    <div key={i}>
                      <label style={{ display:'block', color:'var(--ash)', fontSize:'0.72rem', fontFamily:'Cinzel,serif', marginBottom:'0.25rem' }}>Choix {i+1}{i < 2?' *':' (optionnel)'}</label>
                      <input className="input-field" value={form.sondage_choix[i]||''} onChange={e=>{ const c=[...form.sondage_choix]; c[i]=e.target.value; setField('sondage_choix')(c) }} placeholder={`Option ${i+1}...`} />
                    </div>
                  ))}
                </div>
              )}
              {form.sondage_question.trim() && <p style={{ color:'var(--ash)', fontSize:'0.75rem', marginTop:'0.5rem' }}>Minimum 2 choix requis. Les choix vides seront ignorés.</p>}
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
            <button className="btn-gold" onClick={save}>Enregistrer</button>
            <button className="btn-primary" onClick={()=>setEditing(null)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {articles.length === 0 && !editing && <div className="card" style={{ padding:'2rem', textAlign:'center', color:'var(--ash)' }}>Aucun article. Crée-en un !</div>}
        {articles.map(a => (
          <div key={a.id} className="card" style={{ padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.2rem', flexWrap:'wrap' }}>
                <span style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.95rem' }}>{a.titre}</span>
                <span style={{ fontSize:'0.65rem', padding:'0.15rem 0.5rem', borderRadius:2, fontFamily:'Cinzel,serif', background:a.publie?'rgba(40,120,40,0.2)':'rgba(100,80,80,0.2)', color:a.publie?'#80d080':'#e07070', border:`1px solid ${a.publie?'rgba(40,120,40,0.4)':'rgba(139,0,0,0.3)'}` }}>{a.publie?'Publié':'Masqué'}</span>
                {a.sondage_question && <span style={{ fontSize:'0.65rem', padding:'0.15rem 0.5rem', borderRadius:2, fontFamily:'Cinzel,serif', background:'rgba(201,168,76,0.15)', color:'var(--gold)', border:'1px solid rgba(201,168,76,0.3)' }}>📊 Sondage</span>}
              </div>
              <div style={{ color:'var(--ash)', fontSize:'0.8rem', display:'flex', gap:'1rem' }}>
                {a.mj && <span>🎭 {a.mj.prenom}</span>}
                <span>{new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', flexShrink:0, flexWrap:'wrap' }}>
              <button onClick={()=>togglePublie(a.id,a.publie)} className={a.publie?'btn-primary':'btn-gold'} style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem' }}>{a.publie?'Masquer':'Publier'}</button>
              <button className="btn-gold" onClick={()=>startEdit(a)} style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem' }}>Modifier</button>
              <button className="btn-danger" onClick={()=>del(a.id)} style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem' }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
