// Çiptun sesleri: hepsi Web Audio ile sentezlenir, dış ses dosyası yok. İlk dokunuştan önce çalmaz.
let ctx=null,sessiz=false;
try{sessiz=localStorage.getItem('agent-ofisi-sessiz')==='1'}catch{}
export function sesiAc(){
 try{ctx??=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume()}catch{ctx=null}
}
export function sessizMi(){return sessiz}
export function sessizYap(v){sessiz=v;try{localStorage.setItem('agent-ofisi-sessiz',v?'1':'0')}catch{}}
function nota(frekans,bas,sure,{tip='square',ses=.05,kay=null}={}){
 if(!ctx||sessiz)return;
 const t=ctx.currentTime+bas,o=ctx.createOscillator(),g=ctx.createGain();
 o.type=tip;o.frequency.setValueAtTime(frekans,t);if(kay)o.frequency.exponentialRampToValueAtTime(kay,t+sure);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(ses,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+sure);
 o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+sure+.02);
}
export const ses={
 secim(){nota(660,0,.04,{ses:.03})},
 dogru(){nota(988,0,.07);nota(1319,.06,.12)},
 kombo(){[784,988,1319,1568].forEach((f,i)=>nota(f,i*.05,.09,{ses:.045}))},
 yanlis(){nota(160,0,.22,{tip:'sawtooth',ses:.06,kay:90})},
 kacti(){nota(520,0,.35,{tip:'triangle',ses:.07,kay:130})},
 onay(){nota(1047,0,.06,{ses:.04});nota(1568,.07,.2,{tip:'triangle',ses:.06})},
 lale(){nota(523,0,.08,{tip:'triangle'});nota(659,.09,.1,{tip:'triangle'})},
 telefon(){for(let i=0;i<4;i++){nota(1320,i*.12,.05,{ses:.04});nota(990,i*.12+.06,.05,{ses:.04})}},
 kahve(){[659,587,523,392].forEach((f,i)=>nota(f,i*.13,.2,{tip:'triangle',ses:.05}))},
 basla(){[392,523,659,784].forEach((f,i)=>nota(f,i*.07,.1,{ses:.04}))},
 zil(){for(let i=0;i<3;i++){nota(1760,i*.28,.5,{tip:'sine',ses:.05});nota(1319,i*.28,.5,{tip:'triangle',ses:.03})}},
};
