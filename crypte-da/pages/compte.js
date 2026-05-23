import Layout from '../components/Layout'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { setUser } from '../lib/auth'

export default function Compte() {
  const router = useRouter()
  const [mode, setMode] = useState('connexion')
  const [pseudo, setPseudo] = useState('')
  const [mdp, setMdp] = useState('')
  const [mdpConfirm, setMdpConfirm] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const connexion = async () => {
    setMsg(null)
    if (!pseudo.trim() || !mdp) { setMsg({ type:'error', text:'Pseudo et mot de passe requis.' }); return }
    setLoading(true)
    const { data } = await supabase.from('users').select('*').eq('pseudo', pseudo.trim()).single()
    setLoading(false)
    if (!data || data.mot_de_passe !== mdp) { setMsg({ type:'error', text:'Pseudo ou mot de passe incorrect.' }); return }
    setUser({ id:data.id, pseudo:data.pseudo, avatar_url:data.avatar_url })
    router.push('/mon-compte')
  }

  const inscription = async () => {
    setMsg(null)
    if (!pseudo.trim()) { setMsg({ type:'error', text:'Le pseudo est requis.' }); return }
    if (pseudo.trim().length < 3) { setMsg({ type:'error', text:'Pseudo trop court (3 caractères min).' }); return }
    if (!mdp || mdp.length < 4) { setMsg({ type:'error', text:'Mot de passe trop court (4 caractères min).' }); return }
    if (mdp !== mdpConfirm) { setMsg({ type:'error', text:'Les mots de passe ne correspondent pas.' }); return }
    setLoading(true)
    const { data: existing } = await supabase.from('users').select('id').eq('pseudo', pseudo.trim()).single()
    if (existing) { setMsg({ type:'error', text:'Ce pseudo est déjà pris.' }); setLoading(false); return }
    const { data, error } = await supabase.from('users').insert({ pseudo:pseudo.trim(), mot_de_passe:mdp, avatar_url:avatarUrl||null }).select().single()
    setLoading(false)
    if (error) { setMsg({ type:'error', text:error.message }); return }
    setUser({ id:data.id, pseudo:data.pseudo, avatar_url:data.avatar_url })
    router.push('/mon-compte')
  }

  return (
    <Layout>
      <div style={{ maxWidth:440, margin:'0 auto', padding:'3rem 1rem 4rem' }}>
        <h1 style={{ color:'var(--gold)', fontSize:'clamp(1.4rem,4vw,2rem)', textAlign:'center', marginBottom:'0.5rem' }}>
          {mode === 'connexion' ? 'Connexion' : 'Créer un compte'}
        </h1>
        <div className="divider"><span>🔐</span></div>
        <div style={{ display:'flex', marginBottom:'2rem', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2, overflow:'hidden' }}>
          {['connexion','inscription'].map(m => (
            <button key={m} onClick={()=>{ setMode(m); setMsg(null) }} style={{ flex:1, padding:'0.75rem', fontFamily:'Cinzel,serif', fontSize:'0.78rem', letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', border:'none', background:mode===m?'rgba(201,168,76,0.15)':'transparent', color:mode===m?'var(--gold)':'var(--ash)', borderBottom:mode===m?'2px solid var(--gold)':'2px solid transparent', transition:'all 0.2s' }}>
              {m === 'connexion' ? 'Se connecter' : 'S\'inscrire'}
            </button>
          ))}
        </div>
        <div className="card" style={{ padding:'1.5rem' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Pseudo *</label>
              <input className="input-field" value={pseudo} onChange={e=>setPseudo(e.target.value)} placeholder="Votre pseudo..." onKeyDown={e=>e.key==='Enter'&&(mode==='connexion'?connexion():null)} />
            </div>
            <div>
              <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Mot de passe *</label>
              <input className="input-field" type="password" value={mdp} onChange={e=>setMdp(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&(mode==='connexion'?connexion():null)} />
            </div>
            {mode === 'inscription' && (
              <>
                <div>
                  <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>Confirmer *</label>
                  <input className="input-field" type="password" value={mdpConfirm} onChange={e=>setMdpConfirm(e.target.value)} placeholder="••••••••" />
                </div>
                <div>
                  <label style={{ display:'block', color:'var(--ash)', fontSize:'0.78rem', fontFamily:'Cinzel,serif', marginBottom:'0.3rem' }}>URL Avatar (facultatif)</label>
                  <input className="input-field" value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} placeholder="https://..." />
                </div>
              </>
            )}
          </div>
          {msg && <div style={{ padding:'0.75rem 1rem', margin:'1rem 0 0', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{msg.text}</div>}
          <button className="btn-gold" onClick={mode==='connexion'?connexion:inscription} disabled={loading} style={{ width:'100%', marginTop:'1.5rem' }}>
            {loading ? '...' : mode==='connexion' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
