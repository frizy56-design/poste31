(function(){
'use strict';

/* =========================================================
   Encres de la carte (couleurs proches de la norme ISOM)
   ========================================================= */
const C = {br:'#C1661F', bk:'#1C1C1C', bl:'#1D8FD0', blf:'#46A9E3', ye:'#F9B233', ye50:'#FCD999',
  g20:'#CDEBC6', g50:'#8CCF87', g100:'#3DAE49', vi:'#B02A83', gris:'#B7B9BC', ol:'#A3B04B', pave:'#DDB07F'};

const P = (d,c,w,o={}) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="${o.cap||'round'}" stroke-linejoin="round"${o.dash?` stroke-dasharray="${o.dash}"`:''}/>`;
const F = (d,c) => `<path d="${d}" fill="${c}"/>`;
const CI = (x,y,r,fill,stroke,w,dash) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill||'none'}"${stroke?` stroke="${stroke}" stroke-width="${w}"`:''}${dash?` stroke-dasharray="${dash}"`:''}/>`;
const EL = (x,y,rx,ry,fill,stroke,w,dash,cap) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill||'none'}"${stroke?` stroke="${stroke}" stroke-width="${w}"`:''}${dash?` stroke-dasharray="${dash}" stroke-linecap="${cap||'butt'}"`:''}/>`;
const RC = (x,y,w,h,fill,stroke,sw,rx,dash) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${sw}"`:''}${rx?` rx="${rx}"`:''}${dash?` stroke-dasharray="${dash}"`:''}/>`;
const AREA = fill => RC(10,12,100,36,fill,null,0,3);
const LINE = 'M10 30 L110 30';
const VALLEY = 'M8 16 C38 16 46 44 60 44 S82 16 112 16';
const ARCH = 'M8 46 C38 46 46 18 60 18 S82 46 112 46';
const WAVE = 'M10 34 C24 22 38 22 50 30 S76 40 90 30 S104 24 110 26';
const X = (x,y,s,c,w) => P(`M${x-s} ${y-s} L${x+s} ${y+s} M${x+s} ${y-s} L${x-s} ${y+s}`,c,w);
function dots(x1,x2,y,step,r,c){let s='';for(let x=x1;x<=x2+.01;x+=step)s+=CI(+x.toFixed(2),y,r,c);return s;}
function ticks(x1,x2,y,step,up,down,c,w){let s='';for(let x=x1;x<=x2+.01;x+=step){const v=+x.toFixed(2);s+=P(`M${v} ${y-up} L${v} ${y+down}`,c,w,{cap:'butt'});}return s;}
function cubicTags(g,ts,a,b,c,w){
  let s='';
  for(const t of ts){
    const m=1-t;
    const x=m*m*m*g[0]+3*m*m*t*g[2]+3*m*t*t*g[4]+t*t*t*g[6];
    const y=m*m*m*g[1]+3*m*m*t*g[3]+3*m*t*t*g[5]+t*t*t*g[7];
    const dx=3*m*m*(g[2]-g[0])+6*m*t*(g[4]-g[2])+3*t*t*(g[6]-g[4]);
    const dy=3*m*m*(g[3]-g[1])+6*m*t*(g[5]-g[3])+3*t*t*(g[7]-g[5]);
    const L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
    s+=P(`M${(x+nx*a).toFixed(1)} ${(y+ny*a).toFixed(1)} L${(x+nx*b).toFixed(1)} ${(y+ny*b).toFixed(1)}`,c,w,{cap:'butt'});
  }
  return s;
}

/* =========================================================
   La légende (d'après la fiche envoyée)
   ========================================================= */
const SYMBOLS = [
  // Formes de terrain (marron)
  {id:'courbe',cat:'terrain',g:'courbes',name:'Courbe de niveau',ink:'brun',svg:P(VALLEY,C.br,1.5)},
  {id:'courbe-maitresse',cat:'terrain',g:'courbes',name:'Courbe maîtresse',ink:'brun',svg:P(VALLEY,C.br,3.4)},
  {id:'courbe-inter',cat:'terrain',g:'courbes',name:'Courbe intermédiaire',ink:'brun',svg:P(VALLEY,C.br,1.4,{dash:'7 3.5',cap:'butt'})},
  {id:'tiret-pente',cat:'terrain',g:'courbes',name:'Tiret de sens de pente',ink:'brun',svg:P(ARCH,C.br,1.5)+P('M60 18 L60 8',C.br,1.5,{cap:'butt'})},
  {id:'abrupt',cat:'terrain',g:'talus',name:'Abrupt de terre',ink:'brun',svg:P(ARCH,C.br,3)+cubicTags([8,46,38,46,46,18,60,18],[.4,.6,.78,.93],2,7,C.br,1.3)+cubicTags([60,18,74,18,82,46,112,46],[.07,.22,.4,.6],2,7,C.br,1.3)},
  {id:'levee',cat:'terrain',g:'talus',name:'Levée de terre',ink:'brun',svg:P(LINE,C.br,1.8)+dots(14,106,30,11.5,2.6,C.br)},
  {id:'petite-levee',cat:'terrain',g:'talus',name:'Petite levée de terre',ink:'brun',svg:P(LINE,C.br,1.6,{dash:'7 4',cap:'butt'})},
  {id:'ravine',cat:'terrain',g:'talus',name:'Ravine',ink:'brun',svg:P('M8 14 C36 14 48 38 60 38 S84 14 112 14',C.br,1.3)+P('M8 30 C34 30 48 52 60 52 S86 30 112 30',C.br,1.3)+F('M55.5 6 L64.5 6 L60.8 54 L59.2 54 Z',C.br)},
  {id:'fosse-sec',cat:'terrain',g:'talus',name:'Fossé sec',ink:'brun',svg:P(LINE,C.br,2.6,{dash:'0.1 5.5'})},
  {id:'colline',cat:'terrain',g:'formes',name:'Colline',ink:'brun',svg:EL(44,30,22,12,null,C.br,1.6)+CI(92,30,10,null,C.br,1.4,'4 3')},
  {id:'butte',cat:'terrain',g:'formes',name:'Butte',ink:'brun',svg:CI(60,30,3.8,C.br)},
  {id:'trou',cat:'terrain',g:'trous',name:'Trou',ink:'brun',svg:P('M53 24 L60 37 L67 24',C.br,2.4)},
  {id:'depression',cat:'terrain',g:'formes',name:'Dépression',ink:'brun',svg:EL(60,30,26,12,null,C.br,1.6)+P('M60 18 L60 23.5 M60 42 L60 36.5 M34 30 L39.5 30 M86 30 L80.5 30',C.br,1.4,{cap:'butt'})},
  {id:'petite-depression',cat:'terrain',g:'formes',name:'Petite dépression',ink:'brun',svg:P('M52 25 A8 8 0 0 0 68 25',C.br,2.4)},
  {id:'accidente',cat:'terrain',g:'formes',name:'Terrain accidenté',ink:'brun',svg:RC(14,10,92,40,'url(#pAccid)',null,0,10)},
  {id:'detail-terrain',cat:'terrain',g:'formes',name:'Détail particulier de terrain',ink:'brun',svg:X(60,30,5.5,C.br,2.4)},

  // Rochers et blocs rocheux (noir)
  {id:'falaise-inf',cat:'rochers',g:'falaises',name:'Falaise infranchissable',ink:'noir',svg:P('M10 26 L110 26',C.bk,5.5,{cap:'butt'})+ticks(16,104,28,11,0,7,C.bk,1.6)},
  {id:'colonne',cat:'rochers',g:'falaises',name:'Colonne rocheuse',ink:'noir',svg:F('M34 21 C40 17 48 20 47 28 C46 36 37 39 32 35 C28 31 29 25 34 21 Z',C.bk)+F('M60 31 C66 24 88 23 94 29 C90 36 70 38 60 31 Z',C.bk)},
  {id:'falaise-fr',cat:'rochers',g:'falaises',name:'Falaise franchissable',ink:'noir',svg:P('M10 26 L110 26',C.bk,1.8,{cap:'butt'})+ticks(14,106,26,8,0,6,C.bk,1.2)},
  {id:'trou-rocheux',cat:'rochers',g:'trous',name:'Trou rocheux',ink:'noir',svg:P('M53 23 L60 37 L67 23',C.bk,3.2)},
  {id:'caverne',cat:'rochers',g:'trous',name:'Caverne',ink:'noir',svg:P('M50 22 L59 38 L72 29',C.bk,3)},
  {id:'rocher',cat:'rochers',g:'blocs',name:'Rocher, gros rocher',ink:'noir',svg:CI(46,30,2.6,C.bk)+CI(74,30,5,C.bk)},
  {id:'groupe-rochers',cat:'rochers',g:'blocs',name:'Groupe de rochers',ink:'noir',svg:F('M60 20 L69.5 37 L50.5 37 Z',C.bk)},
  {id:'rocailleux',cat:'rochers',g:'blocs',name:'Terrain rocailleux',ink:'noir',svg:RC(14,10,92,40,'url(#pRocail)',null,0,10)},
  {id:'sablonneux',cat:'rochers',g:'blocs',name:'Terrain sablonneux',ink:null,svg:RC(14,10,92,40,'url(#pSable)',null,0,10)},
  {id:'blocs',cat:'rochers',g:'blocs',name:'Zone de blocs rocheux',ink:'noir',svg:RC(14,10,92,40,'url(#pBlocs)',null,0,10)},
  {id:'affleurement',cat:'rochers',g:'blocs',name:'Affleurement rocheux',ink:null,svg:F('M22 32 C22 22 44 17 64 18 C86 19 100 24 99 31 C98 39 76 43 54 42 C34 41 22 39 22 32 Z',C.gris)},

  // Eau et marais (bleu)
  {id:'lac',cat:'eau',g:'surfaces',name:'Lac',ink:'bleu',svg:`<path d="M20 30 C20 19 46 14 68 16 C90 18 101 25 99 33 C97 42 72 46 48 44 C29 42 20 38 20 30 Z" fill="${C.blf}" stroke="${C.bk}" stroke-width="1.6"/>`},
  {id:'mare',cat:'eau',g:'surfaces',name:'Mare',ink:'bleu',svg:F('M53 30 C53 24 58 22 62 23 C67 24 69 28 67 33 C65 37 58 38 55 35 C53.5 33.5 53 32 53 30 Z',C.blf)},
  {id:'trou-eau',cat:'eau',g:'trous',name:"Trou d'eau",ink:'bleu',svg:P('M53 24 L60 37 L67 24',C.bl,2.4)},
  {id:'riviere-inf',cat:'eau',g:'eau-lignes',name:'Rivière infranchissable',ink:'bleu',svg:P(WAVE,C.bl,5.5)},
  {id:'cours-eau',cat:'eau',g:'eau-lignes',name:"Cours d'eau",ink:'bleu',svg:P(WAVE,C.bl,2.8)},
  {id:'ruisseau',cat:'eau',g:'eau-lignes',name:'Ruisseau franchissable',ink:'bleu',svg:P(WAVE,C.bl,1.4)},
  {id:'ruisseau-inter',cat:'eau',g:'eau-lignes',name:'Ruisseau intermittent',ink:'bleu',svg:P(WAVE,C.bl,1.5,{dash:'3 3',cap:'butt'})},
  {id:'fosse-humide',cat:'eau',g:'eau-lignes',name:'Fossé humide',ink:'bleu',svg:P(LINE,C.bl,1.5,{dash:'9 3.5',cap:'butt'})},
  {id:'marais-inf',cat:'eau',g:'marais',name:'Marais infranchissable',ink:'bleu',svg:AREA('url(#pMaraisInf)')},
  {id:'marais',cat:'eau',g:'marais',name:'Marais',ink:'bleu',svg:AREA('url(#pMarais)')},
  {id:'marais-pv',cat:'eau',g:'marais',name:'Marais peu visible',ink:'bleu',svg:AREA('url(#pMaraisPV)')},
  {id:'petit-marais',cat:'eau',g:'marais',name:'Petit marais',ink:'bleu',svg:P('M52 26 L68 26 M54 33 L66 33',C.bl,2.2,{cap:'butt'})},
  {id:'puits',cat:'eau',g:'eau-points',name:'Puits, fontaine',ink:'bleu',svg:CI(60,30,5.5,null,C.bl,2.2)},
  {id:'element-eau',cat:'eau',g:'eau-points',name:"Élément d'eau particulier",ink:'bleu',svg:X(60,30,5,C.bl,2.4)},
  {id:'source',cat:'eau',g:'eau-points',name:'Source',ink:'bleu',svg:P('M58 23 A7 7 0 1 0 58 37',C.bl,2.2)+P('M57 30 Q66 30 76 35',C.bl,2)},

  // Végétation (jaune, blanc, vert)
  {id:'decouvert',cat:'vege',g:'jaune',name:'Terrain découvert',ink:'jaune',svg:AREA(C.ye)},
  {id:'arbres-disperses',cat:'vege',g:'jaune',name:'Terrain découvert avec arbres dispersés',ink:'jaune',svg:AREA('url(#pArbres)')},
  {id:'encombre',cat:'vege',g:'jaune',name:'Terrain découvert encombré',ink:'jaune',svg:AREA(C.ye50)},
  {id:'semi-ouvert',cat:'vege',g:'jaune',name:'Terrain semi-ouvert',ink:'jaune',svg:AREA('url(#pSemi)')},
  {id:'foret-facile',cat:'vege',g:'vert',name:'Forêt, course facile',ink:'blanc',svg:RC(10,12,100,36,'#FFFFFF','#555555',1,3)},
  {id:'foret-ralentie',cat:'vege',g:'vert',name:'Forêt, course ralentie',ink:'vert',svg:AREA(C.g20)},
  {id:'foret-difficile',cat:'vege',g:'vert',name:'Forêt, course difficile',ink:'vert',svg:AREA(C.g50)},
  {id:'foret-impenetrable',cat:'vege',g:'vert',name:'Forêt impénétrable',ink:'vert',svg:AREA(C.g100)},
  {id:'vegbasse-ralentie',cat:'vege',g:'vert',name:'Végétation basse, course ralentie',ink:'vert',svg:AREA('url(#pVegLente)')},
  {id:'vegbasse-impossible',cat:'vege',g:'vert',name:'Végétation basse, course impossible',ink:'vert',svg:AREA('url(#pVegImp)')},
  {id:'foret-direction',cat:'vege',g:'vert',name:'Forêt traversable dans une direction',ink:'vert',svg:AREA('url(#pDir)')},
  {id:'verger',cat:'vege',g:'jaune',name:'Verger',ink:null,svg:AREA('url(#pVerger)')},
  {id:'vigne',cat:'vege',g:'jaune',name:'Vigne',ink:null,svg:AREA('url(#pVigne)')},
  {id:'limite-culture',cat:'vege',g:'limites',name:'Limite de culture nette',ink:null,svg:EL(60,30,36,15,C.ye)+P('M32 35 L58 35 L66 24 L88 24',C.bk,1.6)},
  {id:'limite-distincte',cat:'vege',g:'limites',name:'Limite de végétation distincte',ink:'noir',noCQ:true,svg:EL(60,30,28,13,null,C.bk,2.4,'0.1 4.4','round')},
  {id:'limite-peu',cat:'vege',g:'limites',name:'Limite de végétation peu distincte',ink:null,svg:EL(60,30,36,15,C.ye)+EL(62,30,11,5.5,'#FFFFFF')},
  {id:'element-vege',cat:'vege',g:'limites',name:'Élément particulier de végétation',ink:'vert',svg:CI(38,30,2.8,C.g100)+X(60,30,4,C.g100,2.2)+CI(82,30,4.5,null,C.g100,2)},

  // Éléments de topographie dus à l'homme (noir)
  {id:'autoroute',cat:'homme',g:'routes',name:'Autoroute',ink:null,svg:RC(10,23,100,14,'#6E6E6E',C.bk,2.2)+P(LINE,C.bk,1.2,{cap:'butt'})},
  {id:'route-principale',cat:'homme',g:'routes',name:'Route principale',ink:null,svg:RC(10,25,100,10,'#E6B47F',C.bk,1.8)},
  {id:'route-secondaire',cat:'homme',g:'routes',name:'Route secondaire',ink:'noir',svg:RC(10,26.5,100,7,'#FFFFFF',C.bk,1.8)},
  {id:'route',cat:'homme',g:'routes',name:'Route',ink:'noir',svg:P(LINE,C.bk,2.4,{cap:'butt'})},
  {id:'chemin-carrossable',cat:'homme',g:'chemins',name:'Chemin carrossable',ink:'noir',svg:P(LINE,C.bk,2.6,{dash:'14 4',cap:'butt'})},
  {id:'chemin',cat:'homme',g:'chemins',name:'Chemin',ink:'noir',svg:P(LINE,C.bk,1.8,{dash:'10 3.5',cap:'butt'})},
  {id:'sentier',cat:'homme',g:'chemins',name:'Sentier',ink:'noir',svg:P(LINE,C.bk,1.3,{dash:'5 3',cap:'butt'})},
  {id:'sentier-pv',cat:'homme',g:'chemins',name:'Sentier peu visible',ink:'noir',svg:P(LINE,C.bk,1.3,{dash:'5 2.5 5 9',cap:'butt'})},
  {id:'jonction-visible',cat:'homme',g:'chemins',name:'Jonction visible de chemins',ink:'noir',svg:P('M10 42 L110 42',C.bk,1.6,{dash:'8 4',cap:'butt'})+P('M62 42 L82 20',C.bk,1.6,{dash:'8 4',cap:'butt'})},
  {id:'jonction-pv',cat:'homme',g:'chemins',name:'Jonction peu visible de chemins',ink:'noir',svg:P('M10 42 L110 42',C.bk,1.6,{dash:'8 4',cap:'butt'})+P('M72 37 L88 19',C.bk,1.6,{dash:'8 4',cap:'butt'})},
  {id:'layon',cat:'homme',g:'chemins',name:'Layon',ink:'noir',svg:P(LINE,'#4A4A4A',0.9,{dash:'12 5',cap:'butt'})},
  {id:'voie-ferree',cat:'homme',g:'lignes',name:'Voie ferrée',ink:'noir',svg:P(LINE,C.bk,2.2,{cap:'butt'})+ticks(16,104,30,11,4.5,4.5,C.bk,2)},
  {id:'ligne-electrique',cat:'homme',g:'lignes',name:'Ligne électrique',ink:'noir',svg:P('M10 36 L60 26 L110 37',C.bk,1.1)+P('M60 21 L60 31',C.bk,2,{cap:'butt'})},
  {id:'ligne-ht',cat:'homme',g:'lignes',name:'Ligne haute tension',ink:'noir',svg:P('M10 32 L60 22 L110 33',C.bk,1.1)+P('M10 39 L60 29 L110 40',C.bk,1.1)+P('M60 17 L60 34',C.bk,2.2,{cap:'butt'})},
  {id:'tunnel',cat:'homme',g:'lignes',name:'Tunnel',ink:'noir',svg:P('M10 30 L44 30 M76 30 L110 30',C.bk,3.4,{cap:'butt'})+P('M39 21 L45 26 L45 34 L39 39 M81 21 L75 26 L75 34 L81 39',C.bk,1.8)},
  {id:'mur',cat:'homme',g:'murs',name:'Mur de pierre',ink:'noir',svg:P(LINE,C.bk,1.1)+dots(14,106,30,11.5,1.9,C.bk)},
  {id:'mur-inf',cat:'homme',g:'murs',name:'Mur infranchissable',ink:'noir',svg:P(LINE,C.bk,2.2)+dots(14,106,30,11.5,3,C.bk)},
  {id:'mur-ruine',cat:'homme',g:'murs',name:'Mur en ruine',ink:'noir',svg:P(LINE,C.bk,1.1,{dash:'8 4',cap:'butt'})+dots(14,106,30,12,1.9,C.bk)},
  {id:'cloture',cat:'homme',g:'clotures',name:'Clôture',ink:'noir',svg:P(LINE,C.bk,1.1)+ticks(15,105,30,10,5,0,C.bk,1.1)},
  {id:'cloture-inf',cat:'homme',g:'clotures',name:'Clôture infranchissable',ink:'noir',svg:P(LINE,C.bk,2)+ticks(15,105,30,10,5.5,5.5,C.bk,1.5)},
  {id:'cloture-ruine',cat:'homme',g:'clotures',name:'Clôture en ruine',ink:'noir',svg:P(LINE,C.bk,1.1,{dash:'8 4',cap:'butt'})+ticks(14,106,30,12,5,0,C.bk,1.1)},
  {id:'passage',cat:'homme',g:'clotures',name:'Point de passage (mur, clôture)',ink:'noir',svg:P('M10 30 L52 30 M68 30 L110 30',C.bk,1.4)+ticks(15,45,30,10,5,0,C.bk,1.1)+ticks(75,105,30,10,5,0,C.bk,1.1)+P('M52 22 L52 38 M68 22 L68 38',C.bk,2,{cap:'butt'})},
  {id:'batiments',cat:'homme',g:'points-homme',name:'Bâtiments',ink:'noir',svg:RC(36,27,6,6,C.bk)+RC(62,20,20,20,C.bk)},
  {id:'habitations',cat:'homme',g:'zones',name:"Zone d'habitations",ink:null,svg:RC(10,12,100,36,C.ol,null,0,3)+RC(22,20,16,10,C.bk)+RC(48,30,12,10,C.bk)+RC(74,18,22,14,C.bk)},
  {id:'zone-interdite',cat:'homme',g:'zones',name:'Zone interdite (carte)',ink:'noir',svg:RC(10,12,100,36,'url(#pInterdit)',C.bk,1.2)},
  {id:'parking',cat:'homme',g:'zones',name:'Aire de parking',ink:null,svg:RC(10,14,100,32,C.pave,C.bk,1.4)},
  {id:'ruines',cat:'homme',g:'points-homme',name:'Ruines',ink:'noir',svg:RC(38,28,4,4,C.bk)+RC(58,20,20,20,'none',C.bk,1.8,0,'4 3')},
  {id:'tombe',cat:'homme',g:'points-homme',name:'Tombe',ink:'noir',svg:P('M60 20 L60 40 M53.5 27 L66.5 27',C.bk,2.2,{cap:'butt'})},
  {id:'element-homme',cat:'homme',g:'points-homme',name:"Élément particulier dû à l'homme",ink:'noir',svg:CI(46,30,4.2,null,C.bk,2)+X(74,30,4.5,C.bk,2.2)},
  {id:'borne',cat:'homme',g:'points-homme',name:'Borne',ink:'noir',svg:CI(60,30,3.2,null,C.bk,1.8)},
  {id:'haute-tour',cat:'homme',g:'points-homme',name:'Haute tour',ink:'noir',svg:F('M60 19 L63.2 26.8 L71 30 L63.2 33.2 L60 41 L56.8 33.2 L49 30 L56.8 26.8 Z',C.bk)},
  {id:'petite-tour',cat:'homme',g:'points-homme',name:'Petite tour',ink:'noir',svg:P('M51 22 L69 22 M60 22 L60 39',C.bk,3,{cap:'butt'})},
  {id:'mangeoire',cat:'homme',g:'points-homme',name:'Mangeoire',ink:'noir',svg:P('M51 27 Q60 16 69 27 M60 21.5 L60 39',C.bk,2,{cap:'butt'})},

  // Autres symboles : le tracé (violet)
  {id:'depart',cat:'parcours',g:'trace-points',name:'Départ',ink:'violet',svg:P('M60 14 L74 39 L46 39 Z',C.vi,2.4)},
  {id:'poste',cat:'parcours',g:'trace-points',name:'Poste de contrôle',ink:'violet',svg:CI(60,30,11,null,C.vi,2.4)},
  {id:'itineraire-balise',cat:'parcours',g:'trace-lignes',name:'Itinéraire balisé',ink:'violet',svg:P('M10 40 C28 40 32 20 50 20 S72 40 90 40 S106 26 110 22',C.vi,2.4,{dash:'6 4',cap:'butt'})},
  {id:'arrivee',cat:'parcours',g:'trace-points',name:'Arrivée',ink:'violet',svg:CI(60,30,12,null,C.vi,2.2)+CI(60,30,7.5,null,C.vi,2.2)},
  {id:'ligne-postes',cat:'parcours',g:'trace-lignes',name:'Jonction entre 2 postes consécutifs',ink:'violet',svg:CI(22,30,8,null,C.vi,2.2)+CI(98,30,8,null,C.vi,2.2)+P('M30 30 L90 30',C.vi,2,{cap:'butt'})},
  {id:'limite-franchir',cat:'parcours',g:'trace-lignes',name:'Limite à ne pas franchir',ink:'violet',svg:P('M12 40 L22 26 L98 26 L108 40',C.bk,1.2)+P('M22 26 L98 26',C.vi,5,{cap:'butt'})},
  {id:'passage-trace',cat:'parcours',g:'trace-points',name:'Point de passage (tracé)',ink:'violet',svg:P('M48 24 Q60 29.5 72 24 M48 37 Q60 31.5 72 37',C.vi,2.6)},
  {id:'zone-interdite-trace',cat:'parcours',g:'trace-zones',name:'Zone interdite (tracé)',ink:'violet',svg:AREA('url(#pInterditV)')},
  {id:'zone-dangereuse',cat:'parcours',g:'trace-zones',name:'Zone dangereuse',ink:'violet',svg:AREA('url(#pDanger)')},
  {id:'itineraire-interdit',cat:'parcours',g:'trace-lignes',name:'Itinéraire interdit',ink:null,svg:P(LINE,C.bk,2.2,{cap:'butt'})+X(38,30,6,C.vi,2.6)+X(82,30,6,C.vi,2.6)},
  {id:'secours',cat:'parcours',g:'trace-points',name:'Poste de secours',ink:'violet',svg:F('M56 18 H64 V26 H72 V34 H64 V42 H56 V34 H48 V26 H56 Z',C.vi)},
  {id:'ravito',cat:'parcours',g:'trace-points',name:'Poste de ravitaillement',ink:'violet',svg:P('M47 21 L73 21 L68.5 40 L51.5 40 Z',C.vi,2.4)+P('M48.5 26.5 L71.5 26.5',C.vi,1.8,{cap:'butt'})},
  {id:'ligne-nord',cat:'parcours',g:'trace-lignes',name:'Ligne de nord',ink:'bleu',noCQ:true,svg:P('M60 8 L60 52',C.bl,2.4,{cap:'butt'})},

  // Extension : symboles de la norme ISOM 2017-2 absents de la fiche (activables dans le carnet)
  {id:'butte-allongee',cat:'terrain',g:'formes',ext:true,name:'Petite butte allongée',ink:'brun',svg:`<ellipse cx="60" cy="30" rx="8.5" ry="3.6" fill="${C.br}" transform="rotate(-18 60 30)"/>`},
  {id:'tres-accidente',cat:'terrain',g:'formes',ext:true,name:'Terrain très accidenté',ink:'brun',svg:RC(14,10,92,40,'url(#pAccid2)',null,0,10)},
  {id:'blocs-dense',cat:'rochers',g:'blocs',ext:true,name:'Zone de blocs rocheux dense',ink:'noir',svg:RC(14,10,92,40,'url(#pBlocs2)',null,0,10)},
  {id:'pierreux-marche',cat:'rochers',g:'blocs',ext:true,name:'Sol pierreux, on marche',ink:'noir',svg:RC(14,10,92,40,'url(#pRocail2)',null,0,10)},
  {id:'pierreux-difficile',cat:'rochers',g:'blocs',ext:true,name:'Sol pierreux, passage très difficile',ink:'noir',svg:RC(14,10,92,40,'url(#pRocail3)',null,0,10)},
  {id:'terrain-cultive',cat:'vege',g:'jaune',ext:true,name:'Terrain cultivé',ink:null,svg:AREA('url(#pCult)')},
];
const BY_ID = Object.fromEntries(SYMBOLS.map(s=>[s.id,s]));

/* =========================================================
   Ce que ça veut dire, et ce que tu verras sur le terrain
   (d'après les définitions de la norme ISOM 2017-2)
   ========================================================= */
const EXPL = {
  // Formes de terrain
  'courbe':["Une ligne qui relie tous les points situés à la même altitude. Sur une carte de CO, deux courbes voisines sont en général séparées de 5 mètres de dénivelé.",
    "Plus les courbes sont serrées, plus la pente est raide, et quand elles s'écartent le terrain s'aplatit. C'est ce qui te dit si tu vas monter, descendre ou rester à plat, donc c'est la base pour choisir ton itinéraire."],
  'courbe-maitresse':["Une courbe sur cinq est dessinée plus épaisse pour qu'on lise les altitudes d'un coup d'œil.",
    "Il n'y a rien de spécial à voir sur place, mais passer d'une courbe maîtresse à la suivante représente 25 mètres de dénivelé quand l'équidistance est de 5 mètres, donc elle t'aide à estimer vite l'effort d'une montée."],
  'courbe-inter':["Une courbe en tirets, placée entre deux courbes normales pour montrer une forme de relief trop discrète pour elles.",
    "Elle signale un léger replat, un petit vallon ou une petite croupe, c'est-à-dire un détail de relief peu marqué qu'il faut chercher du regard."],
  'tiret-pente':["Un petit trait accroché à une courbe de niveau, toujours placé du côté où le terrain descend.",
    "Il lève le doute là où on pourrait confondre une bosse et un creux. Si les tirets pointent vers l'intérieur d'une courbe fermée, tu vas descendre dans une cuvette, et s'ils pointent vers l'extérieur, tu es sur une bosse."],
  'abrupt':["Une cassure franche dans le niveau du sol, d'au moins 1 mètre de haut, comme un talus raide, le bord d'une sablière ou le talus d'une route creusée.",
    "Tu verras une petite paroi de terre, et les tirets montrent de quel côté ça descend. On peut en général la passer mais ça casse le rythme, donc c'est souvent un bon repère à longer plutôt qu'un obstacle à attaquer de face."],
  'levee':["Une levée ou un mur de terre bien distinct, d'au moins 1 mètre de haut.",
    "C'est une bosse allongée qui forme une ligne dans le terrain. Elle se franchit, et comme elle est continue, elle fait une excellente main courante à suivre ou une ligne d'arrêt qui te prévient que tu as dépassé ton poste."],
  'petite-levee':["Une levée de terre plus basse, en ruine ou moins facile à distinguer, d'au moins 50 centimètres de haut.",
    "Elle est plus discrète, parfois à moitié effacée ou couverte de végétation, donc il faut ouvrir l'œil pour la repérer, mais elle reste utile comme ligne de repère."],
  'ravine':["Une ravine creusée par l'eau, d'au moins 1 mètre de profondeur, trop étroite pour être dessinée avec des courbes de niveau.",
    "Tu verras un sillon encaissé dans la pente. La traverser t'oblige à descendre puis à remonter, donc on la longe souvent, et elle te guide très bien vers le haut ou le bas du versant."],
  'fosse-sec':["Une petite ravine, un fossé sec ou une tranchée d'au moins 50 centimètres de profondeur.",
    "C'est un petit creux en ligne, souvent sans eau, qui se saute facilement. Il ne te ralentit pas vraiment, mais il fait une bonne ligne de repère quand il coupe ta route."],
  'colline':["Un sommet dessiné par des courbes de niveau qui se referment sur elles-mêmes. Une petite colline plus basse qu'une courbe normale peut aussi être dessinée en tirets.",
    "Tu verras le terrain monter de tous les côtés vers un point haut. Le sommet est un repère fort, et souvent on choisit de contourner la colline à flanc plutôt que de passer par-dessus."],
  'butte':["Une petite butte ou un monticule bien visible, d'au moins 1 mètre de haut, trop petit pour être dessiné avec une courbe de niveau.",
    "C'est une bosse isolée qui fait souvent un bon poste. En forêt elle n'apparaît parfois qu'au dernier moment, donc il vaut mieux partir d'un repère proche pour l'atteindre."],
  'trou':["Un trou aux bords raides et nets, d'au moins 1 mètre de profondeur et 1 mètre de large.",
    "C'est un creux franc qu'on ne voit qu'une fois tout près, donc arrive dessus avec précision et regarde où tu mets les pieds."],
  'depression':["Un creux fermé dessiné par une courbe de niveau qui se referme, avec des tirets de pente tournés vers l'intérieur pour montrer que le terrain descend.",
    "Tu verras une cuvette entourée de pentes, donc tu descends pour y entrer et tu remontes pour en sortir. Une fois au fond, tu ne vois plus rien autour de toi, alors repère bien ta direction de sortie avant d'y descendre."],
  'petite-depression':["Un petit creux peu profond, d'au moins 1 mètre, sans bords raides, trop petit pour être dessiné avec une courbe de niveau.",
    "C'est une cuvette douce, moins marquée qu'un trou, que tu remarques surtout au changement de pente sous tes pieds. Elle se rate facilement, donc il faut arriver dessus avec précision."],
  'accidente':["Une zone pleine de petits trous et de petites bosses, trop nombreux et trop complexes pour être dessinés un par un.",
    "Le sol est bosselé et irrégulier, donc tu dois regarder où tu poses les pieds, et il devient difficile d'y repérer un détail précis."],
  'detail-terrain':["Un élément de relief particulier qui se distingue bien de ce qui l'entoure. Sa signification exacte doit être donnée dans la légende de la carte.",
    "Regarde la légende de ta carte avant de partir pour savoir ce que ce symbole désigne sur cette course précise."],

  // Rochers et blocs rocheux
  'falaise-inf':["Une falaise, une carrière ou un abrupt si haut et si raide qu'il est impossible ou dangereux de le franchir.",
    "Tu verras une vraie paroi rocheuse. On ne la descend pas et on ne la grimpe pas, donc ton itinéraire doit la contourner, ce qui peut coûter un détour."],
  'colonne':["Un bloc rocheux gigantesque, un pilier de rocher ou une falaise massive, dessiné tel qu'on le voit du dessus.",
    "C'est une grosse masse de rocher qu'on voit de loin, donc un excellent repère. Elle ne se franchit pas, tu passes à côté."],
  'falaise-fr':["Une petite falaise ou une carrière franchissable, d'au moins 1 mètre de haut.",
    "C'est une marche de rocher qu'on peut passer en s'aidant des mains ou en cherchant un endroit plus bas. La franchir ralentit normalement ta progression, donc la contourner est parfois plus rapide."],
  'trou-rocheux':["Un trou dans le rocher ou un puits de mine, d'au moins 1 mètre de profondeur, qui peut être dangereux pour le coureur.",
    "C'est un creux aux bords durs qu'on découvre parfois au dernier moment, donc approche-toi prudemment."],
  'caverne':["L'entrée d'une grotte ou d'une caverne. Dans la norme officielle, elle fait partie de la même famille que le trou rocheux, parce qu'elle peut aussi être dangereuse.",
    "Tu verras une ouverture dans le rocher, souvent au pied d'une paroi. C'est un bon repère, mais reste prudent autour."],
  'rocher':["Un rocher isolé et bien distinct. Le petit point désigne un rocher de plus de 1 mètre de haut, le gros point un bloc particulièrement gros, de plus de 2 mètres.",
    "Ce sont des repères précis qui servent souvent de postes, et plus le point est gros sur la carte, plus le rocher se voit de loin."],
  'groupe-rochers':["Un groupe de rochers trop rapprochés pour être dessinés un par un, chacun faisant au moins 1 mètre de haut.",
    "Tu verras un petit amas de blocs, plus facile à repérer qu'un rocher seul, donc c'est un bon point d'attaque ou un bon poste."],
  'rocailleux':["Une zone couverte de pierres et de cailloux.",
    "Le sol est instable et ça ralentit la course, parfois jusqu'à devoir marcher quand les pierres sont nombreuses, donc attention aux chevilles."],
  'sablonneux':["Une zone de sable mou, sans végétation.",
    "Tes pieds s'enfoncent et tu avances à moins de 80 % de ta vitesse normale, donc un chemin qui la contourne peut être plus rapide."],
  'blocs':["Une zone couverte de nombreux blocs rocheux, trop nombreux pour être dessinés un par un.",
    "Tu dois zigzaguer entre les blocs, ce qui ralentit, et il devient difficile de reconnaître un bloc précis au milieu des autres."],
  'affleurement':["Une zone de rocher nu, sans terre ni végétation, sur laquelle on peut courir.",
    "C'est une dalle ou une surface rocheuse à découvert, donc la course y reste possible, mais le rocher peut glisser quand il est mouillé."],

  // Eau et marais
  'lac':["Une étendue d'eau qu'on ne peut pas traverser. Le trait noir autour souligne justement qu'elle est infranchissable.",
    "Tu dois en faire le tour, mais la berge fait en échange une excellente main courante à suivre."],
  'mare':["Une petite étendue d'eau, comme une mare ou un petit étang.",
    "C'est un repère facile à reconnaître, qu'on contourne plutôt que de s'y mouiller. Selon la saison, elle peut être plus petite, voire à sec."],
  'trou-eau':["Un trou rempli d'eau ou un point d'eau trop petit pour être dessiné à l'échelle.",
    "C'est un point d'eau très localisé, donc un poste précis qu'il vaut mieux viser en partant d'un repère proche."],
  'riviere-inf':["Une rivière trop large, trop profonde ou trop rapide pour être traversée.",
    "Tu ne peux passer que par un pont, donc repère-le sur la carte avant d'arriver au bord, sinon tu perdras du temps à longer la rive."],
  'cours-eau':["Un cours d'eau franchissable, en principe d'au moins 2 mètres de large.",
    "Tu peux le traverser, mais tu risques de te mouiller les pieds et de ralentir. Comme il suit le fond du vallon, c'est aussi une ligne de repère très sûre."],
  'ruisseau':["Un petit ruisseau qu'on franchit facilement.",
    "Un saut suffit en général. Il coule au fond d'un vallon, donc le suivre te guide vers le bas de la pente."],
  'ruisseau-inter':["Un petit chenal, naturel ou creusé, où l'eau ne coule que par moments.",
    "Selon la saison il peut être à sec et ressembler à un simple sillon humide, donc ne compte pas sur la présence d'eau pour le reconnaître."],
  'fosse-humide':["Un fossé où l'eau circule, naturel ou creusé par l'homme, souvent bien rectiligne.",
    "C'est une ligne droite souvent humide ou boueuse au fond, qui se franchit d'un saut et fait une bonne main courante à travers bois ou champs."],
  'marais-inf':["Un marais qu'on ne peut pas traverser ou qui est dangereux pour les coureurs.",
    "On risque de s'y enfoncer, donc tu dois obligatoirement le contourner."],
  'marais':["Un marais franchissable, avec en général un bord bien net.",
    "Le sol est mou et gorgé d'eau, donc tu vas te mouiller et ralentir. Le traverser est possible, et c'est à toi de juger si le contourner serait plus rapide."],
  'marais-pv':["Un marais peu marqué ou saisonnier, où l'on passe progressivement du sol humide au sol ferme.",
    "Le sol est simplement humide et spongieux, ça se traverse sans gros souci, mais ses limites sont floues, donc c'est un repère peu précis."],
  'petit-marais':["Un marais trop étroit pour être dessiné en surface, moins de 5 mètres de large, ou un petit filet d'eau.",
    "C'est un petit coin humide, discret mais précis, qui peut servir à confirmer ta position."],
  'puits':["Un puits, une fontaine, un réservoir d'eau ou une source captée bien visible.",
    "C'est une construction qu'on voit bien, donc un poste facile à identifier."],
  'element-eau':["Un élément lié à l'eau qui se remarque. Sa signification exacte est donnée dans la légende de la carte.",
    "Regarde la légende de ta carte pour savoir ce que cette croix bleue désigne sur cette course."],
  'source':["Un endroit où l'eau sort du sol avec un écoulement visible. Le symbole s'ouvre du côté où l'eau s'écoule.",
    "C'est souvent le point de départ d'un ruisseau, au creux d'un vallon, donc en remontant le vallon tu arrives dessus."],

  // Végétation
  'decouvert':["Un terrain ouvert sans arbres, couvert d'herbe ou de mousse, comme une prairie.",
    "Tu cours plus facilement qu'en forêt et tu vois loin, donc c'est idéal pour lire le terrain autour de toi et avancer vite."],
  'arbres-disperses':["Un terrain ouvert parsemé d'arbres ou de buissons isolés.",
    "La course reste facile et la visibilité bonne, même si les arbres isolés coupent un peu la vue au loin."],
  'encombre':["Un terrain ouvert mais rugueux, comme une lande, de la bruyère, des hautes herbes ou une jeune plantation dont les arbres font moins de 1 mètre.",
    "Tu vois loin, mais la végétation au sol accroche les jambes et peut te ralentir."],
  'semi-ouvert':["Un terrain ouvert rugueux, comme une lande ou une friche, parsemé d'arbres ou de buissons.",
    "La visibilité reste correcte, mais la végétation au sol et les arbustes te freinent un peu."],
  'foret-facile':["Le blanc représente la forêt typique de la carte, celle où l'on court normalement.",
    "Ce sont des arbres avec peu de végétation au sol, donc tu cours à ta vitesse et tu vois assez loin entre les troncs, ce qui en fait souvent la meilleure option pour couper tout droit."],
  'foret-ralentie':["Une forêt où la végétation ou la mauvaise visibilité réduit ta vitesse à 60 à 80 % de la normale.",
    "Les buissons et les branches te gênent un peu, donc tu cours encore mais moins vite. Sur une longue distance, un détour par du blanc peut être plus rapide."],
  'foret-difficile':["Une végétation dense avec une mauvaise visibilité, qui réduit ta vitesse à 20 à 60 % de la normale.",
    "Tu ne cours plus vraiment, tu marches en écartant les branches, donc il vaut mieux l'éviter si un autre passage existe."],
  'foret-impenetrable':["Une végétation très dense, où l'on avance à moins de 20 % de sa vitesse normale.",
    "Il faut se battre avec les branches pour avancer, donc on la contourne presque toujours."],
  'vegbasse-ralentie':["Une forêt où la visibilité est bonne mais où le sous-bois réduit ta vitesse à 60 à 80 % de la normale.",
    "Tu vois tes repères au loin, mais la végétation basse freine tes jambes, donc tu avances plus lentement que la visibilité ne le laisse croire."],
  'vegbasse-impossible':["Une forêt où la visibilité est bonne mais où le sous-bois est si dense que ta vitesse tombe à 20 à 60 % de la normale.",
    "Tu vois à travers, mais tu ne peux plus courir, tu marches, donc cherche un autre passage dès que possible."],
  'foret-direction':["Une forêt dense qu'on traverse bien dans un seul sens. Les bandes blanches montrent la direction dans laquelle on court facilement.",
    "Dans le sens des bandes tu avances bien, alors qu'en travers tu es freiné, donc aligne ton itinéraire sur elles."],
  'verger':["Un terrain planté d'arbres ou d'arbustes, en général en rangées régulières, comme un verger.",
    "Tu cours facilement entre les rangées, mais tous les arbres se ressemblent, donc garde bien ta direction à la boussole."],
  'vigne':["Une vigne ou une culture du même genre en rangs serrés. Les lignes montrent le sens des rangs.",
    "Tu cours bien dans le sens des rangs, alors que les traverser est lent, donc profite de leur direction quand elle va dans ton sens."],
  'limite-culture':["La limite d'un champ ou d'une zone cultivée, quand elle n'est pas déjà marquée par une clôture, un mur ou un chemin.",
    "Tu verras le passage net d'une culture à une autre, par exemple d'un champ à une prairie, ce qui fait une bonne ligne de repère."],
  'limite-distincte':["Une lisière de forêt bien nette, ou une limite de végétation bien marquée à l'intérieur de la forêt.",
    "Tu vois clairement où la végétation change, par exemple au bord d'une clairière, donc c'est une main courante fiable."],
  'limite-peu':["Une limite de végétation floue. Elle n'est pas dessinée par un trait, on la devine seulement au changement de couleur.",
    "La végétation change progressivement, sans ligne nette, donc ne compte pas dessus comme repère précis."],
  'element-vege':["Des éléments de végétation remarquables. Le point vert est un buisson ou un arbre remarquable, le cercle vert un grand arbre remarquable, et la croix verte un élément particulier précisé dans la légende de la carte.",
    "Ce sont des repères ponctuels, comme un gros arbre isolé, qui peuvent servir de poste."],

  // Éléments dus à l'homme
  'autoroute':["Une route à grande circulation, à chaussées séparées.",
    "Elle est en général clôturée et dangereuse, donc on ne la traverse que par un pont ou un tunnel."],
  'route-principale':["Une route large, dessinée à sa vraie largeur sur la carte.",
    "Des voitures y circulent, donc traverse-la prudemment. Elle forme une ligne d'arrêt impossible à rater."],
  'route-secondaire':["Une route goudronnée de largeur moyenne, praticable en voiture par tous les temps.",
    "Tu cours vite dessus, et elle permet souvent de rejoindre rapidement une zone, même si ça rallonge un peu la distance."],
  'route':["Une petite route entretenue, praticable en voiture, plus étroite qu'une route secondaire.",
    "La surface est dure et roulante, donc c'est souvent le passage le plus rapide, même avec un détour."],
  'chemin-carrossable':["Une piste peu entretenue, où une voiture ne passe qu'en roulant doucement.",
    "C'est un large chemin de terre ou de gravier, très facile à suivre et rapide à courir."],
  'chemin':["Un chemin bien marqué, plus étroit qu'une piste.",
    "Tu le suis sans difficulté et tu cours vite, donc c'est une main courante très sûre."],
  'sentier':["Un petit sentier qu'on peut suivre à allure de course.",
    "Il est étroit mais visible, donc tu peux le suivre sans ralentir."],
  'sentier-pv':["Un petit sentier peu visible ou peu marqué, qu'on peut pourtant suivre en courant.",
    "Il peut disparaître par endroits sous les feuilles ou l'herbe, donc garde ta boussole en main pour ne pas le perdre."],
  'jonction-visible':["Deux chemins qui se rejoignent avec une intersection bien nette. Sur la carte, les tirets se touchent.",
    "Tu verras clairement le croisement, donc c'est un point fiable pour savoir exactement où tu es."],
  'jonction-pv':["Deux chemins qui se rejoignent, mais l'intersection est difficile à voir. Sur la carte, les tirets ne se touchent pas.",
    "Le départ du chemin peut passer inaperçu, donc ralentis quand tu penses en approcher et cherche-le du regard."],
  'layon':["Une trouée rectiligne dans la forêt, bien visible mais sans vrai chemin au sol.",
    "Tu vois une ligne droite plus claire entre les arbres, mais le sol n'y est pas forcément plus facile. C'est surtout un très bon repère de direction."],
  'voie-ferree':["Une voie de chemin de fer ou un autre type de rails.",
    "Traverse avec une grande prudence. Quand il est interdit de la traverser ou de la longer, la carte la barre de croix violettes."],
  'ligne-electrique':["Une ligne électrique, un téléphérique ou un téléski. Les petits traits marquent les poteaux.",
    "Tu peux suivre la ligne de poteaux et de câbles, ce qui fait un bon repère en ligne."],
  'ligne-ht':["Une grande ligne électrique, dessinée avec deux traits. Les barres marquent les pylônes.",
    "Les pylônes se voient de loin et la ligne passe souvent dans une trouée déboisée, donc c'est un repère très sûr."],
  'tunnel':["Un passage sous une route, une voie ferrée ou un autre obstacle. La norme utilise le même symbole pour les ponts et les tunnels.",
    "S'il est dessiné, c'est qu'on peut y passer, donc c'est souvent le seul endroit pour franchir une grande route ou une voie."],
  'mur':["Un mur bien visible, en pierres, en béton ou en rondins.",
    "Il se franchit en général sans problème, et comme il est continu, c'est une bonne ligne à suivre."],
  'mur-inf':["Un mur qu'on ne peut pas franchir, en général haut de plus de 1,5 mètre.",
    "Tu ne dois pas l'escalader, donc cherche un point de passage ou fais le tour."],
  'mur-ruine':["Un mur écroulé ou peu visible.",
    "Il ressemble parfois à une simple ligne de pierres au sol, donc il faut regarder attentivement pour le repérer."],
  'cloture':["Une clôture qu'on peut franchir. Quand elle entoure un enclos, les petits traits sont placés vers l'intérieur.",
    "Tu peux l'enjamber ou passer dessous, mais ça prend du temps, et elle fait aussi une excellente main courante."],
  'cloture-inf':["Une clôture qu'on ne peut pas franchir, en général haute de plus de 1,5 mètre.",
    "Tu ne dois pas la passer, donc cherche un point de passage ou fais le tour."],
  'cloture-ruine':["Une clôture écroulée ou peu visible.",
    "Il reste parfois quelques piquets ou un fil au sol, donc elle se franchit facilement mais se repère mal."],
  'passage':["Un endroit où l'on peut franchir un mur, une clôture ou un autre obstacle en ligne, comme un portail, une échelle ou une ouverture.",
    "C'est souvent le seul passage sur une longue distance, donc vise-le directement quand ton itinéraire doit franchir l'obstacle."],
  'batiments':["Un bâtiment dessiné vu du dessus, à l'échelle quand il est assez grand.",
    "C'est un repère très visible, mais on ne passe pas au travers, donc tu le contournes."],
  'habitations':["Le vert olive marque une zone où l'on ne doit pas entrer, comme des maisons, des jardins ou une usine.",
    "Même si rien ne t'en empêche physiquement, tu restes dehors, ce qui oblige parfois à faire le tour."],
  'zone-interdite':["Une zone interdite d'accès en permanence, marquée par des bandes noires verticales.",
    "Tu n'as pas le droit d'y entrer, donc ton itinéraire doit passer autour."],
  'parking':["Une surface dure et plane, comme un parking, du goudron, du gravier compacté ou du béton.",
    "Tu cours vite dessus, et c'est un repère facile à reconnaître."],
  'ruines':["Un bâtiment en ruine, dessiné en tirets et à l'échelle quand il est assez grand.",
    "Tu verras des restes de murs ou des fondations, souvent envahis par la végétation."],
  'tombe':["Une tombe ou un petit monument funéraire isolé.",
    "C'est un repère ponctuel discret, à respecter quand tu passes à côté."],
  'element-homme':["Un élément construit qui se remarque. Sa signification exacte est donnée dans la légende de la carte.",
    "Regarde la légende de ta carte pour savoir ce que le rond et la croix désignent sur cette course."],
  'borne':["Une borne bien visible, par exemple une borne de limite, un cairn ou une borne géodésique.",
    "C'est un petit repère ponctuel, souvent au bord d'un chemin ou sur une limite de parcelle."],
  'haute-tour':["Une tour haute ou un grand pylône.",
    "Elle dépasse souvent des arbres et se voit de loin, donc elle t'aide à te situer."],
  'petite-tour':["Une petite tour ou une plateforme, comme un mirador de chasse.",
    "C'est un repère ponctuel bien visible une fois que tu es à proximité."],
  'mangeoire':["Une mangeoire ou un râtelier à fourrage, isolé ou fixé à un arbre.",
    "C'est un petit repère ponctuel, utile pour confirmer ta position."],

  // Autres symboles : le tracé
  'depart':["Le point de départ de ton parcours. Le centre du triangle marque l'endroit exact.",
    "C'est là que tu commences à lire ta carte, et le triangle pointe vers ton premier poste."],
  'poste':["Un cercle centré sur l'élément où se trouve la balise que tu dois pointer.",
    "Tu cherches une balise orange et blanche avec son boîtier de pointage. L'endroit exact, par exemple le pied du rocher ou le côté nord de la butte, est donné par la définition de poste."],
  'itineraire-balise':["Un itinéraire balisé sur le terrain, qu'il est obligatoire de suivre.",
    "Tu suis la rubalise ou les marques posées par l'organisateur, par exemple entre le dernier poste et l'arrivée."],
  'arrivee':["La fin du parcours, dessinée par un double cercle.",
    "Tu pointes l'arrivée pour arrêter ton chrono, et le dernier poste y est souvent relié par un itinéraire balisé."],
  'ligne-postes':["Le trait qui relie deux postes dans l'ordre où tu dois les faire.",
    "Il indique seulement l'ordre, pas le chemin à suivre, donc c'est à toi de choisir ton itinéraire entre les deux postes."],
  'limite-franchir':["Une limite que l'organisateur interdit de franchir, par exemple le long d'une clôture ou d'un mur.",
    "Tu ne dois pas la traverser, même si c'est physiquement possible, donc cherche un point de passage ou fais le tour."],
  'passage-trace':["Un point de passage ajouté par l'organisateur à travers un mur, une clôture, une route ou une voie ferrée.",
    "C'est l'endroit autorisé pour franchir l'obstacle, donc ton itinéraire doit passer exactement là."],
  'zone-interdite-trace':["Une zone interdite ajoutée par l'organisateur pour cette course.",
    "Tu n'as pas le droit d'y entrer, donc ton itinéraire doit passer autour."],
  'zone-dangereuse':["Une zone dangereuse signalée par l'organisateur.",
    "Évite-la, ou redouble de prudence si ton itinéraire passe tout près."],
  'itineraire-interdit':["Un itinéraire, par exemple une route ou une voie ferrée, qu'il est interdit d'emprunter.",
    "Tu ne dois pas courir dessus, et si un point de passage est dessiné, c'est le seul endroit où tu peux le traverser."],
  'secours':["L'emplacement d'un poste de secours.",
    "C'est là que tu trouves de l'aide si tu te blesses ou si un autre coureur a besoin d'assistance."],
  'ravito':["L'emplacement d'un poste de ravitaillement.",
    "C'est l'endroit où tu peux boire, et parfois manger, pendant la course."],
  'ligne-nord':["Des lignes parallèles qui indiquent la direction du nord magnétique.",
    "Elles ne correspondent à rien sur le terrain, mais elles te servent à orienter ta carte avec la boussole, en alignant l'aiguille sur elles."],

  // Extension norme 2017
  'butte-allongee':["Une petite butte allongée bien visible, d'au moins 1 mètre de haut, trop petite pour être dessinée avec une courbe de niveau.",
    "C'est une bosse en longueur, comme un petit dos d'âne dans la pente, et le symbole est orienté comme elle sur le terrain, donc il t'aide aussi à te placer."],
  'tres-accidente':["Une zone de trous et de bosses trop complexe pour être dessinée en détail, ou un autre terrain inégal, qui limite nettement la vitesse de course.",
    "C'est la version plus dense du terrain accidenté : le sol te ralentit vraiment, donc prévois de marcher par endroits ou de passer à côté."],
  'blocs-dense':["Une zone couverte de très nombreux blocs rocheux, trop nombreux pour être dessinés un par un, qui réduit la vitesse de course.",
    "Tu avances en enjambant ou en contournant les blocs, nettement plus lentement que dans une zone de blocs ordinaire."],
  'pierreux-marche':["Une zone couverte de pierres et de cailloux où ta vitesse tombe à 20 à 60 % de la normale.",
    "Tu ne cours plus vraiment, tu marches en regardant où tu poses les pieds. Dans la norme récente, le sol pierreux existe en trois densités : plus les points noirs sont serrés, plus tu ralentis."],
  'pierreux-difficile':["Une zone de pierres si dense que ta vitesse tombe sous 20 % de la normale.",
    "Le passage est très pénible et fatigue les chevilles, donc on le contourne presque toujours."],
  'terrain-cultive':["Un terrain cultivé, en général utilisé pour faire pousser des cultures.",
    "Selon la saison et la hauteur des cultures, on y court plus ou moins bien, et on respecte les cultures en passant."],
};

/* =========================================================
   Paires souvent confondues (pour les duels et le carnet)
   ========================================================= */
const PAIRS = [
  ['courbe','courbe-maitresse'],['courbe','courbe-inter'],['butte','trou'],['trou','petite-depression'],['colline','depression'],
  ['levee','petite-levee'],['ravine','fosse-sec'],['abrupt','falaise-fr'],['falaise-inf','falaise-fr'],['rocher','butte'],
  ['rocher','groupe-rochers'],['rocailleux','blocs'],['trou-rocheux','trou'],['trou-eau','trou'],['cours-eau','ruisseau'],
  ['ruisseau','ruisseau-inter'],['ruisseau-inter','fosse-humide'],['marais','marais-pv'],['marais','marais-inf'],['lac','mare'],
  ['puits','element-eau'],['decouvert','encombre'],['arbres-disperses','semi-ouvert'],['foret-ralentie','foret-difficile'],
  ['foret-difficile','foret-impenetrable'],['vegbasse-ralentie','vegbasse-impossible'],['vegbasse-ralentie','foret-direction'],
  ['verger','vigne'],['limite-distincte','limite-peu'],['route','route-secondaire'],['chemin-carrossable','chemin'],
  ['chemin','sentier'],['sentier','sentier-pv'],['sentier','layon'],['jonction-visible','jonction-pv'],['mur','cloture'],
  ['mur','mur-ruine'],['cloture','cloture-inf'],['ligne-electrique','ligne-ht'],['batiments','ruines'],['petite-tour','mangeoire'],
  ['zone-interdite','zone-interdite-trace'],['passage','passage-trace'],['depart','poste'],['poste','arrivee'],
  ['zone-interdite-trace','zone-dangereuse'],['itineraire-interdit','limite-franchir'],['ligne-postes','itineraire-balise'],
  ['butte','butte-allongee'],['accidente','tres-accidente'],['blocs','blocs-dense'],['rocailleux','pierreux-marche'],
  ['pierreux-marche','pierreux-difficile'],['sablonneux','terrain-cultive'],
];

/* =========================================================
   Lecture de carte : des flèches posées sur de vraies cartes
   (x, y en pixels de l'image ; a = direction de la queue de la flèche, en degrés)
   ========================================================= */
const MAPS = {
  m1:{src:'maps/chamrousse.jpg', w:1516, h:2461, cw:200, tapL:46, top:70, name:'CDL Chamrousse', sub:'Violet long · 6 juin 2026'},
  m3:{src:'maps/les-grives.jpg', w:2482, h:2633, cw:260, tapL:58, top:70, name:'Les Grives', sub:'Revole des Chirats · Violet long',
      note:"La ligne verte est la trace GPS d'un coureur, elle ne fait pas partie de la carte."},
  m4:{src:'maps/prelager.jpg', w:2136, h:3004, cw:220, tapL:50, top:70, name:'Prélager', sub:'Revole des Chirats MD 2026 · Violet long',
      note:"La ligne verte est la trace GPS d'un coureur, elle ne fait pas partie de la carte."},
  m5:{src:'maps/cfmd-bourbach.jpg', w:2499, h:1864, cw:200, tapL:46, top:50, name:'CFMD Bourbach-le-Bas', sub:'Buchberg-Saegekopf · H55',
      note:'Sur ce scan, une partie du tracé violet paraît rouge.'},
  m6:{src:'maps/cfc-mulhouse.jpg', w:3458, h:2578, cw:280, tapL:64, top:70, name:'CFC Mulhouse', sub:'Buchberg-Saegekopf · N2'},
};
// Norme 2017 : la zone interdite du tracé est hachurée en croisillons, le dessin de la « zone dangereuse » de l'ancienne légende
const NOTE_OOB = "Sur les cartes récentes (norme 2017), la zone interdite du tracé est hachurée en croisillons violets. Dans ta légende, ce dessin s'appelle « zone dangereuse ».";
const HOTSPOTS = [
  // CDL Chamrousse
  {m:'m1', x:657, y:1700, ans:'depart'},
  {m:'m1', x:830, y:1010, ans:'poste', a:100},
  {m:'m1', x:620, y:1505, ans:'ligne-postes'},
  {m:'m1', x:1031, y:425, ans:'itineraire-interdit', a:-20},
  {m:'m1', x:1265, y:1915, ans:'batiments', ok:['ruines'], note:'Sur cette carte, les grands bâtiments sont dessinés en gris avec un contour noir.'},
  {m:'m1', x:1052, y:300, ans:'habitations', a:0, ok:['zone-interdite','parking']},
  {m:'m1', x:872, y:444, ans:'rocher'},
  {m:'m1', x:406, y:2004, ans:'groupe-rochers', ok:['blocs','rocailleux']},
  {m:'m1', x:913, y:300, ans:'vegbasse-ralentie', ok:['vegbasse-impossible','foret-direction','vigne']},
  {m:'m1', x:674, y:1569, ans:'puits', a:-30},
  {m:'m1', x:95, y:1975, ans:'marais', a:45, ok:['marais-pv','marais-inf','petit-marais']},
  {m:'m1', x:333, y:1985, ans:'ruisseau-inter', ok:['fosse-humide','petit-marais']},
  {m:'m1', x:580, y:804, ans:'ruisseau', a:100, ok:['cours-eau','ruisseau-inter','fosse-humide']},
  {m:'m1', x:1433, y:2043, ans:'element-vege'},
  {m:'m1', x:1011, y:1575, ans:'ligne-nord', a:0},
  // Les Grives
  {m:'m3', x:570, y:230, ans:'depart', a:0},
  {m:'m3', x:716, y:332, ans:'arrivee', a:180},
  {m:'m3', x:661, y:280, ans:'ligne-nord', a:0},
  {m:'m3', x:440, y:310, ans:'element-vege', note:'Sur la légende de cette carte, la croix verte est un « arbre particulier ».'},
  {m:'m3', x:683, y:508, ans:'groupe-rochers', a:45, ok:['blocs','rocailleux']},
  {m:'m3', x:1288, y:1022, ans:'habitations', ok:['zone-interdite','parking']},
  {m:'m3', x:1320, y:945, ans:'batiments', ok:['ruines']},
  {m:'m3', x:1240, y:1056, ans:'ruisseau', a:-70, ok:['cours-eau','ruisseau-inter','fosse-humide']},
  {m:'m3', x:95, y:1630, ans:'decouvert', a:45, ok:['encombre','semi-ouvert','arbres-disperses']},
  {m:'m3', x:2090, y:2140, ans:'marais', ok:['marais-pv','marais-inf','petit-marais']},
  {m:'m3', x:1330, y:1060, ans:'vegbasse-ralentie', ok:['vegbasse-impossible','foret-direction','vigne']},
  // Prélager
  {m:'m4', x:1695, y:973, ans:'arrivee', a:-30},
  {m:'m4', x:1640, y:1118, ans:'depart', a:160},
  {m:'m4', x:1021, y:683, ans:'poste', a:180},
  {m:'m4', x:1680, y:1582, ans:'ligne-postes', a:160},
  {m:'m4', x:1657, y:1500, ans:'ligne-nord', a:180},
  {m:'m4', x:1959, y:1131, ans:'itineraire-interdit', a:115},
  {m:'m4', x:1680, y:1527, ans:'petite-depression', a:-120, ok:['depression']},
  {m:'m4', x:984, y:2300, ans:'courbe', a:180, ok:['courbe-maitresse','courbe-inter']},
  {m:'m4', x:1689, y:867, ans:'element-vege', a:-45},
  {m:'m4', x:1745, y:470, ans:'rocailleux', a:150, ok:['blocs','rocher','groupe-rochers','blocs-dense','pierreux-marche','pierreux-difficile']},
  {m:'m4', x:1030, y:2430, ans:'decouvert', a:-45, ok:['encombre','terrain-cultive']},
  {m:'m4', x:130, y:1550, ans:'vegbasse-ralentie', a:-45, ok:['vegbasse-impossible','foret-direction','vigne']},
  {m:'m4', x:1574, y:1635, ans:'ruisseau', a:-90, ok:['cours-eau','ruisseau-inter','fosse-humide']},
  {m:'m4', x:1598, y:889, ans:'route-principale', a:-135, ok:['autoroute','parking']},
  {m:'m4', x:1317, y:2245, ans:'cloture', a:-90, ok:['cloture-ruine','cloture-inf']},
  {m:'m4', x:1376, y:2250, ans:'batiments', a:180, ok:['ruines','habitations']},
  {m:'m4', x:1146, y:2522, ans:'habitations', a:-60, ok:['zone-interdite','parking','batiments']},
  // CFMD Bourbach-le-Bas
  {m:'m5', x:2112, y:976, ans:'arrivee', a:0},
  {m:'m5', x:1069, y:1013, ans:'depart', a:-150},
  {m:'m5', x:502, y:1476, ans:'poste', a:0},
  {m:'m5', x:1542, y:520, ans:'ligne-postes', a:-90},
  {m:'m5', x:443, y:1540, ans:'ligne-nord', a:0},
  {m:'m5', x:800, y:1330, ans:'zone-interdite-trace', a:135, ok:['zone-dangereuse','zone-interdite'], note:NOTE_OOB},
  {m:'m5', x:556, y:1395, ans:'groupe-rochers', a:-135, ok:['blocs','rocher','blocs-dense']},
  {m:'m5', x:476, y:1328, ans:'rocailleux', a:-150, ok:['blocs','blocs-dense','pierreux-marche','pierreux-difficile']},
  {m:'m5', x:498, y:1430, ans:'element-vege', a:-45},
  {m:'m5', x:432, y:1381, ans:'route', a:-90, ok:['chemin-carrossable','route-secondaire']},
  {m:'m5', x:1551, y:320, ans:'lac', a:100, ok:['mare','marais-inf']},
  {m:'m5', x:1486, y:315, ans:'batiments', a:180, ok:['ruines','habitations']},
  {m:'m5', x:1462, y:300, ans:'habitations', a:-135, ok:['zone-interdite','parking','batiments']},
  {m:'m5', x:1650, y:607, ans:'petite-tour', a:-45, ok:['haute-tour']},
  {m:'m5', x:1671, y:754, ans:'element-homme', a:-45, ok:['borne']},
  {m:'m5', x:1505, y:748, ans:'decouvert', a:100, ok:['encombre','terrain-cultive']},
  // CFC Mulhouse
  {m:'m6', x:1710, y:585, ans:'arrivee', a:0},
  {m:'m6', x:1504, y:646, ans:'depart', a:-90},
  {m:'m6', x:1627, y:1646, ans:'poste', a:90},
  {m:'m6', x:1290, y:1736, ans:'ligne-postes', a:-90},
  {m:'m6', x:1486, y:1700, ans:'ligne-nord', a:0},
  {m:'m6', x:1350, y:520, ans:'zone-interdite-trace', a:-135, ok:['zone-dangereuse','zone-interdite'], note:NOTE_OOB},
  {m:'m6', x:886, y:1224, ans:'lac', a:-100, ok:['mare','marais-inf']},
  {m:'m6', x:912, y:1178, ans:'batiments', a:-60, ok:['ruines','habitations']},
  {m:'m6', x:1012, y:1228, ans:'habitations', a:-30, ok:['zone-interdite','parking','batiments']},
  {m:'m6', x:930, y:1089, ans:'marais', a:0, ok:['marais-pv','marais-inf','petit-marais']},
  {m:'m6', x:1356, y:1968, ans:'petite-tour', a:-45, ok:['haute-tour']},
  {m:'m6', x:1730, y:2098, ans:'mangeoire', a:-45, ok:['haute-tour']},
  {m:'m6', x:1588, y:1938, ans:'element-vege', a:-45},
  {m:'m6', x:1340, y:1690, ans:'decouvert', a:180, ok:['encombre','terrain-cultive']},
  {m:'m6', x:1735, y:850, ans:'terrain-cultive', a:135, ok:['decouvert','verger','sablonneux']},
];

/* Touche la carte : zones où plusieurs détails vérifiés sont proches les uns des autres.
   Chaque détail reçoit une flèche lettrée ; on demande laquelle montre le symbole. */
const TAP_ZONES = [
  {m:'m1', pts:[{ans:'rocher',x:872,y:444,a:135},{ans:'vegbasse-ralentie',x:913,y:300,a:135},{ans:'habitations',x:1052,y:300,a:0},{ans:'itineraire-interdit',x:1031,y:425,a:-20}]},
  {m:'m1', pts:[{ans:'ligne-postes',x:620,y:1505,a:135},{ans:'puits',x:674,y:1569,a:-30},{ans:'depart',x:657,y:1700,a:135}]},
  {m:'m1', pts:[{ans:'marais',x:95,y:1975,a:45},{ans:'ruisseau-inter',x:333,y:1985,a:135},{ans:'groupe-rochers',x:406,y:2004,a:135}]},
  {m:'m3', bb:[[548,168],[800,378]], pts:[{ans:'element-vege',x:440,y:310,a:135},{ans:'depart',x:570,y:230,a:0},{ans:'ligne-nord',x:661,y:280,a:0},{ans:'arrivee',x:716,y:332,a:180}]},
  {m:'m3', pts:[{ans:'batiments',x:1320,y:945,a:-45},{ans:'habitations',x:1288,y:1022,a:-135},{ans:'ruisseau',x:1240,y:1056,a:160},{ans:'vegbasse-ralentie',x:1330,y:1060,a:45}]},
  {m:'m4', pts:[{ans:'batiments',x:1376,y:2250,a:120},{ans:'route-principale',x:1412,y:2246,a:-30},{ans:'cloture',x:1317,y:2245,a:120},{ans:'decouvert',x:1300,y:2185,a:-150}]},
  {m:'m4', pts:[{ans:'arrivee',x:1695,y:973,a:-30},{ans:'depart',x:1640,y:1118,a:160},{ans:'itineraire-interdit',x:1761,y:1048,a:60}]},
  {m:'m4', pts:[{ans:'ligne-nord',x:1657,y:1470,a:180},{ans:'petite-depression',x:1680,y:1527,a:-60},{ans:'ligne-postes',x:1680,y:1582,a:160},{ans:'ruisseau',x:1574,y:1635,a:180}]},
  {m:'m5', pts:[{ans:'lac',x:1551,y:320,a:90},{ans:'batiments',x:1486,y:315,a:120},{ans:'habitations',x:1462,y:300,a:-135}]},
  {m:'m5', pts:[{ans:'groupe-rochers',x:556,y:1395,a:-45},{ans:'rocailleux',x:476,y:1328,a:-120},{ans:'element-vege',x:498,y:1430,a:120},{ans:'route',x:432,y:1381,a:160}]},
  {m:'m6', pts:[{ans:'lac',x:886,y:1224,a:-150},{ans:'batiments',x:912,y:1178,a:-60},{ans:'marais',x:930,y:1089,a:0},{ans:'habitations',x:1012,y:1228,a:-30}]},
  {m:'m6', pts:[{ans:'petite-tour',x:1511,y:2000,a:-135},{ans:'element-vege',x:1588,y:1938,a:-45},{ans:'mangeoire',x:1730,y:2098,a:-45}]},
  {m:'m6', pts:[{ans:'depart',x:1504,y:646,a:-90},{ans:'arrivee',x:1710,y:585,a:0},{ans:'zone-interdite-trace',x:1420,y:560,a:-135,note:NOTE_OOB}]},
];
// Paires jamais proposées ensemble quand un seul symbole est montré (trop proches sans point de comparaison)
const EXCLUDE = [['borne','element-homme'],['accidente','tres-accidente'],['blocs','blocs-dense'],['rocailleux','pierreux-marche'],
  ['rocailleux','pierreux-difficile'],['pierreux-marche','pierreux-difficile'],['sablonneux','terrain-cultive']];
const isExcluded = (a,b) => EXCLUDE.some(([x,y]) => (x===a&&y===b)||(x===b&&y===a));

const CATS = [
  {k:'terrain',label:'Formes de terrain',short:'Terrain',rep:'courbe',tip:'Tout le relief est en marron : courbes de niveau, talus, buttes et trous.'},
  {k:'rochers',label:'Rochers et blocs rocheux',short:'Rochers',rep:'groupe-rochers',tip:'Rochers et falaises sont dessinés en noir.'},
  {k:'eau',label:'Eau et marais',short:'Eau',rep:'cours-eau',tip:"Tout ce qui touche à l'eau est en bleu."},
  {k:'vege',label:'Végétation',short:'Végétation',rep:'foret-difficile',tip:"Jaune = terrain découvert, blanc = forêt où l'on court bien, vert = ça freine. Plus le vert est foncé, plus ça freine."},
  {k:'homme',label:"Éléments de topographie dus à l'homme",short:'Homme',rep:'chemin',tip:"Routes, chemins, murs, clôtures et bâtiments sont surtout en noir."},
  {k:'parcours',label:'Autres symboles (le tracé)',short:'Parcours',rep:'poste',tip:'Le tracé de la course est imprimé en violet par-dessus la carte.'},
];
const CAT = Object.fromEntries(CATS.map(c=>[c.k,c]));
const INKS = {
  brun:{label:'Marron',hex:C.br,rule:'Le marron dessine le relief et les formes du terrain.'},
  noir:{label:'Noir',hex:C.bk,rule:"Le noir sert aux rochers et à ce que l'homme a construit."},
  bleu:{label:'Bleu',hex:C.bl,rule:"Le bleu, c'est l'eau."},
  jaune:{label:'Jaune',hex:C.ye,rule:'Le jaune signale un terrain découvert, sans arbres.'},
  vert:{label:'Vert',hex:C.g100,rule:'Le vert indique une végétation qui ralentit la course.'},
  blanc:{label:'Blanc',hex:'#FFFFFF',rule:"Le blanc, c'est la forêt où l'on court facilement."},
  violet:{label:'Violet',hex:C.vi,rule:'Le violet est réservé au tracé du parcours.'},
};

// Ordre d'apparition des nouveaux symboles : on alterne les familles
const ORDER = (() => {
  const seq = ['parcours','vege','terrain','homme','eau','rochers'];
  const pools = Object.fromEntries(seq.map(k=>[k,SYMBOLS.filter(s=>s.cat===k).map(s=>s.id)]));
  const out = []; let added = true;
  while(added){ added=false; for(const k of seq){ const id = pools[k].shift(); if(id){ out.push(id); added=true; } } }
  return out;
})();

/* =========================================================
   Utilitaires
   ========================================================= */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const dayIndex = (d=new Date()) => Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);
