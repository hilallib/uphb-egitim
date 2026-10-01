import {OfficeRenderer} from './renderer.js';
import {Mesai} from './game.js';
import {ses,sesiAc,sessizMi,sessizYap} from './ses.js';
const params=new URLSearchParams(location.search);
if(params.has('font-test'))document.body.classList.add('font-review');
const $=s=>document.querySelector(s);
const hiz=params.has('test')?Number(params.get('hiz')||1):1;
const sec=l=>l[Math.floor(Math.random()*l.length)];

async function init(){
 const [agents,office,veriProje,ayar,hafta,replik]=await Promise.all(['agents','office','projeler','ayarlar','hafta','replikler'].map(async name=>{
  const response=await fetch(`data/${name}.json`);if(!response.ok)throw new Error(`Veri yüklenemedi: ${name}`);return response.json();
 }));
 const projeler=veriProje.projeler,tanim=Object.fromEntries(projeler.map(p=>[p.id,p]));
 await document.fonts.load('10px Ofis');await document.fonts.ready;
 const renderer=new OfficeRenderer($('#office'),$('#desk-labels'),agents,office);
 const isim=Object.fromEntries(agents.map(a=>[a.id,a.name]));
 const gunler=hafta.gunler;
 let oyun=null,gunNo=0,sonuclar=[],t0=0,okunan=0,mesaj=null,imza='';
 const saat=t=>(t-t0)*hiz;
 const zincirYaz=p=>p.zincir.map((g,i)=>(p.tanim.adimlar[i]?.some(a=>a.onay)?'Hilal onayı + ':'')+g.map(a=>isim[a]).join(' + ')).join(' → ');
 const tamZincir=p=>p.adimlar.map(g=>g.map(a=>a.onay?`Hilal onayı + ${isim[a.agent]}`:isim[a.agent]).join(' + ')).join(' → ');

 const acilisGunu=oda=>gunler.findIndex(g=>g.acik.includes(oda));
 const odaAdi=Object.fromEntries(office.rooms.map(r=>[r.id,r.title]));
 // Henüz açılmamış odalar kilitli görünür; açıldığı günden 2 gün sonra uzmanlık etiketleri silinir (ezber).
 function kilitle(no){
  renderer.kilitli=new Map();renderer.rolGizli=new Set();
  for(const r of office.rooms){
   const acilis=acilisGunu(r.id);
   if(!gunler[no].acik.includes(r.id)){renderer.kilitli.set(r.id,`${gunler[acilis].ad} AÇILIYOR`);continue}
   if(no-acilis>=2)renderer.rolGizli.add(r.id);
  }
  renderer.resize();
 }
 kilitle(0);window.addEventListener('resize',()=>renderer.resize());

 function panel({ust,baslik,govde=[],dugme,tik}){
  $('#panel-ust').textContent=ust;$('#panel-baslik').textContent=baslik;
  $('#panel-govde').replaceChildren(...govde.map(([sinif,metin])=>{const p=document.createElement('p');p.className=sinif;p.textContent=metin;return p}));
  const b=$('#panel-dugme');b.textContent=dugme;b.onclick=()=>{sesiAc();tik()};
  $('#acilis').hidden=true;$('#panel').hidden=false;$('#panel-govde').scrollTop=0;
 }
 const saatGoster=(g,sn)=>{const {baslangic,bitis}=ayar.saat,dk=sn/g.sureSn*(bitis-baslangic)*60;return`${String(baslangic+Math.floor(dk/60)).padStart(2,'0')}:${String(Math.floor(dk%60)).padStart(2,'0')}`};
 function gunAc(no){
  gunNo=no;const g=gunler[no];kilitle(no);document.body.classList.remove('oyunda');$('#hud').hidden=true;
  $('#gun-adi').textContent=g.ad;$('#saat-durum').innerHTML='09:00 <b>·</b> MESAİ ÖNCESİ';
  const govde=[['yeni',g.yeni],['buyuk',`🎯 Hedef: ${g.hedef} proje bitir`],['baslik','Bugünün işleri']];
  for(const p of g.projeler){const t=tanim[p.id];govde.push(['is',`${t.ikon} ${t.ad} · ${t.adimlar.length} adım · ${p.sn?`${saatGoster(g,p.sn)}'de gelir · `:''}teslim ${saatGoster(g,p.teslimSn)}`])}
  if(g.olaylar.some(o=>o.tur==='musteri'))govde.push(['is','📞 Gün içinde müşteri de arayabilir…']);
  const ezber=office.rooms.filter(r=>g.acik.includes(r.id)&&no-acilisGunu(r.id)===2).map(r=>odaAdi[r.id]);
  if(ezber.length)govde.push(['ezber',`🧠 ${ezber.join(', ')} odasının etiketleri bugün yok. Ezberinden oyna! Emin değilsen Lale'ye ver.`]);
  panel({ust:`GÜN ${no+1}/${gunler.length} · 09:00`,baslik:g.ad,govde,dugme:'MESAİYE BAŞLA',tik:()=>mesaiBaslat()});
 }
 function mesaiBaslat(){
  const seed=params.has('seed')?Number(params.get('seed'))+gunNo:Date.now();
  oyun=new Mesai({agents,projeler,ayar,gun:gunler[gunNo],seed});t0=performance.now();oyun.baslat(0);okunan=0;mesaj=null;imza='';
  document.body.classList.add('oyunda');$('#panel').hidden=true;$('#hud').hidden=false;$('#konusmalar').replaceChildren();
  renderer.resize();ses.basla();
  if(params.has('test'))window.__mesai={oyun,renderer,gunNo};
 }
 function yaz(metin,sure=1900){mesaj={metin,bitis:performance.now()+sure}}
 function salla(){const f=$('.office-frame');f.classList.remove('salla');void f.offsetWidth;f.classList.add('salla');navigator.vibrate?.(70)}
 function konus(agent,metin){
  const p=renderer.place(agent);if(!p||!metin)return;
  const kutu=$('#konusmalar');kutu.querySelector(`[data-agent="${agent}"]`)?.remove();
  while(kutu.children.length>=3)kutu.firstChild.remove();
  const d=document.createElement('div');d.className=`konusma${agent==='hilal'?' hilal':''}`;d.dataset.agent=agent;
  const sol=p.x>renderer.width*.62,kenar=renderer.mobile?12:20;
  d.classList.toggle('solda',sol);
  d.style.left=`${(p.x+(sol?-kenar:kenar))*renderer.scale}px`;d.style.top=`${(p.y+(renderer.mobile?6:2))*renderer.scale}px`;
  d.innerHTML='<b></b><span></span>';d.querySelector('b').textContent=isim[agent];d.querySelector('span').textContent=metin;
  kutu.append(d);setTimeout(()=>d.remove(),1900);
 }
 const soz=(agent,tur)=>replik[agent]?.[tur]?.length?sec(replik[agent][tur]):null;
 function uyari(metin,sure=1800){const u=$('#uyari');u.textContent=metin;u.hidden=false;clearTimeout(uyari.t);uyari.t=setTimeout(()=>u.hidden=true,sure)}

 function olaylariIsle(time){
  for(;okunan<oyun.olaylar.length;okunan++){
   const o=oyun.olaylar[okunan];
   if(o.tur==='dogru'){
    renderer.float(o.agent,`+${o.puan}`,o.yol==='lale'?'#ffe27a':oyun.kombo?'#ff9dc8':'#b8f0c4',time);
    if(o.yol==='lale'){konus(o.agent,soz(o.agent,'dogru'));ses.dogru()}
   }
   if(o.tur==='adimBitti'&&!o.son){
    konus(o.agent,`${o.kart.gorev.text} hazır! ✓`);ses.secim();
    if(!o.kalan)yaz(`${isim[o.agent]} bitirdi → ${o.proje.tanim.kisa}: sıradaki adım açıldı (${o.adimNo+1}/${o.proje.tanim.adimlar.length})`);
    else yaz(`${isim[o.agent]} bitirdi. ${o.proje.tanim.kisa}: paralel adımın diğer parçası bekleniyor.`);
   }
   if(o.tur==='projeGeldi'&&oyun.gecenSn>0.2&&!o.proje.acil){uyari(`📋 Yeni proje: ${o.proje.tanim.ad} · teslim ${oyun.saatYaz((o.proje.teslim-oyun.basla)/1000)}`);ses.lale()}
   if(o.tur==='projeBitti'){uyari(`✅ ${o.proje.tanim.ad} ${'⭐'.repeat(o.yildiz)} +${o.bonus}`,2200);renderer.float('hilal',`+${o.bonus}`,'#ffd76a',time);ses.kombo()}
   if(o.tur==='gecikti'){yaz(`⏰ ${o.proje.tanim.ad} teslim saatini kaçırdı! Bitir ama yıldız düşer.`);ses.kacti();salla()}
   if(o.tur==='hedef'){uyari('🎯 HEDEF TAMAM! Kalan işlerle puan topla.',2000)}
   if(o.tur==='kahve'){uyari(`☕ KAHVE GELDİ! ${o.sure} sn ekip 2× hızlı`);ses.kahve()}
   if(o.tur==='musteri'){uyari(`📞 MÜŞTERİ ARADI! ${o.proje.tanim.ad.replace('📞 ','')} · ×2`);ses.telefon()}
   if(o.tur==='acilKacti')yaz('📞 Müşteri beklemekten sıkıldı, telefonu kapattı.');
  }
 }
 function sonucIsle(s,time){
  if(s.tur==='dogru'){konus(s.agent,soz(s.agent,'dogru'));s.kombo?ses.kombo():ses.dogru();if(s.kombo)yaz('KOMBO ×2!',900)}
  else if(s.tur==='yanlis'){renderer.float(s.agent,'-1','#ff8f9f',time);konus(s.agent,soz(s.agent,'yanlis'));yaz(`"${s.kart.gorev.text}" ${isim[s.dogruAgent]}'in işi. Masası yanıyor.`);ses.yanlis();salla()}
  else if(s.tur==='mesgul'){konus(s.agent,soz(s.agent,'mesgul'));yaz(`${isim[s.agent]} meşgul. Başka bir projenin adımını ver ya da bekle.`)}
  else if(s.tur==='lale'){konus('lale',soz('lale','yonlendir'));yaz(`Lale kartı ${isim[s.hedef]}'e götürüyor…`);ses.lale()}
  else if(s.tur==='laleOnay'){konus('lale',soz('lale','onay'));yaz('💸 Para harcayan adım: önce kendi masana (Hilal) dokun.')}
  else if(s.tur==='onaysiz'){renderer.float(s.agent,`-${s.ceza}`,'#ff8f9f',time);konus(s.agent,soz(s.agent,'onaysiz'));yaz('💸 Onaysız harcama olmaz! Önce Hilal\'in masası.');ses.yanlis();salla()}
  else if(s.tur==='onay'){renderer.float('hilal',`+${s.puan}`,'#b8f0c4',time);konus('hilal',soz('hilal','onay'));yaz('Onaylandı. Şimdi kartı reklamcısına ver.');ses.onay()}
  else if(s.tur==='secimyok')yaz('Önce yukarıdan bir karta dokun.');
  else if(s.tur==='kendi'){konus('hilal',soz('hilal','kendi'));yaz('Burası senin masan. İşi ekibine ver!')}
 }

 function hud(time){
  const k=oyun.kuyruk;
  const yeni=JSON.stringify([k.map(x=>[x.id,!!x.onayli,x.proje.gec]),oyun.secili,oyun.puan,oyun.pil,oyun.kombo]);
  if(yeni!==imza){
   imza=yeni;
   const sirali=[...k].sort((a,b)=>(b.acil-a.acil)||(a.proje.no-b.proje.no)||(a.id-b.id));
   $('#kuyruk').replaceChildren(...(sirali.length?sirali:[null]).map(kart=>{
    if(!kart){const bos=document.createElement('div');bos.className='kart bos';bos.textContent='Açık adım yok · ekip çalışıyor';return bos}
    const p=kart.proje,b=document.createElement('button');b.type='button';b.dataset.kart=kart.id;b.style.setProperty('--renk',p.tanim.renk);
    b.className=['kart',oyun.secili===kart.id&&'secili',kart.gorev.onay&&(kart.onayli?'onayli':'onay'),kart.acil&&'acil',p.gec&&'gec'].filter(Boolean).join(' ');
    b.innerHTML='<span class="proje"></span><span class="satir"><span class="ikon"></span><span class="metin"></span></span>';
    b.querySelector('.proje').textContent=`${p.tanim.ikon} ${p.tanim.kisa} ${p.adim+1}/${p.tanim.adimlar.length} · ⏰${oyun.saatYaz((p.teslim-oyun.basla)/1000)}`;
    b.querySelector('.ikon').textContent=kart.gorev.icon;b.querySelector('.metin').textContent=kart.gorev.text;
    if(kart.gorev.onay){const e=document.createElement('em');e.textContent=kart.onayli?'✓ ONAYLI':'ÖNCE HİLAL';b.append(e)}
    if(kart.acil){const e=document.createElement('i');e.className='sure';b.append(e)}
    return b;
   }));
   $('#puan').textContent=`PUAN ${oyun.puan}`;
   $('#kombo').hidden=!oyun.kombo;
   const piller=$('#piller');piller.setAttribute('aria-label',`${oyun.pil} pil`);
   piller.replaceChildren(...Array.from({length:ayar.pil},(_,i)=>{const p=document.createElement('i');p.className=`pil${i<oyun.pil?'':' bos'}`;return p}));
  }
  for(const b of document.querySelectorAll('#kuyruk .kart.acil')){
   const kart=k.find(x=>x.id===Number(b.dataset.kart));if(!kart)continue;const p=kart.proje;
   b.querySelector('.sure').style.width=`${Math.max(0,(p.teslim-oyun.now)/(p.teslim-p.basla))*100}%`;
  }
  $('#saat-durum').innerHTML=`${oyun.saat} <b>·</b> ${oyun.kahvede?'☕ KAHVE':'MESAİDE'}`;
  const h=$('#hedef'),d=oyun.istat.bitenProje;h.classList.toggle('tamam',oyun.hedefTamam);
  h.querySelector('.yazi').textContent=`${oyun.hedefTamam?'✓ ':''}PROJE ${d}/${oyun.hedef}`;h.querySelector('.dolu').style.width=`${Math.min(d/oyun.hedef,1)*100}%`;
  let ipucu='';
  const secili=k.find(x=>x.id===oyun.secili);
  if(mesaj&&mesaj.bitis>time)ipucu=mesaj.metin;
  else if(oyun.ipucu)ipucu=oyun.secili?'Şimdi bu adımı yapacak agent\'ın masasına dokun. Yeşil yanan masa!':'👆 Yukarıdaki karta dokun: projenin ilk adımı.';
  else if(secili?.gorev.onay&&!secili.onayli)ipucu='💸 Para harcayan adım: önce kendi masana (Hilal) dokun, onayla.';
  const el=$('#ipucu');if(el.textContent!==ipucu)el.textContent=ipucu;
 }

 function gunBitti(){
  ses.zil();document.body.classList.remove('oyunda');$('#hud').hidden=true;$('#konusmalar').replaceChildren();$('#uyari').hidden=true;
  $('#saat-durum').innerHTML=`${oyun.saat} <b>·</b> ${oyun.bitisNedeni==='pil'?'PİLLER BİTTİ':'MESAİ BİTTİ'}`;
  const g=gunler[gunNo],st=oyun.istat,basarili=oyun.hedefTamam;
  const planli=oyun.projeler.filter(p=>!p.acil);
  const planDisi=g.projeler.filter(p=>!planli.some(x=>x.id===p.id)).map(p=>tanim[p.id]);
  const maxYildiz=g.projeler.length*3;
  if(basarili)sonuclar[gunNo]={gun:g.ad,puan:oyun.puan,yildiz:st.yildiz,maxYildiz,istat:st};
  const govde=[[basarili?'hedef-tamam':'hedef-kacti',basarili?`🎯 Hedef tamam: ${st.bitenProje}/${oyun.hedef} proje`:`✗ Hedef kaçtı: ${st.bitenProje}/${oyun.hedef} proje`],
   ['buyuk',`${oyun.puan} PUAN · ${'⭐'.repeat(st.yildiz)||'—'}`],['baslik','Projeler böyle yürüdü']];
  for(const p of planli){
   if(p.bitti)govde.push(['zincir',`✅ ${p.tanim.ad} ${'⭐'.repeat(p.yildiz)}${p.gec?' (geç)':''}\n${zincirYaz(p)}`]);
   else govde.push(['zincir kacti',`✗ ${p.tanim.ad}: ${p.adim}/${p.tanim.adimlar.length} adımda kaldı\nOlması gereken: ${tamZincir(p.tanim)}`]);
  }
  for(const t of planDisi)govde.push(['zincir kacti',`✗ ${t.ad}: hiç başlamadı\nOlması gereken: ${tamZincir(t)}`]);
  for(const p of oyun.projeler.filter(p=>p.acil))govde.push(['zincir',p.bitti?`📞 Müşteri memnun: ${p.tanim.ad.replace('📞 ','')} (+${p.bonus})`:`📞 Müşteri kaçtı: ${p.tanim.ad.replace('📞 ','')}`]);
  const karisik=Object.entries(st.karisik).sort((a,b)=>b[1]-a[1])[0];
  if(karisik){const [dogru,yanlis]=karisik[0].split('|');govde.push(['',`${isim[dogru]} ile ${isim[yanlis]}'i ${karisik[1]} kez karıştırdın.`])}
  govde.push(['lale',`Lale: "${!basarili?sec(['Bu günü bir daha deneyelim.','Olur böyle günler. Tekrar odaklanalım.','Ekip hazır, bir tur daha.']):st.yildiz===maxYildiz?'Kusursuz. Ben bile bu kadar iyi yönetemezdim.':sec(['Bugün kimse boşta kalmadı.','İyi iş. Yarın 09:00\'da görüşürüz.','Ekip memnun. Devam.'])}"`]);
  const son=gunNo===gunler.length-1;
  panel({ust:`${g.ad} · ${oyun.saat} · ${oyun.bitisNedeni==='pil'?'PİLLER BİTTİ':'MESAİ BİTTİ'}`,baslik:'Lale\'nin gün sonu raporu',govde,
   dugme:!basarili?'GÜNÜ TEKRAR OYNA':son?'HAFTAYI BİTİR':`SONRAKİ GÜN: ${gunler[gunNo+1].ad}`,tik:()=>!basarili?gunAc(gunNo):son?haftaBitti():gunAc(gunNo+1)});
 }
 function unvan(oran){return oran>=.9?'Lale bile kıskandı':oran>=.7?'Koordinatör':oran>=.45?'Takım Kaptanı':'Stajyer Yönetici'}
 function haftaBitti(){
  const toplam=sonuclar.reduce((s,r)=>s+r.puan,0),yildiz=sonuclar.reduce((s,r)=>s+r.yildiz,0),max=sonuclar.reduce((s,r)=>s+r.maxYildiz,0);
  const govde=[['buyuk',`${toplam} PUAN`],['hedef-tamam',`⭐ ${yildiz}/${max} yıldız`],['baslik',`Ünvanın: ${unvan(yildiz/max)}`],
   ...sonuclar.map(r=>['gunluk',`${r.gun} · ${r.puan} puan · ${'⭐'.repeat(r.yildiz)}`])];
  panel({ust:'CUMA · 19:00 · HAFTA BİTTİ',baslik:'Haftanın özeti',govde,dugme:'YENİ HAFTA',tik:()=>{sonuclar=[];gunAc(0)}});
 }

 $('#kuyruk').addEventListener('click',e=>{const b=e.target.closest('[data-kart]');if(b&&oyun?.durum==='oyunda'){oyun.sec(Number(b.dataset.kart));ses.secim()}});
 $('#scene').addEventListener('click',e=>{
  const d=e.target.closest('.desk-hit');if(!d||oyun?.durum!=='oyunda')return;
  sonucIsle(oyun.masa(d.dataset.agent),performance.now());
 });
 // ?gun=5 → doğrudan o günden başla (tanıtım çekimi için).
 const ilkGun=Math.min(Math.max((Number(params.get('gun'))||1)-1,0),gunler.length-1);
 $('#basla').addEventListener('click',()=>{sesiAc();gunAc(ilkGun)});
 const sessizDugme=$('#sessiz');
 const sessizGoster=()=>{sessizDugme.textContent=sessizMi()?'🔇':'🔊';sessizDugme.setAttribute('aria-label',sessizMi()?'Sesi aç':'Sesi kapat')};
 sessizDugme.addEventListener('click',()=>{sessizYap(!sessizMi());sesiAc();sessizGoster()});sessizGoster();

 function animate(time){
  if(oyun?.durum==='oyunda'){oyun.tick(saat(time));olaylariIsle(time);hud(time)}
  // Gün bazen tıklama anında biter (3. yanlışta pil biter); rapor her iki yoldan da bir kez açılır (30.09 düzeltme).
  if(oyun?.durum==='bitti'&&!oyun.raporlandi){oyun.raporlandi=true;olaylariIsle(time);gunBitti()}
  renderer.view=oyun?.durum==='oyunda'?oyun.gorunum():null;
  renderer.draw(time,renderer.view);
  requestAnimationFrame(animate);
 }
 requestAnimationFrame(animate);
 if(params.has('test'))window.__oyunTest={gunAc,haftaBitti,sonuclar:()=>sonuclar};
 document.documentElement.dataset.ready='true';
}
init().catch(error=>{console.error(error);document.querySelector('#error').hidden=false});
