import {box,plant,shelf,picture,desk,person,bubble,glow,card} from './sprites.js';

export class OfficeRenderer{
 constructor(canvas,labels,agents,office){this.canvas=canvas;this.c=canvas.getContext('2d');this.labels=labels;this.agents=new Map(agents.map(a=>[a.id,a]));this.office=office;this.placements=[];this.frame=0;this.floaters=[];this.hits=document.querySelector('#desk-hits');this.kilitli=new Map();this.rolGizli=new Set()}
 resize(){
  const available=document.querySelector('.office-frame').clientWidth;
  this.mobile=matchMedia('(max-width:700px)').matches;
  this.width=this.mobile?180:640;this.height=this.mobile?324:254;
  this.scale=Math.max(1,Math.floor(available/this.width*2)/2);   // yarım adımlı büyütme: dar pencerede ofis minik kalmasın (30.09)
  this.canvas.width=this.width;this.canvas.height=this.height;
  this.canvas.style.width=`${this.width*this.scale}px`;this.canvas.style.height=`${this.height*this.scale}px`;
  const scene=this.canvas.parentElement;scene.style.width=this.canvas.style.width;scene.style.height=this.canvas.style.height;
  this.c.imageSmoothingEnabled=false;
  const rooms=this.office.rooms;
  this.rooms=this.mobile?rooms.map((r,i)=>({...r,x:2,y:2+i*108,w:176,h:106})):rooms.map((r,i)=>({...r,x:[4,191,449][i],y:4,w:[183,254,187][i],h:169}));
  this.placements=[];this.labels.replaceChildren();this.hits?.replaceChildren();
  for(const room of this.rooms){
   const cols=room.columns;
   room.agents.forEach((id,i)=>{
    const a=this.agents.get(id);const col=i%cols,row=Math.floor(i/cols);
    const x=room.x+Math.round(room.w*(col+0.5)/cols);
    const y=room.y+(this.mobile?28:64)+row*(this.mobile?40:65);
    const labelY=y+(this.mobile?27:26);
    const cw=Math.floor(room.w/cols),rh=this.mobile?40:65,top=y-(this.mobile?6:26);
    const hit={x:room.x+col*cw,y:top,w:cw,h:rh};
    this.placements.push({a,x,y,room,hit});
    if(this.hits){
     const b=document.createElement('button');b.type='button';b.className='desk-hit';b.dataset.agent=id;b.disabled=this.kilitli.has(room.id);
     b.setAttribute('aria-label',id==='hilal'?'Senin masan':`${a.name}'in masası: ${a.role}`);
     b.style.cssText=`left:${hit.x*this.scale}px;top:${hit.y*this.scale}px;width:${hit.w*this.scale}px;height:${hit.h*this.scale}px`;
     this.hits.append(b);
    }
    const label=document.createElement('div');label.className=`desk-label${id==='hilal'?' hilal':''}`;
    label.dataset.agent=id;label.title=`${a.name} · ${a.role}`;
    label.setAttribute('aria-label',`${a.name}: ${a.role}`);
    if(this.kilitli.has(room.id))label.hidden=true;
    label.style.cssText=`left:${(x-23)*this.scale}px;top:${labelY*this.scale}px;width:${46*this.scale}px;height:${9*this.scale}px;--label:${id==='hilal'?'#ff9dc8':room.color}`;
    const name=document.createElement('span');name.textContent=a.name;label.append(name);
    if(a.rol){const rol=document.createElement('small');rol.className='rol';const gizli=this.rolGizli?.has(room.id)&&id!=='hilal';
     rol.textContent=gizli?'? ezber':`${a.ikon} ${a.rol}`;rol.classList.toggle('gizli',gizli);name.append(rol)}
    this.labels.append(label);
   });
  }
  this.draw(0,this.view);
 }
 text(text,x,y,color='#e6dcca',align='left',size=10){const c=this.c;c.font=`${size}px Ofis`;c.fillStyle=color;c.textAlign=align;c.fillText(text,Math.round(x),Math.round(y))}
 drawRoom(r){
  const c=this.c,{x,y,w,h}=r;box(c,x,y,w,h,'#101827');box(c,x+1,y+1,w-2,h-2,r.floor);
  const wallH=this.mobile?18:39;
  for(let yy=y+wallH;yy<y+h-2;yy+=8){
   box(c,x+2,yy,w-4,1,'#111b2825');
   for(let xx=x+2+(Math.floor(yy/8)%2)*12;xx<x+w-2;xx+=24)box(c,xx,yy,1,8,'#111b281c');
  }
  box(c,x+1,y+1,w-2,wallH,r.wall);box(c,x+1,y+wallH,w-2,2,'#131d2a');
  box(c,x+1,y+1,w-2,1,'#ffffff15');
  this.text(r.title,x+7,y+12,r.color);
  box(c,x+w-10,y+7,3,3,r.color);
  if(!this.mobile){
   this.text(r.subtitle,x+7,y+24,'#a9a3a5', 'left', 7.5);
   shelf(c,x+w-38,y+20);picture(c,x+12,y+25,r.id==='pazarlama'?1:0);
   if(r.id==='pazarlama'){picture(c,x+43,y+25);picture(c,x+72,y+25,1)}
   plant(c,x+w-11,y+48);plant(c,x+11,y+h-11);
  }else{
   // Plants sit in the gap between desks, keeping labels and characters clear.
   if(r.columns===2)plant(c,x+Math.round(w/2),y+65);
  }
 }
 drawLounge(){
  const c=this.c,y=177;
  box(c,4,y,632,73,'#38424c');
  for(let row=0;row<7;row++)for(let col=0;col<63;col++)box(c,5+col*10,y+1+row*10,10,10,(row+col)%2?'#a4a49b':'#d3cab6');
  box(c,5,y+71,630,2,'#121d2b');
  // Meeting corner.
  box(c,34,192,91,45,'#7c7257');box(c,36,194,87,41,'#a29470');
  for(const x of [42,103])for(const yy of [198,221]){box(c,x,yy,12,13,'#51483c');box(c,x+1,yy,10,9,'#7b8f86');box(c,x+2,yy+1,8,2,'#b0b8a0')}
  box(c,55,195,48,39,'#644837');box(c,57,193,44,37,'#bd946a');box(c,58,194,42,2,'#e2ba89');
  box(c,62,200,11,7,'#e2d8bc');box(c,64,202,7,1,'#879398');box(c,87,219,5,4,'#ece1c4');
  this.text('TOPLANTI',79,244,'#233648','center');
  // Soft rug, sofas and coffee table.
  box(c,270,188,100,53,'#78606b');box(c,272,190,96,49,'#a1858d');
  box(c,286,187,68,13,'#603b52');box(c,288,186,64,11,'#bd718c');box(c,290,187,60,2,'#e5a1b1');
  for(let x=290;x<350;x+=20)box(c,x,192,18,5,'#a75e7a');
  box(c,276,203,15,28,'#663b51');box(c,277,204,11,25,'#bd718c');box(c,351,203,15,28,'#663b51');box(c,354,204,11,25,'#bd718c');
  box(c,300,208,43,21,'#594838');box(c,299,206,43,20,'#be966b');box(c,300,207,41,2,'#dec099');
  box(c,312,212,6,5,'#eee4cc');box(c,313,212,4,2,'#604f47');box(c,327,217,7,5,'#759ea6');
  this.text('BİR KAHVE MOLASI?',320,245,'#263548','center');
  // Coffee counter and plants.
  box(c,526,199,62,26,'#71523e');box(c,525,197,64,5,'#d4b186');box(c,528,205,27,18,'#997953');box(c,559,205,27,18,'#997953');
  box(c,532,183,18,15,'#293c47');box(c,534,184,14,7,'#b7c7c5');box(c,537,192,7,5,'#1c2b38');box(c,539,194,4,3,'#f2dec2');
  box(c,568,193,5,4,'#f1d9b8');box(c,578,193,5,4,'#f1d9b8');this.text('KAHVE',556,238,'#2c3b48','center');
  plant(c,17,222,2);plant(c,183,218,2);plant(c,406,219,2);plant(c,618,225,2);
 }
 place(id){return this.placements.find(p=>p.a.id===id)}
 float(agent,text,color,time){this.floaters.push({agent,text,color,start:time})}
 draw(time,view=null){
  const c=this.c;c.clearRect(0,0,this.width,this.height);box(c,0,0,this.width,this.height,'#1b2535');
  this.rooms.forEach(r=>this.drawRoom(r));if(!this.mobile)this.drawLounge();
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const px=this.mobile?4:0;
  this.placements.forEach(({a,x,y,hit},i)=>{
   if(this.kilitli.has(this.placements[i].room.id)){desk(c,x,y);return}
   const v=view?.[a.id];
   if(v?.isik)glow(c,hit.x,hit.y,hit.w,hit.h,'#ffe27a',time);
   else if(v?.ipucu)glow(c,hit.x,hit.y,hit.w,hit.h,'#9ff0b5',time);
   desk(c,x,y,a.id==='hilal',v?.calisiyor,time);
   const frame=still?0:Math.floor(time/(v?.calisiyor?200:650)+i*0.7)%4===0?-1:0;
   if(!v?.yuruyus)person(c,x-px,y+14,a,frame);
   const bx=x+(this.mobile?16:22),by=y+(this.mobile?7:-24);
   if(a.id==='hilal'){
    if(v?.balon)bubble(c,bx,by,this.mobile,v.balon.metin,v.balon.ton);
    else this.text('SEN',x+(this.mobile?16:23),y+(this.mobile?16:-16),'#ffb1d3','center');
   }
   else if(v?.yuruyus)bubble(c,bx,by,this.mobile,'···','mesgul');
   else if(v?.balon)bubble(c,bx,by,this.mobile,v.balon.metin,v.balon.ton);
   else if(v?.calisiyor)bubble(c,bx,by,this.mobile,this.mobile?'···':'Çalışıyor…','calisiyor');
   if(v?.calisiyor){const w=this.mobile?18:26,bx0=x-px-w/2,by0=y+(this.mobile?23:21);box(c,bx0-1,by0-1,w+2,4,'#111926');box(c,bx0,by0,w,2,'#35684f');box(c,bx0,by0,Math.round(w*Math.min(v.ilerleme,1)),2,'#b8f0c4')}
   else bubble(c,bx,by,this.mobile);
  });
  for(const r of this.rooms){
   const yazi=this.kilitli.get(r.id);if(!yazi)continue;
   const wallH=this.mobile?18:39;
   c.fillStyle='#0b0e16d0';c.fillRect(r.x+1,r.y+wallH+2,r.w-2,r.h-wallH-3);
   box(c,r.x+Math.round(r.w/2)-4,r.y+Math.round((r.h+wallH)/2)-12,9,7,'#8b94aa');box(c,r.x+Math.round(r.w/2)-2,r.y+Math.round((r.h+wallH)/2)-16,5,5,'#0000');
   c.strokeStyle='#8b94aa';c.lineWidth=2;c.strokeRect(r.x+Math.round(r.w/2)-2,r.y+Math.round((r.h+wallH)/2)-17,5,6);
   this.text(yazi,r.x+r.w/2,r.y+(r.h+wallH)/2+6,'#c9c2d6','center');
  }
  const lale=view?.lale?.yuruyus;
  if(lale){
   const from=this.place('lale'),to=this.place(lale.hedef);
   const o=lale.oran,e=o<.5?2*o*o:1-(-2*o+2)**2/2;
   const x=from.x+(to.x-from.x)*e,y=from.y+(to.y-from.y)*e;
   const step=still?0:Math.floor(time/120)%2?-1:0;
   person(c,x-px,y+14,from.a,step);card(c,x-px+7,y+step);
  }
  this.floaters=this.floaters.filter(f=>time-f.start<900);
  for(const f of this.floaters){
   const p=this.place(f.agent),t=(time-f.start)/900;
   this.text(f.text,p.x,p.y-(this.mobile?2:14)-Math.round(t*16),t>.7&&Math.floor(time/60)%2?'#0000':f.color,'center');
  }
  this.frame++;
 }
}