const dayDate = i => new Date(i*864e5);
const fmtDate = i => new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).format(dayDate(i));
const WD = ['D','L','M','M','J','V','S'];
function fmtClock(ms){ const s=Math.max(0,Math.floor(ms/1000)); return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
function fmtSec1(ms){ return (ms/1000).toFixed(1).replace('.',',')+' s'; }
const plural = (n,one,many) => n>1 ? many : one;
function tile(id, cls='', label){ const s=BY_ID[id]; return `<svg class="tile ${cls}" viewBox="0 0 120 60" role="img" aria-label="${esc(label ?? s.name)}">${s.svg}</svg>`; }
function buzz(p){ try{ if(navigator.vibrate) navigator.vibrate(p); }catch(e){} }

const ICONS = {
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  chev:'<svg class="chev" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2l5 5-5 5"/></svg>',
  soundOn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  soundOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  sprint:'<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="14" cy="16" r="9"/><path d="M14 16V10.5M11.5 3.5h5M14 3.5v3"/></svg>',
  train:'<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M5 22 11 9l6 13Z"/><circle cx="21" cy="9" r="4.5"/></svg>',
  map:'<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M3 6.5 10 4l8 2.5L25 4v17.5L18 24l-8-2.5L3 24Z"/><path d="M10 4v17.5M18 6.5V24"/><path d="M13.5 16.5 20 10M20 10h-4M20 10v4"/></svg>',
  help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4"/><circle cx="12" cy="17.6" r=".6" fill="currentColor"/></svg>',
  tap:'<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="10" r="6.5"/><circle cx="11" cy="10" r="2" fill="currentColor"/><path d="M15.5 14.5 24 23M24 23h-5M24 23v-5"/></svg>',
  recall:'<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="13" height="17" rx="2"/><path d="M11 3.5h11a2 2 0 0 1 2 2V20"/><path d="M8.5 12.5a2 2 0 1 1 2.6 1.9c-.6.2-.6.8-.6 1.4M10.5 18.8v.2"/></svg>',
  duel:'<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="8" width="9" height="12" rx="2"/><rect x="16.5" y="8" width="9" height="12" rx="2"/><path d="M13 12l2 2-2 2"/></svg>',
  carnet:'<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="5" width="8" height="5" rx="1"/><rect x="4" y="12" width="8" height="5" rx="1"/><rect x="4" y="19" width="8" height="5" rx="1"/><path d="M15 7.5h9M15 14.5h9M15 21.5h7"/></svg>',
};

/* =========================================================
   Niveaux et badges
   ========================================================= */
const LEVELS = [
  {min:0,   name:'Premiers pas'},
  {min:.10, name:'Lecteur débutant'},
  {min:.30, name:'Orienteur'},
  {min:.50, name:'Orienteur confirmé'},
  {min:.70, name:'Expert de la légende'},
  {min:.90, name:'Maître de la légende'},
];
const BADGES = [
  ...CATS.map(c => ({k:'fam-'+c.k, name:`${c.short} maîtrisé`, desc:`Tous les symboles de la famille « ${c.label} » maîtrisés.`, rep:c.rep})),
  {k:'serie-7',    name:'7 jours',        desc:"Le circuit du jour couru 7 jours d'affilée.", icon:'flame'},
  {k:'serie-30',   name:'30 jours',       desc:"Le circuit du jour couru 30 jours d'affilée.", icon:'flame'},
  {k:'semaine',    name:'Semaine pleine', desc:'5 circuits du jour dans la même semaine.', icon:'week'},
  {k:'sans-faute', name:'Sans faute',     desc:'Un circuit du jour bouclé sans aucun poste manquant.', icon:'check'},
  {k:'carte-10',   name:'Œil de lynx',    desc:'10 flèches sur 10 en lecture de carte.', icon:'eye'},
];
const BADGE_KEYS = new Set(BADGES.map(b=>b.k));
const WEEK_GOAL = 5;

/* =========================================================
   Progression : répétition espacée (boîtes de Leitner)
   ========================================================= */
const INT = [0,1,2,4,8,16];           // jours avant la prochaine révision selon la boîte
const LS_KEY = 'poste31.progress.v1';
const LS_PREF = 'poste31.prefs';
const num = v => (typeof v==='number' && isFinite(v)) ? v : 0;
function blankState(){ return {v:1, cards:{}, days:{}, bestSprint:0, bestAvg:0, updatedAt:0, resetAt:0, conf:{}, badges:{}, opt:{ext:false, extT:0}, lvlMax:0}; }
function normalize(o){
  const s = blankState();
  if(!o || typeof o!=='object') return s;
  if(o.cards && typeof o.cards==='object') for(const [k,c] of Object.entries(o.cards)){
    if(BY_ID[k] && c && typeof c==='object') s.cards[k] = {b:Math.max(0,Math.min(5,Math.round(num(c.b)))), d:num(c.d), t:num(c.t), s:num(c.s), c:num(c.c), w:num(c.w)};
  }
  if(o.days && typeof o.days==='object') for(const [k,d] of Object.entries(o.days)){
    if(/^\d+$/.test(k) && d && typeof d==='object') s.days[k] = {c:num(d.c), first:num(d.first), pm:num(d.pm), n:num(d.n)};
  }
  if(o.conf && typeof o.conf==='object') for(const [k,v] of Object.entries(o.conf)){
    const [a,b] = k.split('|');
    if(BY_ID[a] && BY_ID[b] && a!==b && v && typeof v==='object' && num(v.n)>0) s.conf[k] = {n:num(v.n), t:num(v.t)};
  }
  if(o.badges && typeof o.badges==='object') for(const [k,v] of Object.entries(o.badges)){
    if(BADGE_KEYS.has(k) && num(v)>0) s.badges[k] = num(v);
  }
  if(o.opt && typeof o.opt==='object') s.opt = {ext: !!o.opt.ext, extT: num(o.opt.extT)};
  s.bestSprint = num(o.bestSprint); s.bestAvg = num(o.bestAvg); s.updatedAt = num(o.updatedAt); s.resetAt = num(o.resetAt); s.lvlMax = num(o.lvlMax);
  return s;
}
function merge(a,b){
  const R = Math.max(a.resetAt, b.resetAt);
  if(a.updatedAt < R && a.resetAt < R) a = Object.assign(blankState(), {resetAt:a.resetAt});
  if(b.updatedAt < R && b.resetAt < R) b = Object.assign(blankState(), {resetAt:b.resetAt});
  const m = blankState();
  for(const id of new Set([...Object.keys(a.cards), ...Object.keys(b.cards)])){
    const x=a.cards[id], y=b.cards[id];
    m.cards[id] = Object.assign({}, !x ? y : !y ? x : (y.t > x.t ? y : x));
  }
  for(const k of new Set([...Object.keys(a.days), ...Object.keys(b.days)])){
    const x=a.days[k]||{c:0,first:0,pm:0,n:0}, y=b.days[k]||{c:0,first:0,pm:0,n:0};
    const src = (x.first && (!y.first || x.c>=y.c)) ? x : y;
    m.days[k] = {c:Math.max(x.c,y.c), first:src.first||x.first||y.first, pm:src.first?src.pm:Math.max(x.pm,y.pm), n:Math.max(x.n,y.n)};
  }
  for(const k of new Set([...Object.keys(a.conf), ...Object.keys(b.conf)])){
    const x=a.conf[k]||{n:0,t:0}, y=b.conf[k]||{n:0,t:0};
    m.conf[k] = {n:Math.max(x.n,y.n), t:Math.max(x.t,y.t)};
  }
  for(const k of new Set([...Object.keys(a.badges), ...Object.keys(b.badges)])){
    const v = [a.badges[k], b.badges[k]].filter(x=>x>0);
    m.badges[k] = Math.min(...v);
  }
  m.opt = Object.assign({}, (b.opt.extT > a.opt.extT) ? b.opt : a.opt);
  m.lvlMax = Math.max(a.lvlMax, b.lvlMax);
  m.bestSprint = Math.max(a.bestSprint, b.bestSprint);
  m.bestAvg = [a.bestAvg,b.bestAvg].filter(v=>v>0).reduce((p,v)=>p?Math.min(p,v):v,0);
  m.updatedAt = Math.max(a.updatedAt, b.updatedAt);
  m.resetAt = R;
  return m;
}

let prefs = {sound:true};
try{ prefs = Object.assign(prefs, JSON.parse(localStorage.getItem(LS_PREF) || '{}')); }catch(e){}
function savePrefs(){ try{ localStorage.setItem(LS_PREF, JSON.stringify(prefs)); }catch(e){} }

/* =========================================================
   Compte : session gardée dans un cookie, progression dans Supabase
   ========================================================= */
const CFG = window.POSTE31_CONFIG || {};
const API_URL = String(CFG.supabaseUrl || '').trim().replace(/\/+$/, '');
const API_KEY = String(CFG.supabaseKey || '').trim();
const CONFIGURED = /^https?:\/\/\S+$/.test(API_URL) && API_KEY.length > 20;
const COOKIE = 'p31_session';
const COOKIE_PATH = location.pathname.replace(/[^/]*$/, '') || '/';
let me = null;                 // pseudo du joueur connecté
let st = blankState();         // sa progression
const localKey = u => LS_KEY + '.' + u;
function getToken(){ const m = document.cookie.match(/(?:^|;\s*)p31_session=([a-f0-9]{64})(?:;|$)/); return m ? m[1] : null; }
function setToken(t){ document.cookie = `${COOKIE}=${t}; Max-Age=${400*86400}; Path=${COOKIE_PATH}; SameSite=Lax${location.protocol==='https:' ? '; Secure' : ''}`; }
function clearToken(){ document.cookie = `${COOKIE}=; Max-Age=0; Path=${COOKIE_PATH}; SameSite=Lax`; }
function saveLocal(){ if(!me) return; try{ localStorage.setItem(localKey(me), JSON.stringify(st)); }catch(e){} }
function loadLocal(u){ try{ return normalize(JSON.parse(localStorage.getItem(localKey(u)) || 'null')); }catch(e){ return blankState(); } }

async function rpc(fn, args){
  const headers = {'Content-Type':'application/json', 'apikey':API_KEY};
  if(API_KEY.startsWith('eyJ')) headers.Authorization = 'Bearer ' + API_KEY;   // ancienne clé « anon »
  let res;
  try{ res = await fetch(`${API_URL}/rest/v1/rpc/${fn}`, {method:'POST', headers, body:JSON.stringify(args)}); }
  catch(e){ return {ok:false, error:'network'}; }
  if(!res.ok) return {ok:false, error: res.status>=500 ? 'server' : 'http', status:res.status};
  try{ return await res.json(); }catch(e){ return {ok:false, error:'server'}; }
}

let syncState = 'wait', saveTimer = null, saving = false, again = false;
function touch(){ st.updatedAt = Date.now(); saveLocal(); scheduleCloud(); }
function scheduleCloud(delay=1500){ if(!me) return; clearTimeout(saveTimer); saveTimer = setTimeout(flushCloud, delay); }
async function flushCloud(){
  clearTimeout(saveTimer);
  const token = getToken();
  if(!me || !token) return;
  if(saving){ again = true; return; }
  saving = true;
  const r = await rpc('p31_save', {p_token: token, p_data: st});
  saving = false;
  if(r.ok) setSync('cloud');
  else if(r.error==='no_session'){ sessionLost(); return; }
  else setSync('offline');
  if(again){ again = false; flushCloud(); }
}
function setSync(s){ syncState = s; const el = $('#sync'); if(el) el.innerHTML = syncHTML(); }
function syncHTML(){
  if(syncState==='cloud') return '<span class="dot on"></span>Progression sauvegardée sur ton compte : tu la retrouves sur n\'importe quel appareil.';
  if(syncState==='offline') return '<span class="dot warn"></span>Pas de connexion au serveur : ta progression est gardée sur cet appareil et sera envoyée dès que possible.';
  return '<span class="dot"></span>Connexion au serveur…';
}
async function pullCloud(){
  const token = getToken();
  if(!me || !token) return;
  const u = me;
  const r = await rpc('p31_load', {p_token: token});
  if(me !== u) return;   // quelqu'un s'est déconnecté entre-temps
  if(!r.ok){ if(r.error==='no_session') sessionLost(); else setSync('offline'); return; }
  const remote = r.data ? normalize(r.data) : null;
  setSync('cloud');
  if(remote){
    const m = merge(st, remote), js = JSON.stringify(m);
    const localChanged = js !== JSON.stringify(st), remoteChanged = js !== JSON.stringify(remote);
    st = m; saveLocal();
    if(localChanged && !session) refreshCurrent();
    if(remoteChanged) flushCloud();
  } else if(Object.keys(st.cards).length || st.resetAt){
    flushCloud();
  }
}
function refreshCurrent(){
  if(!$('#screen-home').hidden) renderHome();
  else if(!$('#screen-carnet').hidden) renderCarnet();
}

/* ---- notation ---- */
const card = id => st.cards[id];
const isActive = s => !s.ext || st.opt.ext;
const ACTIVE = () => SYMBOLS.filter(isActive);
const EXT_COUNT = SYMBOLS.filter(s=>s.ext).length;
const masteredCount = () => ACTIVE().filter(s=>card(s.id) && card(s.id).b>=4).length;
const seenCount = () => ACTIVE().filter(s=>card(s.id)).length;
function recordConf(a, b){
  if(!BY_ID[a] || !BY_ID[b] || a===b) return;
  const k = [a,b].sort().join('|'), prev = st.conf[k] || {n:0, t:0};
  st.conf[k] = {n: prev.n+1, t: Date.now()};
  const keys = Object.keys(st.conf);
  if(keys.length > 200){ keys.sort((x,y)=> st.conf[x].t - st.conf[y].t).slice(0, keys.length-200).forEach(x=>delete st.conf[x]); }
}
function myConfusions(){
  return Object.entries(st.conf)
    .map(([k,v]) => ({pair:k.split('|'), n:v.n, t:v.t}))
    .filter(c => isActive(BY_ID[c.pair[0]]) && isActive(BY_ID[c.pair[1]]))
    .sort((x,y)=> y.n-x.n || y.t-x.t);
}
function levelInfo(){
  const tot = ACTIVE().length, m = masteredCount(), r = tot ? m/tot : 0;
  let i = 0; for(let j=0;j<LEVELS.length;j++) if(r >= LEVELS[j].min) i = j;
  const next = LEVELS[i+1];
  const need = next ? Math.max(0, Math.ceil(next.min*tot) - m) : 0;
  const lo = LEVELS[i].min*tot, hi = next ? next.min*tot : tot;
  const pct = next ? Math.min(100, Math.max(0, (m-lo)/Math.max(1,hi-lo)*100)) : 100;
  return {i, name:LEVELS[i].name, next, need, pct, m, tot};
}
function weekInfo(){
  const t = dayIndex(), start = t - ((dayDate(t).getUTCDay()+6)%7);
  let n = 0; for(let d=start; d<=t; d++) if(st.days[d] && st.days[d].c>0) n++;
  return {n, start};
}
function familyMastered(k){ const ids = ACTIVE().filter(s=>s.cat===k); return ids.length>0 && ids.every(s=>card(s.id) && card(s.id).b>=4); }
function unlockBadge(k, list){ if(!st.badges[k]){ st.badges[k] = Date.now(); if(list) list.push(k); } }
function checkBadges(extra){
  const got = [];
  for(const c of CATS) if(familyMastered(c.k)) unlockBadge('fam-'+c.k, got);
  const s = getStreak();
  if(s>=7) unlockBadge('serie-7', got);
  if(s>=30) unlockBadge('serie-30', got);
  if(weekInfo().n >= WEEK_GOAL) unlockBadge('semaine', got);
  for(const k of (extra||[])) unlockBadge(k, got);
  const L = levelInfo().i, up = L > st.lvlMax;
  if(up) st.lvlMax = L;
  return {badges:got, levelUp: up ? LEVELS[L].name : null};
}
function grade(it, ok){
  if(it.type==='color') return;
  const t = dayIndex();
  let c = card(it.id);
  if(!c) c = st.cards[it.id] = {b:0,d:t,t:0,s:0,c:0,w:0};
  c.s++; c.t = Date.now(); ok ? c.c++ : c.w++;
  if(it.retry) return;                            // déjà remis en boîte 1 au premier raté
  if(it.practice){ if(!ok){ c.b=1; c.d=t; } return; }
  if(session.graded.has(it.id)) return;
  session.graded.add(it.id);
  if(ok){ c.b = Math.min(5, c.b+1); c.d = t + INT[c.b]; }
  else { c.b = 1; c.d = t; }
}
function gradeLight(id, ok){
  const t = dayIndex();
  let c = card(id);
  if(!c){ c = st.cards[id] = {b:1, d: ok ? t+1 : t, t:0, s:0, c:0, w:0}; }
  c.s++; c.t = Date.now(); ok ? c.c++ : c.w++;
  if(!ok){ c.b = Math.min(c.b,1); c.d = t; }
}
function getStreak(){
  let t = dayIndex(); let n = 0;
  const done = i => st.days[i] && st.days[i].c>0;
  if(!done(t)) t--;
  while(done(t)){ n++; t--; }
  return n;
}
function pruneDays(){ const lim = dayIndex()-400; for(const k of Object.keys(st.days)) if(+k < lim) delete st.days[k]; }

/* =========================================================
   Construction des circuits
   ========================================================= */
function pickType(id){
  const b = card(id) ? card(id).b : 0;
  if(b<=1) return 's2n';
  if(b<=3) return Math.random()<.5 ? 's2n' : 'n2s';
  return Math.random()<.65 ? 'n2s' : 's2n';
}
function planCircuit(){
  const t = dayIndex();
  const seenIds = ACTIVE().filter(s=>card(s.id)).map(s=>s.id);
  const unseen = ORDER.filter(id=>!card(id) && isActive(BY_ID[id]));
  const due = seenIds.filter(id=>card(id).d<=t).sort((a,b)=> card(a).d-card(b).d || card(a).b-card(b).b);
  const SLOTS = 11;
  let nNew = Math.min(unseen.length, due.length>=10 ? 1 : due.length>=6 ? 3 : 5);
  let reviews = due.slice(0, Math.max(0, SLOTS - nNew*2));
  let left = SLOTS - nNew*2 - reviews.length;
  if(left>0){
    const pool = shuffle(seenIds.filter(id=>!reviews.includes(id))).sort((a,b)=> card(a).b-card(b).b);
    const extra = pool.slice(0,left);
    reviews = reviews.concat(extra); left -= extra.length;
  }
  while(left>=2 && nNew < Math.min(unseen.length, 6)){ nNew++; left -= 2; }
  const newIds = unseen.slice(0, nNew);
  const colorIds = pickColorIds(reviews.concat(newIds), 3, t);
  return {newIds, reviews, colorIds, total: newIds.length*2 + reviews.length + colorIds.length};
}
function canColor(id){ const s = BY_ID[id]; return !!(s && s.ink && !s.noCQ); }
function pickColorIds(ids, n, seed){
  const pool = ids.filter(canColor);
  if(!pool.length) return [];
  const r = mulberry(seed*31+7), out = [];
  const sh = pool.slice().sort(()=> r()-.5);
  // on varie les couleurs demandées quand c'est possible
  const seenInk = new Set();
  for(const id of sh){ if(out.length>=n) break; if(!seenInk.has(BY_ID[id].ink)){ out.push(id); seenInk.add(BY_ID[id].ink); } }
  for(const id of sh){ if(out.length>=n) break; if(!out.includes(id)) out.push(id); }
  return out;
}
function insertColors(q, ids){
  const spots = [.3,.6,.85];
  ids.forEach((id,k)=>{ q.splice(Math.max(1, Math.round(q.length*spots[k % spots.length])), 0, {id, type:'color', practice:true}); });
  return q;
}
function interleave(a,b){ const out=[]; for(let i=0;i<Math.max(a.length,b.length);i++){ if(i<a.length) out.push(a[i]); if(i<b.length) out.push(b[i]); } return out; }
function buildQueue(plan){
  const rev = shuffle(plan.reviews).map(id=>({id, type:pickType(id)}));
  const A = plan.newIds.map(id=>({id, type:'s2n'}));
  const Cq = shuffle(plan.newIds).map(id=>({id, type:'n2s', practice:true}));
  const half = Math.ceil(rev.length/2);
  const first = interleave(A, rev.slice(0,half));
  if(Cq.length>1 && first.length && Cq[0].id===first[first.length-1].id){ [Cq[0],Cq[1]] = [Cq[1],Cq[0]]; }
  const q = first.concat(interleave(rev.slice(half), Cq));
  return insertColors(q, plan.colorIds);
}
function distractors(id, n, hard){
  const s = BY_ID[id], pool = ACTIVE();
  const ok = x => x.id!==id && !isExcluded(id,x.id);
  const grp = shuffle(pool.filter(x=>ok(x) && x.g===s.g));
  const cat = shuffle(pool.filter(x=>ok(x) && x.cat===s.cat && x.g!==s.g));
  const any = shuffle(pool.filter(x=>ok(x) && x.cat!==s.cat));
  const out = [];
  const take = arr => { while(arr.length){ const x = arr.shift(); if(!out.includes(x.id)){ out.push(x.id); return true; } } return false; };
  if(hard){ while(out.length<n && (take(grp) || take(cat) || take(any))); }
  else { take(grp); if(out.length<n) take(cat); if(out.length<n) take(any); while(out.length<n && (take(cat) || take(grp) || take(any))); }
  return out.slice(0,n);
}
/* ---- lecture de carte ---- */
function clampVB(x, y, w, h, M){
  const top = M.top || 0;   // on évite la barre grise de l'export en haut des scans
  return [Math.max(0, Math.min(M.w - w, x)), Math.max(top, Math.min(M.h - h, y)), w, h].map(v => +v.toFixed(1));
}
function mapSVG(h){
  const M = MAPS[h.m], cw = M.cw, ch = Math.round(cw*0.72);
  const a = (h.a ?? 135) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;
  const L = cw*0.3, g = cw*0.022, hd = cw*0.075, sw = cw*0.017, halo = cw*0.016;
  const f = v => v.toFixed(1);
  const p0 = [h.x+ux*g, h.y+uy*g], base = [p0[0]+ux*hd, p0[1]+uy*hd], tail = [p0[0]+ux*L, p0[1]+uy*L];
  const head = `${f(p0[0])},${f(p0[1])} ${f(base[0]+px*hd*.55)},${f(base[1]+py*hd*.55)} ${f(base[0]-px*hd*.55)},${f(base[1]-py*hd*.55)}`;
  const vq = clampVB(h.x+ux*L*.35-cw/2, h.y+uy*L*.35-ch/2, cw, ch, M);
  const W2 = cw*2.8, H2 = ch*2.8, vc = clampVB(h.x-W2/2, h.y-H2/2, W2, H2, M);
  const R = cw*0.16;
  const html = `<svg class="mapview" id="qmap" viewBox="${vq.join(' ')}" role="img" aria-label="Extrait de la carte ${esc(M.name)} avec une flèche">
    <image href="${M.src}" x="0" y="0" width="${M.w}" height="${M.h}"/>
    <g class="ring" opacity="0"><circle cx="${h.x}" cy="${h.y}" r="${f(R)}" fill="none" stroke="#FFFFFF" stroke-width="${f(sw*3.4)}"/><circle cx="${h.x}" cy="${h.y}" r="${f(R)}" fill="none" stroke="#E4002B" stroke-width="${f(sw*1.9)}"/></g>
    <g class="arrow">
      <line x1="${f(base[0])}" y1="${f(base[1])}" x2="${f(tail[0])}" y2="${f(tail[1])}" stroke="#FFFFFF" stroke-width="${f(sw+halo*2)}" stroke-linecap="round"/>
      <polygon points="${head}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="${f(halo*2)}" stroke-linejoin="round"/>
      <line x1="${f(base[0])}" y1="${f(base[1])}" x2="${f(tail[0])}" y2="${f(tail[1])}" stroke="#E4002B" stroke-width="${f(sw)}" stroke-linecap="round"/>
      <polygon points="${head}" fill="#E4002B"/>
    </g>
  </svg>`;
  return {html, vq, vc};
}
function tweenVB(svg, a, b, ms){
  let reduce = false; try{ reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  if(reduce){ svg.setAttribute('viewBox', b.join(' ')); return; }
  const t0 = performance.now();
  const step = now => {
    const t = Math.min(1, (now-t0)/ms), e = 1-Math.pow(1-t,3);
    svg.setAttribute('viewBox', a.map((v,i)=>(v+(b[i]-v)*e).toFixed(1)).join(' '));
    if(t<1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function mapDistractors(h){
  const s = BY_ID[h.ans], bad = new Set([h.ans, ...(h.ok||[])]);
  const okx = x => !bad.has(x.id) && !isExcluded(h.ans, x.id);
  const same = shuffle(ACTIVE().filter(x=>okx(x) && x.cat===s.cat));
  const other = shuffle(ACTIVE().filter(x=>okx(x) && x.cat!==s.cat));
  const out = same.slice(0,2).map(x=>x.id);
  while(out.length<3 && other.length) out.push(other.shift().id);
  return out;
}
/* chargement des cartes : on suit l'état de chaque image */
const mapState = {};
function loadMap(m){
  if(mapState[m]==='ok' || mapState[m]==='loading') return;
  mapState[m] = 'loading';
  const img = new Image();
  img.onload = () => { mapState[m] = 'ok'; onMapState(m); };
  img.onerror = () => { mapState[m] = 'err'; onMapState(m); };
  img.src = MAPS[m].src;
}
/* une carte absente du site (fichier pas encore envoyé sur GitHub) est simplement ignorée */
const mapAvail = {};   // m -> true (présente) | false (absente) ; inconnue tant qu'on n'a pas pu vérifier
let mapProbe = null;
function probeMaps(){
  if(mapProbe) return mapProbe;
  if(!/^https?:$/.test(location.protocol)){ mapProbe = Promise.resolve(); return mapProbe; }
  mapProbe = Promise.all(Object.keys(MAPS).map(async m => {
    let t = null;
    try{
      const ctl = typeof AbortController!=='undefined' ? new AbortController() : null;
      if(ctl) t = setTimeout(()=>ctl.abort(), 6000);
      const r = await fetch(MAPS[m].src, {method:'HEAD', cache:'no-cache', signal: ctl ? ctl.signal : undefined});
      if(r.status===404 || r.status===410) mapAvail[m] = false; else if(r.ok) mapAvail[m] = true;
    }catch(e){ /* hors connexion : on ne sait pas, on garde la carte */ }
    finally{ if(t) clearTimeout(t); }
  }));
  return mapProbe;
}
const mapUsable = m => mapAvail[m] !== false;
const waitProbe = () => Promise.race([probeMaps(), new Promise(r => setTimeout(r, 2000))]);
// quelques cartes seulement par partie : moins de données à charger sur téléphone, et de la variété d'une partie à l'autre
function limitMaps(items, getM, need, k=3){
  const keep = new Set();
  for(const m of shuffle([...new Set(items.map(getM))])){
    if(keep.size >= k && items.filter(x=>keep.has(getM(x))).length >= need) break;
    keep.add(m);
  }
  return items.filter(x=>keep.has(getM(x)));
}
function loadMapsFor(queue){
  const seen = [];
  for(const it of queue){ const m = it.type==='map' ? HOTSPOTS[it.hs].m : TAP_ZONES[it.z].m; if(!seen.includes(m)) seen.push(m); }
  seen.forEach(loadMap);   // la carte de la première question part en premier
}
function mapOverlay(m){
  const s = mapState[m];
  if(s==='ok') return '';
  if(s==='err') return `<div class="map-loading err" role="status"><p><b>La carte n'a pas pu se charger.</b><br>Vérifie ta connexion, puis réessaie.</p><div class="ml-actions"><button class="btn-ghost sm" data-act="map-retry" data-m="${m}">Réessayer</button><button class="linkish" data-act="skip-q">Passer cette question</button></div></div>`;
  return `<div class="map-loading" role="status"><span class="ml-dot" aria-hidden="true"></span><p>Chargement de la carte…</p></div>`;
}
function mapWrap(m, svg){ return `<div class="mapwrap" data-map="${m}">${svg}${mapOverlay(m)}</div>`; }
function currentMap(){
  if(!session || session.over) return null;
  const it = session.queue[session.pos]; if(!it) return null;
  if(it.type==='map') return HOTSPOTS[it.hs].m;
  if(it.type==='tap') return TAP_ZONES[it.z].m;
  return null;
}
function onMapState(m){
  if(currentMap()!==m || $('#screen-quiz').hidden) return;
  if(mapState[m]==='ok' && session.mapWait){ renderQuestion(); return; }
  const w = document.querySelector(`.mapwrap[data-map="${m}"]`);
  if(w){ const old = w.querySelector('.map-loading'); if(old) old.remove(); w.insertAdjacentHTML('beforeend', mapOverlay(m)); }
}

/* Touche la carte : flèches lettrées posées sur une zone */
function tapSVG(z, letters){
  const M = MAPS[z.m], L = M.tapL, R = L*0.3, f = v => v.toFixed(1);
  const hd = L*0.2, sw = L*0.05, halo = L*0.045, g = L*0.06;
  let x0=Infinity, y0=Infinity, x1=-Infinity, y1=-Infinity;
  const geo = z.pts.map((p,i)=>{
    const a = p.a*Math.PI/180, ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;
    const p0 = [p.x+ux*g, p.y+uy*g], base = [p0[0]+ux*hd, p0[1]+uy*hd], tail = [p.x+ux*L, p.y+uy*L];
    x0 = Math.min(x0, p.x, tail[0]-R); x1 = Math.max(x1, p.x, tail[0]+R);
    y0 = Math.min(y0, p.y, tail[1]-R); y1 = Math.max(y1, p.y, tail[1]+R);
    const head = `${f(p0[0])},${f(p0[1])} ${f(base[0]+px*hd*.55)},${f(base[1]+py*hd*.55)} ${f(base[0]-px*hd*.55)},${f(base[1]-py*hd*.55)}`;
    return {p, base, tail, head, letter:letters[i]};
  });
  for(const [bx,by] of (z.bb||[])){ x0 = Math.min(x0,bx); x1 = Math.max(x1,bx); y0 = Math.min(y0,by); y1 = Math.max(y1,by); }
  const pad = L*0.55;
  let w = x1-x0+pad*2, h = y1-y0+pad*2;
  if(w < h*1.25) w = h*1.25;
  if(h < w/1.8) h = w/1.8;
  const cx = (x0+x1)/2, cy = (y0+y1)/2;
  const vb = clampVB(cx-w/2, cy-h/2, w, h, M);
  const pins = geo.map(o=>`<g class="pin" data-act="ans" data-v="${o.p.ans}" role="button" aria-label="Flèche ${o.letter}">
      <line x1="${f(o.base[0])}" y1="${f(o.base[1])}" x2="${f(o.tail[0])}" y2="${f(o.tail[1])}" stroke="#FFFFFF" stroke-width="${f(sw+halo*2)}" stroke-linecap="round"/>
      <polygon points="${o.head}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="${f(halo*2)}" stroke-linejoin="round"/>
      <line x1="${f(o.base[0])}" y1="${f(o.base[1])}" x2="${f(o.tail[0])}" y2="${f(o.tail[1])}" stroke="#E4002B" stroke-width="${f(sw)}" stroke-linecap="round"/>
      <polygon points="${o.head}" fill="#E4002B"/>
      <circle class="bub" cx="${f(o.tail[0])}" cy="${f(o.tail[1])}" r="${f(R)}" fill="#FFFFFF" stroke="#E4002B" stroke-width="${f(sw*.9)}"/>
      <text class="bub-t" x="${f(o.tail[0])}" y="${f(o.tail[1])}" font-size="${f(R*1.25)}" text-anchor="middle" dominant-baseline="central" font-weight="800" fill="#E4002B" font-family="Atkinson Hyperlegible, system-ui, sans-serif">${o.letter}</text>
      <circle cx="${f(o.tail[0])}" cy="${f(o.tail[1])}" r="${f(R*1.7)}" fill="transparent"/>
    </g>`).join('');
  return `<svg class="mapview tapview" id="qmap" viewBox="${vb.join(' ')}" style="aspect-ratio:${f(vb[2])}/${f(vb[3])}" role="img" aria-label="Extrait de la carte ${esc(M.name)} avec des flèches lettrées">
    <image href="${M.src}" x="0" y="0" width="${M.w}" height="${M.h}"/>${pins}</svg>`;
}

function prepareItem(it){
  if(it.opts) return;
  if(it.type==='map'){
    const h = HOTSPOTS[it.hs];
    it.opts = shuffle([h.ans, ...mapDistractors(h)]);
    it.answer = h.ans;
    return;
  }
  if(it.type==='tap'){
    const z = TAP_ZONES[it.z];
    it.letters = shuffle(['A','B','C','D'].slice(0, z.pts.length));
    it.opts = z.pts.map(p=>p.ans);
    it.answer = it.id;
    return;
  }
  if(it.type==='recall'){ it.answer = it.id; it.opts = []; return; }
  if(it.duel){
    it.opts = shuffle(it.duel.slice());
    it.answer = it.id;
    return;
  }
  if(it.type==='color'){
    const good = BY_ID[it.id].ink;
    it.opts = shuffle([good, ...shuffle(Object.keys(INKS).filter(k=>k!==good)).slice(0,3)]);
    it.answer = good;
  } else {
    const hard = (card(it.id) ? card(it.id).b : 0) >= 2;
    it.opts = shuffle([it.id, ...distractors(it.id, 3, hard)]);
    it.answer = it.id;
  }
}

/* =========================================================
   Sons (le « bip » du doigt électronique) et chrono
   ========================================================= */
let actx = null;
function audio(){ if(!actx){ try{ const A = window.AudioContext||window.webkitAudioContext; actx = A ? new A() : null; }catch(e){ actx=null; } } if(actx && actx.state==='suspended') actx.resume().catch(()=>{}); return actx; }
function tone(freq, dur, type='square', vol=.04, when=0){
  if(!prefs.sound) return;
  const a = audio(); if(!a) return;
  try{
    const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.006);
    g.gain.setValueAtTime(vol,t+Math.max(0.01,dur-0.03)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+dur+0.03);
  }catch(e){}
}
const sfx = {
  punch(){ tone(2750,.09,'square',.03); },
  wrong(){ tone(180,.24,'sawtooth',.05); },
  tick(){ tone(1000,.13,'sine',.09); },
  go(){ tone(1000,.5,'sine',.1); },
  finish(){ tone(2750,.08,'square',.03); tone(2750,.08,'square',.03,.13); tone(3300,.2,'square',.03,.26); },
};
const clock = {
  acc:0, t0:0, running:false,
  start(){ if(!this.running){ this.t0 = performance.now(); this.running = true; } },
  pause(){ if(this.running){ this.acc += performance.now()-this.t0; this.running = false; } },
  now(){ return this.acc + (this.running ? performance.now()-this.t0 : 0); },
  reset(){ this.acc = 0; this.running = false; },
};
let tickTimer = null;
function startTick(){ stopTick(); tickTimer = setInterval(tick, 100); }
function stopTick(){ if(tickTimer){ clearInterval(tickTimer); tickTimer = null; } }
const SPRINT_MS = 60000;
function tick(){
  if(!session) return;
  const el = $('#qtime'); if(!el) return;
  if(session.mode==='sprint'){
    const rem = Math.max(0, SPRINT_MS - clock.now() - session.penalty);
    el.textContent = fmtClock(rem + 999);
    el.classList.toggle('warn', rem < 10000);
    const b = $('#tbar'); if(b) b.style.width = (rem/SPRINT_MS*100).toFixed(1)+'%';
    if(rem<=0 && !session.over) finishSprint();
  } else {
    el.textContent = fmtClock(clock.now());
  }
}

/* =========================================================
   Écrans
   ========================================================= */
let session = null;
let carnetCat = 'all';
let resetArmed = false;
function showScreen(name){
  for(const k of ['home','brief','quiz','result','carnet','auth','setup']) $('#screen-'+k).hidden = (k!==name);
  window.scrollTo(0,0);
}

/* ---- accueil ---- */
function punchSVG(i, done){
  let s = '<svg viewBox="0 0 30 30" aria-hidden="true">';
  if(done){
    const r = mulberry(i*9301+49297); const pos=[8,15,22]; let n=0; const pins=[];
    for(const y of pos) for(const x of pos){ if(r()<.55){ pins.push([x,y]); n++; } }
    if(n<4) pins.push([8,8],[22,22],[15,15],[22,8]);
    for(const [x,y] of pins.slice(0,7)) s += `<circle cx="${x}" cy="${y}" r="2.3" fill="currentColor"/>`;
  }
  return s+'</svg>';
}
function smoothClosed(p){
  const n=p.length; let d=`M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for(let i=0;i<n;i++){
    const p0=p[(i-1+n)%n], p1=p[i], p2=p[(i+1)%n], p3=p[(i+2)%n];
    d += ` C${(p1[0]+(p2[0]-p0[0])/6).toFixed(1)} ${(p1[1]+(p2[1]-p0[1])/6).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(1)} ${(p2[1]-(p3[1]-p1[1])/6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d+'Z';
}
function blob(r, cx, cy, rx, ry){
  const ph=r()*6.28, pts=[];
  for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; const f=1+.18*Math.sin(3*a+ph)+.1*Math.sin(5*a+ph*2); pts.push([cx+Math.cos(a)*rx*f, cy+Math.sin(a)*ry*f]); }
  return smoothClosed(pts);
}
function heroMap(n, seed){
  const W=340, H=150, r=mulberry(seed);
  let s = `<svg class="hero-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Carte du circuit du jour, ${n} postes">`;
  s += `<rect width="${W}" height="${H}" fill="#FFFFFF"/>`;
  s += `<path d="${blob(r, 50+r()*70, 35+r()*60, 42, 26)}" fill="#FCD999"/>`;
  s += `<path d="${blob(r, 220+r()*80, 55+r()*55, 50, 30)}" fill="#CDEBC6"/>`;
  const cx = 110+r()*120, cy = 45+r()*60, ph=[r()*6.28, r()*6.28, r()*6.28];
  for(let k=1;k<=12;k++){
    const pts=[], R=k*15;
    for(let i=0;i<40;i++){ const a=i/40*Math.PI*2; const f=1+.2*Math.sin(3*a+ph[0])+.09*Math.sin(5*a+ph[1])+.05*Math.sin(2*a+ph[2]); pts.push([cx+Math.cos(a)*R*f*1.35, cy+Math.sin(a)*R*f*.8]); }
    s += `<path d="${smoothClosed(pts)}" fill="none" stroke="#C1661F" stroke-width="${k%5===0?1.5:.7}" opacity=".6"/>`;
  }
  for(let x=34; x<W; x+=72) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#1D8FD0" stroke-width=".7" opacity=".5"/>`;
  // le tracé
  const V='#B02A83', a0=r()*Math.PI*2, mx=W/2, my=H/2+4;
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const pts=[[clamp(mx+Math.cos(a0)*120,16,W-16), clamp(my+Math.sin(a0)*48,16,H-16)]];
  for(let i=0;i<n;i++){ const a=a0+(i+1)/(n+1)*Math.PI*2*.9; const rr=.55+.45*r(); pts.push([clamp(mx+Math.cos(a)*140*rr,14,W-14), clamp(my+Math.sin(a)*56*rr,14,H-14)]); }
  pts.push([clamp(mx+Math.cos(a0+.4)*52,16,W-16), clamp(my+Math.sin(a0+.4)*22,16,H-16)]);
  for(let i=0;i<pts.length-1;i++){
    const [x1,y1]=pts[i],[x2,y2]=pts[i+1], L=Math.hypot(x2-x1,y2-y1); if(L<20) continue;
    const ux=(x2-x1)/L, uy=(y2-y1)/L;
    s += `<line x1="${(x1+ux*9).toFixed(1)}" y1="${(y1+uy*9).toFixed(1)}" x2="${(x2-ux*9).toFixed(1)}" y2="${(y2-uy*9).toFixed(1)}" stroke="${V}" stroke-width="1.5"/>`;
  }
  const [sx,sy]=pts[0], th=Math.atan2(pts[1][1]-sy, pts[1][0]-sx);
  const tri=[0,2.094,4.189].map(o=>[sx+Math.cos(th+o)*8.5, sy+Math.sin(th+o)*8.5]);
  s += `<path d="M${tri.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')} Z" fill="none" stroke="${V}" stroke-width="1.7"/>`;
  for(let i=1;i<=n;i++){
    const [x,y]=pts[i];
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="none" stroke="${V}" stroke-width="1.6"/>`;
    s += `<text x="${clamp(x+9,4,W-12).toFixed(1)}" y="${clamp(y-7,10,H-3).toFixed(1)}" font-size="10" font-weight="700" fill="${V}" font-family="Atkinson Hyperlegible, system-ui, sans-serif">${i}</text>`;
  }
  const [fx,fy]=pts[pts.length-1];
  s += `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="7.5" fill="none" stroke="${V}" stroke-width="1.6"/><circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="4.5" fill="none" stroke="${V}" stroke-width="1.6"/>`;
  return s+'</svg>';
}
function badgeIcon(b, on){
  const col = on ? '#B02A83' : '#8B9386';
  const inner = b.rep
    ? `<g transform="translate(6 18) scale(.4)">${BY_ID[b.rep].svg}</g>`
    : `<g transform="translate(15 15)" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${BADGE_PATHS[b.icon]||''}</g>`;
  return `<svg class="medal${on?'':' locked'}" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="#FFFFFF" stroke="${col}" stroke-width="3"/><circle cx="30" cy="30" r="21.5" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="2 2.5"/>${inner}</svg>`;
}
const BADGE_PATHS = {
  flame:'<path d="M15 3c2 6 8 8 8 15a8 8 0 0 1-16 0c0-4 3-6 4-9 1 2 2 3 3 3 0-3 0-6 1-9z"/>',
  week:'<rect x="4" y="6" width="22" height="20" rx="3"/><path d="M4 12h22M10 3v5M20 3v5M10 19l3 3 6-6"/>',
  check:'<path d="M6 16l6 6 12-14"/>',
  eye:'<path d="M3 15s5-8 12-8 12 8 12 8-5 8-12 8S3 15 3 15z"/><circle cx="15" cy="15" r="3.5"/>',
};
function levelIcon(){
  return `<svg class="medal" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="#FFFFFF" stroke="#B02A83" stroke-width="3"/><path d="M19 36l11-9 11 9M19 27l11-9 11 9" fill="none" stroke="#B02A83" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function renderHome(){
  probeMaps();
  if(checkBadges().badges.length) touch();
  const t = dayIndex(), plan = planCircuit(), day = st.days[t], done = !!(day && day.c>0);
  const streak = getStreak(), total = ACTIVE().length, seen = seenCount(), mastered = masteredCount();
  const lv = levelInfo(), wk = weekInfo(), nConf = myConfusions().length, nBadges = Object.keys(st.badges).length;
  const cells = [];
  for(let i=6;i>=0;i--){
    const d = t-i, ok = !!(st.days[d] && st.days[d].c>0);
    cells.push(`<div class="cell${ok?' done':''}${i===0?' today':''}">${punchSVG(d, ok)}<span>${WD[dayDate(d).getUTCDay()]}</span></div>`);
  }
  const heroBody = done ? `
      <p class="eyebrow">Circuit du jour couru · ${esc(fmtDate(t))}</p>
      <h1 class="hero-title">${fmtClock(day.first)}</h1>
      <p class="hero-meta">${day.pm} ${plural(day.pm,'poste manquant','postes manquants')}${day.c>1?` · ${day.c} circuits aujourd'hui`:''}. Un circuit bonus t'attend : ${plan.total} postes, ${plan.newIds.length} ${plural(plan.newIds.length,'nouveau symbole','nouveaux symboles')}.</p>
      <button class="btn-ghost" data-act="start-circuit">Courir un circuit bonus</button>` : `
      <p class="eyebrow">Circuit du jour · ${esc(fmtDate(t))}</p>
      <h1 class="hero-title">${plan.total} postes</h1>
      <p class="hero-meta">${[plan.newIds.length ? `${plan.newIds.length} ${plural(plan.newIds.length,'nouveau symbole','nouveaux symboles')}` : '', plan.reviews.length ? `${plan.reviews.length} ${plural(plan.reviews.length,'révision','révisions')}` : '', plan.colorIds.length ? `${plan.colorIds.length} ${plural(plan.colorIds.length,'question de couleur','questions de couleur')}` : ''].filter(Boolean).join(' · ')}</p>
      <button class="btn-primary" data-act="start-circuit">Prendre le départ</button>`;
  const catRows = CATS.map(c=>{
    const ids = ACTIVE().filter(s=>s.cat===c.k), m = ids.filter(s=>card(s.id)&&card(s.id).b>=4).length, sn = ids.filter(s=>card(s.id)).length;
    return `<li><button class="cat-row" data-act="open-carnet" data-cat="${c.k}">${tile(c.rep,'',c.label)}<b>${esc(c.label)}</b><span class="bar" aria-hidden="true"><i class="m" style="width:${(m/ids.length*100).toFixed(1)}%"></i><i class="s" style="width:${((sn-m)/ids.length*100).toFixed(1)}%"></i></span><span class="count">${m}/${ids.length}</span></button></li>`;
  }).join('');
  $('#screen-home').innerHTML = `
    <header class="top">
      <div class="brand" aria-label="Poste 31"><span>Poste</span><span class="brand-code">31</span></div>
      <div class="top-actions">
        <button class="icon-btn" data-act="help" aria-label="Comment ça marche ?">${ICONS.help}</button>
        <button class="icon-btn" data-act="sound" aria-pressed="${prefs.sound}" aria-label="${prefs.sound?'Couper le son':'Activer le son'}">${prefs.sound?ICONS.soundOn:ICONS.soundOff}</button>
      </div>
    </header>
    <p class="lede">La légende des cartes de course d'orientation, apprise un circuit par jour.</p>
    <section class="carton" aria-label="Carton de contrôle des 7 derniers jours">
      <div class="carton-top">
        <div class="carton-grid">${cells.join('')}</div>
        <div class="carton-streak"><strong>${streak}</strong><span>${streak? plural(streak,"jour d'affilée","jours d'affilée") : 'série à lancer'}</span></div>
      </div>
      <div class="week">
        <span>Objectif de la semaine : <b>${Math.min(wk.n,WEEK_GOAL)}/${WEEK_GOAL}</b> ${wk.n>=WEEK_GOAL ? '· atteint' : 'circuits du jour'}</span>
        <span class="week-pips" aria-hidden="true">${Array.from({length:WEEK_GOAL},(_,i)=>`<i class="${i<wk.n?'on':''}"></i>`).join('')}</span>
      </div>
    </section>
    <section class="hero">
      ${heroMap(plan.total, t)}
      <div class="hero-body">${heroBody}</div>
    </section>
    <section class="block">
      <div class="block-head"><h2 class="h2">Ta légende</h2><span class="count">${mastered} / ${total} maîtrisés</span></div>
      <div class="level"><span class="lvl-num">Niveau ${lv.i+1}</span><b>${esc(lv.name)}</b></div>
      <div class="bar" aria-hidden="true"><i class="m" style="width:${(mastered/total*100).toFixed(1)}%"></i><i class="s" style="width:${((seen-mastered)/total*100).toFixed(1)}%"></i>${LEVELS.slice(1).map(L=>`<span class="tick" style="left:${(L.min*100).toFixed(0)}%"></span>`).join('')}</div>
      <div class="bar-legend"><span>Maîtrisés</span><span class="s">Déjà vus (${seen})</span></div>
      <p class="lvl-next">${lv.next ? `Encore ${lv.need} ${plural(lv.need,'symbole maîtrisé','symboles maîtrisés')} pour passer au niveau ${lv.i+2}, « ${esc(lv.next.name)} ». Les repères sur la barre marquent chaque niveau.` : 'Tu as atteint le plus haut niveau. Continue les révisions pour le garder.'}</p>
      <ul class="cats">${catRows}</ul>
    </section>
    <section class="block">
      <div class="block-head"><h2 class="h2">Tes badges</h2><span class="count">${nBadges} / ${BADGES.length}</span></div>
      <ul class="badges">${BADGES.map(b=>`<li><button class="bdg${st.badges[b.k]?'':' locked'}" data-act="badge" data-k="${b.k}">${badgeIcon(b, !!st.badges[b.k])}<span>${esc(b.name)}</span></button></li>`).join('')}</ul>
    </section>
    <section class="block" aria-label="Autres façons de jouer">
      <div class="block-head"><h2 class="h2">Autres modes</h2></div>
      <div class="mgrid">
        <button class="mtile" data-act="start-sprint"><span class="ic">${ICONS.sprint}</span><b>Sprint 60 s</b><small>${st.bestSprint ? `Record : ${st.bestSprint} ${plural(st.bestSprint,'bonne réponse','bonnes réponses')}` : 'Un maximum de réponses avant la fin du chrono'}</small></button>
        <button class="mtile" data-act="start-map"><span class="ic">${ICONS.map}</span><b>Lecture de carte</b><small>Une flèche sur une vraie carte : quel symbole ?</small></button>
        <button class="mtile" data-act="start-tap"><span class="ic">${ICONS.tap}</span><b>Touche la carte</b><small>Quelle flèche montre le symbole demandé ?</small></button>
        <button class="mtile" data-act="start-recall"><span class="ic">${ICONS.recall}</span><b>Rappel sans choix</b><small>Retrouve le nom de tête, sans propositions</small></button>
        <button class="mtile" data-act="start-duel"><span class="ic">${ICONS.duel}</span><b>Duels</b><small>${nConf ? `${nConf} ${plural(nConf,'paire que tu as confondue','paires que tu as confondues')}` : 'Les symboles qui se ressemblent, face à face'}</small></button>
        <button class="mtile" data-act="pick-training"><span class="ic">${ICONS.train}</span><b>Par famille</b><small>10 questions sur une famille, sans chrono</small></button>
      </div>
      <button class="mode" data-act="open-carnet" data-cat="all"><span class="ic">${ICONS.carnet}</span><span><b>Carnet de légende</b><small>Les ${total} symboles, ton niveau et tes confusions</small></span>${ICONS.chev}</button>
    </section>
    <footer class="foot">
      <p>Pourquoi 31 ? En course d'orientation, les codes des postes commencent à 31 pour ne jamais être confondus avec leur numéro d'ordre sur le circuit.</p>
      <p class="who">Connecté en tant que <b>${esc(me||'')}</b></p>
      <p class="sync" id="sync">${syncHTML()}</p>
      <button class="linkish" data-act="help">Comment ça marche ?</button>
      <button class="linkish" data-act="logout">Se déconnecter</button>
      <button class="linkish" data-act="reset">Remettre ma progression à zéro</button>
    </footer>`;
}

/* ---- pré-départ ---- */
function renderBrief(){
  const ids = session.newIds;
  $('#screen-brief').innerHTML = `
    <div class="sub-head"><button class="icon-btn" data-act="home" aria-label="Retour à l'accueil">${ICONS.back}</button><h1 class="h1">Zone de pré-départ</h1></div>
    <p class="lede">${ids.length} ${plural(ids.length,'nouveau symbole va','nouveaux symboles vont')} tomber sur ton circuit, deux fois chacun. Regarde-les bien avant le bip.</p>
    <ul class="brief">${ids.map(id=>`<li>${tile(id)}<div><b>${esc(BY_ID[id].name)}</b><small>${esc(CAT[BY_ID[id].cat].label)}</small></div>${EXPL[id]?`<div class="brief-txt"><p>${esc(EXPL[id][0])}</p><p><span class="lbl">Sur le terrain</span>${esc(EXPL[id][1])}</p></div>`:''}</li>`).join('')}</ul>
    <div class="go-bar"><button class="btn-primary" data-act="go">Je suis prêt : départ</button></div>`;
}

/* ---- questions ---- */
function stripSVG(){
  const q = session.queue, n = q.length, step = n>16 ? 18 : 24, y = 15;
  const xs = [14]; for(let i=0;i<=n;i++) xs.push(14+(i+1)*step);
  const W = xs[xs.length-1] + 14;
  let s = `<svg class="strip" viewBox="0 0 ${W} 30" preserveAspectRatio="xMidYMid meet" aria-hidden="true">`;
  for(let i=0;i<xs.length-1;i++){
    const a = xs[i]+8, b = xs[i+1]-8;
    if(b>a) s += `<line x1="${a}" y1="${y}" x2="${b}" y2="${y}" stroke="currentColor" stroke-width="1.6" opacity="${i<=session.pos?1:.35}"/>`;
  }
  s += `<path d="M${xs[0]+6.5} ${y} L${xs[0]-4} ${y-6.5} L${xs[0]-4} ${y+6.5} Z" fill="none" stroke="currentColor" stroke-width="1.6"/>`;
  for(let i=0;i<n;i++){
    const it = q[i], x = xs[i+1];
    const cur = i===session.pos, past = i<session.pos;
    const fill = cur ? 'currentColor' : (past && it.result==='ok') ? 'currentColor' : 'none';
    const op = cur ? 1 : past ? (it.result==='ok' ? .3 : 1) : .45;
    s += `<circle cx="${x}" cy="${y}" r="6.5" fill="${fill}" fill-opacity="${cur?1:.3}" stroke="currentColor" stroke-width="1.6" opacity="${op}"${it.retry?' stroke-dasharray="2.5 2"':''}/>`;
    if(past && it.result==='miss') s += `<path d="M${x-3.5} ${y-3.5} L${x+3.5} ${y+3.5} M${x+3.5} ${y-3.5} L${x-3.5} ${y+3.5}" stroke="currentColor" stroke-width="1.6"/>`;
  }
  const fx = xs[xs.length-1];
  s += `<circle cx="${fx}" cy="${y}" r="7" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".45"/><circle cx="${fx}" cy="${y}" r="4" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".45"/>`;
  return s + '</svg>';
}
function qbarHTML(){
  if(session.mode==='sprint'){
    return `<div class="qbar"><button class="icon-btn" data-act="quit" aria-label="Arrêter le sprint">${ICONS.close}</button><div class="qpos"><span class="qlabel">Sprint</span><span class="qcode" id="qscore">${session.score}</span></div><div class="qtime" id="qtime">01:00</div></div>`;
  }
  const n = `${session.pos+1}/${session.queue.length}`;
  const label = {train:`Question ${n}`, map:`Flèche ${n}`, tap:`Zone ${n}`, recall:`Carte ${n}`, duel:`Duel ${n}`}[session.mode] || `Poste ${session.pos+1}`;
  return `<div class="qbar"><button class="icon-btn" data-act="quit" aria-label="Abandonner">${ICONS.close}</button><div class="qpos"><span class="qlabel">${label}</span>${session.mode!=='circuit'?'':`<span class="qcode" title="Code du poste">${31+session.pos}</span>`}</div><div class="qtime" id="qtime">${fmtClock(clock.now())}</div></div>`;
}
function promptHTML(it){
  const s = BY_ID[it.id];
  if(it.type==='map'){
    const h = HOTSPOTS[it.hs], M = MAPS[h.m], mv = mapSVG(h);
    it._mv = mv;
    return `<div class="prompt map-prompt">${mapWrap(h.m, mv.html)}<p class="map-cap"><b>${esc(M.name)}</b> · ${esc(M.sub)}</p>${M.note?`<p class="map-note">${esc(M.note)}</p>`:''}<p class="ask">Qu'indique la flèche ?</p></div>`;
  }
  if(it.type==='tap'){
    const z = TAP_ZONES[it.z], M = MAPS[z.m];
    return `<div class="prompt map-prompt"><p class="ask">Touche la flèche qui montre</p><p class="target">${esc(s.name)}</p>${mapWrap(z.m, tapSVG(z, it.letters))}<p class="map-cap"><b>${esc(M.name)}</b> · ${esc(M.sub)}</p>${M.note?`<p class="map-note">${esc(M.note)}</p>`:''}</div>`;
  }
  if(it.type==='recall'){
    const front = it.dir==='n'
      ? `<p class="ask">Imagine le symbole de tête</p><p class="target">${esc(s.name)}</p>`
      : `${tile(it.id,'big','Symbole à retrouver de tête')}<p class="ask">Dis son nom dans ta tête</p>`;
    const back = it.revealed ? `<div class="recall-back">${it.dir==='n' ? tile(it.id,'big') : `<p class="target">${esc(s.name)}</p>`}${EXPL[it.id]?`<p class="fb-expl"><span class="lbl">Sur le terrain</span>${esc(EXPL[it.id][1])}</p>`:''}</div>` : '';
    return `<div class="prompt recall">${front}${back}</div>`;
  }
  if(it.duel && it.type==='s2n') return `<div class="prompt">${tile(it.id,'big','Symbole à identifier')}<p class="ask">Duel : lequel des deux est-ce ?</p></div>`;
  if(it.duel && it.type==='n2s') return `<div class="prompt"><p class="ask">Duel : lequel des deux est</p><p class="target">${esc(s.name)}</p></div>`;
  if(it.type==='s2n') return `<div class="prompt">${tile(it.id,'big','Symbole à identifier')}<p class="ask">Quel est ce symbole ?</p></div>`;
  if(it.type==='n2s') return `<div class="prompt"><p class="ask">Touche le bon symbole</p><p class="target">${esc(s.name)}</p></div>`;
  return `<div class="prompt"><p class="ask">Sur la carte, ce symbole est imprimé en…</p><p class="target">${esc(s.name)}</p></div>`;
}
function optionsHTML(it){
  if(it.type==='tap'){
    const order = it.letters.map((L,i)=>({L, ans:it.opts[i]})).sort((a,b)=> a.L.localeCompare(b.L));
    return `<p class="ask letters-ask">Ou touche la lettre :</p><div class="opts letters" style="grid-template-columns:repeat(${order.length},minmax(0,1fr))">${order.map(o=>`<button class="opt letter" data-act="ans" data-v="${o.ans}">${o.L}</button>`).join('')}</div>`;
  }
  if(it.type==='recall'){
    if(!it.revealed) return `<div class="opts"><button class="btn-primary" data-act="reveal" id="reveal-btn">Retourner la carte</button></div>`;
    return `<p class="ask letters-ask">Tu l'avais trouvé ?</p><div class="opts self"><button class="opt self-yes" data-act="self" data-v="1"><span class="k">1</span><span>Oui, je l'avais</span></button><button class="opt self-no" data-act="self" data-v="0"><span class="k">2</span><span>Non, raté</span></button></div>`;
  }
  if(it.type==='s2n' || it.type==='map') return `<div class="opts">${it.opts.map((id,i)=>`<button class="opt" data-act="ans" data-v="${id}"><span class="k">${i+1}</span><span>${esc(BY_ID[id].name)}</span></button>`).join('')}</div>`;
  if(it.type==='n2s') return `<div class="opts tiles">${it.opts.map((id,i)=>`<button class="opt-tile" data-act="ans" data-v="${id}" aria-label="Choix ${i+1}">${tile(id,'','Choix '+(i+1))}<span class="k">${i+1}</span></button>`).join('')}</div>`;
  return `<div class="opts">${it.opts.map((k,i)=>`<button class="opt" data-act="ans" data-v="${k}"><span class="k">${i+1}</span><span class="sw" style="background:${INKS[k].hex}"></span><span>${INKS[k].label}</span></button>`).join('')}</div>`;
}
function renderQuestion(){
  const it = session.queue[session.pos];
  prepareItem(it);
  const top = session.mode==='sprint' ? `<div class="tbar"><i id="tbar" style="width:${(Math.max(0,SPRINT_MS-clock.now()-session.penalty)/SPRINT_MS*100).toFixed(1)}%"></i></div>` : stripSVG();
  $('#screen-quiz').innerHTML = qbarHTML() + top + `<div class="qbody">${promptHTML(it)}${optionsHTML(it)}</div>`;
  session.qStart = clock.now();
  session.locked = false;
  const m = (it.type==='map' || it.type==='tap') ? currentMap() : null;
  session.mapWait = !!m && mapState[m]!=='ok';
  if(session.mapWait){
    loadMap(m);
    $$('#screen-quiz .opts [data-act="ans"]').forEach(b=>{ b.disabled = true; });
  }
}
function answer(v, btn){
  if(!session || session.locked || session.over || session.waiting || session.mapWait) return;
  const it = session.queue[session.pos];
  if(it.type==='recall') return;
  session.locked = true;
  const ok = v===it.answer;
  session.log.push({id:it.id, type:it.type, ok, ms:clock.now()-session.qStart, code:31+session.pos, retry:!!it.retry});
  it.result = ok ? 'ok' : 'miss';
  if(!ok && it.type!=='color') recordConf(it.answer, v);
  $$('#screen-quiz [data-act="ans"]').forEach(b=>{ b.disabled = true; if(b.dataset.v===it.answer) b.classList.add('is-right'); else if(b.dataset.v===v) b.classList.add('is-wrong','shake'); });
  if(session.mode==='sprint'){ sprintAnswer(it, ok); return; }
  if(session.mode==='map' || session.mode==='tap'){ mapAnswer(it, v, ok); return; }
  if(session.mode==='duel'){ duelAnswer(it, v, ok); return; }
  grade(it, ok); touch();
  if(ok){ sfx.punch(); buzz(15); setTimeout(next, 480); }
  else {
    sfx.wrong(); buzz([30,40,30]);
    const tries = (it.tries||0) + 1;
    it.requeued = tries <= 2;
    if(it.requeued){
      const retry = {id:it.id, type: it.type==='color' ? 'color' : (it.type==='s2n' ? 'n2s' : 's2n'), retry:true, practice:!!it.practice, tries};
      session.queue.splice(Math.min(session.pos+3, session.queue.length), 0, retry);
    }
    clock.pause();
    showFeedback(it, v);
  }
}
function showFeedback(it, v){
  const s = BY_ID[it.id], fb = $('#fb');
  let body;
  if(it.type==='color'){
    body = `<div class="fb-row good">${tile(it.id)}<div><small>${esc(s.name)}</small><b>Imprimé en ${INKS[s.ink].label.toLowerCase()}</b></div></div><p class="fb-tip">${esc(INKS[s.ink].rule)}</p>`;
  } else {
    const ch = BY_ID[v];
    body = `<div class="fb-row good">${tile(it.id)}<div><small>La bonne réponse</small><b>${esc(s.name)}</b></div></div>
      ${EXPL[it.id] ? `<p class="fb-expl"><span class="lbl">Sur le terrain</span>${esc(EXPL[it.id][1])}</p>` : ''}
      <div class="fb-row bad">${tile(v)}<div><small>Ta réponse</small><b>${esc(ch.name)}</b></div></div>
      ${ch.cat!==s.cat ? `<p class="fb-tip">${esc(CAT[s.cat].tip)}</p>` : ''}`;
  }
  const tag = session.mode==='circuit' ? 'Poste manquant' : 'Raté';
  const note = !it.requeued ? 'On passe au suivant : il reviendra dans tes prochaines révisions.' : `Il revient un peu plus loin : ${session.mode==='circuit'?'tu dois le pointer pour finir le circuit':'redonne-lui sa chance'}.`;
  fb.innerHTML = `<div class="fb-inner"><p class="fb-tag">${tag}</p>${body}<p class="fb-note">${note}</p><button class="btn-primary" data-act="continue" id="fb-go">Continuer</button></div>`;
  fb.hidden = false;
  setTimeout(()=>{ const b = $('#fb-go'); if(b) b.focus({preventScroll:true}); }, 60);
}
function mapAnswer(it, v, ok){
  gradeLight(it.id, ok); touch();
  if(ok){ sfx.punch(); buzz(15); } else { sfx.wrong(); buzz([30,40,30]); }
  clock.pause();
  const tap = it.type==='tap';
  const svg = $('#qmap');
  if(!tap && svg && it._mv){ const r = svg.querySelector('.ring'); if(r) r.setAttribute('opacity','1'); tweenVB(svg, it._mv.vq, it._mv.vc, 750); }
  const s = BY_ID[it.id], note = (tap ? (TAP_ZONES[it.z].pts.find(p=>p.ans===it.id)||{}).note : HOTSPOTS[it.hs].note) || '', fb = $('#fb');
  const last = session.pos >= session.queue.length-1;
  const nextLbl = last ? 'Voir mon résultat' : tap ? 'Zone suivante' : 'Flèche suivante';
  fb.innerHTML = `<div class="fb-inner">
    <p class="fb-tag${ok?' ok':''}">${ok ? 'Bien lu' : 'Raté'}</p>
    <div class="fb-row good">${tile(it.id)}<div><small>${tap ? 'La bonne flèche montre' : 'La flèche montre'}</small><b>${esc(s.name)}</b></div></div>
    ${ok ? '' : `<div class="fb-row bad">${tile(v)}<div><small>${tap ? 'Ta flèche montrait' : 'Ta réponse'}</small><b>${esc(BY_ID[v].name)}</b></div></div>`}
    ${EXPL[it.id] ? `<p class="fb-expl"><span class="lbl">Sur le terrain</span>${esc(EXPL[it.id][1])}</p>` : ''}
    ${note ? `<p class="fb-note">${esc(note)}</p>` : ''}
    ${tap ? '' : '<p class="fb-note">La carte recule pour te montrer où se trouve ce détail.</p>'}
    <button class="btn-primary" data-act="continue" id="fb-go">${nextLbl}</button></div>`;
  fb.hidden = false;
  window.scrollTo({top:0, behavior:'smooth'});
  setTimeout(()=>{ const b = $('#fb-go'); if(b) b.focus({preventScroll:true}); }, 60);
}
function duelAnswer(it, v, ok){
  gradeLight(it.id, ok); touch();
  if(ok){ sfx.punch(); buzz(15); setTimeout(next, 650); return; }
  sfx.wrong(); buzz([30,40,30]);
  clock.pause();
  const [a,b] = it.duel, fb = $('#fb');
  const side = id => `<div class="cmp-col${id===it.id?' good':''}">${tile(id)}<b>${esc(BY_ID[id].name)}</b>${EXPL[id]?`<p>${esc(EXPL[id][0])}</p>`:''}</div>`;
  const last = session.pos >= session.queue.length-1;
  fb.innerHTML = `<div class="fb-inner">
    <p class="fb-tag">Raté</p>
    <p class="fb-note">La bonne réponse était <b>${esc(BY_ID[it.id].name)}</b>. Compare-les côte à côte :</p>
    <div class="cmp">${side(a)}${side(b)}</div>
    <button class="btn-primary" data-act="continue" id="fb-go">${last ? 'Voir mon résultat' : 'Duel suivant'}</button></div>`;
  fb.hidden = false;
  setTimeout(()=>{ const x = $('#fb-go'); if(x) x.focus({preventScroll:true}); }, 60);
}
function reveal(){
  if(!session || session.over || session.mode!=='recall') return;
  const it = session.queue[session.pos];
  if(it.revealed) return;
  it.revealed = true; it.revealMs = clock.now()-session.qStart;
  sfx.tick();
  const body = $('#screen-quiz .qbody');
  if(body) body.innerHTML = promptHTML(it) + optionsHTML(it);
}
function selfGrade(yes){
  if(!session || session.over || session.mode!=='recall' || session.locked) return;
  const it = session.queue[session.pos];
  if(!it.revealed) return;
  session.locked = true;
  const ok = !!yes;
  session.log.push({id:it.id, type:'recall', ok, ms:it.revealMs||0, code:31+session.pos, retry:!!it.retry});
  it.result = ok ? 'ok' : 'miss';
  grade(it, ok); touch();
  if(ok){ sfx.punch(); buzz(15); }
  else {
    sfx.wrong(); buzz([30,40,30]);
    if(!it.retry) session.queue.splice(Math.min(session.pos+4, session.queue.length), 0, {id:it.id, type:'recall', dir: it.dir==='s' ? 'n' : 's', retry:true});
  }
  setTimeout(next, 250);
}
function hideFeedback(){ const fb = $('#fb'); fb.hidden = true; fb.innerHTML = ''; }
function next(){
  if(!session || session.over) return;
  hideFeedback();
  session.pos++;
  if(session.pos >= session.queue.length){
    const fin = {train:finishTraining, map:finishMap, tap:finishTap, recall:finishRecall, duel:finishDuel}[session.mode] || finishCircuit;
    fin(); return;
  }
  if(document.visibilityState!=='hidden') clock.start();
  renderQuestion();
}

/* ---- démarrages ---- */
function go(withCountdown){
  hideFeedback(); closeSheet();
  showScreen('quiz');
  session.waiting = true;
  renderQuestion();
  const begin = () => { session.waiting = false; clock.reset(); clock.start(); session.qStart = 0; startTick(); tick(); };
  if(!withCountdown){ begin(); return; }
  const ov = $('#countdown'), numEl = $('#cd-num');
  let i = 3; ov.hidden = false; numEl.textContent = '3'; sfx.tick();
  const iv = setInterval(()=>{
    i--;
    if(i>0){ numEl.textContent = String(i); numEl.style.animation='none'; void numEl.offsetWidth; numEl.style.animation=''; sfx.tick(); }
    else if(i===0){ numEl.textContent = 'Top'; numEl.style.animation='none'; void numEl.offsetWidth; numEl.style.animation=''; sfx.go(); }
    else { clearInterval(iv); ov.hidden = true; if(session) begin(); }
  }, 600);
}
function startCircuit(){
  const plan = planCircuit();
  session = {mode:'circuit', queue:buildQueue(plan), pos:0, log:[], graded:new Set(), mastered0:masteredCount(), newIds:plan.newIds, over:false};
  session.initial = session.queue.length;
  clock.reset();
  if(plan.newIds.length){ renderBrief(); showScreen('brief'); }
  else go(true);
}
function startTraining(cat){
  const ids = ACTIVE().filter(s=>s.cat===cat).map(s=>s.id);
  const pick = shuffle(shuffle(ids).sort((a,b)=> (card(a)?card(a).b:-1) - (card(b)?card(b).b:-1)).slice(0,10));
  const q = pick.map(id=>({id, type: card(id) ? pickType(id) : 's2n'}));
  insertColors(q, shuffle(pick.filter(canColor)).slice(0, cat==='vege' ? 2 : 1));
  session = {mode:'train', cat, queue:q, pos:0, log:[], graded:new Set(), mastered0:masteredCount(), over:false};
  session.initial = session.queue.length;
  clock.reset();
  go(false);
}
let starting = false;
async function startTap(){
  if(starting) return; starting = true;
  try{ await waitProbe(); } finally { starting = false; }
  const all = [];
  TAP_ZONES.forEach((z,zi)=>{ if(mapUsable(z.m)) z.pts.forEach(p=>{ if(isActive(BY_ID[p.ans])) all.push({z:zi, id:p.ans}); }); });
  if(!all.length){ openInfo('Touche la carte', "Aucune carte n'est disponible pour le moment. Réessaie un peu plus tard."); return; }
  const few = limitMaps(all, x=>TAP_ZONES[x.z].m, 10);
  const pick = []; let lastZ = -1;
  for(const x of shuffle(few)){ if(pick.length>=8) break; if(x.z===lastZ) continue; pick.push(x); lastZ = x.z; }
  for(const x of shuffle(few)){ if(pick.length>=8) break; if(!pick.includes(x)) pick.push(x); }
  session = {mode:'tap', queue:pick.map(x=>({id:x.id, z:x.z, type:'tap'})), pos:0, log:[], over:false};
  session.initial = session.queue.length;
  loadMapsFor(session.queue);
  clock.reset();
  go(false);
}
function startRecall(){
  const t = dayIndex();
  const seen = ACTIVE().filter(s=>card(s.id)).map(s=>s.id);
  if(seen.length < 4){ openInfo('Rappel sans choix', "Il faut d'abord avoir rencontré quelques symboles : cours le circuit du jour, puis reviens ici pour les retrouver de tête."); return; }
  const due = seen.filter(id=>card(id).d<=t).sort((a,b)=> card(a).b-card(b).b);
  const rest = shuffle(seen.filter(id=>!due.includes(id))).sort((a,b)=> card(a).b-card(b).b);
  const pick = shuffle(due.concat(rest).slice(0, 12));
  session = {mode:'recall', queue:pick.map(id=>({id, type:'recall', dir: Math.random()<.7 ? 's' : 'n'})), pos:0, log:[], graded:new Set(), mastered0:masteredCount(), over:false};
  session.initial = session.queue.length;
  clock.reset();
  go(false);
}
function duelPairs(focusId){
  const act = id => BY_ID[id] && isActive(BY_ID[id]);
  const seen = id => !!card(id);
  const key = p => p.slice().sort().join('|');
  const out = [], keys = new Set();
  const add = p => { const k = key(p); if(!keys.has(k) && act(p[0]) && act(p[1])){ keys.add(k); out.push(p); } };
  const mine = myConfusions().map(c=>c.pair);
  if(focusId){
    mine.filter(p=>p.includes(focusId)).forEach(add);
    PAIRS.filter(p=>p.includes(focusId)).forEach(add);
    return out;
  }
  mine.forEach(add);
  shuffle(PAIRS.filter(p=>seen(p[0]) && seen(p[1]))).forEach(add);
  shuffle(PAIRS.filter(p=>seen(p[0]) || seen(p[1]))).forEach(add);
  return out;
}
function startDuel(focusId){
  const pairs = duelPairs(focusId);
  if(!pairs.length){ openInfo('Duels', "Les duels opposent les symboles que tu confonds. Cours d'abord le circuit du jour pour en rencontrer quelques-uns."); return; }
  const n = 10, q = [];
  for(let i=0; q.length<n && i<n*3; i++){
    const p = pairs[i % pairs.length], target = p[Math.random()<.5 ? 0 : 1];
    // sans point de comparaison, certaines paires ne se jouent qu'en montrant les deux dessins
    const type = isExcluded(p[0],p[1]) ? 'n2s' : (Math.random()<.5 ? 's2n' : 'n2s');
    q.push({id:target, type, duel:p.slice()});
  }
  session = {mode:'duel', queue:q, pos:0, log:[], over:false, focus:focusId||null};
  session.initial = session.queue.length;
  clock.reset();
  closeSheet();
  go(false);
}
async function startMapGame(){
  if(starting) return; starting = true;
  try{ await waitProbe(); } finally { starting = false; }
  const pool = HOTSPOTS.map((h,i)=>i).filter(i => mapUsable(HOTSPOTS[i].m) && isActive(BY_ID[HOTSPOTS[i].ans]));
  if(!pool.length){ openInfo('Lecture de carte', "Aucune carte n'est disponible pour le moment. Réessaie un peu plus tard."); return; }
  const count = {}, pick = [];
  for(const i of shuffle(limitMaps(pool, i=>HOTSPOTS[i].m, 16))){
    const a = HOTSPOTS[i].ans;
    if((count[a]||0) >= 2) continue;
    count[a] = (count[a]||0) + 1; pick.push(i);
    if(pick.length===10) break;
  }
  session = {mode:'map', queue:pick.map(i=>({id:HOTSPOTS[i].ans, hs:i, type:'map'})), pos:0, log:[], over:false};
  session.initial = session.queue.length;
  loadMapsFor(session.queue);
  clock.reset();
  go(false);
}
function finishSimple(o){
  session.over = true; clock.pause(); stopTick(); hideFeedback();
  const t = dayIndex(); const day = st.days[t] || (st.days[t] = {c:0, first:0, pm:0, n:0}); day.n += session.log.length;
  const rw = checkBadges(o.extra);
  touch(); flushCloud();
  $('#screen-result').innerHTML = `
    <div class="res-head">
      <p class="res-eyebrow">${esc(o.eyebrow)}</p>
      <h1 class="res-time">${o.good}/${o.total}</h1>
      <p class="res-sub">${o.sub}</p>
    </div>
    ${rewardsHTML(rw)}
    <h2 class="h2">À revoir</h2>
    ${reviewList(o.missed)}
    <div class="res-actions"><button class="btn-primary" data-act="${o.againAct}"${o.againCat?` data-cat="${o.againCat}"`:''}>${esc(o.againLabel)}</button><button class="btn-ghost" data-act="home">Retour à l'accueil</button></div>`;
  showScreen('result'); sfx.finish();
}
function finishMap(){
  const good = session.log.filter(l=>l.ok).length, total = session.log.length;
  finishSimple({eyebrow:'Lecture de carte', good, total, sub:`${plural(good,'flèche bien lue','flèches bien lues')}, en ${fmtClock(clock.now())}`,
    missed:[...new Set(session.log.filter(l=>!l.ok).map(l=>l.id))], againAct:'start-map', againLabel:'Nouvelle série de flèches',
    extra: (good===10 && total===10) ? ['carte-10'] : []});
}
function finishTap(){
  const good = session.log.filter(l=>l.ok).length, total = session.log.length;
  finishSimple({eyebrow:'Touche la carte', good, total, sub:`${plural(good,'bonne flèche touchée','bonnes flèches touchées')}, en ${fmtClock(clock.now())}`,
    missed:[...new Set(session.log.filter(l=>!l.ok).map(l=>l.id))], againAct:'start-tap', againLabel:'Nouvelle série de zones'});
}
function finishRecall(){
  const first = session.log.filter(l=>!l.retry), good = first.filter(l=>l.ok).length;
  finishSimple({eyebrow:'Rappel sans choix', good, total:first.length, sub:`${plural(good,'symbole retrouvé','symboles retrouvés')} de tête du premier coup`,
    missed:[...new Set(session.log.filter(l=>!l.ok).map(l=>l.id))], againAct:'start-recall', againLabel:'Nouvelle série de cartes'});
}
function finishDuel(){
  const good = session.log.filter(l=>l.ok).length;
  finishSimple({eyebrow:'Duels', good, total:session.log.length, sub:`${plural(good,'duel gagné','duels gagnés')}`,
    missed:[...new Set(session.log.filter(l=>!l.ok).map(l=>l.id))], againAct:'start-duel', againLabel:'Nouvelle série de duels'});
}
function rewardsHTML(r){
  if(!r || (!r.badges.length && !r.levelUp)) return '';
  const items = [];
  if(r.levelUp) items.push(`<li class="rw"><span class="rw-ic">${levelIcon()}</span><span><small>Nouveau niveau</small><b>${esc(r.levelUp)}</b></span></li>`);
  for(const k of r.badges){ const b = BADGES.find(x=>x.k===k); if(b) items.push(`<li class="rw"><span class="rw-ic">${badgeIcon(b, true)}</span><span><small>Badge débloqué</small><b>${esc(b.name)}</b></span></li>`); }
  return `<ul class="rewards">${items.join('')}</ul>`;
}
function startSprint(){
  const seen = ACTIVE().filter(s=>card(s.id)).map(s=>s.id);
  session = {mode:'sprint', queue:[], pos:0, log:[], score:0, penalty:0, misses:[], recent:[], over:false, pool: seen.length>=12 ? seen : ACTIVE().map(s=>s.id)};
  session.queue.push(sprintItem());
  clock.reset();
  go(true);
}
function sprintItem(){
  const pool = session.pool; let id, guard = 0;
  do{ id = pool[Math.floor(Math.random()*pool.length)]; } while(session.recent.includes(id) && guard++ < 25);
  session.recent.push(id); if(session.recent.length>8) session.recent.shift();
  const r = Math.random();
  if(r < .18 && canColor(id)) return {id, type:'color'};
  return {id, type: r < .7 ? 's2n' : 'n2s'};
}
function sprintAnswer(it, ok){
  if(it.type!=='color') gradeLight(it.id, ok);
  touch();
  if(ok){ session.score++; const sc = $('#qscore'); if(sc) sc.textContent = session.score; sfx.punch(); buzz(12); setTimeout(sprintNext, 260); }
  else {
    session.penalty += 3000; if(!session.misses.includes(it.id)) session.misses.push(it.id);
    sfx.wrong(); buzz([30,40,30]);
    const p = document.createElement('div'); p.className = 'penalty'; p.textContent = '−3 s'; document.body.appendChild(p); setTimeout(()=>p.remove(), 950);
    tick();
    setTimeout(sprintNext, 1000);
  }
}
function sprintNext(){ if(!session || session.over || session.mode!=='sprint') return; session.queue.push(sprintItem()); session.pos++; renderQuestion(); }

/* ---- résultats ---- */
function finishCircuit(){
  session.over = true; clock.pause(); stopTick(); hideFeedback();
  const ms = clock.now(), t = dayIndex();
  const day = st.days[t] || (st.days[t] = {c:0, first:0, pm:0, n:0});
  const pm = session.log.filter(l=>!l.ok).length;
  const firstRun = day.c===0;
  day.c++; day.n += session.log.length;
  if(firstRun){ day.first = ms; day.pm = pm; }
  const avg = ms / session.initial, prev = st.bestAvg;
  const rec = session.initial>=8 && (!prev || avg < prev);
  if(rec) st.bestAvg = avg;
  const rw = checkBadges(firstRun && pm===0 ? ['sans-faute'] : []);
  pruneDays(); touch(); flushCloud();
  const mastered = masteredCount(), delta = mastered - session.mastered0, streak = getStreak();
  const okLogs = session.log.filter(l=>l.ok); const slowest = okLogs.length ? okLogs.reduce((a,b)=>b.ms>a.ms?b:a) : null;
  const rows = session.log.map(l=>`<tr data-act="detail" data-id="${l.id}"${l===slowest?' class="slow"':''}><td class="code">${l.code}</td><td><div class="sym">${tile(l.id,'',BY_ID[l.id].name)}<span>${esc(BY_ID[l.id].name)}${l.type==='color'?' <span class="muted">(couleur)</span>':''}${l===slowest?'<span class="tag">Le plus long</span>':''}</span></div></td><td class="num">${fmtSec1(l.ms)}${l.ok?'':'<em class="pm">PM</em>'}</td></tr>`).join('');
  $('#screen-result').innerHTML = `
    <div class="res-head">
      <svg class="res-mark" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" stroke-width="3.5"/><circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" stroke-width="3.5"/></svg>
      <p class="res-eyebrow">Arrivée · ${firstRun ? 'circuit du jour' : 'circuit bonus'}</p>
      <h1 class="res-time">${fmtClock(ms)}</h1>
      <p class="res-sub">${session.initial} postes · ${pm} ${plural(pm,'poste manquant','postes manquants')} · ${fmtSec1(avg)} par poste</p>
      ${rec ? `<p class="badge">${prev ? 'Nouveau record de vitesse' : 'Premier record posé'} : ${fmtSec1(avg)} par poste</p>` : ''}
    </div>
    ${rewardsHTML(rw)}
    <div class="stats3">
      <div><b>${streak}</b><span>${plural(streak,"jour d'affilée","jours d'affilée")}</span></div>
      <div><b>${mastered}${delta>0?`<small style="font-size:.5em"> +${delta}</small>`:''}</b><span>symboles maîtrisés</span></div>
      <div><b>${st.bestAvg ? fmtSec1(st.bestAvg).replace(' s','') : '–'}</b><span>record (s par poste)</span></div>
    </div>
    <h2 class="h2">Temps intermédiaires</h2>
    <p class="muted small" style="margin-top:4px">Touche une ligne pour relire ce que veut dire le symbole.</p>
    <div class="splits"><table><thead><tr><th>Code</th><th>Poste</th><th style="text-align:right">Temps</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="res-actions"><button class="btn-primary" data-act="home">Retour à l'accueil</button><button class="btn-ghost" data-act="start-circuit">Courir un circuit bonus</button></div>`;
  showScreen('result'); sfx.finish(); buzz([20,60,20,60,40]);
}
function reviewList(ids){
  if(!ids.length) return `<p class="empty">Aucune erreur. Tout est passé du premier coup.</p>`;
  return `<p class="muted small">Touche un symbole pour relire ce qu'il veut dire sur le terrain.</p><ul class="review">${ids.map(id=>`<li><button class="item" data-act="detail" data-id="${id}">${tile(id)}<span>${esc(BY_ID[id].name)}</span></button></li>`).join('')}</ul>`;
}
function finishTraining(){
  const first = session.log.filter(l=>!l.retry), good = first.filter(l=>l.ok).length, cat = session.cat;
  finishSimple({eyebrow:`Entraînement · ${CAT[cat].label}`, good, total:first.length, sub:`du premier coup, en ${fmtClock(clock.now())}`,
    missed:[...new Set(session.log.filter(l=>!l.ok).map(l=>l.id))], againAct:'train', againCat:cat, againLabel:'Relancer cette famille'});
}
function finishSprint(){
  if(!session || session.over) return;
  session.over = true; clock.pause(); stopTick(); hideFeedback();
  const sc = session.score, prev = st.bestSprint, rec = sc > prev;
  if(rec) st.bestSprint = sc;
  const t = dayIndex(); const day = st.days[t] || (st.days[t] = {c:0, first:0, pm:0, n:0}); day.n += session.log.length;
  const rw = checkBadges();
  touch(); flushCloud();
  $('#screen-result').innerHTML = `
    <div class="res-head">
      <p class="res-eyebrow">Sprint 60 secondes</p>
      <h1 class="res-time">${sc}</h1>
      <p class="res-sub">${plural(sc,'bonne réponse','bonnes réponses')} · ${session.misses.length} ${plural(session.misses.length,'erreur','erreurs')}</p>
      ${rec ? `<p class="badge">${prev ? `Nouveau record (avant : ${prev})` : 'Premier record posé'}</p>` : `<p class="res-sub">Record : ${st.bestSprint}</p>`}
    </div>
    ${rewardsHTML(rw)}
    <h2 class="h2">À revoir</h2>
    ${reviewList(session.misses)}
    <div class="res-actions"><button class="btn-primary" data-act="start-sprint">Relancer un sprint</button><button class="btn-ghost" data-act="home">Retour à l'accueil</button></div>`;
  showScreen('result'); sfx.finish();
}

/* ---- carnet ---- */
function pips(id){
  const c = card(id);
  if(!c) return `<span class="newtag">Pas encore vu</span>`;
  return `<span class="pips" aria-label="Niveau ${c.b} sur 5">${[1,2,3,4,5].map(i=>`<i class="${i<=c.b?'on':''}"></i>`).join('')}</span>`;
}
function itemHTML(s){
  return `<button class="item" data-act="detail" data-id="${s.id}">${tile(s.id)}<span>${esc(s.name)}</span>${s.ext?'<em class="ext-tag">Norme 2017</em>':''}${pips(s.id)}</button>`;
}
function renderCarnet(){
  const act = ACTIVE(), confs = myConfusions();
  if(carnetCat==='ext' && !st.opt.ext) carnetCat = 'all';
  if(carnetCat==='conf' && !confs.length) carnetCat = 'all';
  const chip = (k,label,n) => `<button class="chip" data-act="carnet-cat" data-cat="${k}" aria-pressed="${carnetCat===k}">${esc(label)}<small>${n}</small></button>`;
  const extRow = `<div class="ext-row"><div><b>Symboles de la norme 2017</b><small>${EXT_COUNT} symboles des cartes récentes absents de ta fiche. Activés, ils entrent dans le circuit du jour et les autres modes.</small></div><button class="switch" role="switch" aria-checked="${st.opt.ext}" aria-label="Activer les symboles de la norme 2017" data-act="toggle-ext"><span></span></button></div>`;
  let body;
  if(carnetCat==='conf'){
    body = `<div class="carnet-cat"><b>Tes confusions</b><p class="muted small">Les paires que tu as déjà mélangées, de la plus fréquente à la plus rare. Touche un symbole pour relire son explication.</p><button class="btn-ghost" data-act="start-duel">Duel sur mes confusions</button></div>
      <div class="pairs">${confs.slice(0,30).map(c=>`<div class="pair">${itemHTML(BY_ID[c.pair[0]])}<span class="vs">ou</span>${itemHTML(BY_ID[c.pair[1]])}<small>Confondus ${c.n} ${plural(c.n,'fois','fois')}</small></div>`).join('')}</div>`;
  } else {
    const list = carnetCat==='all' ? act : carnetCat==='ext' ? SYMBOLS.filter(s=>s.ext) : act.filter(s=>s.cat===carnetCat);
    const head = carnetCat==='all'
      ? `${extRow}<p class="muted small" style="margin-bottom:12px">Touche un symbole pour savoir ce qu'il veut dire et ce que tu verras sur le terrain. Les pastilles montrent ton niveau, de 1 à 5.</p>`
      : carnetCat==='ext'
      ? `${extRow}<div class="carnet-cat"><b>Norme 2017</b><p class="muted small">Les cartes du jeu suivent la norme ISOM 2017, qui compte quelques symboles absents de ta fiche. Ceux-ci en font partie.</p></div>`
      : `<div class="carnet-cat"><b>${esc(CAT[carnetCat].label)}</b><p class="muted small">${esc(CAT[carnetCat].tip)}</p><button class="btn-ghost" data-act="train" data-cat="${carnetCat}">S'entraîner sur cette famille</button></div>`;
    body = `${head}<div class="grid">${list.map(itemHTML).join('')}</div>`;
  }
  $('#screen-carnet').innerHTML = `
    <div class="sub-head"><button class="icon-btn" data-act="home" aria-label="Retour à l'accueil">${ICONS.back}</button><h1 class="h1">Carnet de légende</h1></div>
    <div class="chips" role="group" aria-label="Familles de symboles">${chip('all','Tout',act.length)}${confs.length?chip('conf','Mes confusions',confs.length):''}${CATS.map(c=>chip(c.k,c.short,act.filter(s=>s.cat===c.k).length)).join('')}${st.opt.ext?chip('ext','Norme 2017',EXT_COUNT):''}</div>
    ${body}`;
}

/* ---- feuilles ---- */
let sheetPaused = false;
function openSheet(html, label){
  $('#sheet-body').innerHTML = html;
  $('#sheet-body').setAttribute('aria-label', label || 'Détail');
  $('#sheet').hidden = false;
  if(session && !session.over && clock.running){ clock.pause(); sheetPaused = true; }
}
function closeSheet(){
  $('#sheet').hidden = true; $('#sheet-body').innerHTML = '';
  if(sheetPaused && session && !session.over && $('#fb').hidden && !session.waiting) clock.start();
  sheetPaused = false;
}
function explHTML(id){
  const e = EXPL[id]; if(!e) return '';
  return `<div class="expl"><section><h3>Ce que c'est</h3><p>${esc(e[0])}</p></section><section class="ter"><h3>Sur le terrain</h3><p>${esc(e[1])}</p></section></div>`;
}
function openDetail(id){
  const s = BY_ID[id], c = card(id), t = dayIndex();
  const status = !c ? 'Pas encore vu' : c.b>=4 ? `Maîtrisé (niveau ${c.b} sur 5)` : `En cours, niveau ${c.b} sur 5`;
  const nextTxt = !c ? '' : c.d<=t ? "À réviser aujourd'hui" : c.d===t+1 ? 'Demain' : `Dans ${c.d-t} jours`;
  const inkTxt = s.ink ? INKS[s.ink].label : 'Plusieurs couleurs';
  // confusions personnelles d'abord, puis les paires pièges connues
  const mine = myConfusions().filter(x=>x.pair.includes(id)).map(x=>({o:x.pair[0]===id?x.pair[1]:x.pair[0], n:x.n}));
  const known = PAIRS.filter(p=>p.includes(id)).map(p=>({o:p[0]===id?p[1]:p[0], n:0})).filter(x=>!mine.some(m=>m.o===x.o));
  const others = mine.concat(known).filter(x=>BY_ID[x.o] && isActive(BY_ID[x.o])).slice(0,4);
  const confBlock = others.length ? `
    <h3 class="sub-h">${mine.length ? 'Tu le confonds avec' : 'À ne pas confondre avec'}</h3>
    <div class="confs">${others.map(x=>`<button class="conf-row" data-act="detail" data-id="${x.o}">${tile(x.o)}<span><b>${esc(BY_ID[x.o].name)}</b><small>${x.n ? `Confondus ${x.n} fois` : 'Symbole proche'}</small></span></button>`).join('')}</div>
    <button class="btn-ghost" data-act="duel-focus" data-id="${id}">Duel sur ces symboles</button>` : '';
  openSheet(`
    <div class="sheet-head"><p class="sheet-eyebrow">${esc(CAT[s.cat].label)}${s.ext?' · norme 2017':''}</p><button class="icon-btn" data-act="close-sheet" aria-label="Fermer">${ICONS.close}</button></div>
    ${tile(id,'xl')}
    <h2 class="detail-name">${esc(s.name)}</h2>
    ${explHTML(id)}
    ${confBlock}
    <dl class="facts">
      <div><dt>Couleur</dt><dd>${inkTxt}</dd></div>
      <div><dt>Ton niveau</dt><dd>${status}</dd></div>
      ${nextTxt ? `<div><dt>Prochaine révision</dt><dd>${nextTxt}</dd></div>` : ''}
      ${c ? `<div><dt>Réponses</dt><dd>${c.c} ${plural(c.c,'juste','justes')} · ${c.w} ${plural(c.w,'fausse','fausses')}</dd></div>` : ''}
    </dl>`, s.name);
}
function openTrainingPicker(){
  openSheet(`
    <div class="sheet-head"><p class="sheet-eyebrow">Entraînement par famille</p><button class="icon-btn" data-act="close-sheet" aria-label="Fermer">${ICONS.close}</button></div>
    <p class="muted small">10 questions, sans chrono, en commençant par les symboles que tu connais le moins.</p>
    <div class="pick">${CATS.map(c=>{ const ids=ACTIVE().filter(s=>s.cat===c.k); const m=ids.filter(s=>card(s.id)&&card(s.id).b>=4).length; const sn=ids.filter(s=>card(s.id)).length; return `<button class="cat-row" data-act="train" data-cat="${c.k}">${tile(c.rep,'',c.label)}<b>${esc(c.label)}</b><span class="bar" aria-hidden="true"><i class="m" style="width:${(m/ids.length*100).toFixed(1)}%"></i><i class="s" style="width:${((sn-m)/ids.length*100).toFixed(1)}%"></i></span><span class="count">${m}/${ids.length}</span></button>`; }).join('')}</div>`, 'Choisir une famille');
}
function openQuitConfirm(){
  const sprint = session.mode==='sprint';
  openSheet(`
    <div class="sheet-head"><p class="sheet-eyebrow">${({sprint:'Sprint', train:'Entraînement', map:'Lecture de carte', tap:'Touche la carte', recall:'Rappel sans choix', duel:'Duels'})[session.mode] || 'Circuit'} en pause</p></div>
    <h2 class="detail-name">${sprint ? 'Arrêter le sprint ?' : 'Abandonner ?'}</h2>
    <p class="muted">Tes réponses sont gardées pour les révisions, mais ${sprint ? 'le score ne sera pas enregistré' : session.mode==='circuit' ? 'le circuit ne comptera pas pour ta série' : 'la série s’arrête là'}.</p>
    <div class="res-actions"><button class="btn-primary" data-act="close-sheet">Reprendre</button><button class="btn-ghost" data-act="abandon">${sprint ? 'Arrêter' : 'Abandonner'}</button></div>`, 'Pause');
}
function openResetConfirm(){
  openSheet(`
    <div class="sheet-head"><p class="sheet-eyebrow">Progression</p><button class="icon-btn" data-act="close-sheet" aria-label="Fermer">${ICONS.close}</button></div>
    <h2 class="detail-name">Tout remettre à zéro ?</h2>
    <p class="muted">Tes niveaux sur les ${ACTIVE().length} symboles, ta série, tes badges, tes confusions et tes records seront effacés. On ne peut pas revenir en arrière.</p>
    <div class="res-actions"><button class="btn-danger" data-act="reset-confirm">Oui, tout effacer</button><button class="btn-ghost" data-act="close-sheet">Garder ma progression</button></div>`, 'Remise à zéro');
}
function openInfo(title, text){
  openSheet(`
    <div class="sheet-head"><p class="sheet-eyebrow">${esc(title)}</p><button class="icon-btn" data-act="close-sheet" aria-label="Fermer">${ICONS.close}</button></div>
    <p style="margin:10px 0 4px">${esc(text)}</p>
    <div class="res-actions"><button class="btn-primary" data-act="close-sheet">Compris</button></div>`, title);
}
function openBadge(k){
  const b = BADGES.find(x=>x.k===k); if(!b) return;
  const at = st.badges[k];
  let prog = '';
  if(!at){
    if(b.rep){ const c = CATS.find(x=>'fam-'+x.k===k), ids = ACTIVE().filter(s=>s.cat===c.k), m = ids.filter(s=>card(s.id)&&card(s.id).b>=4).length; prog = `${m} sur ${ids.length} symboles maîtrisés pour l'instant.`; }
    else if(k==='serie-7' || k==='serie-30'){ prog = `Ta série actuelle : ${getStreak()} ${plural(getStreak(),'jour','jours')}.`; }
    else if(k==='semaine'){ prog = `Cette semaine : ${weekInfo().n} sur ${WEEK_GOAL}.`; }
  }
  const date = at ? new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(at)) : '';
  openSheet(`
    <div class="sheet-head"><p class="sheet-eyebrow">Badge</p><button class="icon-btn" data-act="close-sheet" aria-label="Fermer">${ICONS.close}</button></div>
    <div class="badge-detail">${badgeIcon(b, !!at)}<h2 class="detail-name">${esc(b.name)}</h2><p>${esc(b.desc)}</p><p class="muted small">${at ? `Débloqué le ${date}.` : esc(prog || 'Pas encore débloqué.')}</p></div>`, b.name);
}
function openIntro(){
  prefs.intro = true; savePrefs();
  const sec = (ic, title, text) => `<section><span class="ic">${ic}</span><div><h3>${title}</h3><p>${text}</p></div></section>`;
  openSheet(`
    <div class="sheet-head"><p class="sheet-eyebrow">Comment ça marche</p><button class="icon-btn" data-act="close-sheet" aria-label="Fermer">${ICONS.close}</button></div>
    <h2 class="detail-name">Bienvenue sur Poste 31</h2>
    <div class="intro">
      ${sec(ICONS.map, 'Le circuit du jour', "Chaque jour, un circuit d'environ 14 postes : chaque poste est une question sur un symbole. Avant le départ, la zone de pré-départ te présente les nouveaux symboles du jour.")}
      ${sec(ICONS.close, 'Le poste manquant', "Une mauvaise réponse est un poste manquant, ou PM, comme en course : le symbole revient un peu plus loin et tu dois le pointer pour finir le circuit.")}
      ${sec(ICONS.carnet, 'Tes niveaux de 1 à 5', "Chaque symbole a un niveau. Une bonne réponse le fait monter et il revient plus tard (1, 2, 4, 8 puis 16 jours). Une erreur le renvoie au niveau 1 et il revient vite. À partir du niveau 4, il est maîtrisé.")}
      ${sec(ICONS.duel, 'Les autres modes', "Sprint, lecture de carte, touche la carte, rappel sans choix, duels sur tes confusions et entraînement par famille : ils complètent le circuit du jour.")}
      ${sec(ICONS.sprint, 'Ta série et tes objectifs', "Ta série avance chaque jour où tu cours le circuit du jour. Vise 5 circuits par semaine, monte de niveau et débloque des badges.")}
    </div>
    <div class="res-actions"><button class="btn-primary" data-act="close-sheet">C'est parti</button></div>`, 'Comment ça marche');
}

/* =========================================================
   Événements
   ========================================================= */
function goHome(){ session = null; stopTick(); clock.reset(); hideFeedback(); closeSheet(); renderHome(); showScreen('home'); }
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if(!el){ if(e.target === $('#sheet') && !(session && !session.over && $('#sheet-body').getAttribute('aria-label')==='Pause')) closeSheet(); return; }
  const act = el.dataset.act;
  switch(act){
    case 'start-circuit': audio(); startCircuit(); break;
    case 'go': audio(); go(true); break;
    case 'start-sprint': audio(); startSprint(); break;
    case 'start-map': audio(); startMapGame(); break;
    case 'start-tap': audio(); startTap(); break;
    case 'start-recall': audio(); startRecall(); break;
    case 'start-duel': audio(); startDuel(); break;
    case 'duel-focus': audio(); startDuel(el.dataset.id); break;
    case 'reveal': reveal(); break;
    case 'self': selfGrade(el.dataset.v==='1'); break;
    case 'map-retry': { const m = el.dataset.m; delete mapState[m]; loadMap(m); onMapState(m); break; }
    case 'skip-q': if(session && !session.over){ session.mapWait = false; next(); } break;
    case 'toggle-ext': st.opt.ext = !st.opt.ext; st.opt.extT = Date.now(); touch(); renderCarnet(); break;
    case 'badge': openBadge(el.dataset.k); break;
    case 'help': openIntro(); break;
    case 'auth-tab': setAuthTab(el.dataset.tab); break;
    case 'logout': openLogoutConfirm(); break;
    case 'logout-confirm': logout(); break;
    case 'pick-training': openTrainingPicker(); break;
    case 'train': audio(); startTraining(el.dataset.cat); break;
    case 'ans': answer(el.dataset.v, el); break;
    case 'continue': if(!$('#fb').hidden) next(); break;
    case 'quit': if(session && !session.over) openQuitConfirm(); break;
    case 'abandon': flushCloud(); goHome(); break;
    case 'home': flushCloud(); goHome(); break;
    case 'open-carnet': carnetCat = el.dataset.cat || 'all'; renderCarnet(); showScreen('carnet'); break;
    case 'carnet-cat': carnetCat = el.dataset.cat; renderCarnet(); break;
    case 'detail': openDetail(el.dataset.id); break;
    case 'close-sheet': closeSheet(); break;
    case 'sound': prefs.sound = !prefs.sound; savePrefs(); if(prefs.sound){ audio(); sfx.punch(); } renderHome(); break;
    case 'reset': openResetConfirm(); break;
    case 'reset-confirm': { const now = Date.now(); st = blankState(); st.resetAt = now; st.updatedAt = now; saveLocal(); flushCloud(); closeSheet(); renderHome(); break; }
  }
});
document.addEventListener('keydown', e => {
  if(e.key==='Escape' && !$('#sheet').hidden){ closeSheet(); return; }
  if(!session || $('#screen-quiz').hidden) return;
  if(!$('#fb').hidden){ if((e.key==='Enter' || e.key===' ') && document.activeElement !== $('#fb-go')){ e.preventDefault(); next(); } return; }
  if(!$('#sheet').hidden) return;
  const it = session.queue[session.pos];
  if(it && it.type==='recall'){
    if(!it.revealed && (e.key==='Enter' || e.key===' ')){ e.preventDefault(); reveal(); }
    else if(it.revealed && (e.key==='1' || e.key==='2')){ selfGrade(e.key==='1'); }
    return;
  }
  const n = parseInt(e.key,10);
  if(n>=1 && n<=4){ const b = $$('#screen-quiz .opts [data-act="ans"]')[n-1]; if(b && !b.disabled) answer(b.dataset.v, b); }
});
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState==='hidden'){
    if(session && !session.over) clock.pause();
    flushCloud();
  } else {
    if(session && !session.over && !session.waiting && $('#fb').hidden && $('#sheet').hidden && !session.locked) clock.start();
    if(!session) pullCloud();
  }
});

