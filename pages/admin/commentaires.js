import AdminLayout from '../../components/AdminLayout'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminCommentaires() {
  const [commentaires, setCommentaires] = useState([])
  const [filtre, setFiltre] = useState('attente')
  const [msg, setMsg] = useState(null)

  useEffect(() => { load() }, [filtre])
  const load = async () => {
    let q = supabase.from('commentaires').select('*,sessions(titre)').order('created_at',{ascending:false})
    if (filtre === 'attente') q = q.eq('approuve', false)
    if (filtre === 'approuves') q = q.eq('approuve', true)
    const { data } = await q
    setCommentaires(data||[])
  }

  const approuver = async (id) => {
    await supabase.from('commentaires').update({ approuve: true }).eq('id', id)
    setMsg({ type:'success', text:'Commentaire approuvé et publié.' }); load()
  }
  const rejeter = async (id) => {
    if (!confirm('Supprimer ce commentaire définitivement ?')) return
    await supabase.from('commentaires').delete().eq('id', id)
    setMsg({ type:'success', text:'Commentaire supprimé.' }); load()
  }

  return (
    <AdminLayout title="Commentaires">
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'2rem', flexWrap:'wrap' }}>
        {[['attente','⏳ En attente'],['approuves','✅ Approuvés'],['tous','📋 Tous']].map(([val,label]) => (
          <button key={val} onClick={()=>{ setFiltre(val); setMsg(null) }} style={{ fontFamily:'Cinzel,serif', fontSize:'0.78rem', letterSpacing:'0.08em', padding:'0.5rem 1.25rem', borderRadius:2, cursor:'pointer', transition:'all 0.2s', background:filtre===val?'rgba(201,168,76,0.2)':'transparent', color:filtre===val?'var(--gold)':'var(--ash)', border:`1px solid ${filtre===val?'rgba(201,168,76,0.5)':'rgba(201,168,76,0.15)'}` }}>{label}</button>
        ))}
      </div>

      {msg && <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', borderRadius:2, background:msg.type==='error'?'rgba(139,0,0,0.2)':'rgba(40,120,40,0.2)', color:msg.type==='error'?'#e07070':'#80d080', fontSize:'0.9rem' }}>{msg.text}</div>}

      {commentaires.length === 0 && (
        <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>{filtre==='attente'?'🎉':'📭'}</div>
          <p style={{ color:'var(--ash)' }}>{filtre==='attente'?'Aucun commentaire en attente de modération.':filtre==='approuves'?'Aucun commentaire approuvé.':'Aucun commentaire.'}</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {commentaires.map(c => (
          <div key={c.id} className="card" style={{ padding:'1.5rem', borderColor:c.approuve?'rgba(40,120,40,0.3)':'rgba(201,168,76,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem', marginBottom:'0.75rem' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', marginBottom:'0.3rem' }}>
                  <span style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:'0.9rem' }}>⚔️ {c.pseudo}</span>
                  {c.note && <span style={{ color:'var(--gold)' }}>{'🎲'.repeat(c.note)} <span style={{ color:'var(--ash)', fontSize:'0.8rem' }}>{c.note}/5</span></span>}
                  <span style={{ fontSize:'0.65rem', padding:'0.15rem 0.5rem', borderRadius:2, fontFamily:'Cinzel,serif', background:c.approuve?'rgba(40,120,40,0.2)':'rgba(201,168,76,0.1)', color:c.approuve?'#80d080':'var(--gold)', border:`1px solid ${c.approuve?'rgba(40,120,40,0.4)':'rgba(201,168,76,0.3)'}` }}>{c.approuve?'Publié':'En attente'}</span>
                </div>
                <div style={{ color:'var(--ash)', fontSize:'0.78rem', display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                  {c.sessions && <span>📜 {c.sessions.titre}</span>}
                  <span>🔑 {c.code_utilise}</span>
                  <span>🕒 {new Date(c.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                {!c.approuve && <button className="btn-gold" onClick={()=>approuver(c.id)} style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem' }}>✅ Approuver</button>}
                <button className="btn-danger" onClick={()=>rejeter(c.id)} style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem' }}>🗑 Supprimer</button>
              </div>
            </div>
            {c.contenu && (
              <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:2, padding:'1rem', borderLeft:'2px solid rgba(201,168,76,0.3)' }}>
                <p style={{ color:'var(--parchment)', lineHeight:1.7, margin:0, fontSize:'0.95rem', whiteSpace:'pre-wrap' }}>{c.contenu}</p>
              </div>
            )}
            {!c.contenu && <p style={{ color:'var(--ash)', fontSize:'0.85rem', fontStyle:'italic', margin:0 }}>Note uniquement, sans commentaire écrit.</p>}
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
