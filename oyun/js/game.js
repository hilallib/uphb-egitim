// Bir iş gününün kuralları: projeler adım adım ilerler. Ekrana dokunmaz; zaman milisaniye olarak dışarıdan verilir.
export function rastgele(seed){
 let s=seed>>>0;
 return()=>{s=s+0x6D2B79F5>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
}

export class Mesai{
 constructor({agents,projeler,ayar,gun,seed=Date.now()}){
  this.agents=agents.filter(a=>a.id!=='hilal'&&gun.acik.includes(a.room)).map(a=>a.id);
  this.tanim=Object.fromEntries(projeler.map(p=>[p.id,p]));
  this.ayar=ayar;this.gun=gun;this.rnd=rastgele(seed);this.seed=seed;
  this.durum='bekliyor';
 }
 baslat(now){
  const g=this.gun;
  Object.assign(this,{durum:'oyunda',basla:now,now,puan:0,pil:this.ayar.pil,seri:0,kuyruk:[],secili:null,sayac:0,projeNo:0,
   projeler:[],isler:[],mesgul:{},balon:{},isik:{},yuruyus:null,olaylar:[],bitisNedeni:null,ipucu:!!g.ogretici,hizBitis:0,
   bekleyenProje:[...g.projeler].sort((a,b)=>a.sn-b.sn),bekleyenOlay:[...g.olaylar||[]].sort((a,b)=>a.sn-b.sn),
   istat:{adim:0,dogru:0,yanlis:0,laleye:0,onay:0,onaysiz:0,bitenProje:0,yildiz:0,geciken:0,acil:0,acilKacan:0,agent:{},karisik:{}}});
  this.tick(now);
 }
 get gecenSn(){return(this.now-this.basla)/1000}
 saatYaz(sn){const {baslangic,bitis}=this.ayar.saat,dk=Math.min(Math.max(sn,0)/this.gun.sureSn,1)*(bitis-baslangic)*60;return`${String(baslangic+Math.floor(dk/60)).padStart(2,'0')}:${String(Math.floor(dk%60)).padStart(2,'0')}`}
 get saat(){return this.saatYaz(this.gecenSn)}
 get kombo(){return this.seri>=this.ayar.puan.komboEsik}
 get kahvede(){return this.hizBitis>this.now}
 get hedef(){return this.gun.hedef||0}
 get hedefTamam(){return this.istat.bitenProje>=this.hedef}
 get aktifProjeler(){return this.projeler.filter(p=>!p.bitti&&!p.iptal)}
 olay(tur,veri={}){this.olaylar.push({tur,zaman:this.now,...veri})}

 projeAc(tanim,{teslim,acil=false}){
  const p={no:++this.projeNo,id:tanim.id,tanim,acil,basla:this.now,teslim,adim:0,acik:0,hata:0,bitti:false,iptal:false,gec:false,zincir:[]};
  this.projeler.push(p);this.olay('projeGeldi',{proje:p});this.adimAc(p);return p;
 }
 adimAc(p){
  const grup=p.tanim.adimlar[p.adim];p.acik=grup.length;p.zincir.push([]);
  for(const gorev of grup)this.kuyruk.push({id:++this.sayac,proje:p,gorev,geldi:this.now,acil:p.acil});
  if(p.adim>0)this.olay('adimAcildi',{proje:p,sayi:grup.length});
 }
 isBasla(agent,kart,puan,yol){
  const sure=this.ayar.calismaSn*1000/(this.kahvede?this.ayar.kahveHiz:1);
  const bas=Math.max(this.now,this.mesgul[agent]||0);
  this.mesgul[agent]=bas+sure;this.isler.push({agent,kart,basla:bas,bitis:bas+sure});
  this.puan+=puan;this.istat.adim++;this.istat.agent[agent]=(this.istat.agent[agent]||0)+1;
  this.olay('dogru',{agent,puan,yol,kart});
 }
 adimBitti(is){
  const p=is.kart.proje;if(p.iptal)return;
  p.zincir[p.adim].push(is.agent);p.acik--;
  const son=p.acik===0&&p.adim===p.tanim.adimlar.length-1;
  this.olay('adimBitti',{agent:is.agent,kart:is.kart,proje:p,son,kalan:p.acik,adimNo:p.adim+1});
  if(p.acik>0)return;
  p.adim++;
  if(p.adim<p.tanim.adimlar.length)this.adimAc(p);else this.projeBitti(p);
 }
 projeBitti(p){
  const P=this.ayar.puan,zamaninda=this.now<=p.teslim;
  p.bitti=true;p.bitis=this.now;p.yildiz=1+(zamaninda?1:0)+(zamaninda&&!p.hata?1:0);
  const bonus=(P.proje+p.yildiz*P.yildiz)*(p.acil?P.acilCarpan:1);
  this.puan+=bonus;p.bonus=bonus;if(p.acil)this.istat.acil++;
  else{this.istat.bitenProje++;this.istat.yildiz+=p.yildiz}
  this.olay('projeBitti',{proje:p,yildiz:p.yildiz,bonus});
  if(!p.acil&&this.istat.bitenProje===this.hedef)this.olay('hedef',{hedef:this.hedef});
 }
 pilDus(n=1){this.pil=Math.max(0,this.pil-n);if(this.pil<=0)this.bitir('pil')}
 bitir(neden){if(this.durum!=='oyunda')return;this.durum='bitti';this.bitisNedeni=neden;this.secili=null;this.olay('bitti',{neden})}

 tick(now){
  if(this.durum!=='oyunda')return;
  this.now=now;
  if(this.yuruyus&&now>=this.yuruyus.bitis){const y=this.yuruyus;this.yuruyus=null;this.isBasla(y.hedef,y.kart,this.ayar.puan.lale,'lale')}
  for(const is of this.isler.filter(i=>i.bitis<=now).sort((a,b)=>a.bitis-b.bitis)){this.isler=this.isler.filter(i=>i!==is);this.adimBitti(is)}
  while(this.bekleyenProje.length&&this.gecenSn>=this.bekleyenProje[0].sn){
   const b=this.bekleyenProje.shift();this.projeAc(this.tanim[b.id],{teslim:this.basla+b.teslimSn*1000});
  }
  while(this.bekleyenOlay.length&&this.gecenSn>=this.bekleyenOlay[0].sn){
   const o=this.bekleyenOlay.shift();
   if(o.tur==='kahve'){this.hizBitis=now+this.ayar.kahveSn*1000;this.olay('kahve',{sure:this.ayar.kahveSn})}
   if(o.tur==='musteri'){const p=this.projeAc(this.tanim[o.proje],{teslim:now+o.sureSn*1000,acil:true});this.olay('musteri',{proje:p})}
  }
  for(const p of this.aktifProjeler.filter(p=>!p.gec&&now>p.teslim)){
   p.gec=true;
   if(p.acil){p.iptal=true;this.kuyruk=this.kuyruk.filter(k=>k.proje!==p);if(this.kuyruk.every(k=>k.id!==this.secili))this.secili=null;this.istat.acilKacan++;this.olay('acilKacti',{proje:p})}
   else{this.istat.geciken++;this.olay('gecikti',{proje:p})}
  }
  if(this.gecenSn>=this.gun.sureSn)this.bitir('saat');
 }
 sec(kartId){
  if(this.durum!=='oyunda')return;
  this.secili=this.secili===kartId?null:kartId;
 }
 masa(agent){
  if(this.durum!=='oyunda')return{tur:'yok'};
  const kart=this.kuyruk.find(k=>k.id===this.secili);
  if(agent==='hilal'){
   if(kart?.gorev.onay&&!kart.onayli){
    kart.onayli=true;this.secili=null;this.puan+=this.ayar.puan.onay;this.istat.onay++;
    this.balon.hilal={metin:'Onay!',ton:'calisiyor',bitis:this.now+900};
    return this.sonuc({tur:'onay',kart,puan:this.ayar.puan.onay});
   }
   return this.sonuc({tur:'kendi'});
  }
  if(!kart)return this.sonuc({tur:'secimyok'});
  const dogruAgent=kart.gorev.agent,p=kart.proje;
  if(this.mesgulMu(agent)){this.balon[agent]={metin:'Meşgul',ton:'mesgul',bitis:this.now+800};return this.sonuc({tur:'mesgul',agent})}
  const onaysiz=kart.gorev.onay&&!kart.onayli;
  if(onaysiz&&agent==='lale'){this.secili=null;this.isik.hilal=this.now+1200;return this.sonuc({tur:'laleOnay'})}
  if(onaysiz&&agent===dogruAgent){
   this.secili=null;this.seri=0;this.istat.onaysiz++;p.hata++;
   this.balon[agent]={metin:'!',ton:'yanlis',bitis:this.now+1000};this.isik.hilal=this.now+1200;
   const s=this.sonuc({tur:'onaysiz',agent,ceza:this.ayar.onayCeza});this.pilDus(this.ayar.onayCeza);return s;
  }
  if(agent===dogruAgent){
   const P=this.ayar.puan,komboVar=this.kombo,carpan=(komboVar?P.komboCarpan:1)*(kart.acil?P.acilCarpan:1);
   const hizli=this.now-kart.geldi<=P.hizSn*1000,puan=(P.adim+(hizli?P.hiz:0))*carpan;
   this.kartCikar(kart);this.seri++;this.istat.dogru++;this.ipucu=false;
   this.isBasla(agent,kart,puan,'direkt');
   return this.sonuc({tur:'dogru',agent,puan,hizli,kombo:komboVar,acil:kart.acil,kart});
  }
  if(agent==='lale'){
   this.kartCikar(kart);this.istat.laleye++;this.ipucu=false;
   this.yuruyus={hedef:dogruAgent,kart,basla:this.now,bitis:this.now+this.ayar.laleYuruyusSn*1000};
   return this.sonuc({tur:'lale',hedef:dogruAgent,kart});
  }
  this.secili=null;this.seri=0;this.istat.yanlis++;p.hata++;
  const cift=`${dogruAgent}|${agent}`;this.istat.karisik[cift]=(this.istat.karisik[cift]||0)+1;
  this.balon[agent]={metin:'?',ton:'yanlis',bitis:this.now+1000};this.isik[dogruAgent]=this.now+1000;
  const s=this.sonuc({tur:'yanlis',agent,dogruAgent,kart});this.pilDus();return s;
 }
 sonuc(s){this.olay('masa',{sonuc:s});return s}
 kartCikar(kart){this.kuyruk=this.kuyruk.filter(k=>k!==kart);this.secili=null}
 mesgulMu(agent){return agent==='lale'&&this.yuruyus?true:(this.mesgul[agent]||0)>this.now}
 // Çizim için her agent'ın o anki hâli.
 gorunum(){
  const g={};
  for(const id of [...this.agents,'hilal']){
   const b=this.balon[id],is=this.isler.find(i=>i.agent===id&&i.basla<=this.now);
   g[id]={calisiyor:!!is,ilerleme:is?(this.now-is.basla)/(is.bitis-is.basla):0,balon:b&&b.bitis>this.now?b:null,isik:(this.isik[id]||0)>this.now};
  }
  if(this.yuruyus){const y=this.yuruyus;g.lale.yuruyus={hedef:y.hedef,oran:Math.min((this.now-y.basla)/(y.bitis-y.basla),1)}}
  const sec=this.kuyruk.find(k=>k.id===this.secili);
  if(this.ipucu&&sec&&g[sec.gorev.agent])g[sec.gorev.agent].ipucu=true;
  if(sec?.gorev.onay&&!sec.onayli&&!this.istat.onay)g.hilal.ipucu=true;
  return g;
 }
}
