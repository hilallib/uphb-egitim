// Original pixel drawings. Coordinates are integers on a low resolution canvas.
export function box(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)}
export function plant(c,x,y,size=1){
 c.save();c.translate(x,y);c.scale(size,size);
 box(c,-5,4,10,7,'#553f3b');box(c,-4,4,8,5,'#bd8260');box(c,-5,3,10,2,'#e0aa7c');
 box(c,-1,-12,2,16,'#81a477');
 [[-6,-10,5,3],[-8,-5,7,3],[1,-13,5,3],[1,-7,7,3],[-4,-16,3,5],[2,-1,5,3]].forEach(p=>box(c,...p,'#5e906c'));
 box(c,-6,-10,4,1,'#9bbe86');box(c,2,-13,4,1,'#9bbe86');c.restore();
}
export function shelf(c,x,y){
 box(c,x,y,27,15,'#242c39');box(c,x,y+13,27,2,'#b08768');box(c,x,y,27,2,'#bd9775');
 const colors=['#bd777d','#d6b77d','#7aabb0','#9f8cb5','#b3b888'];
 for(let i=0;i<8;i++){let h=6+i%3*2;box(c,x+2+i*3,y+13-h,2,h,colors[i%5]);box(c,x+2+i*3,y+12-h,2,1,'#e5d7af')}
}
export function picture(c,x,y,kind=0){
 box(c,x,y,19,13,'#ad9376');box(c,x+1,y+1,17,11,'#202c3e');
 if(kind===0){box(c,x+3,y+3,13,7,'#526c80');box(c,x+11,y+3,3,3,'#edc379');box(c,x+3,y+8,5,2,'#89a3a2');box(c,x+8,y+6,4,4,'#779387')}
 else{box(c,x+3,y+3,13,7,'#c9c4ad');box(c,x+5,y+5,6,1,'#64788a');box(c,x+5,y+7,9,1,'#84999e')}
}
export function desk(c,x,y,hilal=false,lit=false,time=0){
 box(c,x-21,y+3,43,19,'#17243555');box(c,x-20,y,40,14,'#503a35');
 box(c,x-19,y,38,11,'#b88c62');box(c,x-19,y,38,2,'#dfb784');box(c,x-18,y+10,36,2,'#8d624b');
 box(c,x-18,y+12,3,6,'#584a45');box(c,x+15,y+12,3,6,'#584a45');
 box(c,x-18,y+13,3,2,'#b78b68');box(c,x+15,y+13,3,2,'#b78b68');
 box(c,x-8,y-10,17,13,'#424556');box(c,x-7,y-11,15,12,'#d1c7ae');box(c,x-6,y-10,13,9,'#858e91');
 box(c,x-5,y-9,11,7,lit?'#2f6a55':'#243c49');
 if(lit){const k=Math.floor(time/180)%4;for(let i=0;i<3;i++)box(c,x-4,y-8+i*2,i===2?k+2:7-(k+i)%3,1,'#b8f0c4')}
 else{box(c,x-4,y-8,3,1,hilal?'#ee9bbc':'#90c4bb');box(c,x-4,y-6,7,1,'#456a72')}
 box(c,x+5,y,1,1,'#abe0ad');box(c,x-2,y+2,5,2,'#8d928a');box(c,x-6,y+4,14,3,'#d0c3a8');
 box(c,x-4,y+5,10,1,'#838c88');box(c,x+11,y+4,3,3,'#f3dbc0');box(c,x+14,y+5,1,1,'#f3dbc0');
 box(c,x-15,y+4,5,5,hilal?'#e5a2bd':'#d3bb90');box(c,x-14,y+5,3,1,'#8d7780');
}
export function person(c,x,y,a,frame=0){
 c.save();c.translate(Math.round(x),Math.round(y));
 box(c,-7,10,15,3,'#10172544');
 box(c,-6,1,13,10,'#303641');box(c,-5,1,11,8,'#75836f');box(c,-5,1,11,1,'#a9b091');
 box(c,-4,8,3,4,'#293142');box(c,2,8,3,4,'#293142');box(c,-5,11,4,2,'#202332');box(c,2,11,4,2,'#202332');
 c.translate(0,frame);
 const long=['long','bob','pony','curly'].includes(a.style);
 if(long){box(c,-6,-13,13,a.style==='long'?24:15,a.hair);box(c,-7,-9,2,a.style==='long'?18:10,a.hair)}
 box(c,-5,-1,11,10,a.shirt);box(c,-7,1,2,6,a.shirt);box(c,6,1,2,6,a.shirt);box(c,-7,6,2,2,a.skin);box(c,6,6,2,2,a.skin);
 box(c,-1,-2,3,3,a.skin);box(c,-4,-12,9,10,a.skin);box(c,-5,-10,1,5,a.skin);box(c,5,-10,1,5,a.skin);
 box(c,-4,-14,9,4,a.hair);box(c,-5,-12,2,5,a.hair);box(c,4,-12,2,3,a.hair);
 box(c,-2,-7,1,2,'#34323e');box(c,3,-7,1,2,'#34323e');box(c,0,-3,2,1,'#a36c66');
 box(c,-3,-13,5,1,'#ffffff24');box(c,-4,2,1,5,'#ffffff22');
 if(a.style==='bun'){box(c,-3,-18,6,5,a.hair);box(c,-2,-18,3,1,'#ffffff30')}
 if(a.style==='part'){box(c,-1,-14,1,4,'#ffffff30');box(c,2,-10,3,1,a.hair)}
 if(a.style==='beard'){box(c,-4,-4,9,3,a.hair);box(c,-1,-4,3,1,a.skin)}
 if(a.style==='long'){box(c,4,-9,3,18,a.hair);box(c,-6,-8,2,17,a.hair);box(c,5,-7,1,13,'#ffc2dd')}
 if(a.style==='pony'){box(c,5,-13,5,4,a.hair);box(c,7,-10,3,9,a.hair);box(c,5,-12,2,2,'#e5ac82')}
 if(a.style==='glasses'){box(c,-4,-8,4,3,'#404054');box(c,2,-8,4,3,'#404054');box(c,0,-7,2,1,'#404054');box(c,-3,-7,2,1,'#c9dfe1');box(c,3,-7,2,1,'#c9dfe1')}
 if(a.style==='headphones'){box(c,-6,-14,13,2,'#26384b');box(c,-7,-11,3,6,'#d8b15e');box(c,5,-11,3,6,'#d8b15e')}
 if(a.style==='quiff'){box(c,-3,-17,7,4,a.hair);box(c,0,-18,5,2,a.hair)}
 if(a.style==='curly'){for(let i=0;i<4;i++)box(c,-6+i*3,-15-i%2,4,5,a.hair);box(c,-7,-10,3,7,a.hair);box(c,5,-10,3,7,a.hair)}
 c.restore();
}
const TONES={idle:['#293448','#3b475d','#e3e0d7','#718092'],calisiyor:['#28503f','#35684f','#d8f6d6','#6fb58c'],yanlis:['#5c2433','#7a3044','#ffd6dc','#e0707f'],mesgul:['#5a4520','#735a2b','#ffe9b8','#d9a94f'],hilal:['#5a2848','#743563','#ffd3e7','#ff9dc8']};
export function bubble(c,x,y,compact=false,text='Idle',tone='idle'){
 const [bg,hi,fg,edge]=TONES[tone]||TONES.idle;
 c.font='10px Ofis';const half=Math.max(compact?11:13,Math.ceil(c.measureText(text).width/2)+3);
 box(c,x-half,y,half*2+1,12,'#111926');box(c,x-half+1,y-1,half*2-1,1,edge);box(c,x-half+1,y+1,half*2-1,10,bg);
 box(c,x-half+2,y+1,half*2-3,1,hi);box(c,x-2,y+12,4,2,'#111926');box(c,x-1,y+12,2,1,bg);
 c.fillStyle=fg;c.textAlign='center';c.fillText(text,x+1,y+9);
}
export function glow(c,x,y,w,h,color,time){
 if(Math.floor(time/150)%2)return;
 c.strokeStyle=color;c.lineWidth=2;c.strokeRect(Math.round(x)+1,Math.round(y)+1,w-2,h-2);
}
export function card(c,x,y){box(c,x-4,y-3,9,7,'#2a2230');box(c,x-3,y-3,7,6,'#fff1d2');box(c,x-2,y-1,5,1,'#b98a9b');box(c,x-2,y+1,3,1,'#b98a9b')}
