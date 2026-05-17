import Layout from '../components/Layout'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function MonPersonnage() {
  const [mode, setMode] = useState('choix')
  const [form, setForm] = useState({ nom:'', classe:'', race:'', niveau:'', description:'', avatar_url:'', mot_de_passe:'', confirm_mdp:'' })
  const [recherche, setRecherche] = useState('')
  const [persoTrouve, setPersoTrouve] = useState(null)
  const [mdpModif, setMdpModif] = useState('')
  const [formModif, setFormModif] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const creer = async () => {
    setMsg(null)
    if (!form.nom.trim()) { setMsg({ type:'error', text:'Le nom du personnage est requis.' }); return }
    if (!form.mot_de_passe || form.mot_de_passe.length < 4) { setMsg({ type:'error', text:'Mot de passe trop court (4 caractères min).' }); return }
    if (form.mot_de_passe !== form.confirm_mdp) { setMsg({ type:'error', text:'Les mots de passe ne correspondent pas.' }); return }
    setLoading(true)
    const { error } = await supabase.from('personnages').insert({
      nom: form.nom.trim(), classe: form.classe, race: form.race,
      niveau: form.niveau ? parseInt(form.niveau) : null,
      description: form.description, avatar_url: form.avatar_url,
      mot_de_passe: form.mot_de_passe
    })
    setLoading(false)
    if (error) setMsg({ type:'error', text:error.message })
    else {
      setMsg({ type:'success', text:`✅ Personnage "${form.nom}" créé ! Retenez bien votre mot de passe.` })
      setForm({ nom:'', classe:'', race:'', niveau:'', description:'', avatar_url:'', mot_de_passe:'', confirm_mdp:'' })
    }
  }

  const rechercherPerso = async () => {
    setMsg(null); setPersoTrouve(null)
    if (!recherche.trim() || recherche.trim().length < 2) { setMsg({ type:'error', text:'Entrez au moins 2 lettres.' }); return }
    setLoading(true)
    const { data } = await supabase.from('personnages').select('*').ilike('nom', `${recherche.trim()}%`)
    setLoading(false)
    if (!data || data.length === 0) setMsg({ type:'error', text:'Aucun personnage trouvé.' })
    else if (data.length === 1) setPersoTrouve(data[0])
    else setMsg({ type:'error', text:`${data.length} personnages trouvés, soyez plus précis.` })
  }

  const validerModif = () => {
    setMsg(null)
    if (mdpModif !== persoTrouve.mot_de_passe) { setMsg({ type:'error', text:'Mot de passe incorrect.' }); return }
    setFormModif({ ...persoTrouve, confirm_mdp:'', nouveau_mdp:'' })
  }

  const sauvegarderModif = async () => {
    setMsg(null); setLoading(true)
    const updates = { nom:formModif.nom, classe:formModif.classe, race:formModif.race, niveau:formModif.niveau?parseInt(formModif.niveau):null, description:formModif.description, avatar_url:formModif.avatar_url }
    if (formModif.nouveau_mdp) {
      if (formModif.nouveau_mdp !== formModif.confirm_mdp) { setMsg({ type:'error', text:'Les mots de passe ne correspondent pas.' }); setLoading(false); return }
      updates.mot_de_passe = formModif.nouveau_mdp
    }
    const { error } = await supabase.from('personnages').update(updates).eq('id', persoTrouve.id)
    setLoading(false)
    if (error) setMsg({ type:'error', text:error.message })
    else { setMsg({ type:'success', text:'✅ Personnage mis à jour !' }); setFormModif(null); setPersoTrouve(null); setMdpModif(''); setMode('choix') }
  }

  const F = ({ label, value, onChange, placeholder, type='text', span }) => (
    <div style={{ gridColumn:span?'1/-1':undefined }}>
      <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>{label}</label>
      <input className="input-field" type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />
    </div>
  )

  return (
    <Layout>
      <div style={{ maxWidth:700, margin:'0 auto', padding:'3rem 1.5rem' }}>
        <h1 style={{ color:'var(--gold)', fontSize:'2rem', textAlign:'center', marginBottom:'0.5rem' }}>Mon Personnage</h1>
        <div className="divider"><span>🧙</span></div>

        {/* Choix */}
        {mode === 'choix' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'2rem' }}>
            {[
              { icon:'⚔️', label:'Créer mon personnage', desc:'Nouvelle fiche aventurier', action:'creer' },
              { icon:'📜', label:'Modifier mon personnage', desc:'Mettre à jour ma fiche', action:'modifier' }
            ].map(item => (
              <button key={item.action} onClick={()=>{ setMode(item.action); setMsg(null) }} style={{ padding:'2rem', textAlign:'center', background:'var(--stone-mid)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:2, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(201,168,76,0.7)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(201,168,76,0.3)'}>
                <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>{item.icon}</div>
                <div style={{ fontFamily:'Cinzel,serif', color:'var(--gold)', fontSize:'1rem', marginBottom:'0.4rem' }}>{item.label}</div>
                <div style={{ color:'var(--ash)', fontSize:'0.85rem' }}>{item.desc}</div>
              </button>
            ))}
          </div>
        )}

        {msg && (
          <div style={{ padding:'0.75rem 1rem', margin:'1.5rem 0', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', border:`1px solid ${msg.type==='error'?'rgba(139,0,0,0.4)':'rgba(40,120,40,0.4)'}`, color:msg.type==='error'?'#e07070':'#80d080' }}>
            {msg.text}
          </div>
        )}

        {/* Créer */}
        {mode === 'creer' && (
          <div className="card" style={{ padding:'2rem', marginTop:'2rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ color:'var(--gold)', fontSize:'1.1rem' }}>Nouvelle fiche personnage</h2>
              <button onClick={()=>{ setMode('choix'); setMsg(null) }} style={{ background:'none', border:'none', color:'var(--ash)', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'0.85rem' }}>← Retour</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <F label="Nom du personnage *" span value={form.nom} onChange={v=>setForm({...form,nom:v})} placeholder="Ex: Thalindra Ombrelune" />
              <F label="Classe" value={form.classe} onChange={v=>setForm({...form,classe:v})} placeholder="Ex: Rôdeur" />
              <F label="Race" value={form.race} onChange={v=>setForm({...form,race:v})} placeholder="Ex: Elfe" />
              <F label="Niveau" type="number" value={form.niveau} onChange={v=>setForm({...form,niveau:v})} placeholder="1-20" />
              <F label="URL Avatar" span value={form.avatar_url} onChange={v=>setForm({...form,avatar_url:v})} placeholder="https://..." />
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Description</label>
                <textarea className="input-field" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Histoire, traits, motivations..." />
              </div>
              <div style={{ gridColumn:'1/-1', borderTop:'1px solid rgba(201,168,76,0.15)', paddingTop:'1rem', marginTop:'0.5rem' }}>
                <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.85rem', marginBottom:'1rem' }}>🔐 Mot de passe</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  <F label="Mot de passe *" type="password" value={form.mot_de_passe} onChange={v=>setForm({...form,mot_de_passe:v})} placeholder="Min. 4 caractères" />
                  <F label="Confirmer *" type="password" value={form.confirm_mdp} onChange={v=>setForm({...form,confirm_mdp:v})} placeholder="Répétez le mot de passe" />
                </div>
                <p style={{ color:'var(--ash)', fontSize:'0.8rem', marginTop:'0.5rem' }}>⚠️ Retenez bien ce mot de passe, il vous servira pour commenter et modifier votre fiche.</p>
              </div>
            </div>
            <button className="btn-gold" onClick={creer} disabled={loading} style={{ marginTop:'1.5rem', width:'100%' }}>{loading?'Création...':'Créer mon personnage'}</button>
          </div>
        )}

        {/* Modifier — recherche */}
        {mode === 'modifier' && !persoTrouve && !formModif && (
          <div className="card" style={{ padding:'2rem', marginTop:'2rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ color:'var(--gold)', fontSize:'1.1rem' }}>Retrouver mon personnage</h2>
              <button onClick={()=>{ setMode('choix'); setMsg(null) }} style={{ background:'none', border:'none', color:'var(--ash)', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'0.85rem' }}>← Retour</button>
            </div>
            <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Premières lettres du nom *</label>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <input className="input-field" value={recherche} onChange={e=>setRecherche(e.target.value)} onKeyDown={e=>e.key==='Enter'&&rechercherPerso()} placeholder="Ex: Thal..." style={{ flex:1 }} />
              <button className="btn-primary" onClick={rechercherPerso} disabled={loading} style={{ flexShrink:0 }}>{loading?'...':'Rechercher'}</button>
            </div>
          </div>
        )}

        {/* Validation mot de passe */}
        {mode === 'modifier' && persoTrouve && !formModif && (
          <div className="card" style={{ padding:'2rem', marginTop:'2rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', background:'rgba(201,168,76,0.08)', padding:'1rem', borderRadius:2 }}>
              {persoTrouve.avatar_url ? <img src={persoTrouve.avatar_url} alt="" style={{ width:56, height:56, borderRadius:'50%', objectFit:'cover' }} /> : <span style={{ fontSize:'2.5rem' }}>🧙</span>}
              <div>
                <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'1.1rem' }}>{persoTrouve.nom}</div>
                <div style={{ color:'var(--ash)', fontSize:'0.85rem' }}>{[persoTrouve.race, persoTrouve.classe, persoTrouve.niveau?`Niv.${persoTrouve.niveau}`:null].filter(Boolean).join(' · ')}</div>
              </div>
            </div>
            <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Mot de passe *</label>
            <input className="input-field" type="password" value={mdpModif} onChange={e=>setMdpModif(e.target.value)} onKeyDown={e=>e.key==='Enter'&&validerModif()} placeholder="Votre mot de passe..." style={{ marginBottom:'1rem' }} />
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button className="btn-gold" onClick={validerModif}>Accéder à ma fiche</button>
              <button className="btn-primary" onClick={()=>{ setPersoTrouve(null); setMdpModif(''); setMsg(null) }}>← Retour</button>
            </div>
          </div>
        )}

        {/* Formulaire modification */}
        {formModif && (
          <div className="card" style={{ padding:'2rem', marginTop:'2rem' }}>
            <h2 style={{ color:'var(--gold)', fontSize:'1.1rem', marginBottom:'1.5rem' }}>Modifier — {persoTrouve.nom}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <F label="Nom" span value={formModif.nom} onChange={v=>setFormModif({...formModif,nom:v})} />
              <F label="Classe" value={formModif.classe||''} onChange={v=>setFormModif({...formModif,classe:v})} placeholder="Ex: Rôdeur" />
              <F label="Race" value={formModif.race||''} onChange={v=>setFormModif({...formModif,race:v})} placeholder="Ex: Elfe" />
              <F label="Niveau" type="number" value={formModif.niveau||''} onChange={v=>setFormModif({...formModif,niveau:v})} placeholder="1-20" />
              <F label="URL Avatar" span value={formModif.avatar_url||''} onChange={v=>setFormModif({...formModif,avatar_url:v})} placeholder="https://..." />
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Description</label>
                <textarea className="input-field" value={formModif.description||''} onChange={e=>setFormModif({...formModif,description:e.target.value})} />
              </div>
              <div style={{ gridColumn:'1/-1', borderTop:'1px solid rgba(201,168,76,0.15)', paddingTop:'1rem', marginTop:'0.5rem' }}>
                <div style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.85rem', marginBottom:'1rem' }}>🔐 Changer le mot de passe (facultatif)</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  <F label="Nouveau mot de passe" type="password" value={formModif.nouveau_mdp||''} onChange={v=>setFormModif({...formModif,nouveau_mdp:v})} placeholder="Laisser vide = inchangé" />
                  <F label="Confirmer" type="password" value={formModif.confirm_mdp||''} onChange={v=>setFormModif({...formModif,confirm_mdp:v})} placeholder="Répéter le nouveau" />
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
              <button className="btn-gold" onClick={sauvegarderModif} disabled={loading}>{loading?'Sauvegarde...':'Sauvegarder'}</button>
              <button className="btn-primary" onClick={()=>{ setFormModif(null); setMode('choix') }}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