/* =========================================================
   Écrans de connexion
   ========================================================= */
const normUser = s => String(s||'').trim().toLowerCase();
const normAnswer = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
const USER_RE = /^[a-z0-9][a-z0-9._-]{2,19}$/;
const AUTH_ERR = {
  bad_username:"Le pseudo doit faire 3 à 20 caractères : lettres sans accent, chiffres, point, tiret ou tiret bas, en commençant par une lettre ou un chiffre.",
  bad_password:'Le mot de passe doit faire au moins 6 caractères.',
  bad_question:'Choisis une question secrète (au moins 5 caractères).',
  bad_answer_signup:'Écris ta réponse secrète.',
  taken:'Ce pseudo est déjà pris : essaie une variante.',
  busy:"Beaucoup d'inscriptions en ce moment : réessaie dans une heure.",
  bad_credentials:'Pseudo ou mot de passe incorrect.',
  unknown_user:'Aucun compte avec ce pseudo.',
  bad_answer:"Ce n'est pas la bonne réponse.",
  network:'Impossible de joindre le serveur. Vérifie ta connexion, puis réessaie.',
  server:'Le serveur ne répond pas pour le moment. Réessaie dans quelques minutes.',
  http:'Le serveur a refusé la demande. Les réglages du site sont peut-être incomplets.',
};
function errText(r, ctx){
  if(r.error==='locked') return `Trop d'essais ratés : attends ${r.minutes||10} ${plural(r.minutes||10,'minute','minutes')} avant de réessayer.`;
  if(ctx==='signup' && r.error==='bad_answer') return AUTH_ERR.bad_answer_signup;
  return AUTH_ERR[r.error] || 'Une erreur est survenue, réessaie.';
}
function formMsg(id, text, kind){ const el = $('#'+id); if(!el) return; el.textContent = text || ''; el.className = 'form-msg' + (kind ? ' '+kind : ''); }
function setBusy(form, busy, label){
  const b = form.querySelector('button[type="submit"]');
  if(!b) return;
  if(busy){ b.dataset.label = b.textContent; b.textContent = label || 'Un instant…'; b.disabled = true; }
  else { b.textContent = b.dataset.label || b.textContent; b.disabled = false; }
}
let recoverUser = null;
function setAuthTab(tab){
  for(const t of ['login','signup','recover']) $('#form-'+t).hidden = (t!==tab);
  $('#tab-login').setAttribute('aria-selected', String(tab==='login'));
  $('#tab-signup').setAttribute('aria-selected', String(tab==='signup'));
  $('.tabs').hidden = (tab==='recover');
  ['login-msg','su-msg','rc-msg'].forEach(id=>formMsg(id,''));
  if(tab==='recover'){
    recoverUser = null; $('#rc-step2').hidden = true; $('#rc-user').disabled = false;
    $('#rc-btn').textContent = 'Voir ma question';
    const lu = $('#login-user').value; if(lu && !$('#rc-user').value) $('#rc-user').value = lu;
  }
  const first = $('#form-'+tab).querySelector('input:not([disabled])');
  if(first && window.innerWidth > 700) first.focus();
}
function showAuth(tab, msg){
  me = null; st = blankState();
  showScreen('auth');
  setAuthTab(tab || 'login');
  if(msg) formMsg({login:'login-msg', signup:'su-msg', recover:'rc-msg'}[tab||'login'], msg, 'info');
}
function enterApp(username, token){
  if(token) setToken(token);
  me = username;
  try{ localStorage.setItem(LS_KEY + '.last', username); }catch(e){}
  st = loadLocal(username);
  syncState = 'wait';
  renderHome(); showScreen('home');
  pullCloud();
  if(!prefs.intro) setTimeout(openIntro, 400);
}
function sessionLost(){
  const u = me;
  clearToken();
  if(session){ session = null; stopTick(); clock.reset(); hideFeedback(); }
  closeSheet();
  showAuth('login', "Ta connexion n'est plus valable : reconnecte-toi pour continuer. Ta progression sur cet appareil est gardée.");
  if(u) $('#login-user').value = u;
}
async function logout(){
  await flushCloud();
  const token = getToken(), u = me, synced = syncState==='cloud';
  if(token) rpc('p31_logout', {p_token: token});
  clearToken();
  // on ne garde la copie locale que si elle n'a pas pu partir sur le serveur
  if(u && synced){ try{ localStorage.removeItem(localKey(u)); }catch(e){} }
  closeSheet();
  showAuth('login', 'Tu es déconnecté. À bientôt !');
}
function openLogoutConfirm(){
  openSheet(`
    <div class="sheet-head"><p class="sheet-eyebrow">Compte</p><button class="icon-btn" data-act="close-sheet" aria-label="Fermer">${ICONS.close}</button></div>
    <h2 class="detail-name">Se déconnecter ?</h2>
    <p class="muted">Ta progression est sauvegardée sur ton compte ${esc(me||'')}. Tu la retrouveras en te reconnectant avec ton pseudo et ton mot de passe.</p>
    <div class="res-actions"><button class="btn-primary" data-act="logout-confirm">Me déconnecter</button><button class="btn-ghost" data-act="close-sheet">Rester connecté</button></div>`, 'Déconnexion');
}

