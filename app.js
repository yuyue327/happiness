(function(){
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.wishSystem = {};

  /* starfield */
  var starCanvas = document.getElementById('stars');
  var sctx = starCanvas.getContext('2d');
  var stars = [], meteors = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
  function initStars(){
    starCanvas.width = window.innerWidth*dpr; starCanvas.height = window.innerHeight*dpr;
    starCanvas.style.width = window.innerWidth+'px'; starCanvas.style.height = window.innerHeight+'px';
    sctx.setTransform(dpr,0,0,dpr,0,0);
    var count = Math.min(420, Math.round(window.innerWidth*window.innerHeight/4200));
    stars = [];
    for(var i=0;i<count;i++) stars.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,r:Math.random()*1.5+.35,base:Math.random()*.55+.3,spd:Math.random()*.02+.006,phase:Math.random()*Math.PI*2,warm:Math.random()>.72});
  }
  function spawnMeteor(){ meteors.push({x:Math.random()*window.innerWidth*.9+window.innerWidth*.1,y:Math.random()*window.innerHeight*.35,len:90+Math.random()*90,life:0,speed:7+Math.random()*4}); }
  function drawSky(){
    var w=window.innerWidth,h=window.innerHeight;sctx.clearRect(0,0,w,h);
    for(var i=0;i<stars.length;i++){var s=stars[i];s.phase+=s.spd;var a=s.base+Math.sin(s.phase)*.28;sctx.beginPath();sctx.arc(s.x,s.y,s.r,0,Math.PI*2);sctx.fillStyle='rgba(236,240,255,'+Math.max(0,a)+')';sctx.fill();}
    for(var j=meteors.length-1;j>=0;j--){var m=meteors[j];m.life+=.016;m.x-=m.speed;m.y+=m.speed*.52;var g=sctx.createLinearGradient(m.x,m.y,m.x+m.len,m.y-m.len*.52);g.addColorStop(0,'rgba(255,235,195,'+Math.max(0,1-m.life*1.2)+')');g.addColorStop(1,'rgba(255,235,195,0)');sctx.strokeStyle=g;sctx.lineWidth=1.4;sctx.beginPath();sctx.moveTo(m.x,m.y);sctx.lineTo(m.x+m.len,m.y-m.len*.52);sctx.stroke();if(m.life>.85)meteors.splice(j,1);}
    requestAnimationFrame(drawSky);
  }
  initStars(); if(!reduced) drawSky();
  window.addEventListener('resize',initStars);
  if(!reduced) setInterval(function(){if(Math.random()>.3)spawnMeteor();},2600);

  /* dust & sparkles */
  var dustLayer=document.getElementById('dustLayer'),sparkleLayer=document.getElementById('sparkleLayer');
  if(!reduced){
    for(var d=0;d<64;d++){var el=document.createElement('span');var size=Math.random()*3+1.5;el.className='dust';el.style.width=size+'px';el.style.height=size+'px';el.style.left=(Math.random()*100)+'%';el.style.bottom='-20px';el.style.animationDuration=(14+Math.random()*20)+'s';el.style.animationDelay='-'+(Math.random()*30)+'s';el.style.opacity=.25+Math.random()*.5;dustLayer.appendChild(el);}
    var glyphs=['✦','✧','✳','✴','✦','✧'];
    for(var k=0;k<38;k++){var sp=document.createElement('span');sp.className='sparkle';sp.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];sp.style.left=(Math.random()*100)+'%';sp.style.top=(Math.random()*100)+'%';sp.style.setProperty('--s',(7+Math.random()*15)+'px');sp.style.setProperty('--d',(2.2+Math.random()*4.5)+'s');sp.style.animationDelay='-'+(Math.random()*6)+'s';sparkleLayer.appendChild(sp);}
    if(window.matchMedia('(pointer:fine)').matches){var cg=document.getElementById('cursorGlow');window.addEventListener('pointermove',function(e){cg.style.left=e.clientX+'px';cg.style.top=e.clientY+'px';cg.style.opacity='1';},{passive:true});}
  }

  /* reveal */
  var revealEls=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:.1,rootMargin:'0px 0px -40px 0px'});
    revealEls.forEach(function(el,i){el.style.transitionDelay=((i%6)*.07)+'s';obs.observe(el);});
  } else revealEls.forEach(function(el){el.classList.add('visible');});

  /* confetti */
  var confCanvas=document.getElementById('confetti'),cctx=confCanvas.getContext('2d'),confs=[];
  var confColors=['#f7d8a3','#ffbdd0','#fff4dc','#ffd98e','#c9b6ff','#ffe0b2','#ffffff'];
  function fitConfetti(){confCanvas.width=window.innerWidth*dpr;confCanvas.height=window.innerHeight*dpr;confCanvas.style.width=window.innerWidth+'px';confCanvas.style.height=window.innerHeight+'px';cctx.setTransform(dpr,0,0,dpr,0,0);}
  fitConfetti();window.addEventListener('resize',fitConfetti);
  function fireConfetti(x,y,n){for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,sp=3+Math.random()*9;confs.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-3,w:5+Math.random()*7,h:8+Math.random()*10,rot:Math.random()*Math.PI,vr:(Math.random()-.5)*.3,color:confColors[Math.floor(Math.random()*confColors.length)],life:0,max:110+Math.random()*90});}}
  function drawConfetti(){cctx.clearRect(0,0,window.innerWidth,window.innerHeight);for(var i=confs.length-1;i>=0;i--){var p=confs[i];p.life++;p.vy+=.16;p.vx*=.995;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;cctx.save();cctx.translate(p.x,p.y);cctx.rotate(p.rot);cctx.globalAlpha=Math.max(0,1-p.life/p.max);cctx.fillStyle=p.color;cctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cctx.restore();if(p.life>p.max||p.y>window.innerHeight+60)confs.splice(i,1);}requestAnimationFrame(drawConfetti);}
  if(!reduced) drawConfetti();
  window.wishSystem.fireConfetti=fireConfetti;

  /* wishes */
  var wishLayer=document.getElementById('wishLayer'),wishMsg=document.getElementById('wishMsg'),cakeHint=document.getElementById('cakeHint');
  var wishPool=['愿你被世界温柔以待','十九岁生日快乐','幸福永存，不息待续','愿你眼里总有星光','所有愿望都会开花','梦然，要一直快乐呀','愿你所愿，皆如愿以偿'];
  function floatWish(text,times){times=times||1;for(var n=0;n<times;n++){(function(n){setTimeout(function(){var el=document.createElement('div');el.className='floating-wish';el.textContent=text;el.style.left=(4+Math.random()*66)+'%';el.style.top=(56+Math.random()*34)+'%';el.style.fontSize=(18+Math.random()*16)+'px';el.style.setProperty('--drift',(Math.random()*220-110)+'px');el.style.animationDuration=(7+Math.random()*5)+'s';wishLayer.appendChild(el);setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},13000);},n*240);})(n);}}
  function celebrate(text,count){startMusic();wishMsg.classList.add('show');cakeHint.style.opacity='0';floatWish(text,count||7);var shell=document.getElementById('cakeShell');var r=shell.getBoundingClientRect();fireConfetti(r.left+r.width/2,r.top+r.height*.42,reduced?40:170);}
  window.wishSystem.celebrate=celebrate;
  window.wishSystem.randomWish=function(){celebrate(wishPool[Math.floor(Math.random()*wishPool.length)],3);};
  var wishForm=document.getElementById('wishForm'),wishInput=document.getElementById('wishInput');
  wishForm.addEventListener('submit',function(e){e.preventDefault();var t=wishInput.value.trim();if(!t){wishInput.focus();return;}celebrate(t.slice(0,50),7);wishInput.value='';if(window.cake3d)window.cake3d.blow();});

  /* audio */
  var bgm=document.getElementById('bgm'),musicBtn=document.getElementById('musicBtn');
  bgm.volume=.68;
  function startMusic(){if(bgm.paused){var p=bgm.play();if(p&&p.catch)p.catch(function(){});}musicBtn.classList.add('playing');musicBtn.textContent='❚❚';musicBtn.title='暂停《够爱》';}
  function stopMusic(){bgm.pause();musicBtn.classList.remove('playing');musicBtn.textContent='♪';musicBtn.title='播放《够爱》';}
  musicBtn.addEventListener('click',function(){bgm.paused?startMusic():stopMusic();});
  window.wishSystem.startMusic=startMusic;
  window.addEventListener('load',function(){startMusic();});
  document.addEventListener('pointerdown',function(){if(bgm.paused)startMusic();},{once:true});

  /* lightbox */
  var photos=Array.prototype.slice.call(document.querySelectorAll('.photo-card img'));
  var lb=document.getElementById('lightbox'),lbImg=document.getElementById('lbImg'),current=0;
  function showPhoto(i){current=(i+photos.length)%photos.length;lbImg.src=photos[current].src;lbImg.alt=photos[current].alt;}
  photos.forEach(function(img,i){img.addEventListener('click',function(){showPhoto(i);lb.classList.add('show');});});
  document.getElementById('lbClose').addEventListener('click',function(){lb.classList.remove('show');});
  document.getElementById('lbPrev').addEventListener('click',function(){showPhoto(current-1);});
  document.getElementById('lbNext').addEventListener('click',function(){showPhoto(current+1);});
  lb.addEventListener('click',function(e){if(e.target===lb)lb.classList.remove('show');});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('show'))return;if(e.key==='Escape')lb.classList.remove('show');if(e.key==='ArrowLeft')showPhoto(current-1);if(e.key==='ArrowRight')showPhoto(current+1);});

  document.getElementById('replayBtn').addEventListener('click',function(){
    wishMsg.classList.remove('show');cakeHint.style.opacity='';if(window.cake3d)window.cake3d.reset();
    document.getElementById('cakeSection').scrollIntoView({behavior:'smooth',block:'start'});
  });
})();
