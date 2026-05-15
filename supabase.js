@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --blood: #8B0000;
  --blood-light: #c0392b;
  --gold: #c9a84c;
  --gold-light: #f0d080;
  --stone: #1a1714;
  --stone-mid: #2a2522;
  --stone-light: #3d3530;
  --parchment: #e8d5b0;
  --ash: #9a9090;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  background-color: var(--stone);
  color: var(--parchment);
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 18px;
  min-height: 100vh;
}

h1,h2,h3,h4,h5 { font-family: 'Cinzel', serif; letter-spacing: 0.05em; }

.divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
.divider::before,.divider::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, transparent, var(--gold), transparent); }
.divider span { color: var(--gold); font-family: 'Cinzel', serif; font-size: 1rem; }

.card { background: var(--stone-mid); border: 1px solid rgba(201,168,76,0.2); border-radius: 2px; transition: border-color 0.3s, transform 0.2s; }
.card:hover { border-color: rgba(201,168,76,0.5); transform: translateY(-2px); }

.btn-primary { background: linear-gradient(135deg,var(--blood) 0%,#6b0000 100%); color: var(--parchment); font-family: 'Cinzel',serif; font-size: 0.8rem; letter-spacing: 0.1em; padding: 0.6rem 1.5rem; border: 1px solid rgba(201,168,76,0.3); border-radius: 2px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; display: inline-block; }
.btn-primary:hover { background: linear-gradient(135deg,var(--blood-light) 0%,var(--blood) 100%); border-color: var(--gold); }

.btn-gold { background: linear-gradient(135deg,var(--gold) 0%,#a07830 100%); color: var(--stone); font-family: 'Cinzel',serif; font-size: 0.8rem; letter-spacing: 0.1em; padding: 0.6rem 1.5rem; border-radius: 2px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; display: inline-block; }
.btn-gold:hover { background: linear-gradient(135deg,var(--gold-light) 0%,var(--gold) 100%); }

.btn-danger { background: rgba(139,0,0,0.3); color: #e07070; font-family: 'Cinzel',serif; font-size: 0.8rem; letter-spacing: 0.1em; padding: 0.5rem 1rem; border: 1px solid rgba(139,0,0,0.5); border-radius: 2px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; display: inline-block; }
.btn-danger:hover { background: rgba(139,0,0,0.6); }

.input-field { background: rgba(255,255,255,0.05); border: 1px solid rgba(201,168,76,0.3); border-radius: 2px; color: var(--parchment); padding: 0.6rem 1rem; font-family: 'Crimson Text',serif; font-size: 1rem; width: 100%; transition: border-color 0.2s; }
.input-field:focus { outline: none; border-color: var(--gold); background: rgba(255,255,255,0.08); }
.input-field::placeholder { color: var(--ash); }
textarea.input-field { resize: vertical; min-height: 100px; }

.badge { font-family: 'Cinzel',serif; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 2px; }
.badge-future { background: rgba(201,168,76,0.2); color: var(--gold); border: 1px solid rgba(201,168,76,0.4); }
.badge-past { background: rgba(100,80,80,0.3); color: #c09090; border: 1px solid rgba(139,0,0,0.3); }
.badge-active { background: rgba(40,120,40,0.2); color: #80d080; border: 1px solid rgba(40,120,40,0.4); }
.badge-terminee { background: rgba(80,80,80,0.3); color: var(--ash); border: 1px solid rgba(100,100,100,0.3); }

.gold-text { color: var(--gold); }
.blood-text { color: var(--blood-light); }
.ash-text { color: var(--ash); }

@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
.fade-in { animation: fadeIn 0.5s ease forwards; }

select.input-field option { background: var(--stone-mid); color: var(--parchment); }