$('#form-login').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.currentTarget, u = normUser($('#login-user').value), pw = $('#login-pass').value;
  if(!u || !pw){ formMsg('login-msg', 'Écris ton pseudo et ton mot de passe.', 'err'); return; }
  setBusy(f, true, 'Connexion…'); formMsg('login-msg', '');
  const r = await rpc('p31_login', {p_username:u, p_password:pw});
  setBusy(f, false);
  if(!r.ok){ formMsg('login-msg', errText(r, 'login'), 'err'); return; }
  $('#login-pass').value = '';
  audio(); enterApp(r.username, r.token);
});
$('#form-signup').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.currentTarget, u = normUser($('#su-user').value), pw = $('#su-pass').value, pw2 = $('#su-pass2').value;
  const qSel = $('#su-q').value, q = (qSel==='__other' ? $('#su-q-other').value : qSel).trim(), a = normAnswer($('#su-a').value);
  let err = '';
  if(!USER_RE.test(u)) err = AUTH_ERR.bad_username;
  else if(pw.length < 6) err = AUTH_ERR.bad_password;
  else if(pw !== pw2) err = 'Les deux mots de passe ne sont pas identiques.';
  else if(q.length < 5) err = AUTH_ERR.bad_question;
  else if(!a) err = AUTH_ERR.bad_answer_signup;
  if(err){ formMsg('su-msg', err, 'err'); return; }
  setBusy(f, true, 'Création du compte…'); formMsg('su-msg', '');
  const r = await rpc('p31_signup', {p_username:u, p_password:pw, p_question:q, p_answer:a});
  setBusy(f, false);
  if(!r.ok){ formMsg('su-msg', errText(r, 'signup'), 'err'); return; }
  ['su-pass','su-pass2','su-a'].forEach(id=>$('#'+id).value='');
  audio(); enterApp(r.username, r.token);
});
$('#form-recover').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.currentTarget;
  if(!recoverUser){
    const u = normUser($('#rc-user').value);
    if(!u){ formMsg('rc-msg', 'Écris ton pseudo.', 'err'); return; }
    setBusy(f, true, 'Recherche…');
    const r = await rpc('p31_question', {p_username:u});
    setBusy(f, false);
    if(!r.ok){ formMsg('rc-msg', errText(r, 'recover'), 'err'); return; }
    recoverUser = u;
    $('#rc-question').textContent = r.question;
    $('#rc-step2').hidden = false; $('#rc-user').disabled = true;
    $('#rc-btn').textContent = 'Changer mon mot de passe';
    formMsg('rc-msg', '');
    $('#rc-a').focus();
    return;
  }
  const a = normAnswer($('#rc-a').value), pw = $('#rc-pass').value;
  if(!a){ formMsg('rc-msg', 'Écris ta réponse secrète.', 'err'); return; }
  if(pw.length < 6){ formMsg('rc-msg', AUTH_ERR.bad_password, 'err'); return; }
  setBusy(f, true, 'Vérification…');
  const r = await rpc('p31_recover', {p_username:recoverUser, p_answer:a, p_new_password:pw});
  setBusy(f, false);
  if(!r.ok){ formMsg('rc-msg', errText(r, 'recover'), 'err'); return; }
  ['rc-a','rc-pass'].forEach(id=>$('#'+id).value='');
  audio(); enterApp(r.username, r.token);
});
$('#su-q').addEventListener('change', e => { const other = e.target.value==='__other'; $('#su-q-other-wrap').hidden = !other; if(other) $('#su-q-other').focus(); });
document.addEventListener('change', e => {
  const t = e.target;
  if(t.matches && t.matches('input[data-show]')) t.dataset.show.split(',').forEach(id=>{ const i = $('#'+id); if(i) i.type = t.checked ? 'text' : 'password'; });
});

/* ---- lancement ---- */
async function boot(){
  if(!CONFIGURED){ showScreen('setup'); return; }
  const token = getToken();
  if(!token){ showAuth('login'); return; }
  let last = null; try{ last = localStorage.getItem(LS_KEY + '.last'); }catch(e){}
  if(last){ me = last; st = loadLocal(last); renderHome(); showScreen('home'); }   // affichage immédiat, même hors connexion
  const r = await rpc('p31_me', {p_token: token});
  if(r.ok){ enterApp(r.username); return; }
  if(r.error==='no_session'){ clearToken(); showAuth('login', "Ta connexion n'est plus valable : reconnecte-toi."); return; }
  if(last) setSync('offline');
  else showAuth('login', errText(r, 'login'));
}
boot();
})();
