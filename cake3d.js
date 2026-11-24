(function(){
  'use strict';
  var container=document.getElementById('cakeCanvas');
  if(!container||!window.THREE) return;
  var THREE=window.THREE;
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(35,1,.1,100);
  var renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.95;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  function resize(){
    var w=container.clientWidth||680,h=container.clientHeight||560;
    camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
    camera.position.set(0,3.55,h<470?11:9.4);camera.lookAt(0,1.35,0);
  }
  resize();window.addEventListener('resize',resize);

  scene.add(new THREE.HemisphereLight(0xfff1dd,0x4a3b6a,.72));
  scene.add(new THREE.AmbientLight(0xffffff,.16));
  var key=new THREE.DirectionalLight(0xfff0d2,1.05);key.position.set(4,8,6);key.castShadow=true;
  key.shadow.mapSize.width=key.shadow.mapSize.height=1024;key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=6;key.shadow.camera.bottom=-3;scene.add(key);
  var rim=new THREE.PointLight(0xff9fc6,.85,18);rim.position.set(-4,3.5,-4);scene.add(rim);
  var warm=new THREE.PointLight(0xffcd8a,.65,14);warm.position.set(0,2.5,5);scene.add(warm);

  var cake=new THREE.Group();scene.add(cake);
  var creamMat=function(c){return new THREE.MeshPhysicalMaterial({color:c,roughness:.42,metalness:.02,clearcoat:.42,clearcoatRoughness:.36});};
  var goldMat=new THREE.MeshStandardMaterial({color:0xd9b174,metalness:.78,roughness:.24});
  var pink=0xff9dbf,ivory=0xffe2b9,rose=0xff8fb8,creamPink=0xffd3e4,creamIvory=0xfff0d2;

  function lathe(r,h,color){
    var pts=[new THREE.Vector2(0,0),new THREE.Vector2(r-.14,0),new THREE.Vector2(r,.08),new THREE.Vector2(r,h-.1),new THREE.Vector2(r-.14,h),new THREE.Vector2(0,h)];
    var m=new THREE.Mesh(new THREE.LatheGeometry(pts,96),creamMat(color));m.castShadow=true;m.receiveShadow=true;return m;
  }
  function torus(r,tube,y,color,mat){
    var m=new THREE.Mesh(new THREE.TorusGeometry(r,tube,12,96),mat||creamMat(color));m.rotation.x=Math.PI/2;m.position.y=y;m.castShadow=true;return m;
  }

  /* plate */
  var plate=new THREE.Mesh(new THREE.CylinderGeometry(2.55,2.42,.16,96),new THREE.MeshStandardMaterial({color:0xd7b07a,metalness:.65,roughness:.3}));
  plate.position.y=-.09;plate.receiveShadow=true;cake.add(plate);
  cake.add(torus(2.5,.035,.005,0,goldMat));
  var plateTop=new THREE.Mesh(new THREE.CylinderGeometry(2.35,2.35,.03,96),new THREE.MeshStandardMaterial({color:0xfff3df,roughness:.5,metalness:.1}));
  plateTop.position.y=.01;plateTop.receiveShadow=true;cake.add(plateTop);

  /* tiers */
  var tiers=[
    {r:1.86,h:.82,y:.02,col:pink,frost:creamPink,drops:30,pearls:18,sprinkles:48},
    {r:1.36,h:.70,y:.84,col:ivory,frost:creamIvory,drops:24,pearls:14,sprinkles:36},
    {r:.92,h:.62,y:1.54,col:rose,frost:creamPink,drops:18,pearls:10,sprinkles:26}
  ];
  var sprinkles=[];
  tiers.forEach(function(t,idx){
    var body=lathe(t.r,t.h,t.col);body.position.y=t.y;cake.add(body);
    var topY=t.y+t.h;
    var frost=new THREE.Mesh(new THREE.CylinderGeometry(t.r+.035,t.r+.02,.13,96),creamMat(t.frost));frost.position.y=topY-.03;frost.castShadow=true;cake.add(frost);
    cake.add(torus(t.r+.03,.055,t.y+.07,t.frost));
    cake.add(torus(t.r+.025,.02,topY+.045,0,goldMat));
    /* drips */
    for(var i=0;i<t.drops;i++){
      var a=i/t.drops*Math.PI*2+idx*.17;
      var len=.13+Math.random()*.31;
      var g=new THREE.CapsuleGeometry(.055,len,4,10);
      var d=new THREE.Mesh(g,creamMat(t.frost));
      d.position.set(Math.cos(a)*(t.r+.012),topY-.10-len/2,Math.sin(a)*(t.r+.012));
      d.castShadow=true;cake.add(d);
    }
    /* pearls */
    for(var p=0;p<t.pearls;p++){
      var pa=p/t.pearls*Math.PI*2+idx*.3;
      var pearl=new THREE.Mesh(new THREE.SphereGeometry(.045,12,12),new THREE.MeshStandardMaterial({color:p%3===0?0xe9c27b:0xfff8e8,roughness:.25,metalness:.12}));
      pearl.position.set(Math.cos(pa)*(t.r-.03),t.y+.15,Math.sin(pa)*(t.r-.03));cake.add(pearl);
    }
    /* sprinkles on top */
    var colors=[0xff9db8,0x9fd8ff,0xffe38c,0xb8efc8,0xd4b7ff];
    for(var s=0;s<t.sprinkles;s++){
      var ang=Math.random()*Math.PI*2,rad=Math.sqrt(Math.random())*(t.r-.14);
      var sp=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.11,6),new THREE.MeshStandardMaterial({color:colors[s%colors.length],roughness:.5}));
      sp.position.set(Math.cos(ang)*rad,topY+.055,Math.sin(ang)*rad);
      sp.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);cake.add(sp);sprinkles.push(sp);
    }
  });

  /* little flowers around middle tier */
  function flower(x,y,z,rot){
    var g=new THREE.Group();
    for(var i=0;i<5;i++){var petal=new THREE.Mesh(new THREE.SphereGeometry(.07,10,10),creamMat(0xffd9e6));petal.scale.set(1,.55,1.5);petal.position.set(Math.cos(i/5*Math.PI*2)*.085,0,Math.sin(i/5*Math.PI*2)*.085);g.add(petal);}
    var center=new THREE.Mesh(new THREE.SphereGeometry(.04,10,10),goldMat);g.add(center);
    g.position.set(x,y,z);g.rotation.y=rot;cake.add(g);
  }
  for(var f=0;f<8;f++){var fa=f/8*Math.PI*2;flower(Math.cos(fa)*1.38,1.08,Math.sin(fa)*1.38,-fa);}

  /* strawberries */
  function berry(x,z){
    var b=new THREE.Mesh(new THREE.SphereGeometry(.13,16,16),new THREE.MeshStandardMaterial({color:0xe5526b,roughness:.35}));b.scale.y=1.2;b.position.set(x,2.28,z);b.castShadow=true;cake.add(b);
    for(var i=0;i<4;i++){var leaf=new THREE.Mesh(new THREE.ConeGeometry(.045,.11,6),new THREE.MeshStandardMaterial({color:0x6fae61,roughness:.6}));leaf.position.set(x+Math.cos(i/4*Math.PI*2)*.05,2.42,z+Math.sin(i/4*Math.PI*2)*.05);leaf.rotation.z=Math.cos(i/4*Math.PI*2)*.6;cake.add(leaf);}
  }
  [0,1,2,3,4].forEach(function(i){var a=i/5*Math.PI*2+.3;berry(Math.cos(a)*.66,Math.sin(a)*.66);});

  /* gold plaque with handwriting text */
  var plaque=new THREE.Mesh(new THREE.CircleGeometry(.46,64),new THREE.MeshStandardMaterial({color:0xe9c98d,metalness:.65,roughness:.28,side:THREE.DoubleSide})); plaque.scale.set(1.85,.52,1);plaque.position.set(0,1.18,1.4);cake.add(plaque);
  var plaqueRing=new THREE.Mesh(new THREE.RingGeometry(.44,.47,64),goldMat);plaqueRing.scale.set(1.85,.52,1);plaqueRing.position.set(0,1.18,1.405);cake.add(plaqueRing);

  /* candles */
  var flames=[],candlesGroup=new THREE.Group();cake.add(candlesGroup);
  var candleAngles=[-54,-18,18,54,90];
  candleAngles.forEach(function(deg,i){
    var g=new THREE.Group();var a=deg*Math.PI/180;var rad=i%2===0?.48:.62;
    g.position.set(Math.cos(a)*rad,2.16,Math.sin(a)*rad);
    for(var seg=0;seg<10;seg++){
      var band=new THREE.Mesh(new THREE.CylinderGeometry(.042,.042,.056,12),new THREE.MeshStandardMaterial({color:seg%2?0xfff3f7:0xff9dbf,roughness:.5}));
      band.position.y=.03+seg*.056;g.add(band);
    }
    var wick=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.06,8),new THREE.MeshBasicMaterial({color:0x4b382d}));wick.position.y=.63;g.add(wick);
    var flame=new THREE.Group();flame.position.y=.76;
    var outer=new THREE.Mesh(new THREE.ConeGeometry(.072,.21,16),new THREE.MeshBasicMaterial({color:0xff9d3d,transparent:true,opacity:.92}));outer.position.y=.1;flame.add(outer);
    var inner=new THREE.Mesh(new THREE.ConeGeometry(.037,.13,12),new THREE.MeshBasicMaterial({color:0xfff0a8}));inner.position.y=.075;flame.add(inner);
    var light=new THREE.PointLight(0xffa84d,1.6,2.4);light.position.y=.1;flame.add(light);
    g.add(flame);flames.push({group:flame,light:light,phase:Math.random()*6});candlesGroup.add(g);
  });

  /* glitter particles */
  var pGeo=new THREE.BufferGeometry(),pArr=[];
  for(var q=0;q<220;q++){var ang=Math.random()*Math.PI*2,rr=1.2+Math.random()*3.2;pArr.push(Math.cos(ang)*rr,Math.random()*3.5-.2,Math.sin(ang)*rr);}
  pGeo.setAttribute('position',new THREE.Float32BufferAttribute(pArr,3));
  var glitter=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xffe3ad,size:.045,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));cake.add(glitter);

  /* interaction */
  var auto=true,dragging=false,startX=0,startY=0,moved=0,blown=false;
  var el=renderer.domElement;
  el.addEventListener('pointerdown',function(e){dragging=true;moved=0;startX=e.clientX;startY=e.clientY;auto=false;el.setPointerCapture(e.pointerId);});
  el.addEventListener('pointermove',function(e){if(!dragging)return;var dx=e.clientX-startX,dy=e.clientY-startY;moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));cake.rotation.y+=dx*.008;cake.rotation.x=Math.max(-.22,Math.min(.16,cake.rotation.x+dy*.002));startX=e.clientX;startY=e.clientY;});
  el.addEventListener('pointerup',function(e){dragging=false;try{el.releasePointerCapture(e.pointerId);}catch(err){}if(moved<7){if(!blown)blow();if(window.wishSystem&&window.wishSystem.randomWish)window.wishSystem.randomWish();}setTimeout(function(){auto=true;},1600);});
  function blow(){blown=true;flames.forEach(function(f){f.group.visible=false;f.light.intensity=0;});}
  function reset(){blown=false;flames.forEach(function(f){f.group.visible=true;f.light.intensity=1.6;});}
  window.cake3d={blow:blow,reset:reset};

  var clock=new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    var t=clock.getElapsedTime();
    if(auto&&!dragging)cake.rotation.y+=.0032;
    cake.rotation.x+=(0-cake.rotation.x)*.02;
    glitter.rotation.y=t*.05;
    if(!blown)flames.forEach(function(f,i){var s=.9+Math.sin(t*11+f.phase)*.09+Math.sin(t*17+i)*.04;f.group.scale.set(s,1/s,s);f.light.intensity=1.45+Math.sin(t*9+f.phase)*.3;});
    renderer.render(scene,camera);
  }
  animate();
})();
