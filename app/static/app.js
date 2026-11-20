"use strict";
/* ---------- 도우미 ---------- */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const num=(v,d=0)=>{const n=parseFloat(v);return isFinite(n)?n:d};
const won=n=>Math.round(n).toLocaleString("ko-KR");
let uid=1; const nid=()=>"i"+(uid++)+Math.random().toString(36).slice(2,6);
function h(t,a,...c){const e=document.createElement(t);a=a||{};for(const k in a){const v=a[k];if(k==="class")e.className=v;else if(k==="text")e.textContent=v;else if(k.startsWith("on"))e.addEventListener(k.slice(2),v);else if(v===true)e.setAttribute(k,"");else if(v!==false&&v!=null)e.setAttribute(k,v);}
  for(const x of c.flat())if(x!=null&&x!==false)e.append(x);return e;}
function sv(t,a){const e=document.createElementNS("http://www.w3.org/2000/svg",t);for(const k in a)if(a[k]!=null)e.setAttribute(k,a[k]);return e;}
function sel(opts,val,on,id){const s=h("select",{id,onchange:e=>on(e.target.value)},opts.map(([v,l])=>h("option",{value:v,text:l})));s.value=val;return s;}
function inp(type,val,on,extra){return h("input",Object.assign({type,value:val,onchange:e=>on(e.target.value)},extra||{}));}
function fld(label,control){return h("label",{class:"f"},label,control);}
function chk(label,val,on,id){return h("label",{class:"row",style:"gap:6px"},h("input",{type:"checkbox",id,checked:!!val,onchange:e=>on(e.target.checked)}),label);}

/* ---------- 기준 자료 (모두 화면에서 수정 가능) ---------- */
const STYLES={
  modern:{name:"모던",en:"modern",desc:"무채색 바탕, 직선, 포인트 블랙",floor:"f_porcelain",wall:"w_paint",ceiling:"c_paint",tones:{main:"#8b9097",wood:"#6b5a4c",accent:"#22303f",dark:"#23262b",white:"#eceff1"}},
  nordic:{name:"북유럽",en:"Scandinavian",desc:"밝은 원목, 화이트, 파스텔",floor:"f_gangmaru",wall:"w_silk",ceiling:"c_paper",tones:{main:"#c9d2d6",wood:"#d2b48c",accent:"#7fa3a0",dark:"#5c6770",white:"#f4f3ef"}},
  minimal:{name:"미니멀",en:"minimalist",desc:"색·가구 최소화, 여백",floor:"f_gangmaru",wall:"w_paint",ceiling:"c_paint",tones:{main:"#dcdad5",wood:"#c8b89e",accent:"#a9a59c",dark:"#4a4a48",white:"#f6f5f2"}},
  natural:{name:"내추럴 우드",en:"warm natural wood",desc:"따뜻한 나무결, 린넨, 식물",floor:"f_wood",wall:"w_silk",ceiling:"c_paper",tones:{main:"#c9b79c",wood:"#a67c52",accent:"#6f8f5f",dark:"#5a4636",white:"#f1ebdf"}},
  industrial:{name:"인더스트리얼",en:"industrial loft",desc:"노출 천장, 금속, 콘크리트",floor:"f_epoxy",wall:"w_paint",ceiling:"c_exposed",tones:{main:"#6f6b66",wood:"#7a5b3e",accent:"#b0562f",dark:"#1f1f21",white:"#cfcbc4"}},
  classic:{name:"클래식",en:"classic European",desc:"몰딩, 짙은 목재, 대칭 배치",floor:"f_wood",wall:"w_silk",ceiling:"c_gypsum",tones:{main:"#8a7a6a",wood:"#5c3d2a",accent:"#7a2f36",dark:"#33261e",white:"#efe6d6"}},
  japandi:{name:"재팬디",en:"Japandi",desc:"낮은 가구, 차분한 흙빛",floor:"f_gangmaru",wall:"w_paint",ceiling:"c_paper",tones:{main:"#b8ab98",wood:"#b08d62",accent:"#55604f",dark:"#3a3530",white:"#efe9de"}}
};
const SPACES={living:"거실",bedroom:"침실·방",kitchen:"주방",bath:"욕실",entry:"현관",balcony:"발코니",dress:"드레스룸",office:"사무실",cafe:"카페·상가"};
const SPACE_EN={living:"living room",bedroom:"bedroom",kitchen:"kitchen",bath:"bathroom",entry:"entrance hall",balcony:"balcony",dress:"walk-in closet",office:"office",cafe:"cafe"};
// price: 재료 단가(원/㎡, 시세 참고값) · pum: 품(인/㎡, 표준품셈 방식 기본값)
const MAT={
  f_gangmaru:{g:"floor",name:"강마루",en:"light oak engineered wood floor",spec:"7.5T 접착 시공",grade:"중급",price:38000,trade:"내장공",pum:0.045,color:"#c8a67a",pat:"plank"},
  f_ganghwa:{g:"floor",name:"강화마루",en:"laminate wood floor",spec:"8T 클릭 시공",grade:"보급",price:25000,trade:"내장공",pum:0.035,color:"#d4b68c",pat:"plank"},
  f_wood:{g:"floor",name:"원목마루",en:"solid oak hardwood floor",spec:"오크 14T",grade:"고급",price:115000,trade:"내장공",pum:0.06,color:"#9c6f44",pat:"plank"},
  f_porcelain:{g:"floor",name:"포세린 타일",en:"matte grey 600mm porcelain tile floor",spec:"600×600 무광",grade:"고급",price:45000,trade:"타일공",pum:0.11,color:"#b9bcbf",pat:"tile"},
  f_jangpan:{g:"floor",name:"장판(모노륨)",en:"beige sheet vinyl floor",spec:"2.2T",grade:"보급",price:17000,trade:"내장공",pum:0.02,color:"#d9c7a6",pat:"plain"},
  f_deco:{g:"floor",name:"데코타일",en:"wood-look vinyl tile floor",spec:"3T 우드 패턴",grade:"보급",price:15000,trade:"내장공",pum:0.03,color:"#a98f6f",pat:"plank"},
  f_epoxy:{g:"floor",name:"에폭시 코팅",en:"grey epoxy coated concrete floor",spec:"하도+상도",grade:"중급",price:22000,trade:"도장공",pum:0.04,color:"#7d8185",pat:"plain"},
  w_paper:{g:"wall",name:"합지 벽지",en:"off-white wallpaper",spec:"소폭 합지",grade:"보급",price:3500,trade:"도배공",pum:0.025,color:"#efece6"},
  w_silk:{g:"wall",name:"실크 벽지",en:"warm white textured wallpaper",spec:"초배 포함",grade:"중급",price:6500,trade:"도배공",pum:0.035,color:"#f2efe9"},
  w_paint:{g:"wall",name:"수성 페인트",en:"smooth matte painted walls",spec:"친환경 2회 도장, 퍼티 포함",grade:"중급",price:5500,trade:"도장공",pum:0.05,color:"#e9eaec"},
  w_tile:{g:"wall",name:"벽 타일",en:"300x600 ceramic wall tiles",spec:"300×600 도기질",grade:"중급",price:30000,trade:"타일공",pum:0.12,color:"#dfe3e6"},
  w_film:{g:"wall",name:"인테리어 필름",en:"matte solid-color wall panels",spec:"무광 솔리드",grade:"중급",price:12000,trade:"내장공",pum:0.06,color:"#d8d4cc"},
  w_temba:{g:"wall",name:"템바보드",en:"fluted wood wall panels",spec:"MDF 반달 + 도장",grade:"고급",price:45000,trade:"건축목공",pum:0.08,color:"#cdbfa8"},
  c_paper:{g:"ceiling",name:"천장 도배(합지)",en:"white wallpapered ceiling",spec:"기존 천장 위",grade:"보급",price:3500,trade:"도배공",pum:0.03,color:"#f7f6f2"},
  c_paint:{g:"ceiling",name:"천장 수성 페인트",en:"white painted ceiling",spec:"2회 도장",grade:"중급",price:5500,trade:"도장공",pum:0.055,color:"#f3f4f5"},
  c_gypsum:{g:"ceiling",name:"석고보드 천장 신설",en:"new flat gypsum ceiling with recessed downlights",spec:"경량 천장틀 + 9.5T 2겹 + 도배",grade:"고급",price:21000,trade:"내장공",pum:0.11,color:"#f6f3ec"},
  c_exposed:{g:"ceiling",name:"노출 천장 도장",en:"exposed dark painted concrete ceiling",spec:"뿜칠 도장",grade:"중급",price:7000,trade:"도장공",pum:0.05,color:"#3c3f44"}
};
const GROUPS={floor:"바닥",wall:"벽",ceiling:"천장"};
// 대한건설협회 건설업 임금실태조사(시중노임단가) 일당. 'pub' = 2026년 상반기 공표값, 'est' = 추정값(확인 필요)
const RATES0={보통인부:{v:172068,src:"pub"},도배공:{v:227614,src:"pub"},내장공:{v:256883,src:"pub"},도장공:{v:263017,src:"pub"},타일공:{v:290939,src:"pub"},
  건축목공:{v:285000,src:"est"},내선전공:{v:280000,src:"est"},배관공:{v:240000,src:"est"},방수공:{v:215000,src:"est"}};
const FURN_PRESETS=[["소파",2200,900,800,"main"],["1인 소파",850,850,800,"accent"],["커피 테이블",1100,600,400,"wood"],["TV장",1800,400,450,"wood"],["식탁",1400,800,750,"wood"],["의자",450,450,850,"dark"],["침대(퀸)",1600,2050,500,"white"],["침대(싱글)",1100,2050,500,"white"],["협탁",450,400,500,"wood"],["옷장",2000,600,2200,"white"],["책상",1400,700,720,"wood"],["책장",900,300,1800,"wood"],["수납장",1200,450,900,"white"],["신발장",1200,350,2200,"white"],["아일랜드",1600,800,900,"white"],["냉장고",900,750,1800,"dark"],["세탁기",650,650,900,"white"],["화분",400,400,1100,"accent"]];
// 가구 구매 단가(원, 시세 참고값). 0 = 견적에서 제외(가전·설비·별도 항목)
const PRICE={"소파":1200000,"1인 소파":450000,"커피 테이블":250000,"TV장":350000,"식탁":600000,"의자":120000,"침대(퀸)":900000,"침대(싱글)":500000,"협탁":120000,"옷장":900000,"책상":300000,"책장":250000,"수납장":300000,"신발장":450000,"아일랜드":800000,"화분":80000,"화장대":300000,"시스템 옷장":1500000,"회의 테이블":500000,"테이블":180000,"카운터":1200000,"진열장":400000,
  "냉장고":0,"세탁기":0,"싱크대 하부장":0,"욕조":0,"세면대":0,"양변기":0};
const furnPrice=n=>PRICE[n]!=null?PRICE[n]:300000;
// 포장 단위: [한 단위가 덮는 면적 ㎡, 단위명] (제품마다 다르므로 기본값, 수정 가능)
const PACK={f_gangmaru:[3.24,"박스"],f_ganghwa:[2.4,"박스"],f_wood:[1.6,"박스"],f_porcelain:[1.44,"박스(4장)"],f_jangpan:[1,"㎡"],f_deco:[3.3,"박스"],f_epoxy:[25,"세트"],
  w_paper:[6.6,"롤(소폭)"],w_silk:[16.5,"롤"],w_paint:[55,"통(18L, 2회)"],w_tile:[1.44,"박스(8장)"],w_film:[1,"㎡"],w_temba:[2.88,"장"],
  c_paper:[6.6,"롤(소폭)"],c_paint:[55,"통(18L, 2회)"],c_gypsum:[0.81,"장(2겹)"],c_exposed:[55,"통(18L)"]};
// 이케아 제품 카탈로그 (참고용). [id, 분류, 제품명, 설명, 가로, 깊이, 높이(mm), 참고가(원), 3D 모양, 색 계열]
// 규격·가격은 공식 자료와 대조하지 않은 참고값이다. 화면에서 고칠 수 있고, 구매 전 이케아 코리아에서 확인한다.
const CATS={sofa:"소파",arm:"암체어",bed:"침대",ward:"옷장",store:"수납",tv:"TV·거실장",table:"테이블",desk:"책상",chair:"의자",etc:"소품",gen:"일반·설비"};
const CATALOG=[
 ["kivik3","sofa","KIVIK 3인용 소파","패브릭, 넓은 팔걸이",2280,950,830,799000,"sofa","main"],
 ["vimle3","sofa","VIMLE 3인용 소파","모듈형, 커버 교체",2410,980,830,899000,"sofa","main"],
 ["soderhamn3","sofa","SÖDERHAMN 3인용 소파","낮고 깊은 좌석",1980,990,830,699000,"sofa","main"],
 ["ektorp3","sofa","EKTORP 3인용 소파","둥근 팔걸이",2180,880,880,549000,"sofa","white"],
 ["klippan2","sofa","KLIPPAN 2인용 소파","컴팩트",1800,880,660,299000,"sofa","main"],
 ["glostad2","sofa","GLOSTAD 2인용 소파","소형 공간용",1190,780,660,149000,"sofa","dark"],
 ["friheten","sofa","FRIHETEN 코너 소파베드","수납 겸용",2300,1510,660,699000,"sofa","dark"],
 ["poang","arm","POÄNG 암체어","자작나무 프레임",680,820,1000,99000,"sofa","accent"],
 ["strandmon","arm","STRANDMON 윙체어","높은 등받이",820,960,1010,299000,"sofa","accent"],
 ["ekero","arm","EKERÖ 암체어","컴팩트",700,730,750,199000,"sofa","accent"],
 ["malm_q","bed","MALM 침대 프레임 퀸","매트리스 160×200",1680,2090,1000,349000,"bed","wood"],
 ["malm_s","bed","MALM 침대 프레임 싱글","매트리스 90×200",1050,2090,1000,229000,"bed","wood"],
 ["hemnes_q","bed","HEMNES 침대 프레임 퀸","원목, 매트리스 160×200",1740,2110,1200,449000,"bed","white"],
 ["brimnes_q","bed","BRIMNES 수납 침대 퀸","서랍 4개",1660,2060,1110,449000,"bed","white"],
 ["neiden_s","bed","NEIDEN 침대 프레임 싱글","소나무",970,2060,650,69000,"bed","wood"],
 ["pax100","ward","PAX 옷장 100","여닫이문 2짝, 높이 201",1000,580,2010,320000,"ward","white"],
 ["pax150","ward","PAX 옷장 150","여닫이문 3짝, 높이 201",1500,580,2010,480000,"ward","white"],
 ["pax200","ward","PAX 옷장 200","여닫이문 4짝, 높이 201",2000,580,2010,640000,"ward","white"],
 ["kleppstad","ward","KLEPPSTAD 옷장","문 3짝",1170,550,1760,149000,"ward","white"],
 ["brimnes_w","ward","BRIMNES 옷장","문 3짝, 거울",1170,500,1900,229000,"ward","white"],
 ["kallax24","store","KALLAX 선반 유닛 2×4","8칸",770,390,1470,99900,"cube","white"],
 ["kallax44","store","KALLAX 선반 유닛 4×4","16칸",1470,390,1470,169000,"cube","white"],
 ["kallax41","store","KALLAX 선반 유닛 4×1","낮은 4칸",1470,390,420,59900,"cube","white"],
 ["billy80","store","BILLY 책장 80","선반 조절",800,280,2020,79900,"shelf","white"],
 ["billy40","store","BILLY 책장 40","좁은 폭",400,280,2020,59900,"shelf","white"],
 ["ivar","store","IVAR 선반 유닛","소나무 원목",800,300,1790,99000,"shelf","wood"],
 ["hemnes8","store","HEMNES 8칸 서랍장","원목",1600,500,960,399000,"drawer","white"],
 ["malm6","store","MALM 6칸 서랍장","와이드",1600,480,780,249000,"drawer","wood"],
 ["malm4","store","MALM 4칸 서랍장","",800,480,1000,149000,"drawer","wood"],
 ["hemnes_nt","store","HEMNES 협탁","서랍 1개",460,350,700,99000,"drawer","white"],
 ["trofast","store","TROFAST 수납 콤비네이션","아이 방 수납",990,440,560,89900,"cube","white"],
 ["eket","store","EKET 수납 콤비네이션","4칸",700,350,700,80000,"cube","white"],
 ["hemnes_shoe","store","HEMNES 신발장","2칸",890,300,1270,179000,"drawer","white"],
 ["besta180","tv","BESTÅ TV 장식장 180","문 3짝",1800,420,380,250000,"tv","white"],
 ["lack_tv","tv","LACK TV 장식장 160","오픈형",1600,350,360,49900,"tv","dark"],
 ["hemnes_tv","tv","HEMNES TV 장식장","서랍 2개",1480,470,570,299000,"tv","white"],
 ["lisabo","table","LISABO 식탁","물푸레 무늬목, 4인",1400,780,740,249000,"table","wood"],
 ["ekedalen","table","EKEDALEN 확장형 식탁","4~6인",1200,800,750,329000,"table","wood"],
 ["morbylanga","table","MÖRBYLÅNGA 식탁","참나무, 8인",2200,1000,740,899000,"table","wood"],
 ["melltorp","table","MELLTORP 식탁","화이트, 4인",1250,750,740,79900,"table","white"],
 ["lack_coffee","table","LACK 커피 테이블","선반 포함",900,550,450,29900,"table","wood"],
 ["listerby","table","LISTERBY 커피 테이블","참나무 무늬목",1400,600,450,299000,"table","wood"],
 ["lack_side","table","LACK 보조 테이블","",550,550,450,12900,"table","white"],
 ["micke","desk","MICKE 책상","서랍 포함",1050,500,750,99900,"table","white"],
 ["linnmon","desk","LINNMON/ADILS 책상","",1000,600,740,39900,"table","white"],
 ["lagkapten","desk","LAGKAPTEN/ALEX 책상","서랍 유닛 포함",1400,600,730,189000,"table","white"],
 ["bekant","desk","BEKANT 책상","사무용",1600,800,750,499000,"table","wood"],
 ["alex","desk","ALEX 서랍 유닛","5칸",360,580,700,99900,"drawer","white"],
 ["adde","chair","ADDE 의자","적층 가능",390,470,770,15000,"chair","dark"],
 ["odger","chair","ODGER 의자","",450,510,810,99900,"chair","dark"],
 ["lisabo_c","chair","LISABO 의자","물푸레",450,480,790,79900,"chair","wood"],
 ["stefan","chair","STEFAN 의자","원목",420,490,900,39900,"chair","dark"],
 ["markus","chair","MARKUS 사무용 의자","높은 등받이",620,600,1290,229000,"office","dark"],
 ["flintan","chair","FLINTAN 사무용 의자","",740,690,1140,129000,"office","dark"],
 ["fejka","etc","FEJKA 인조 식물","화분 포함",300,300,900,29900,"plant","accent"],
 ["hektar","etc","HEKTAR 플로어 스탠드","",320,320,1810,79900,"lamp","dark"],
 ["raskog","etc","RÅSKOG 카트","3단",350,450,780,49900,"box","dark"],
 ["forhoja","etc","FÖRHÖJA 주방 카트","자작나무",1000,430,900,149000,"box","wood"],
 ["g_fridge","gen","냉장고","견적 제외",900,750,1800,0,"box","dark"],
 ["g_wash","gen","세탁기","견적 제외",650,650,900,0,"box","white"],
 ["g_sink","gen","싱크대 하부장","싱크대 항목으로 견적",2400,600,850,0,"box","white"],
 ["g_island","gen","아일랜드","",1600,800,900,800000,"box","wood"],
 ["g_bathtub","gen","욕조","위생기구 항목으로 견적",1500,700,550,0,"box","white"],
 ["g_basin","gen","세면대","위생기구 항목으로 견적",600,450,850,0,"box","white"],
 ["g_toilet","gen","양변기","위생기구 항목으로 견적",400,700,750,0,"box","white"],
 ["g_custom","gen","직접 입력 가구","크기·단가를 직접 입력",1000,500,800,0,"box","main"]];
const CAT=Object.fromEntries(CATALOG.map(c=>[c[0],{id:c[0],cat:c[1],name:c[2],desc:c[3],w:c[4],d:c[5],h:c[6],price:c[7],kind:c[8],tone:c[9]}]));
const isIkea=f=>!!(f.sku&&CAT[f.sku]&&CAT[f.sku].cat!=="gen");
const ikeaUrl=n=>"https://www.ikea.com/kr/ko/search/?q="+encodeURIComponent(String(n).split(" ")[0]);
function fromCat(id,x,y,rot){const c=CAT[id],q=((Math.round((rot||0)/90)*90)%360+360)%360,sw=q%180===90;
  return {id:nid(),sku:id,name:c.name,kind:c.kind,w:sw?c.d:c.w,d:sw?c.w:c.d,h:c.h,x:x||0,y:y||0,rot:q,tone:c.tone,price:c.price};}
const hit=(a,b)=>a.x<b.x+b.w-1&&b.x<a.x+a.w-1&&a.y<b.y+b.d-1&&b.y<a.y+a.d-1;
function clashes(r){const bad=new Set(),F=r.furniture;for(let i=0;i<F.length;i++)for(let j=i+1;j<F.length;j++)if(hit(F[i],F[j])){bad.add(F[i].id);bad.add(F[j].id);}return bad;}
function freeSpot(r,f){const R=r.room;for(let y=0;y<=R.d-f.d;y+=100)for(let x=0;x<=R.w-f.w;x+=100){f.x=x;f.y=y;if(!r.furniture.some(o=>o!==f&&hit(f,o)))return;}
  f.x=Math.max(0,Math.round((R.w-f.w)/20)*10);f.y=Math.max(0,Math.round((R.d-f.d)/20)*10);}
function turn(r,f){const cx=f.x+f.w/2,cy=f.y+f.d/2,w=f.w;f.w=f.d;f.d=w;f.x=Math.round((cx-f.w/2)/10)*10;f.y=Math.round((cy-f.d/2)/10)*10;f.rot=((f.rot||0)+90)%360;fitRoom(r);}
const TONES={main:"주조색",wood:"목재",accent:"포인트",dark:"짙은색",white:"밝은색"};
const DIRS={all:"전체 모습",front:"앞 (도면 위쪽 벽)",back:"뒤 (도면 아래쪽 벽)",left:"좌 (도면 왼쪽 벽)",right:"우 (도면 오른쪽 벽)",ceil:"천장",floor:"바닥",issue:"하자·특이사항"};
// 평형별 일반적인 구성 (가정값, 실측으로 교체)
const APT={
  "24평 (59㎡)":[["거실","living",3600,3900],["주방","kitchen",2700,3000],["안방","bedroom",3300,3600],["방2","bedroom",2700,3000],["방3","bedroom",2700,2700],["욕실","bath",1500,2100],["현관","entry",1300,1500]],
  "34평 (84㎡)":[["거실","living",4500,4200],["주방","kitchen",3000,3600],["안방","bedroom",3900,3900],["방2","bedroom",3000,3300],["방3","bedroom",3000,3000],["공용 욕실","bath",1600,2300],["안방 욕실","bath",1500,2100],["현관","entry",1500,1800],["발코니","balcony",4500,1300]],
  "45평 (114㎡)":[["거실","living",5400,4800],["주방","kitchen",3600,4200],["안방","bedroom",4500,4200],["방2","bedroom",3600,3300],["방3","bedroom",3300,3300],["방4","bedroom",3000,3000],["공용 욕실","bath",1800,2400],["안방 욕실","bath",1600,2200],["드레스룸","dress",2100,2400],["현관","entry",1800,2000],["발코니","balcony",5400,1400]]
};

/* ---------- 상태 ---------- */
const KEY="interior-studio-v2";
function styleMats(style,space){const st=STYLES[style],m={floor:st.floor,wall:st.wall,ceiling:st.ceiling};
  if(space==="bath"){m.floor="f_porcelain";m.wall="w_tile";}if(space==="entry"||space==="balcony")m.floor="f_porcelain";return m;}
function newRoom(name,space,w,d,style){const R={w,d,h:2300},small=space==="bath"||space==="entry"||space==="dress"||space==="balcony";
  const ops=[{id:nid(),type:"door",wall:"S",pos:Math.min(200,w-900),width:Math.min(small?750:900,w-300),sill:0,height:2100}];
  if(space==="living"||space==="bedroom"||space==="office")ops.push({id:nid(),type:"window",wall:"N",pos:Math.round(w*0.15/50)*50,width:Math.round(w*0.7/50)*50,sill:space==="living"?100:900,height:space==="living"?2000:1200});
  return {id:nid(),name,space,room:R,measured:false,openings:ops,furniture:template(space,R),mats:styleMats(style,space),
    scope:{demo:true,elec:true,doors:true,mold:!small,furn:true},cond:{sash:false,insul:false,expand:false,builtin:0},photos:[],renders:[],base:"",ov:{},custom:[],ai:""};}
function sampleState(){const s={name:"예시 · 34평 아파트 리모델링",style:"nordic",apt:{noElev:false,livein:false},drawing:null,rooms:[],cur:"",
  rates:Object.fromEntries(Object.entries(RATES0).map(([k,o])=>[k,o.v])),pct:{misc:5,profit:10,vat:10},pack:{},common:{ov:{},custom:[]},example:true};
  s.rooms=APT["34평 (84㎡)"].slice(0,4).map(a=>newRoom(a[0],a[1],a[2],a[3],s.style));s.cur=s.rooms[0].id;return s;}
let S;
try{const raw=localStorage.getItem(KEY);if(raw){const p=JSON.parse(raw);if(p&&Array.isArray(p.rooms)&&p.rooms.length&&p.rooms[0].room)S=Object.assign(sampleState(),p);}}catch(e){}
if(!S)S=sampleState();
for(const r of S.rooms){r.renders=r.renders||[];if(r.scope.furn==null)r.scope.furn=true;}S.pack=S.pack||{};
function flush(){try{const c=JSON.parse(JSON.stringify(S));for(const r of c.rooms){r.photos=r.photos.filter(p=>!p.tmp);r.renders=(r.renders||[]).filter(p=>!p.tmp);}if(c.drawing&&c.drawing.tmp)c.drawing=null;localStorage.setItem(KEY,JSON.stringify(c));}catch(e){}}
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(flush,250);}
addEventListener("pagehide",flush);
const cur=()=>S.rooms.find(r=>r.id===S.cur)||S.rooms[0];
const areaOf=r=>r.room.w*r.room.d/1e6;
const blobs=new Map(); // 이번 접속에서 올린 원본 파일
let undo=null,tab="shot",moreTab="site",planView="2d",catSel="sofa",catQ="",selId=null,AI=false,CFG={ai:false,login:false,authed:true},aiCtl=null,status={},estScope="all",dwgMode=null,dwgPts=[],dwgZoom=100;
function snapshot(){undo=JSON.stringify(S);}

/* ---------- 템플릿 배치 ---------- */
function template(space,r){const W=r.w,D=r.d,H=r.h,out=[];
  const P=(sku,x,y,rot,ww)=>{const f=fromCat(sku,0,0,rot);if(ww){if(f.rot%180===90)f.d=ww;else f.w=ww;}if(f.w>W||f.d>D||f.h>H)return null;
    f.x=Math.round(clamp(x,0,W-f.w)/10)*10;f.y=Math.round(clamp(y,0,D-f.d)/10)*10;if(out.some(o=>hit(f,o)))return null;out.push(f);return f;};
  if(space==="living"){P("besta180",(W-1800)/2,0,0)||P("lack_tv",(W-1600)/2,0,0);P(W>=3200?"kivik3":"klippan2",(W-(W>=3200?2280:1800))/2,D,180);P("lack_coffee",(W-900)/2,D-950-900,0);P("poang",W,D/2-340,90);P("fejka",0,D,0);}
  else if(space==="bedroom"){const q=W>=3300,bw=q?1680:1050,bx=q?(W-bw)/2:0;P(q?"malm_q":"malm_s",bx,0,0);if(q){P("hemnes_nt",bx-480,0,0);P("hemnes_nt",bx+bw+20,0,0);}
    P(W>=3600?"pax200":W>=3000?"pax150":"pax100",W,D,180);if(!q)P("micke",W,0,0);}
  else if(space==="kitchen"){P("g_sink",0,0,0,clamp(W-1000,1200,3600));P("g_fridge",W,0,0);const t=P("lisabo",(W-1400)/2,D-780-600,0);
    if(t)for(const dx of [200,750]){P("odger",t.x+dx,t.y-530,0);P("odger",t.x+dx,t.y+t.d+20,180);}}
  else if(space==="bath"){P("g_bathtub",0,0,0,Math.min(1500,W));P("g_basin",W,D,180);P("g_toilet",0,D,270);}
  else if(space==="entry"){P("hemnes_shoe",W,0,90);}
  else if(space==="balcony"){P("g_wash",0,0,0);P("ivar",W,0,0);}
  else if(space==="dress"){P(W>=2100?"pax200":W>=1600?"pax150":"pax100",0,0,0);P("malm4",0,D,180);}
  else if(space==="office"){const n=Math.max(1,Math.floor((W-200)/1600));for(let i=0;i<n;i++){P("lagkapten",100+i*1600,0,0);P("markus",490+i*1600,650,180);}P("billy80",W,D,180);P("kallax24",0,D,180);}
  else{P("g_island",W,0,0);const cols=Math.max(1,Math.floor((W-400)/1700)),rows=Math.max(1,Math.floor((D-1300)/1700));
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const t=P("melltorp",250+i*1700,1300+j*1700,0);if(t){P("adde",t.x+150,t.y-490,0);P("adde",t.x+700,t.y-490,0);P("adde",t.x+150,t.y+t.d+20,180);P("adde",t.x+700,t.y+t.d+20,180);}}}
  return out;}
const wallLen=(r,w)=>(w==="N"||w==="S")?r.room.w:r.room.d;
function fitRoom(r){const R=r.room;for(const o of r.openings){o.width=clamp(o.width,300,wallLen(r,o.wall)-100);o.pos=clamp(o.pos,0,wallLen(r,o.wall)-o.width);o.sill=clamp(o.sill||0,0,R.h-300);o.height=clamp(o.height||1200,200,R.h-o.sill);}
  for(const x of r.furniture){x.w=Math.min(x.w,R.w);x.d=Math.min(x.d,R.d);x.x=clamp(x.x,0,R.w-x.w);x.y=clamp(x.y,0,R.d-x.d);x.h=Math.min(x.h,R.h);}}

/* ---------- 견적 계산 ---------- */
function finish(lines,owner,room){const out=lines.map(l=>{const o=owner.ov[l.key]||{};return Object.assign({},l,o,{auto:true,edited:Object.keys(o).some(k=>k!=="off")});});
  for(const c of owner.custom)out.push(Object.assign({auto:false},c));
  for(const l of out){l.room=room;l.rate=S.rates[l.trade]||0;l.labor=l.pum*l.rate;l.total=l.off?0:l.qty*(l.mat+l.labor);l.matSum=l.off?0:l.qty*l.mat;l.labSum=l.off?0:l.qty*l.labor;}
  return out;}
function roomLines(r){const R=r.room,A=areaOf(r),P=2*(R.w+R.d)/1000,H=R.h/1000;
  const doors=r.openings.filter(o=>o.type==="door"),wins=r.openings.filter(o=>o.type==="window");
  const winA=wins.reduce((s,o)=>s+o.width*o.height/1e6,0),openA=doors.reduce((s,o)=>s+o.width*o.height/1e6,0)+winA;
  const wallA=Math.max(0,P*H-openA),doorW=doors.reduce((s,o)=>s+o.width,0)/1000;
  const F=MAT[r.mats.floor],Wm=MAT[r.mats.wall],C=MAT[r.mats.ceiling],L=[];
  const p=(key,cat,name,spec,unit,qty,mat,trade,pum)=>L.push({key,cat,name,spec,unit,qty:Math.round(qty*100)/100,mat,trade,pum});
  if(r.scope.demo)p("demo","철거","기존 마감 철거","바닥·벽·천장 마감재","㎡",A,0,"보통인부",0.12);
  if(r.cond.expand)p("expand","확장","발코니 확장","단열·난방 배관 연장·턱 제거","식",1,1800000,"건축목공",3);
  if(r.cond.insul)p("insul","단열","외벽 단열·결로 보수","이보드 13T, 외벽 1면","㎡",Math.max(R.w,R.d)/1000*H,14000,"내장공",0.07);
  if(r.cond.sash&&winA>0)p("sash","창호","샷시 교체(이중창)","22mm 복층유리, 철거 포함","㎡",winA,260000,"건축목공",0.25);
  if(r.space==="bath")p("wp","방수","도막 방수","바닥 + 벽 1.2m","㎡",A+P*1.2,9000,"방수공",0.06);
  p("ceil","천장",C.name,C.spec+" · 할증 5%","㎡",A*1.05,C.price,C.trade,C.pum);
  p("wall","벽",Wm.name,Wm.spec+" · 할증 10%","㎡",wallA*1.1,Wm.price,Wm.trade,Wm.pum);
  p("floor","바닥",F.name,F.spec+" · 할증 5%","㎡",A*1.05,F.price,F.trade,F.pum);
  if(r.space!=="bath")p("base","목공","걸레받이","PVC/MDF 랩핑 60mm","m",Math.max(0,P-doorW),3500,"내장공",0.02);
  if(r.scope.mold)p("mold","목공","천장 몰딩","마이너스 또는 평몰딩","m",P,3000,"내장공",0.02);
  if(r.scope.doors&&doors.length)p("door","목공","ABS 도어 교체","문틀·경첩·손잡이 포함","개소",doors.length,280000,"건축목공",0.6);
  if(num(r.cond.builtin,0)>0)p("builtin","가구","붙박이장","E0 PB, 도어·내부 구성 포함","m",num(r.cond.builtin,0),420000,"건축목공",0.4);
  if(r.scope.furn!==false)for(const f of r.furniture){const pr=f.price!=null?f.price:furnPrice(f.name);if(pr>0)p("furn_"+f.id,"가구",(isIkea(f)?"이케아 ":"")+f.name,f.w+"×"+f.d+"×"+f.h+" mm · 배송·조립 포함","개",1,pr,"보통인부",0.05);}
  if(r.scope.elec){p("light","전기","LED 다운라이트","3인치, 타공·결선 포함","개",Math.max(2,Math.round(A/1.2)),12000,"내선전공",0.06);p("sw","전기","스위치·콘센트 교체","","개",Math.max(2,Math.round(P/2.5)),7000,"내선전공",0.04);}
  if(r.space==="bath")p("san","설비","위생기구 세트","양변기·세면대·수전·액세서리","식",1,950000,"배관공",1.5);
  if(r.space==="kitchen")p("sink","가구","싱크대(상·하부장)","PET 도어, 인조대리석 상판","m",Math.round(Math.max(R.w,R.d)/100*0.8)/10,320000,"건축목공",0.35);
  return finish(L,r,r.name);}
function commonLines(){const A=S.rooms.reduce((s,r)=>s+areaOf(r),0),demoA=S.rooms.filter(r=>r.scope.demo).reduce((s,r)=>s+areaOf(r),0),L=[];
  const p=(key,cat,name,spec,unit,qty,mat,trade,pum)=>L.push({key,cat,name,spec,unit,qty:Math.round(qty*100)/100,mat,trade,pum});
  p("prep","가설","보양·먹매김","바닥·엘리베이터·공용부 보양","㎡",A,1500,"보통인부",0.01);
  if(demoA>0)p("waste","철거","폐기물 반출·처리","1톤 트럭 기준","대",Math.max(1,Math.ceil(demoA/20)),350000,"보통인부",0.5);
  if(S.apt.noElev)p("lift","운반","자재 양중·반출(계단)","엘리베이터 없음, 인력 운반","인",Math.max(2,Math.ceil(A/15)),0,"보통인부",1);
  if(S.apt.livein)p("livein","가설","거주 중 공사 추가 보양·일일 정리","가구 이동·비닐 보양","㎡",A,2000,"보통인부",0.02);
  p("clean","기타","준공 청소","","㎡",A,1000,"보통인부",0.03);
  return finish(L,S.common,"공통");}
function allLines(){return S.rooms.flatMap(roomLines).concat(commonLines());}
function totals(lines){const mat=lines.reduce((s,l)=>s+l.matSum,0),lab=lines.reduce((s,l)=>s+l.labSum,0),direct=mat+lab;
  const misc=direct*S.pct.misc/100,profit=(direct+misc)*S.pct.profit/100,supply=direct+misc+profit,vat=supply*S.pct.vat/100;
  return {mat,lab,direct,misc,profit,supply,vat,total:supply+vat};}

/* ---------- 파일 ---------- */
const DB=new Promise(res=>{try{const q=indexedDB.open("interior-studio",1);q.onupgradeneeded=()=>q.result.createObjectStore("img");q.onsuccess=()=>res(q.result);q.onerror=()=>res(null);}catch(e){res(null);}});
async function idb(mode,fn){const db=await DB;if(!db)return null;return new Promise(r=>{let q;try{const tx=db.transaction("img",mode);q=fn(tx.objectStore("img"));tx.oncomplete=()=>r(q&&q.result);tx.onerror=tx.onabort=()=>r(null);}catch(e){r(null);}});}
async function shrink(file,max){try{const bm=await createImageBitmap(file),k=Math.min(1,max/Math.max(bm.width,bm.height));if(k===1&&file.size<1500000)return file;
    const c=document.createElement("canvas");c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);c.getContext("2d").drawImage(bm,0,0,c.width,c.height);
    return await new Promise(r=>c.toBlob(b=>r(b||file),"image/jpeg",0.88));}catch(e){return file;}}
async function storeImage(file,max){const id=nid(),b=await shrink(file,max||1800);blobs.set(id,b);await idb("readwrite",st=>st.put(b,id));return {id,url:URL.createObjectURL(b)};}
async function blobOf(p){if(blobs.has(p.id))return blobs.get(p.id);const b=await idb("readonly",st=>st.get(p.id));if(!b)throw new Error("missing");blobs.set(p.id,b);return b;}
function dropImage(p){blobs.delete(p.id);try{URL.revokeObjectURL(p.url);}catch(e){}idb("readwrite",st=>st.delete(p.id));}
const dataURL=b=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=rej;f.readAsDataURL(b);});
async function hydrate(){const fix=async list=>{const out=[];for(const p of list||[]){const b=await idb("readonly",st=>st.get(p.id));if(b){blobs.set(p.id,b);p.url=URL.createObjectURL(b);out.push(p);}}return out;};
  for(const r of S.rooms){r.photos=await fix(r.photos);r.renders=await fix(r.renders);}
  if(S.drawing){const d=await fix([S.drawing]);S.drawing=d[0]||null;}}
const downloads={save:async({filename,data})=>{const b=data instanceof Blob?data:new Blob([data]);const u=URL.createObjectURL(b),a=h("a",{href:u,download:filename});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);}};
function uploader(id,label,multiple,onfiles){const fi=h("input",{type:"file",id,accept:"image/jpeg,image/png,image/webp",multiple,hidden:true,onchange:e=>{onfiles([...e.target.files]);e.target.value="";}});
  const d=h("div",{class:"drop",tabindex:"0",role:"button",onclick:()=>fi.click(),onkeydown:e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fi.click();}},
    ondragover:e=>{e.preventDefault();d.classList.add("over");},ondragleave:()=>d.classList.remove("over"),ondrop:e=>{e.preventDefault();d.classList.remove("over");onfiles([...e.dataTransfer.files]);}},label);
  return [fi,d];}
const okImg=f=>/^image\/(jpeg|png|webp)$/.test(f.type);

/* ---------- 탭·공간 줄 ---------- */
const TABS=[["shot","사진·스타일"],["real","실사 시안"],["dims","치수·가구 배치"],["est","견적"],["more","상세 설정"]];
function renderTabs(){document.getElementById("tabs").replaceChildren(...TABS.map(([k,l],i)=>h("button",{role:"tab","aria-selected":String(tab===k),id:"tab-"+k,onclick:()=>{tab=k;render();}},k==="more"?null:h("span",{class:"n",text:String(i+1)}),l)));
  const bar=document.getElementById("rooms");bar.hidden=tab==="est"||(tab==="more"&&moreTab==="site");
  bar.replaceChildren(...S.rooms.map(r=>h("button",{"aria-pressed":String(r.id===cur().id),onclick:()=>{S.cur=r.id;selId=null;render();}},r.name+(r.measured?" ✓":""))),
    h("button",{id:"add-room",onclick:()=>{const r=newRoom("새 공간","bedroom",3000,3000,S.style);S.rooms.push(r);S.cur=r.id;tab="shot";changed();}},"+ 공간 추가"));}
function viewLogin(){let pw;const msg=h("p",{class:"note warn","aria-live":"polite"});
  const go=async()=>{try{await api("/api/login",{password:pw.value});CFG.authed=true;render();}catch(e){msg.textContent=e.message||"로그인하지 못했습니다.";}};
  return h("section",{class:"panel",style:"max-width:360px"},h("h2",{text:"로그인"}),fld("비밀번호",pw=h("input",{type:"password",id:"login-pw",autocomplete:"current-password",onkeydown:e=>{if(e.key==="Enter")go();}})),h("button",{class:"btn primary",onclick:go},"들어가기"),msg);}
function render(){const v=document.getElementById("view");
  if(CFG.login&&!CFG.authed){document.getElementById("tabs").replaceChildren();document.getElementById("rooms").hidden=true;v.replaceChildren(viewLogin());return;}
  renderTabs();dispose3D();
  v.replaceChildren(({shot:viewShot,real:viewReal,dims:viewPlan,est:viewEst,more:viewMore})[tab]());
  if((tab==="more"&&moreTab==="view3d")||(tab==="dims"&&planView==="3d"))init3D();save();}
function nextBtn(k,label){return h("div",{class:"row",style:"justify-content:flex-end"},h("button",{class:"btn primary",onclick:()=>{tab=k;render();scrollTo(0,0);}},label+" →"));}
function viewMore(){const sub=h("div",{class:"rooms"},[["site","건설사 도면·공간 구성"],["view3d","3D로 보기"],["mat","자재 바꾸기"]].map(([k,l])=>h("button",{"aria-pressed":String(moreTab===k),id:"more-"+k,onclick:()=>{moreTab=k;render();}},l)));
  return h("div",{class:"stack"},sub,({site:viewSite,view3d:view3D,mat:viewMat})[moreTab]());}
function changed(){S.example=false;render();}
function undoBtn(){return undo?h("button",{class:"btn small",onclick:()=>{try{S=JSON.parse(undo);}catch(e){}undo=null;status={};render();}},"방금 변경 되돌리기"):null;}

/* ---------- AI 공통 ---------- */
async function api(path,body,signal){let r;try{r=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json","X-Requested-With":"studio"},body:JSON.stringify(body),signal});}
  catch(e){throw e&&e.name==="AbortError"?{code:"cancelled"}:{code:"network",message:"서버에 연결하지 못했습니다. 인터넷 연결을 확인하세요."};}
  let j={};try{j=await r.json();}catch(e){}
  if(!r.ok){if(j.error==="login"){CFG.authed=false;}throw {code:j.error||"server",message:j.message||"서버 오류가 났습니다."};}
  return j;}
async function busy(slot,msg,work){if(aiCtl)return false;aiCtl=new AbortController();status[slot]=msg;render();let ok=false;
  try{status[slot]=(await work(aiCtl.signal))||"";ok=true;}catch(e){status[slot]=e&&e.code==="cancelled"?"중지했습니다.":((e&&e.message)||"문제가 생겼습니다. 다시 눌러 주세요.");}
  aiCtl=null;render();return ok;}
function askAI(slot,prompt,images,apply,json=true){if(!AI)return Promise.resolve(false);
  return busy(slot,"AI가 사진을 분석하고 있습니다. 보통 10~40초 걸립니다…",async signal=>{const imgs=[];for(const b of images||[])imgs.push(await dataURL(b));
    const j=await api("/api/ask",{prompt,images:imgs,json},signal);return apply(json?j.value:j.text);});}
function makeReal(r,extra){const base=r.photos.find(p=>p.id===r.base)||r.photos.find(p=>p.dir==="all")||r.photos[0];if(!AI||!base)return Promise.resolve(false);
  return busy("render","시공 후 실사 이미지를 만들고 있습니다. 보통 20초~1분 걸립니다…",async signal=>{const img=await dataURL(await blobOf(base));
    const prompt=(r.prompt||renderPrompt(r))+(extra?" Additional request from the client: "+String(extra).slice(0,300):"");
    const j=await api("/api/render",{prompt,image:img},signal);const b=await (await fetch(j.image)).blob();
    r.renders=r.renders||[];r.renders.unshift(await storeImage(b,2400));if(r.renders.length>12)r.renders.splice(12).forEach(dropImage);S.example=false;
    return "실사 시안을 만들었습니다. 분위기 확인용 이미지이며, 실제 치수는 다음 단계에서 넣습니다.";});}
async function oneClick(r){const ok=await aiRoom(r);if(!ok)return;tab="real";render();await makeReal(r);}
const stopBtn=()=>aiCtl?h("button",{class:"btn",onclick:()=>aiCtl&&aiCtl.abort()},"중지"):null;
const aiNote=()=>!AI?h("p",{class:"note warn",text:"서버에 AI 키가 설정되지 않아 AI 분석과 실사 만들기가 꺼져 있습니다. 직접 입력·기본 구성·견적은 그대로 쓸 수 있습니다."}):null;

/* ---------- 1. 프로젝트·건설사 도면 ---------- */
function stylePanel(){
  return h("section",{class:"panel"},h("h2",{text:"스타일"}),
    h("div",{class:"cards",style:"grid-template-columns:repeat(auto-fill,minmax(130px,1fr))"},Object.entries(STYLES).map(([k,s])=>h("button",{class:"card","aria-pressed":String(S.style===k),onclick:()=>{S.style=k;for(const r of S.rooms){r.mats=styleMats(k,r.space);delete r.ov.floor;delete r.ov.wall;delete r.ov.ceil;r.prompt="";}changed();}},
      h("b",{text:s.name}),h("div",{class:"sw"},[MAT[s.floor].color,MAT[s.wall].color,s.tones.main,s.tones.wood,s.tones.accent].map(c=>h("i",{style:"background:"+c}))),h("small",{text:s.desc})))),
    h("p",{class:"note",text:"스타일을 고르면 모든 공간의 마감재와 가구 색이 그 스타일로 바뀌고 견적에 반영됩니다."}));}
function viewSite(){
  const roomRows=S.rooms.map(r=>h("tr",{},h("td",{},h("button",{class:"btn small",onclick:()=>{S.cur=r.id;tab="shot";render();}},r.name)),h("td",{text:SPACES[r.space]}),
    h("td",{class:"num",text:r.room.w.toLocaleString()+" × "+r.room.d.toLocaleString()}),h("td",{class:"num",text:areaOf(r).toFixed(1)+"㎡"}),
    h("td",{},h("span",{class:"chip "+(r.measured?"ok":"warn"),text:r.measured?"실측 완료":"추정 치수"})),h("td",{class:"num",text:r.photos.length+"장"})));
  const totalA=S.rooms.reduce((s,r)=>s+areaOf(r),0);
  return h("div",{class:"stack"},
    h("section",{class:"panel"},h("h2",{text:"프로젝트"}),
      fld("프로젝트명",inp("text",S.name,v=>{S.name=v;changed();},{id:"p-name"})),
      h("h3",{text:"아파트 평형으로 공간 한 번에 만들기"}),
      h("div",{class:"row"},Object.keys(APT).map(k=>h("button",{class:"btn small",onclick:()=>{snapshot();S.rooms=APT[k].map(a=>newRoom(a[0],a[1],a[2],a[3],S.style));S.cur=S.rooms[0].id;S.common={ov:{},custom:[]};status.site=k+" 구성으로 공간 "+S.rooms.length+"개를 만들었습니다. 치수는 일반적인 평면의 가정값입니다.";changed();}},k)),undoBtn()),
      h("p",{class:"note",text:"기존 공간 목록을 바꿉니다. 치수는 가정값이니 건설사 도면이나 실측으로 고쳐 주세요."}),
      status.site?h("p",{class:"note",text:status.site}):null,
      h("h3",{text:"현장 여건"}),
      h("div",{class:"row"},chk("엘리베이터 없음 (계단 양중)",S.apt.noElev,v=>{S.apt.noElev=v;changed();},"apt-noelev"),chk("거주 중 공사",S.apt.livein,v=>{S.apt.livein=v;changed();},"apt-livein"))),
    h("section",{class:"panel"},h("div",{class:"row",style:"justify-content:space-between"},h("h2",{text:"공간 목록"}),h("span",{class:"note",text:"합계 "+totalA.toFixed(1)+"㎡ · "+(totalA/3.3058).toFixed(1)+"평 (실내 바닥 기준)"})),
      h("div",{class:"tw"},h("table",{class:"narrow"},h("thead",{},h("tr",{},["공간","유형"].map(x=>h("th",{text:x})),["가로 × 세로 (mm)","면적"].map(x=>h("th",{class:"num",text:x})),h("th",{text:"치수"}),h("th",{class:"num",text:"사진"}))),h("tbody",{},roomRows)))),
    viewDrawing());}
function viewDrawing(){const d=S.drawing,r=cur();
  const [fi,drop]=uploader("dwg-input",d?"다른 도면 이미지로 바꾸기":"건설사 평면도 이미지를 끌어 놓거나 눌러서 선택 (JPG·PNG)",false,async fs=>{const f=fs.find(okImg);if(!f)return;
    const st=await storeImage(f,3200);const im=new Image();im.onload=()=>{if(S.drawing)dropImage(S.drawing);S.drawing=Object.assign(st,{nw:im.naturalWidth,nh:im.naturalHeight,scale:null});dwgPts=[];dwgMode=null;changed();};im.src=st.url;});
  if(!d)return h("section",{class:"panel"},h("h2",{text:"건설사 도면"}),fi,drop,
    h("p",{class:"note",text:"분양 카탈로그나 관리사무소에서 받은 평면도를 올리면 크게 보면서 치수를 재고, AI로 공간 목록을 읽어 올 수 있습니다. PDF는 화면 캡처 이미지로 올려 주세요."}));
  const svg=sv("svg",{id:"dwg",viewBox:"0 0 "+d.nw+" "+d.nh});svg.style.width=dwgZoom+"%";
  svg.append(sv("image",{href:d.url,x:0,y:0,width:d.nw,height:d.nh}));
  const u=Math.max(d.nw,d.nh)/400,col=getComputedStyle(document.documentElement).getPropertyValue("--dim").trim();
  dwgPts.forEach(p=>svg.append(sv("circle",{cx:p.x,cy:p.y,r:u*2.2,fill:col})));
  let px=0;if(dwgPts.length===2){px=Math.hypot(dwgPts[0].x-dwgPts[1].x,dwgPts[0].y-dwgPts[1].y);svg.append(sv("line",{x1:dwgPts[0].x,y1:dwgPts[0].y,x2:dwgPts[1].x,y2:dwgPts[1].y,stroke:col,"stroke-width":u}));}
  svg.addEventListener("click",e=>{if(!dwgMode)return;const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());if(dwgPts.length>=2)dwgPts=[];dwgPts.push({x:q.x,y:q.y});render();});
  const mm=d.scale&&px?Math.round(px*d.scale/10)*10:0;
  let refIn;
  const tool=dwgMode==="ref"?(dwgPts.length<2?h("p",{class:"note",text:"도면에서 치수가 적힌 선의 양 끝 두 점을 차례로 누르세요."}):
      h("div",{class:"row"},h("span",{class:"note",text:"이 선의 실제 길이(mm)"}),refIn=h("input",{type:"number",id:"dwg-ref",style:"width:120px",placeholder:"예: 3600"}),h("button",{class:"btn small primary",onclick:()=>{const v=num(refIn.value,0);if(v>0){d.scale=v/px;dwgMode="measure";dwgPts=[];changed();}}},"기준으로 저장"))):
    dwgMode==="measure"?(dwgPts.length<2?h("p",{class:"note",text:"잴 구간의 양 끝 두 점을 누르세요."}):
      h("div",{class:"row"},h("b",{style:"font-family:var(--mono)",text:mm.toLocaleString()+" mm"}),h("span",{class:"note",text:"→ 넣을 공간"}),
        sel(S.rooms.map(x=>[x.id,x.name]),r.id,v=>{S.cur=v;render();},"dwg-room"),
        h("button",{class:"btn small",onclick:()=>{r.room.w=clamp(mm,1000,20000);fitRoom(r);changed();}},"가로에 넣기"),h("button",{class:"btn small",onclick:()=>{r.room.d=clamp(mm,1000,20000);fitRoom(r);changed();}},"세로에 넣기"))):null;
  return h("section",{class:"panel"},h("h2",{text:"건설사 도면"}),
    h("div",{class:"row"},
      h("button",{class:"btn small","aria-pressed":String(dwgMode==="ref"),onclick:()=>{dwgMode=dwgMode==="ref"?null:"ref";dwgPts=[];render();}},"① 기준 길이 맞추기"),
      h("button",{class:"btn small","aria-pressed":String(dwgMode==="measure"),disabled:!d.scale,onclick:()=>{dwgMode=dwgMode==="measure"?null:"measure";dwgPts=[];render();}},"② 거리 재기"),
      h("span",{class:"chip "+(d.scale?"ok":"warn"),text:d.scale?"축척 맞춤 완료":"축척 미설정"}),
      h("span",{class:"note",text:"확대"}),h("input",{type:"range",id:"dwg-zoom",min:"50",max:"300",step:"10",value:dwgZoom,style:"width:120px",oninput:e=>{dwgZoom=+e.target.value;svg.style.width=dwgZoom+"%";}}),
      h("button",{class:"btn small",onclick:()=>{dropImage(d);S.drawing=null;dwgPts=[];dwgMode=null;changed();}},"도면 삭제")),
    tool,
    h("div",{class:"canvasbox scroll"},svg),
    h("div",{class:"row"},h("button",{class:"btn primary",disabled:!AI||!!aiCtl,onclick:aiDrawing},aiCtl?"읽는 중…":"AI로 도면에서 공간 목록·치수 읽기"),stopBtn(),undoBtn(),fi,h("button",{class:"btn small",onclick:()=>fi.click()},"도면 바꾸기")),
    aiNote(),status.dwg?h("p",{class:"note",text:status.dwg}):null,
    d.tmp?h("p",{class:"note warn",text:"이 화면에서는 이미지를 저장할 수 없어, 도면 이미지는 페이지를 닫으면 사라집니다. 치수와 공간 목록은 남습니다."}):null);}
async function aiDrawing(){let blob;try{blob=await blobOf(S.drawing);}catch(e){status.dwg="도면 이미지를 다시 불러오지 못했습니다. 다시 올려 주세요.";render();return;}
  const prompt="첨부 이미지는 한국 아파트(또는 상가)의 건설사 평면도입니다. 도면에 적힌 치수(mm)와 실 이름을 읽어 각 실을 직사각형으로 단순화한 목록을 만드세요.\n"+
   "치수가 적혀 있으면 그 값을 쓰고, 없으면 적힌 다른 치수와의 비례로 추정하세요. 벽 두께는 무시하고 실내 안목 치수에 가깝게 잡습니다. 다용도실·실외기실·파우더룸 같은 작은 실도 포함하되 최대 14개까지.\n"+
   "space는 다음 중 하나: living(거실), bedroom(침실·방), kitchen(주방·식당), bath(욕실), entry(현관), balcony(발코니·다용도실), dress(드레스룸·파우더룸).\n"+
   "아래 형태의 JSON 하나만 답하세요.\n"+
   '{"rooms":[{"name":"거실","space":"living","w":4500,"d":4200}],"notes":"전용면적·평면 타입 등 읽은 내용과 불확실한 부분을 한국어 1~3문장으로"}\n'+
   "w는 도면 가로 방향, d는 세로 방향 길이(mm).";
  askAI("dwg",prompt,[blob],r=>{const list=(r&&Array.isArray(r.rooms)?r.rooms:[]).filter(x=>x&&typeof x==="object").slice(0,14);if(!list.length)throw {code:"invalid_json"};
    snapshot();S.rooms=list.map(x=>newRoom(String(x.name||"공간").slice(0,16),SPACES[x.space]?x.space:"bedroom",Math.round(clamp(num(x.w,3000),1000,20000)/10)*10,Math.round(clamp(num(x.d,3000),1000,20000)/10)*10,S.style));
    S.cur=S.rooms[0].id;S.common={ov:{},custom:[]};S.example=false;
    return "도면에서 공간 "+S.rooms.length+"개를 읽었습니다. "+String(r.notes||"").slice(0,300)+" 숫자를 잘못 읽을 수 있으니 공간 목록의 치수를 도면과 대조해 주세요.";});}

/* ---------- 2. 사진·실측 ---------- */
function dimsPanel(r){const R=r.room;const setR=(k,v,lo,hi)=>{R[k]=clamp(Math.round(num(v,R[k])),lo,hi);fitRoom(r);changed();};
  return h("section",{class:"panel"},h("div",{class:"row",style:"justify-content:space-between"},h("h3",{text:"실측 치수 (mm)"}),h("span",{class:"chip "+(r.measured?"ok":"warn"),text:r.measured?"실측 완료":"추정 치수"})),
    h("div",{class:"fields"},fld("가로",inp("number",R.w,v=>setR("w",v,1000,20000),{id:"r-w",step:"10"})),fld("세로",inp("number",R.d,v=>setR("d",v,1000,20000),{id:"r-d",step:"10"})),fld("천장고",inp("number",R.h,v=>setR("h",v,2000,4500),{id:"r-h",step:"10"}))),
    chk("줄자·레이저로 잰 값을 넣었음 (AI가 이 치수를 바꾸지 않음)",r.measured,v=>{r.measured=v;changed();},"r-measured"),
    h("p",{class:"note",text:"바닥 면적 "+areaOf(r).toFixed(2)+"㎡ · "+(areaOf(r)/3.3058).toFixed(1)+"평 · 둘레 "+(2*(R.w+R.d)/1000).toFixed(1)+"m"}));}
function openingsPanel(r){const R=r.room;
  return h("section",{class:"panel"},h("h3",{text:"문·창 실측 (mm)"}),
    h("div",{class:"list"},r.openings.map(o=>h("div",{class:"op"},
      sel([["door","문"],["window","창"]],o.type,v=>{o.type=v;if(v==="door"){o.sill=0;o.height=2100;}else{o.sill=900;o.height=1200;}fitRoom(r);changed();}),
      sel([["N","위쪽 벽"],["E","오른쪽 벽"],["S","아래쪽 벽"],["W","왼쪽 벽"]],o.wall,v=>{o.wall=v;fitRoom(r);changed();}),
      h("button",{class:"btn small",text:"삭제",onclick:()=>{r.openings=r.openings.filter(x=>x!==o);changed();}}),
      fld("시작 위치",inp("number",o.pos,v=>{o.pos=Math.round(num(v,0));fitRoom(r);changed();},{step:"10"})),
      fld("폭",inp("number",o.width,v=>{o.width=Math.round(num(v,900));fitRoom(r);changed();},{step:"10"})),
      fld(o.type==="door"?"높이":"하단/높이",o.type==="door"?inp("number",o.height,v=>{o.height=Math.round(num(v,2100));fitRoom(r);changed();},{step:"10"}):
        h("span",{class:"row",style:"flex-wrap:nowrap;gap:2px"},inp("number",o.sill,v=>{o.sill=Math.round(num(v,900));fitRoom(r);changed();},{step:"10","aria-label":"창 하단 높이"}),inp("number",o.height,v=>{o.height=Math.round(num(v,1200));fitRoom(r);changed();},{step:"10","aria-label":"창 높이"})))))),
    h("p",{class:"note",text:"시작 위치는 위·아래 벽이면 왼쪽 끝에서, 좌·우 벽이면 위쪽 끝에서 잰 거리입니다."}),
    h("div",{class:"row"},h("button",{class:"btn small",onclick:()=>{r.openings.push({id:nid(),type:"door",wall:"S",pos:200,width:Math.min(900,R.w-300),sill:0,height:2100});fitRoom(r);changed();}},"+ 문"),
      h("button",{class:"btn small",onclick:()=>{r.openings.push({id:nid(),type:"window",wall:"N",pos:300,width:Math.min(1800,R.w-600),sill:900,height:1200});fitRoom(r);changed();}},"+ 창")));}
function condPanel(r){return h("section",{class:"panel"},h("h3",{text:"현장 조건 (견적에 반영)"}),
  chk("기존 마감 철거 필요",r.scope.demo,v=>{r.scope.demo=v;changed();},"c-demo"),
  chk("샷시(창호) 교체",r.cond.sash,v=>{r.cond.sash=v;changed();},"c-sash"),
  chk("외벽 결로·곰팡이 → 단열 보수",r.cond.insul,v=>{r.cond.insul=v;changed();},"c-insul"),
  chk("발코니 확장 공사",r.cond.expand,v=>{r.cond.expand=v;changed();},"c-expand"),
  fld("붙박이장 길이 (m, 없으면 0)",inp("number",r.cond.builtin,v=>{r.cond.builtin=clamp(num(v,0),0,20);changed();},{id:"c-builtin",step:"0.1",min:"0"})));}
function viewShot(){const r=cur();
  const [fi,drop]=uploader("photo-input","'"+r.name+"' 사진을 끌어 놓거나 눌러서 선택 (여러 장 가능)",true,async fs=>{const order=["all","front","back","left","right","ceil","floor","issue"];
    for(const f of fs.filter(okImg)){if(r.photos.length>=12)break;const st=await storeImage(f);const used=new Set(r.photos.map(p=>p.dir));st.dir=order.find(d=>!used.has(d))||"issue";st.memo="";r.photos.push(st);}changed();});
  const photos=h("div",{class:"photos"},r.photos.map((p,i)=>h("div",{class:"photo"},h("img",{src:p.url,alt:r.name+" 사진 "+(i+1),loading:"lazy"}),
    sel(Object.entries(DIRS),p.dir,v=>{p.dir=v;changed();}),inp("text",p.memo,v=>{p.memo=v.slice(0,80);changed();},{placeholder:"메모 (예: 누수 자국)","aria-label":"사진 메모"}),
    h("button",{class:"btn small",text:"사진 삭제",onclick:()=>{dropImage(p);r.photos=r.photos.filter(x=>x!==p);if(r.base===p.id)r.base="";changed();}}))));
  return h("div",{class:"grid"},
    h("div",{class:"stack"},
      h("section",{class:"panel"},h("div",{class:"row",style:"justify-content:space-between"},h("h2",{text:r.name+" 현장 사진"}),h("span",{class:"note",text:r.photos.length+" / 12장"})),
        S.example?h("p",{class:"note",text:"예시 프로젝트가 들어 있습니다. 위에서 공간을 고르고 사진을 올리면 내 프로젝트가 됩니다."}):null,
        fi,drop,r.photos.length?photos:null,
        h("p",{class:"note",text:"한 장만 있어도 됩니다. 여러 장이면 사진마다 어느 쪽을 찍었는지 골라 주세요."}),
        h("div",{class:"row"},h("button",{class:"btn primary",id:"one-click",disabled:!AI||!!aiCtl||!r.photos.length,onclick:()=>oneClick(r)},aiCtl?"만드는 중…":STYLES[S.style].name+" 스타일 실사 만들기"),
          h("button",{class:"btn",disabled:!!aiCtl,onclick:()=>{snapshot();r.furniture=template(r.space,r.room);r.mats=styleMats(S.style,r.space);r.ov={};selId=null;status.room=STYLES[S.style].name+" 스타일 기본 구성으로 만들었습니다.";changed();}},"AI 없이 기본 구성"),stopBtn(),undoBtn()),
        h("p",{class:"note",text:"버튼 하나로 AI가 사진을 보고 마감재·가구·문창·하자를 정리한 뒤, 같은 사진을 시공 후 모습의 실사 이미지로 바꿔 보여 줍니다. 이 내용이 견적의 바탕이 됩니다."}),
        aiNote(),status.room?h("p",{class:"note",text:status.room}):null,r.ai?h("pre",{class:"out",text:r.ai}):null,
        r.photos.some(p=>p.tmp)?h("p",{class:"note warn",text:"이 화면에서는 이미지를 저장할 수 없어, 사진은 페이지를 닫으면 사라집니다. 치수와 견적은 남습니다."}):null),
      nextBtn("real","다음: 실사 시안")),
    h("aside",{class:"stack"},stylePanel(),
      h("section",{class:"panel"},h("h3",{text:"이 공간"}),
        h("div",{class:"fields"},fld("이름",inp("text",r.name,v=>{r.name=v.slice(0,16)||"공간";changed();},{id:"room-name"})),fld("유형",sel(Object.entries(SPACES),r.space,v=>{r.space=v;r.mats=styleMats(S.style,v);changed();},"room-space"))),
        h("div",{class:"row"},h("button",{class:"btn small",onclick:()=>{const c=JSON.parse(JSON.stringify(r));c.id=nid();c.name=(r.name+" 복사").slice(0,16);c.photos=[];c.renders=[];c.openings.forEach(o=>o.id=nid());c.furniture.forEach(o=>o.id=nid());S.rooms.push(c);S.cur=c.id;changed();}},"복제"),
          h("button",{class:"btn small",disabled:S.rooms.length<2,onclick:()=>{snapshot();S.rooms=S.rooms.filter(x=>x!==r);S.cur=S.rooms[0].id;changed();}},"삭제")))));}
function aiRoom(r){const st=STYLES[S.style],R=r.room,ph=r.photos.slice(0,12);
  const matIds=g=>Object.entries(MAT).filter(([,m])=>m.g===g).map(([k,m])=>k+"("+m.name+")").join(", ");
  return Promise.all(ph.map(p=>blobOf(p).catch(()=>null))).then(bl=>{const ok=ph.filter((p,i)=>bl[i]),files=bl.filter(Boolean);
    if(!files.length){status.room="사진을 다시 불러오지 못했습니다. 사진을 다시 올려 주세요.";render();return false;}
    const prompt="당신은 한국의 인테리어 실무 설계자입니다. 첨부한 사진 "+files.length+"장은 같은 공간('"+r.name+"', "+SPACES[r.space]+")의 시공 전 현장 사진입니다.\n"+
     "사진 순서와 찍은 방향:\n"+ok.map((p,i)=>(i+1)+". "+DIRS[p.dir]+(p.memo?" — 메모: "+p.memo:"")).join("\n")+"\n"+
     "원하는 스타일: "+st.name+" ("+st.desc+")\n"+
     (r.measured?"방 치수는 실측값으로 확정입니다: 가로 w="+R.w+", 세로 d="+R.d+", 천장고 h="+R.h+" (mm). room에는 이 값을 그대로 넣고 바꾸지 마세요.\n":"현재 입력된 치수(추정): 가로 "+R.w+", 세로 "+R.d+", 천장고 "+R.h+" mm. 사진에서 문 높이(약 2100mm), 콘센트 높이(약 300mm), 가구 크기 등을 기준으로 더 정확한 치수를 추정하세요.\n")+
     "방은 직사각형으로 단순화합니다. 좌표계: 평면도 왼쪽 위가 원점, x는 왼쪽→오른쪽(가로 w), y는 위→아래(세로 d), 단위 mm. 벽은 N(위, '앞' 사진의 벽), S(아래, '뒤'), W(왼쪽, '좌'), E(오른쪽, '우'). 개구부 pos는 N·S 벽이면 왼쪽 끝에서, W·E 벽이면 위쪽 끝에서 잰 시작 위치, sill은 바닥에서 개구부 하단까지 높이(문은 0)입니다.\n"+
     "사진에 보이는 실제 문·창을 openings에 넣고, 이 스타일로 리모델링한 가구 배치를 제안하세요.\n"+
     "가구는 아래 이케아 카탈로그에서 sku로 고릅니다 (id: 제품명 가로×깊이×높이 mm).\n"+CATALOG.map(c=>c[0]+": "+c[2]+" "+c[4]+"×"+c[5]+"×"+c[6]).join("\n")+"\n"+
     "rot는 가구의 등받이·뒷면이 향하는 쪽입니다: 0=위(N), 90=오른쪽(E), 180=아래(S), 270=왼쪽(W). 소파·침대·옷장·수납장은 보통 뒷면을 벽에 붙입니다. rot가 90 또는 270이면 가로와 깊이가 서로 바뀐 사각형을 차지합니다. x,y는 그렇게 회전한 뒤 차지하는 사각형의 왼쪽 위 모서리이고, 방 안에 들어가야 하며 서로 겹치지 않고 문 앞 통로 800mm를 비웁니다.\n"+
     "자재는 아래 id 중에서만 고르세요.\n바닥: "+matIds("floor")+"\n벽: "+matIds("wall")+"\n천장: "+matIds("ceiling")+"\n"+
     "사진에서 보이는 하자(누수·곰팡이·균열·들뜸 등)와 공사 조건도 판단하세요.\n아래 형태의 JSON 하나만 답하세요.\n"+
     '{"room":{"w":4500,"d":4200,"h":2300},"openings":[{"type":"door","wall":"S","pos":200,"width":900,"sill":0,"height":2100},{"type":"window","wall":"N","pos":600,"width":3000,"sill":900,"height":1200}],"furniture":[{"sku":"kivik3","x":1110,"y":3250,"rot":180},{"sku":"besta180","x":1350,"y":0,"rot":0}],"materials":{"floor":"f_gangmaru","wall":"w_silk","ceiling":"c_paper"},"conditions":{"demolition":true,"sash":false,"insulation":false},"summary":"현장 상태와 제안 요약 2~3문장","notes":["치수 추정 근거","발견한 하자와 시공 시 주의점"]}\n'+
     "furniture는 공간 크기에 맞게 1~10개이고 sku는 반드시 위 카탈로그의 id입니다. 문장은 모두 한국어.";
    return askAI("room",prompt,files,res=>{applyRoomAI(r,res);return "AI가 '"+r.name+"' 도면 초안을 만들었습니다."+(r.measured?"":" 치수는 추정값이니 실측값으로 고쳐 주세요.");});});}
function applyRoomAI(r,x){if(!x||typeof x!=="object"||!x.room)throw {code:"invalid_json"};snapshot();
  if(!r.measured)r.room={w:Math.round(clamp(num(x.room.w,r.room.w),1000,20000)/50)*50,d:Math.round(clamp(num(x.room.d,r.room.d),1000,20000)/50)*50,h:Math.round(clamp(num(x.room.h,r.room.h),2000,4500)/10)*10};
  const R=r.room,ops=(Array.isArray(x.openings)?x.openings:[]).slice(0,10).filter(o=>o&&typeof o.wall==="string"&&o.wall.length===1&&"NESW".includes(o.wall));
  if(ops.length)r.openings=ops.map(o=>{const door=o.type!=="window";return {id:nid(),type:door?"door":"window",wall:o.wall,width:num(o.width,900),pos:num(o.pos,0),sill:door?0:num(o.sill,900),height:num(o.height,door?2100:1200)};});
  const fs=(Array.isArray(x.furniture)?x.furniture:[]).slice(0,14).filter(f=>f&&typeof f==="object").map(f=>CAT[f.sku]?fromCat(f.sku,num(f.x,0),num(f.y,0),num(f.rot,0)):
    {id:nid(),name:String(f.name||"가구").slice(0,20),kind:"box",rot:0,w:clamp(num(f.w,800),200,R.w),d:clamp(num(f.d,600),200,R.d),h:clamp(num(f.h,700),100,R.h-50),x:num(f.x,0),y:num(f.y,0),tone:TONES[f.tone]?f.tone:"main",price:f.price!=null?Math.round(clamp(num(f.price,0),0,30000000)):furnPrice(String(f.name))}).filter(f=>f.w<=R.w&&f.d<=R.d);
  r.furniture=fs.length?fs:template(r.space,R);fitRoom(r);
  r.mats=styleMats(S.style,r.space);const m=x.materials||{};for(const g of ["floor","wall","ceiling"])if(MAT[m[g]]&&MAT[m[g]].g===g)r.mats[g]=m[g];
  const c=x.conditions||{};if(typeof c.demolition==="boolean")r.scope.demo=c.demolition;if(c.sash===true)r.cond.sash=true;if(c.insulation===true)r.cond.insul=true;
  r.ai=[String(x.summary||"").slice(0,600)].concat((Array.isArray(x.notes)?x.notes:[]).slice(0,6).map(n=>"· "+String(n).slice(0,300))).filter(Boolean).join("\n");
  r.ov={};S.example=false;selId=null;}

/* ---------- 3. 평면 배치 ---------- */
function viewPlan(){const r=cur(),R=r.room,M=Math.max(R.w,R.d)*0.16+250,fs=Math.max(R.w,R.d)/24;
  const svg=sv("svg",{id:"plan",viewBox:[-M,-M,R.w+2*M,R.d+2*M].join(" "),role:"img","aria-label":r.name+" 평면도"});
  const css=getComputedStyle(document.documentElement),tok=n=>css.getPropertyValue(n).trim();
  for(let x=500;x<R.w;x+=500)svg.append(sv("line",{x1:x,y1:0,x2:x,y2:R.d,stroke:tok("--grid"),"stroke-width":fs/14}));
  for(let y=500;y<R.d;y+=500)svg.append(sv("line",{x1:0,y1:y,x2:R.w,y2:y,stroke:tok("--grid"),"stroke-width":fs/14}));
  const wt=Math.max(100,fs*0.8);
  svg.append(sv("rect",{x:-wt/2,y:-wt/2,width:R.w+wt,height:R.d+wt,fill:"none",stroke:tok("--wall"),"stroke-width":wt}));
  for(const o of r.openings){const tf={N:"",S:"matrix(1,0,0,-1,0,"+R.d+")",W:"matrix(0,1,1,0,0,0)",E:"matrix(0,1,-1,0,"+R.w+",0)"}[o.wall];
    const og=sv("g",{transform:tf}),a0=o.pos,a1=o.pos+o.width;
    og.append(sv("rect",{x:a0,y:-wt-2,width:o.width,height:wt+4,fill:tok("--canvas")}));
    if(o.type==="door"){og.append(sv("line",{x1:a0,y1:0,x2:a0,y2:o.width,stroke:tok("--accent"),"stroke-width":fs/5}));og.append(sv("path",{d:"M"+a0+" "+o.width+" A"+o.width+" "+o.width+" 0 0 0 "+a1+" 0",fill:"none",stroke:tok("--accent"),"stroke-width":fs/10,"stroke-dasharray":fs/3}));}
    else for(const yy of [-wt*0.8,-wt/2,-wt*0.2])og.append(sv("line",{x1:a0,y1:yy,x2:a1,y2:yy,stroke:tok("--accent"),"stroke-width":fs/9}));
    svg.append(og);}
  const dc=tok("--dim"),dy=-M*0.55,dx=-M*0.55,tk=fs*0.5,lw=fs/10;
  const dl=(x1,y1,x2,y2)=>svg.append(sv("line",{x1,y1,x2,y2,stroke:dc,"stroke-width":lw}));
  dl(0,dy,R.w,dy);dl(0,dy-tk,0,dy+tk);dl(R.w,dy-tk,R.w,dy+tk);dl(dx,0,dx,R.d);dl(dx-tk,0,dx+tk,0);dl(dx-tk,R.d,dx+tk,R.d);
  const t1=sv("text",{x:R.w/2,y:dy-fs*0.5,"text-anchor":"middle","font-size":fs,class:"dimt"});t1.textContent=R.w.toLocaleString();svg.append(t1);
  const t2=sv("text",{x:dx-fs*0.5,y:R.d/2,"text-anchor":"middle","font-size":fs,class:"dimt",transform:"rotate(-90 "+(dx-fs*0.5)+" "+R.d/2+")"});t2.textContent=R.d.toLocaleString();svg.append(t2);
  const tones=STYLES[S.style].tones,bad=clashes(r);
  svg.addEventListener("pointerdown",e=>{if(e.target===svg&&selId){selId=null;render();}});
  for(const f of r.furniture){const fg=sv("g",{class:"furn",transform:"translate("+f.x+" "+f.y+")"}),on=f.id===selId,clash=bad.has(f.id);
    const box=sv("rect",{width:f.w,height:f.d,fill:tones[f.tone]||tones.main,"fill-opacity":.88,stroke:clash?tok("--dim"):on?tok("--accent"):tok("--wall"),"stroke-width":on||clash?fs/5:fs/12,"stroke-dasharray":clash?fs/2.5:null,rx:fs/5});fg.append(box);
    const bt=Math.min(f.w,f.d)*0.16,q=f.rot||0;
    if(f.kind&&f.kind!=="box"&&f.kind!=="plant"&&f.kind!=="lamp"&&f.kind!=="table")fg.append(sv("rect",{x:q===90?f.w-bt:0,y:q===180?f.d-bt:0,width:q%180===0?f.w:bt,height:q%180===0?bt:f.d,fill:tok("--wall"),"fill-opacity":.28,rx:fs/6,"pointer-events":"none"}));
    if(f.w>fs*2.2){const t=sv("text",{x:f.w/2,y:f.d/2+fs*0.28,"text-anchor":"middle","font-size":Math.min(fs*0.75,f.d*0.45,f.w/Math.max(4,f.name.split(" ")[0].length)*1.5),style:"font-family:var(--sans);paint-order:stroke;stroke:"+tok("--canvas")+";stroke-width:"+fs/6+"px;pointer-events:none"});t.textContent=f.name.split(" ")[0];fg.append(t);}
    fg.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();const pt=svg.createSVGPoint(),loc=ev=>{pt.x=ev.clientX;pt.y=ev.clientY;return pt.matrixTransform(svg.getScreenCTM().inverse());};
      const s0=loc(e),ox=f.x,oy=f.y,SN=90;let moved=false;fg.setPointerCapture(e.pointerId);
      const mv=ev=>{const p=loc(ev);let x=clamp(ox+p.x-s0.x,0,R.w-f.w),y=clamp(oy+p.y-s0.y,0,R.d-f.d);
        const xs=[0,R.w-f.w],ys=[0,R.d-f.d];for(const o of r.furniture){if(o===f)continue;if(y<o.y+o.d+SN&&o.y<y+f.d+SN)xs.push(o.x+o.w,o.x-f.w,o.x,o.x+o.w-f.w);if(x<o.x+o.w+SN&&o.x<x+f.w+SN)ys.push(o.y+o.d,o.y-f.d,o.y,o.y+o.d-f.d);}
        let bx=SN,by=SN,sx=null,sy=null;for(const c of xs)if(Math.abs(c-x)<bx){bx=Math.abs(c-x);sx=c;}for(const c of ys)if(Math.abs(c-y)<by){by=Math.abs(c-y);sy=c;}
        f.x=clamp(sx!=null?sx:Math.round(x/10)*10,0,R.w-f.w);f.y=clamp(sy!=null?sy:Math.round(y/10)*10,0,R.d-f.d);moved=true;fg.setAttribute("transform","translate("+f.x+" "+f.y+")");
        box.setAttribute("stroke",r.furniture.some(o=>o!==f&&hit(f,o))?tok("--dim"):tok("--accent"));};
      const up=()=>{fg.removeEventListener("pointermove",mv);fg.removeEventListener("pointerup",up);fg.removeEventListener("pointercancel",up);selId=f.id;if(moved)S.example=false;render();};
      fg.addEventListener("pointermove",mv);fg.addEventListener("pointerup",up);fg.addEventListener("pointercancel",up);});
    svg.append(fg);}
  const f=r.furniture.find(x=>x.id===selId),ik=f&&isIkea(f);
  const setF=(k,v)=>{if(k==="name")f.name=String(v).slice(0,24)||"가구";else if(k==="tone")f.tone=v;else f[k]=clamp(Math.round(num(v,f[k])),50,20000);fitRoom(r);changed();};
  const add=id=>{const nf=fromCat(id,0,0,0);if(nf.w>R.w||nf.d>R.d){if(nf.d<=R.w&&nf.w<=R.d){const w=nf.w;nf.w=nf.d;nf.d=w;nf.rot=90;}else{status.plan="'"+nf.name+"'은(는) 이 공간보다 커서 넣을 수 없습니다.";render();return;}}
    nf.h=Math.min(nf.h,R.h);r.furniture.push(nf);freeSpot(r,nf);selId=nf.id;status.plan="";changed();};
  const q=catQ.trim().toLowerCase(),items=CATALOG.filter(c=>q?(c[2]+" "+c[3]).toLowerCase().includes(q):c[1]===catSel);
  const catalog=h("section",{class:"panel",id:"catalog"},h("h3",{text:"이케아 제품 (참고 카탈로그)"}),
    h("input",{type:"text",id:"cat-q",value:catQ,placeholder:"제품 검색 (예: KALLAX, 책상)",oninput:e=>{catQ=e.target.value;clearTimeout(add.t);add.t=setTimeout(()=>{render();const el=document.getElementById("cat-q");if(el){el.focus();el.setSelectionRange(catQ.length,catQ.length);}},250);}}),
    h("div",{class:"row",style:"gap:4px"},Object.entries(CATS).map(([k,l])=>h("button",{class:"btn small","aria-pressed":String(!q&&catSel===k),onclick:()=>{catSel=k;catQ="";render();}},l))),
    h("div",{class:"catlist"},items.length?items.map(c=>h("button",{class:"card","data-sku":c[0],title:"눌러서 방에 배치",onclick:()=>add(c[0])},h("b",{text:c[2]}),c[3]?h("small",{text:c[3]}):null,
      h("small",{style:"font-family:var(--mono)",text:c[4]+"×"+c[5]+"×"+c[6]+" mm"}),h("small",{style:"font-family:var(--mono)",text:c[7]?won(c[7])+"원":"견적 제외"}))):h("p",{class:"note",text:"찾는 제품이 없습니다. '일반·설비'의 직접 입력 가구를 써 보세요."})),
    h("p",{class:"note",text:"제품을 누르면 방의 빈자리에 놓입니다. 규격과 가격은 참고값이니 구매 전 이케아에서 확인하세요."}));
  const props=h("section",{class:"panel"},h("h3",{text:"선택한 가구"}),
    f?h("div",{class:"stack",style:"gap:10px"},
      ik?h("div",{},h("b",{text:f.name}),h("div",{class:"note",text:CAT[f.sku].desc})):fld("이름",inp("text",f.name,v=>setF("name",v),{id:"f-name"})),
      h("div",{class:"fields",style:"grid-template-columns:repeat(3,minmax(0,1fr))"},fld("가로",inp("number",f.w,v=>setF("w",v),{id:"f-w",step:"10"})),fld("깊이",inp("number",f.d,v=>setF("d",v),{id:"f-d",step:"10"})),fld("높이",inp("number",f.h,v=>setF("h",v),{id:"f-h",step:"10"}))),
      h("div",{class:"fields"},fld("단가 (원, 0이면 견적 제외)",inp("number",f.price!=null?f.price:furnPrice(f.name),v=>{f.price=Math.max(0,Math.round(num(v,0)));delete r.ov["furn_"+f.id];changed();},{id:"f-price",step:"1000",min:"0"})),fld("색 계열",sel(Object.entries(TONES),f.tone,v=>setF("tone",v),"f-tone"))),
      h("div",{class:"row"},h("button",{class:"btn small",id:"f-rot",onclick:()=>{turn(r,f);changed();}},"90° 회전"),
        h("button",{class:"btn small",id:"f-dup",onclick:()=>{const c=Object.assign({},f,{id:nid()});r.furniture.push(c);freeSpot(r,c);selId=c.id;changed();}},"복제"),
        h("button",{class:"btn small",id:"f-del",onclick:()=>{r.furniture=r.furniture.filter(x=>x!==f);selId=null;changed();}},"삭제"),
        ik?h("a",{class:"btn small",href:ikeaUrl(f.name),target:"_blank",rel:"noopener"},"이케아에서 보기"):null),
      bad.has(f.id)?h("p",{class:"note warn",text:"다른 가구와 겹쳐 있습니다."}):null,
      h("p",{class:"note",text:"키보드: 방향키로 50mm 이동(Shift는 10mm), R 회전, Delete 삭제"})):
      h("p",{class:"note",text:"도면에서 가구를 누르면 여기서 크기·단가·방향을 바꿉니다."}));
  const groups={};for(const x of r.furniture){const k=(x.sku||x.name)+"|"+x.w*x.d+"|"+(x.price!=null?x.price:furnPrice(x.name));(groups[k]=groups[k]||{f:x,n:0}).n++;}
  const gl=Object.values(groups),sum=gl.reduce((a,g)=>a+g.n*(g.f.price!=null?g.f.price:furnPrice(g.f.name)),0);
  const list=h("section",{class:"panel"},h("div",{class:"row",style:"justify-content:space-between"},h("h2",{text:r.name+" 가구 목록"}),h("b",{style:"font-family:var(--mono)",text:"합계 "+won(sum)+"원"})),
    gl.length?h("div",{class:"tw"},h("table",{class:"narrow"},h("thead",{},h("tr",{},["제품","규격 (mm)"].map(x=>h("th",{text:x})),["수량","단가","금액"].map(x=>h("th",{class:"num",text:x})))),
      h("tbody",{},gl.map(g=>{const pr=g.f.price!=null?g.f.price:furnPrice(g.f.name);return h("tr",{},h("td",{},isIkea(g.f)?h("a",{href:ikeaUrl(g.f.name),target:"_blank",rel:"noopener",text:g.f.name}):g.f.name),
        h("td",{style:"font-family:var(--mono)",text:Math.max(g.f.w,g.f.d)+"×"+Math.min(g.f.w,g.f.d)+"×"+g.f.h}),h("td",{class:"num",text:String(g.n)}),h("td",{class:"num",text:pr?won(pr):"제외"}),h("td",{class:"num",text:won(pr*g.n)}));})))):
      h("p",{class:"note",text:"아직 배치한 가구가 없습니다."}),
    h("p",{class:"note",text:"이 목록이 그대로 견적의 가구 항목이 됩니다(배송·조립 인건비는 견적에서 더해집니다). 제품명을 누르면 이케아 코리아 검색으로 이동합니다."}));
  const tb=(k,l)=>h("button",{class:"btn small",id:"pv-"+k,"aria-pressed":String(planView===k),onclick:()=>{planView=k;render();}},l);
  const cb=(l,k)=>h("button",{class:"btn small",onclick:()=>cam3D(k)},l);
  return h("div",{class:"stack"},
    h("div",{class:"planner"},
      h("div",{class:"stack pl-canvas"},
        h("div",{class:"row"},tb("2d","2D 평면"),tb("3d","3D 보기"),planView==="3d"?[cb("조감도","bird"),cb("위에서","top"),cb("실내 투시","in")]:null,
          bad.size?h("span",{class:"chip warn",text:"겹친 가구 "+bad.size+"개"}):null),
        h("div",{class:"canvasbox"},planView==="3d"?h("div",{id:"three"}):svg),
        status.plan?h("p",{class:"note warn",text:status.plan}):null,
        h("p",{class:"note",text:planView==="3d"?"끌어서 돌려 보고, 휠이나 두 손가락으로 확대합니다. 가구를 옮기려면 2D 평면으로 바꾸세요.":"가구를 끌면 벽과 다른 가구에 자석처럼 붙습니다. 짙은 띠가 있는 쪽이 등받이·뒷면입니다. 단위 mm, 격자 한 칸 500mm."})),
      h("div",{class:"pl-cat"},catalog),
      h("aside",{class:"stack pl-side"},props,dimsPanel(r))),
    list,
    h("div",{class:"grid even"},openingsPanel(r),condPanel(r)),
    nextBtn("est","다음: 견적"));}
addEventListener("keydown",e=>{if(tab!=="dims"||planView!=="2d"||!selId||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))return;const r=cur(),f=r.furniture.find(x=>x.id===selId);if(!f)return;
  const st=e.shiftKey?10:50,mv={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,-st],ArrowDown:[0,st]}[e.key];
  if(mv){f.x=clamp(f.x+mv[0],0,r.room.w-f.w);f.y=clamp(f.y+mv[1],0,r.room.d-f.d);}else if(e.key==="r"||e.key==="R")turn(r,f);
  else if(e.key==="Delete"||e.key==="Backspace"){r.furniture=r.furniture.filter(x=>x!==f);selId=null;}else return;
  e.preventDefault();changed();});

/* ---------- 3D·렌더 ---------- */
let T3=null;
function renderPrompt(r){const st=STYLES[S.style],R=r.room;
  return "Edit the attached photo of this "+SPACE_EN[r.space]+" in a Korean apartment and show it after the renovation is finished. Keep exactly the same camera angle, room shape and proportions, and the positions and sizes of windows and doors. Remove all existing furniture, clutter and old finishes. "+
   "Style: "+st.en+". New floor: "+MAT[r.mats.floor].en+". New walls: "+MAT[r.mats.wall].en+". New ceiling: "+MAT[r.mats.ceiling].en+" with recessed LED downlights. "+
   "Room size about "+(R.w/1000).toFixed(1)+" m wide by "+(R.d/1000).toFixed(1)+" m deep, ceiling height "+(R.h/1000).toFixed(2)+" m. "+
   (r.furniture.length?"Add this furniture at real scale: "+r.furniture.map(f=>(isIkea(f)?"IKEA ":"")+f.name+" "+f.w+"x"+f.d+"x"+f.h+" mm").join("; ")+". Place it sensibly for the room, keeping walkways clear. ":"")+
   "Photorealistic real-estate interior photograph, natural daylight, realistic materials, reflections and soft shadows, straight verticals, no people, no text, no watermark.";}
function viewReal(){const r=cur();r.renders=r.renders||[];
  const pr=h("pre",{class:"out",id:"render-prompt",text:r.prompt||renderPrompt(r)});
  const base=r.photos.find(p=>p.id===r.base)||r.photos.find(p=>p.dir==="all")||r.photos[0];
  const [fi,drop]=uploader("render-input","다른 곳에서 만든 이미지를 직접 올리기 (JPG·PNG)",true,async fs=>{for(const f of fs.filter(okImg)){if(r.renders.length>=12)break;r.renders.push(await storeImage(f,2400));}changed();});
  let extra;
  return h("div",{class:"stack"},
    h("section",{class:"panel"},h("h2",{text:r.name+" 시공 전 · 후"}),
      h("div",{class:"row"},h("button",{class:"btn primary",id:"make-real",disabled:!AI||!!aiCtl||!base,onclick:()=>makeReal(r,extra.value)},aiCtl?"만드는 중…":(r.renders.length?"다시 만들기":STYLES[S.style].name+" 스타일 실사 만들기")),
        extra=h("input",{type:"text",id:"render-extra",style:"flex:1;min-width:180px",placeholder:"추가 요청 (예: 소파를 베이지색으로, 조명을 더 따뜻하게)"}),stopBtn()),
      aiNote(),status.render?h("p",{class:"note",text:status.render}):null,
      r.photos.length>1?fld("기준 현장 사진",sel(r.photos.map((p,i)=>[p.id,(i+1)+". "+DIRS[p.dir]]),base.id,v=>{r.base=v;changed();},"render-base")):null,
      (base||r.renders.length)?h("div",{class:"photos",style:"grid-template-columns:repeat(auto-fill,minmax(300px,1fr))"},
        base?h("div",{class:"photo"},h("img",{src:base.url,alt:"시공 전"}),h("span",{class:"chip",text:"시공 전 (현장 사진)"})):null,
        r.renders.map((p,i)=>h("div",{class:"photo"},h("img",{src:p.url,alt:"시공 후 실사 "+(i+1)}),h("div",{class:"row"},h("span",{class:"chip ok",text:"시공 후 실사 "+(i+1)}),
          h("button",{class:"btn small",text:"저장",onclick:async()=>{try{downloads.save({filename:(r.name.replace(/[\\/:*?"<>|]/g,"")||"공간")+"-실사-"+(i+1)+".jpg",data:await blobOf(p)});}catch(e){}}}),
          h("button",{class:"btn small",text:"삭제",onclick:()=>{dropImage(p);r.renders=r.renders.filter(x=>x!==p);changed();}}))))):
        h("p",{class:"note",text:"1단계에서 이 공간의 현장 사진을 올리면 여기에서 실사 이미지를 만들 수 있습니다."}),
      h("p",{class:"note",text:"실사 이미지는 스타일과 분위기를 보여 주는 시안입니다. 이미지 속 치수는 정확하지 않으니, 다음 단계에서 실측 치수를 넣어 견적을 확정하세요."})),
    h("details",{class:"panel"},h("summary",{text:"지시문 보기 · 직접 올리기"}),
      h("div",{class:"stack",style:"margin-top:12px"},pr,
        h("div",{class:"row"},h("button",{class:"btn small",onclick:async()=>{try{await navigator.clipboard.writeText(pr.textContent);status.render="지시문을 복사했습니다.";}catch(e){status.render="복사가 막혀 있습니다. 글을 직접 선택해 복사하세요.";}render();}},"지시문 복사"),
          h("button",{class:"btn small",disabled:!AI||!!aiCtl,onclick:()=>askAI("render","아래는 현장 사진을 시공 후 모습으로 편집하기 위한 영어 지시문 초안입니다. 같은 사실(카메라 각도 유지, 치수, 자재, 가구 규격)을 모두 유지하면서 "+STYLES[S.style].name+" 스타일의 조명, 소품, 색감, 질감을 더 구체적으로 묘사한 영어 지시문 한 단락으로 다시 써 주세요. 지시문 본문만 답하세요.\n\n"+renderPrompt(r),null,t=>{r.prompt=String(t).slice(0,3000);return "AI가 지시문을 다듬었습니다. 다시 만들기를 누르면 이 지시문으로 만듭니다.";},false)},"AI로 지시문 다듬기"),
          r.prompt?h("button",{class:"btn small",onclick:()=>{r.prompt="";changed();}},"기본 지시문으로"):null),
        fi,drop)),
    nextBtn("dims","다음: 치수·가구 배치"));}
function view3D(){const r=cur(),box=h("div",{id:"three"}),msg=h("p",{class:"note","aria-live":"polite"});
  const b=(l,k)=>h("button",{class:"btn small",onclick:()=>cam3D(k)},l);
  return h("div",{class:"stack"},h("div",{class:"row"},b("조감도","bird"),b("평면(위에서)","top"),b("실내 투시","in"),
      h("button",{class:"btn small primary",onclick:()=>{if(!T3)return;T3.renderer.render(T3.scene,T3.camera);T3.renderer.domElement.toBlob(async bl=>{if(!bl)return;try{await downloads.save({filename:(r.name.replace(/[\\/:*?"<>|]/g,"")||"공간")+"-3D.png",data:bl});msg.textContent="이미지를 저장했습니다.";}catch(e){msg.textContent=e&&e.code==="declined"?"저장을 취소했습니다.":"이 화면에서는 이미지 저장이 안 됩니다.";}},"image/png");}},"지금 화면 PNG 저장"),
      h("span",{class:"note",text:"끌어서 회전 · 휠/두 손가락으로 확대"})),
    h("div",{class:"canvasbox"},box),msg,
    h("p",{class:"note",text:"치수·문창·자재·가구 배치가 그대로 반영된 배치 확인용 3D입니다. 실사 이미지를 만들 때 가구 위치 기준으로 함께 넣을 수 있습니다."}));}
// 가구 3D 모양. 원점은 바닥 중앙, 뒷면(등받이)은 -z 쪽. 치수는 m.
function furn3D(f,tones){const sw=(f.rot||0)%180===90,w=(sw?f.d:f.w)/1000,d=(sw?f.w:f.d)/1000,H=f.h/1000,g=new THREE.Group();
  const base=new THREE.Color(tones[f.tone]||tones.main),mat=k=>new THREE.MeshStandardMaterial({color:base.clone().multiplyScalar(k||1),roughness:.8});
  const B=(bw,bh,bd,x,y,z,k)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(bw,.005),Math.max(bh,.005),Math.max(bd,.005)),typeof k==="object"?k:mat(k));m.position.set(x,y,z);g.add(m);return m;};
  const legs=(lh,ins,t)=>{for(const sx of [-1,1])for(const sz of [-1,1])B(t,lh,t,sx*(w/2-ins),lh/2,sz*(d/2-ins),.7);};
  const white=new THREE.MeshStandardMaterial({color:0xf3f1ec,roughness:.9}),k=f.kind||"box";
  if(k==="sofa"){const sh=Math.min(.42,H*.55),aw=Math.min(.2,w*.1),bd=d*.24;B(w,sh*.45,d,0,sh*.225+.04,0,.8);legs(.05,.06,.04);
    B(w-2*aw,sh*.55,d-bd,0,sh*.725+.02,bd/2,1.05);B(w,H-sh*.3,bd,0,(H+sh*.3)/2,-d/2+bd/2,1);for(const sx of [-1,1])B(aw,Math.min(H*.75,sh+.2),d,sx*(w/2-aw/2),Math.min(H*.75,sh+.2)/2+.04,0,.95);
    const n=Math.max(1,Math.round((w-2*aw)/.75));for(let i=1;i<n;i++)B(.012,sh*.56,d-bd,-(w-2*aw)/2+i*(w-2*aw)/n,sh*.725+.02,bd/2,.75);}
  else if(k==="bed"){B(w,.28,d,0,.16,0,1);B(w,Math.max(H,.5),.06,0,Math.max(H,.5)/2,-d/2+.03,1);B(w-.08,.2,d-.14,0,.4,.03,white);
    const pw=w>1.3?w*.4:w*.7;for(const sx of (w>1.3?[-1,1]:[0]))B(pw,.1,.4,sx*w*.23,.55,-d/2+.32,white);B(w-.06,.05,d*.55,0,.52,d*.2,.85);}
  else if(k==="table"){const t=Math.min(.05,H*.1);B(w,t,d,0,H-t/2,0,1);legs(H-t,.05,.05);if(H<.55&&w>.7)B(w-.14,.02,d-.14,0,H*.35,0,.9);}
  else if(k==="chair"){const sh=Math.min(.46,H*.6);B(w,.04,d,0,sh,0,1);B(w,H-sh,.04,0,(H+sh)/2,-d/2+.02,1);legs(sh,.03,.035);}
  else if(k==="office"){const sh=.48;B(w*.8,.07,d*.75,0,sh,.02,1);B(w*.75,H-sh-.05,.07,0,(H+sh)/2+.03,-d/2+.1,1);B(.06,sh-.08,.06,0,sh/2,0,.5);
    const c=new THREE.Mesh(new THREE.CylinderGeometry(Math.min(w,d)*.45,Math.min(w,d)*.45,.04,20),mat(.5));c.position.y=.04;g.add(c);}
  else if(k==="shelf"||k==="cube"){const t=k==="cube"?.038:.02;B(w,H,.008,0,H/2,-d/2+.004,.92);for(const sx of [-1,1])B(t,H,d,sx*(w/2-t/2),H/2,0,1);
    const rows=Math.max(1,Math.round(H/(k==="cube"?.365:.34)));for(let i=0;i<=rows;i++)B(w-2*t,t,d,0,t/2+i*(H-t)/rows,0,1);
    if(k==="cube"){const cols=Math.max(1,Math.round(w/.365));for(let i=1;i<cols;i++)B(t,H,d,-w/2+i*w/cols,H/2,0,1);}}
  else if(k==="ward"||k==="drawer"||k==="tv"){const lift=k==="tv"?.08:k==="drawer"?.05:0;B(w,H-lift,d,0,lift+(H-lift)/2,0,1);if(lift)legs(lift,.05,.04);
    if(k==="drawer"){const rows=Math.max(1,Math.round((H-lift)/.22));for(let i=1;i<rows;i++)B(w-.02,.008,.01,0,lift+i*(H-lift)/rows,d/2+.002,.6);if(w>1.1)B(.008,H-lift-.02,.01,0,lift+(H-lift)/2,d/2+.002,.6);
      for(let i=0;i<rows;i++)for(const sx of (w>1.1?[-.25,.25]:[0]))B(.1,.012,.02,sx*w,lift+(i+.5)*(H-lift)/rows,d/2+.012,.45);}
    else{const n=Math.max(1,Math.round(w/(k==="tv"?.6:.5)));for(let i=1;i<n;i++)B(.008,H-lift-.02,.01,-w/2+i*w/n,lift+(H-lift)/2,d/2+.002,.6);
      if(k==="ward")for(let i=0;i<n;i++)B(.015,.16,.025,-w/2+(i+(i%2?.12:.88))*w/n,Math.min(1.05,H*.5),d/2+.014,.45);}}
  else if(k==="plant"){const pr=Math.min(w,d)*.3,ph=Math.min(.3,H*.3),pot=new THREE.Mesh(new THREE.CylinderGeometry(pr,pr*.8,ph,16),white);pot.position.y=ph/2;g.add(pot);
    const leaf=new THREE.MeshStandardMaterial({color:0x4f7d4a,roughness:.9});for(const [x,y,z,rr] of [[0,.6,0,.5],[.12,.42,.08,.36],[-.1,.78,-.06,.34]]){const b=new THREE.Mesh(new THREE.SphereGeometry(Math.min(w,d)*rr,12,10),leaf);b.position.set(x*w,ph+(H-ph)*y,z*d);b.scale.y=1.25;g.add(b);}}
  else if(k==="lamp"){const c=new THREE.Mesh(new THREE.CylinderGeometry(Math.min(w,d)*.4,Math.min(w,d)*.4,.03,16),mat(.6));c.position.y=.015;g.add(c);B(.025,H-.25,.025,0,(H-.25)/2,0,.6);
    const sh=new THREE.Mesh(new THREE.CylinderGeometry(Math.min(w,d)*.3,Math.min(w,d)*.48,.24,18),new THREE.MeshStandardMaterial({color:0xf2e8d0,roughness:.6,emissive:0x554422}));sh.position.y=H-.12;g.add(sh);}
  else B(w,H,d,0,H/2,0,1);
  return g;}
function floorTex(r,m){const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");x.fillStyle=m.color;x.fillRect(0,0,256,256);x.strokeStyle="rgba(0,0,0,.18)";x.lineWidth=2;
  if(m.pat==="plank"){for(let i=0;i<4;i++){x.fillStyle="rgba(0,0,0,"+(0.02+0.03*(i%2))+")";x.fillRect(0,i*64,256,64);x.beginPath();x.moveTo(0,i*64);x.lineTo(256,i*64);x.stroke();const o=(i*97)%256;x.beginPath();x.moveTo(o,i*64);x.lineTo(o,i*64+64);x.stroke();}}
  else if(m.pat==="tile"){x.strokeRect(0,0,256,256);x.beginPath();x.moveTo(128,0);x.lineTo(128,256);x.moveTo(0,128);x.lineTo(256,128);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.repeat.set(r.room.w/1000/(m.pat==="tile"?1.2:0.8),r.room.d/1000/(m.pat==="tile"?1.2:0.5));return t;}
function init3D(){const box=document.getElementById("three"),r=cur();if(!box)return;
  if(!window.THREE||!THREE.OrbitControls){box.append(h("p",{class:"note",style:"padding:16px",text:"3D 라이브러리를 불러오지 못했습니다. 네트워크를 확인하고 새로고침해 주세요. 도면과 견적은 그대로 쓸 수 있습니다."}));return;}
  let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});}catch(e){box.append(h("p",{class:"note",style:"padding:16px",text:"이 기기에서는 3D(WebGL)를 쓸 수 없습니다."}));return;}
  const R=r.room,W=R.w/1000,D=R.d/1000,H=R.h/1000,scene=new THREE.Scene();
  scene.background=new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim()||"#f7f9fb");
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.9;box.append(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(50,4/3,0.05,200),controls=new THREE.OrbitControls(camera,renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff,0x8a94a3,0.6));
  const ext=Math.max(W,D),sun=new THREE.DirectionalLight(0xfff4e0,0.8);sun.position.set(W,H+4,D*0.8);sun.castShadow=true;const sc=sun.shadow.camera;sc.left=-ext;sc.right=ext;sc.top=ext;sc.bottom=-ext;sc.far=40;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-0.0005;scene.add(sun);
  const bulb=new THREE.PointLight(0xfff1dc,0.45,ext*3);bulb.position.set(0,H-0.3,0);scene.add(bulb);
  const fm=MAT[r.mats.floor],wm=MAT[r.mats.wall],cm=MAT[r.mats.ceiling];
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshStandardMaterial({map:floorTex(r,fm),roughness:fm.pat==="tile"?.35:.7}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshStandardMaterial({color:cm.color,roughness:1}));ceil.rotation.x=Math.PI/2;ceil.position.y=H;scene.add(ceil);
  const wallMat=new THREE.MeshStandardMaterial({color:wm.color,roughness:.95}),baseMat=new THREE.MeshStandardMaterial({color:0xf2f2f0,roughness:.6}),glass=new THREE.MeshStandardMaterial({color:0x9fc6e8,transparent:true,opacity:.3,side:THREE.DoubleSide});
  const put=(wall,a0,a1,y0,y1,mat,off)=>{if(a1-a0<0.005||y1-y0<0.005)return;const m=new THREE.Mesh(new THREE.PlaneGeometry(a1-a0,y1-y0),mat),am=(a0+a1)/2,y=(y0+y1)/2,o=off||0;
    if(wall==="N")m.position.set(-W/2+am,y,-D/2+o);else if(wall==="S"){m.position.set(-W/2+am,y,D/2-o);m.rotation.y=Math.PI;}else if(wall==="W"){m.position.set(-W/2+o,y,-D/2+am);m.rotation.y=Math.PI/2;}else{m.position.set(W/2-o,y,-D/2+am);m.rotation.y=-Math.PI/2;}
    m.receiveShadow=mat===wallMat;scene.add(m);};
  for(const wall of "NESW"){const L=(wall==="N"||wall==="S")?W:D;let c0=0;
    for(const o of r.openings.filter(o=>o.wall===wall).sort((a,b)=>a.pos-b.pos)){const a0=o.pos/1000,a1=Math.min(L,(o.pos+o.width)/1000);if(a0<c0)continue;
      const sill=o.type==="door"?0:o.sill/1000,top=Math.min(H,sill+o.height/1000);
      put(wall,c0,a0,0,H,wallMat);put(wall,c0,a0,0,0.06,baseMat,0.004);put(wall,a0,a1,0,sill,wallMat);put(wall,a0,a1,top,H,wallMat);if(o.type==="window")put(wall,a0,a1,sill,top,glass);c0=a1;}
    put(wall,c0,L,0,H,wallMat);put(wall,c0,L,0,0.06,baseMat,0.004);}
  const tones=STYLES[S.style].tones;
  for(const f of r.furniture){const g=furn3D(f,tones);g.position.set(-W/2+(f.x+f.w/2)/1000,0,-D/2+(f.y+f.d/2)/1000);g.rotation.y=-(f.rot||0)*Math.PI/180;
    g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(g);}
  let raf=0;const draw=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;renderer.render(scene,camera);});};
  const size=()=>{const w=box.clientWidth,hh=box.clientHeight||w*0.75;if(!w)return;renderer.setSize(w,hh,false);camera.aspect=w/hh;camera.updateProjectionMatrix();draw();};
  const ro=new ResizeObserver(size);ro.observe(box);controls.addEventListener("change",draw);
  T3={renderer,scene,camera,controls,ro,draw,W,D,H,r};cam3D("bird");size();}
function cam3D(k){if(!T3)return;const {camera,controls,W,D,H,r}=T3,m=Math.max(W,D);
  if(k==="top"){camera.position.set(0,m*1.5+H,0.01);controls.target.set(0,0,0);}
  else if(k==="in"){const o=r.openings.find(x=>x.type==="door"),mid=o?(o.pos+o.width/2)/1000:0;let p=[0,1.5,D/2-0.3];
    if(o){if(o.wall==="N")p=[-W/2+mid,1.5,-D/2+0.3];else if(o.wall==="S")p=[-W/2+mid,1.5,D/2-0.3];else if(o.wall==="W")p=[-W/2+0.3,1.5,-D/2+mid];else p=[W/2-0.3,1.5,-D/2+mid];}
    camera.position.set(p[0],Math.min(1.5,H-0.3),p[2]);controls.target.set(0,1.0,0);}
  else{camera.position.set(W*0.85,m*0.95+H,D*1.15);controls.target.set(0,H*0.25,0);}
  controls.update();T3.draw();}
function dispose3D(){if(!T3)return;T3.ro.disconnect();T3.controls.dispose();T3.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});T3.renderer.dispose();T3=null;}

/* ---------- 5. 자재 ---------- */
function viewMat(){const r=cur();
  return h("div",{class:"stack"},Object.entries(GROUPS).map(([g,label])=>h("section",{class:"panel"},h("h2",{text:r.name+" · "+label+" 마감"}),
    h("div",{class:"cards",style:"grid-template-columns:repeat(auto-fill,minmax(190px,1fr))"},Object.entries(MAT).filter(([,m])=>m.g===g).map(([id,m])=>h("button",{class:"card","aria-pressed":String(r.mats[g]===id),onclick:()=>{r.mats[g]=id;delete r.ov[g==="ceiling"?"ceil":g];changed();}},
      h("div",{class:"row",style:"justify-content:space-between"},h("b",{text:m.name}),h("span",{class:"chip",text:m.grade})),
      h("div",{class:"sw"},h("i",{style:"background:"+m.color})),
      h("small",{text:m.spec}),h("small",{style:"font-family:var(--mono)",text:"재료 "+won(m.price)+"원/㎡ · "+m.trade+" "+m.pum+"인/㎡"})))))),
    h("div",{class:"row"},h("button",{class:"btn small",onclick:()=>{snapshot();for(const x of S.rooms)if(x!==r&&x.space===r.space){x.mats=Object.assign({},r.mats);delete x.ov.floor;delete x.ov.wall;delete x.ov.ceil;}status.mat="같은 유형("+SPACES[r.space]+") 공간에 이 마감을 적용했습니다.";changed();}},"같은 유형 공간에 똑같이 적용"),undoBtn()),
    status.mat?h("p",{class:"note",text:status.mat}):null,
    h("p",{class:"note",text:"재료 단가는 시세 참고값입니다. 거래처 단가는 견적 탭에서 줄마다 고칠 수 있습니다. 여기서 자재를 바꾸면 그 줄의 수동 수정은 초기화됩니다."}));}

/* ---------- 6. 견적 ---------- */
function setOv(owner,l,k,v){if(l.auto)owner.ov[l.key]=Object.assign(owner.ov[l.key]||{},{[k]:v});else{const c=owner.custom.find(c=>c.key===l.key);if(c)c[k]=v;}changed();}
function lineTable(owner,lines){const trades=Object.keys(S.rates).map(k=>[k,k]);
  const rows=lines.map(l=>h("tr",{class:l.off?"off":""},
    h("td",{},inp("text",l.cat,v=>setOv(owner,l,"cat",v.slice(0,10)),{style:"width:64px","aria-label":"공종"})),
    h("td",{},inp("text",l.name,v=>setOv(owner,l,"name",v.slice(0,40)),{class:"nm","aria-label":"품명"}),h("div",{class:"note",style:"font-size:11px",text:l.spec||""})),
    h("td",{text:l.unit}),
    h("td",{class:"num"},inp("number",l.qty,v=>setOv(owner,l,"qty",Math.max(0,num(v,0))),{step:"0.1",min:"0","aria-label":"수량"})),
    h("td",{class:"num"},inp("number",l.mat,v=>setOv(owner,l,"mat",Math.max(0,num(v,0))),{step:"100",min:"0","aria-label":"재료 단가"})),
    h("td",{},sel(trades,l.trade,v=>setOv(owner,l,"trade",v))),
    h("td",{class:"num"},inp("number",l.pum,v=>setOv(owner,l,"pum",Math.max(0,num(v,0))),{step:"0.005",min:"0",style:"width:72px","aria-label":"품(인)"})),
    h("td",{class:"num",text:won(l.labor)}),h("td",{class:"num",text:won(l.total)}),
    h("td",{},h("div",{class:"row",style:"flex-wrap:nowrap;gap:4px"},
      l.auto&&l.edited?h("button",{class:"btn small",title:"자동 계산값으로 되돌리기",onclick:()=>{const off=owner.ov[l.key]&&owner.ov[l.key].off;owner.ov[l.key]=off?{off:true}:{};changed();}},"↺"):null,
      l.auto?h("button",{class:"btn small",onclick:()=>setOv(owner,l,"off",!l.off)},l.off?"넣기":"빼기"):h("button",{class:"btn small",onclick:()=>{owner.custom=owner.custom.filter(c=>c.key!==l.key);changed();}},"삭제")))));
  return h("div",{class:"tw"},h("table",{},h("thead",{},h("tr",{},["공종","품명 · 규격","단위"].map(x=>h("th",{text:x})),["수량","재료 단가"].map(x=>h("th",{class:"num",text:x})),h("th",{text:"직종"}),["품(인/단위)","노무 단가","금액"].map(x=>h("th",{class:"num",text:x})),h("th",{}))),h("tbody",{},rows)));}
function usageTable(){const use={};for(const r of S.rooms){const ls=roomLines(r);for(const [key,g] of [["floor","floor"],["wall","wall"],["ceil","ceiling"]]){const l=ls.find(x=>x.key===key);if(!l||l.off)continue;const id=r.mats[g];(use[id]=use[id]||{q:0,rooms:[]}).q+=l.qty;use[id].rooms.push(r.name);}}
  return h("div",{class:"tw"},h("table",{class:"narrow"},h("thead",{},h("tr",{},["자재","쓰는 공간"].map(x=>h("th",{text:x})),["사용량","포장 단위(㎡)"].map(x=>h("th",{class:"num",text:x})),h("th",{class:"num",text:"주문 수량"}))),
    h("tbody",{},Object.entries(use).map(([id,u])=>{const pk=PACK[id]||[1,"㎡"],m2=S.pack[id]||pk[0];
      return h("tr",{},h("td",{},MAT[id].name,h("div",{class:"note",style:"font-size:11px",text:GROUPS[MAT[id].g]+" · "+MAT[id].spec})),h("td",{text:u.rooms.join(", ")}),h("td",{class:"num",text:u.q.toFixed(1)+"㎡"}),
        h("td",{class:"num"},inp("number",m2,v=>{S.pack[id]=clamp(num(v,pk[0]),0.1,500);changed();},{step:"0.01",min:"0.1","aria-label":MAT[id].name+" 포장 단위 면적"})),h("td",{class:"num",text:Math.ceil(u.q/m2-1e-9)+" "+pk[1]}));}))));}
function furnTable(){const rows=[];for(const r of S.rooms)if(r.scope.furn!==false)for(const l of roomLines(r))if(l.key&&String(l.key).startsWith("furn_")&&!l.off)rows.push([r.name,l]);
  if(!rows.length)return h("p",{class:"note",text:"견적에 포함된 가구가 없습니다."});
  return h("div",{class:"tw"},h("table",{class:"narrow"},h("thead",{},h("tr",{},["공간","가구","규격 (가로×세로×높이)"].map(x=>h("th",{text:x})),["수량","금액"].map(x=>h("th",{class:"num",text:x})))),
    h("tbody",{},rows.map(([n,l])=>h("tr",{},h("td",{text:n}),h("td",{text:l.name}),h("td",{style:"font-family:var(--mono)",text:String(l.spec).split(" · ")[0]}),h("td",{class:"num",text:String(l.qty)}),h("td",{class:"num",text:won(l.total)}))),
      h("tr",{},h("td",{colspan:"4",text:"가구 합계"}),h("td",{class:"num",text:won(rows.reduce((s,x)=>s+x[1].total,0))})))));}
function viewEst(){const lines=allLines(),t=totals(lines),A=S.rooms.reduce((s,r)=>s+areaOf(r),0),py=A/3.3058;
  if(estScope!=="all"&&estScope!=="common"&&!S.rooms.some(r=>r.id===estScope))estScope="all";
  const scopeBar=h("div",{class:"rooms"},[["all","전체 요약"],["common","공통 공사"]].concat(S.rooms.map(r=>[r.id,r.name])).map(([k,l])=>h("button",{"aria-pressed":String(estScope===k),id:"est-"+k,onclick:()=>{estScope=k;render();}},l)));
  let body;
  if(estScope==="all"){const groups=S.rooms.map(r=>[r.name,roomLines(r),areaOf(r).toFixed(1)+"㎡",r.id]).concat([["공통 공사",commonLines(),"—","common"]]);
    body=h("section",{class:"panel"},h("h2",{text:"공간별 합계"}),
      h("div",{class:"tw"},h("table",{class:"narrow"},h("thead",{},h("tr",{},h("th",{text:"공간"}),["면적","재료비","노무비","직접공사비"].map(x=>h("th",{class:"num",text:x})))),
        h("tbody",{},groups.map(([n,ls,a,id])=>{const m=ls.reduce((s,l)=>s+l.matSum,0),lb=ls.reduce((s,l)=>s+l.labSum,0);
          return h("tr",{},h("td",{},h("button",{class:"btn small",onclick:()=>{estScope=id;render();}},n)),h("td",{class:"num",text:a}),h("td",{class:"num",text:won(m)}),h("td",{class:"num",text:won(lb)}),h("td",{class:"num",text:won(m+lb)}));})))),
      h("p",{class:"note",text:"공간 이름을 누르면 그 공간의 내역을 줄 단위로 고칠 수 있습니다."}),
      h("h2",{text:"마감재 사용량·주문 수량"}),usageTable(),
      h("p",{class:"note",text:"사용량은 할증(바닥·천장 5%, 벽 10%)을 포함한 값입니다. 포장 단위는 제품마다 다르니 실제 제품 규격으로 고치면 주문 수량이 다시 계산됩니다."}),
      h("h2",{text:"가구 목록"}),furnTable());}
  else{const owner=estScope==="common"?S.common:S.rooms.find(r=>r.id===estScope),ls=estScope==="common"?commonLines():roomLines(owner),sub=ls.reduce((s,l)=>s+l.total,0);
    body=h("section",{class:"panel"},h("div",{class:"row",style:"justify-content:space-between"},h("h2",{text:(estScope==="common"?"공통 공사":owner.name)+" 내역"}),h("span",{class:"note",text:"직접공사비 소계 "+won(sub)+"원"})),
      estScope==="common"?h("p",{class:"note",text:"보양·폐기물·양중·청소처럼 집 전체에 한 번 드는 공사입니다."}):
        h("div",{class:"row"},h("h3",{text:"공사 범위"}),chk("철거",owner.scope.demo,v=>{owner.scope.demo=v;changed();},"sc-demo"),chk("전기·조명",owner.scope.elec,v=>{owner.scope.elec=v;changed();},"sc-elec"),chk("문 교체",owner.scope.doors,v=>{owner.scope.doors=v;changed();},"sc-doors"),chk("천장 몰딩",owner.scope.mold,v=>{owner.scope.mold=v;changed();},"sc-mold"),chk("가구 구매",owner.scope.furn!==false,v=>{owner.scope.furn=v;changed();},"sc-furn")),
      lineTable(owner,ls),
      h("div",{class:"row"},h("button",{class:"btn small",onclick:()=>{owner.custom.push({key:nid(),cat:"기타",name:"추가 항목",spec:"",unit:"식",qty:1,mat:0,trade:"보통인부",pum:0});changed();}},"+ 항목 추가"),
        h("button",{class:"btn small",onclick:()=>{owner.ov={};changed();}},"수동 수정 모두 되돌리기"),
        h("span",{class:"note",text:"줄 금액 = 수량 × (재료 단가 + 품 × 직종 노임단가)"})));}
  const pct=(k,id)=>inp("number",S.pct[k],v=>{S.pct[k]=clamp(num(v,0),0,50);changed();},{id,step:"0.5",min:"0",max:"50"});
  const msg=h("p",{class:"note",id:"est-msg","aria-live":"polite"});
  const csv=()=>{const q=s=>'"'+String(s==null?"":s).replace(/"/g,'""')+'"';const out=[["공간","공종","품명","규격","단위","수량","재료단가","직종","품(인)","노임단가","노무단가","금액"].map(q).join(",")];
    for(const l of lines)if(!l.off)out.push([l.room,l.cat,l.name,l.spec,l.unit,l.qty,l.mat,l.trade,l.pum,l.rate,Math.round(l.labor),Math.round(l.total)].map(q).join(","));
    out.push("");for(const [a,b] of [["재료비",t.mat],["노무비",t.lab],["직접공사비",t.direct],["공과잡비 "+S.pct.misc+"%",t.misc],["기업이윤 "+S.pct.profit+"%",t.profit],["공급가액",t.supply],["부가세 "+S.pct.vat+"%",t.vat],["합계",t.total]])out.push([q(a),"","","","","","","","","","",Math.round(b)].join(","));
    return "﻿"+out.join("\r\n");};
  const txt=()=>{const o=["["+S.name+"] 인테리어 견적",STYLES[S.style].name+" 스타일 · 공사 면적 "+A.toFixed(1)+"㎡("+py.toFixed(1)+"평)",""];let last="";
    for(const l of lines){if(l.off)continue;if(l.room!==last){o.push("■ "+l.room);last=l.room;}o.push("  "+l.cat+" | "+l.name+" | "+l.qty+l.unit+" | "+won(l.total)+"원");}
    return o.concat(["","공급가액 "+won(t.supply)+"원","부가세 "+won(t.vat)+"원","합계 "+won(t.total)+"원"]).join("\n");};
  return h("div",{class:"stack"},scopeBar,body,
    h("div",{class:"grid"},
      h("section",{class:"panel"},h("h2",{text:"직종별 노임단가 (원/일)"}),
        h("div",{class:"fields",style:"grid-template-columns:repeat(auto-fill,minmax(150px,1fr))"},Object.keys(S.rates).map(k=>{const src=RATES0[k]&&RATES0[k].v===S.rates[k]?RATES0[k].src:"usr";
          return fld(h("span",{class:"row",style:"gap:6px"},k,h("span",{class:"chip "+(src==="pub"?"ok":src==="est"?"warn":""),text:src==="pub"?"2026 상반기 공표":src==="est"?"추정 · 확인 필요":"직접 입력"})),inp("number",S.rates[k],v=>{S.rates[k]=Math.max(0,Math.round(num(v,0)));changed();},{id:"rate-"+k,step:"1000",min:"0"}));})),
        h("p",{class:"note",text:"대한건설협회 「건설업 임금실태조사 보고서(시중노임단가)」 기준입니다. '공표' 표시는 2026년 상반기(1월 1일 적용) 값이고, 9월 1일부터 적용되는 하반기 값과 '추정' 표시 직종은 협회 공표 자료를 보고 직접 넣어 주세요. 품(인/단위)과 재료 단가는 기본값이며 현장 여건에 맞게 줄마다 고칠 수 있습니다."})),
      h("section",{class:"panel"},h("h2",{text:"전체 집계"}),
        h("dl",{class:"sum",style:"margin:0"},
          h("dt",{text:"재료비"}),h("dd",{text:won(t.mat)}),h("dt",{text:"노무비"}),h("dd",{text:won(t.lab)}),h("dt",{text:"직접공사비"}),h("dd",{text:won(t.direct)}),
          h("dt",{},"공과잡비 ",pct("misc","pct-misc")," %"),h("dd",{text:won(t.misc)}),h("dt",{},"기업이윤 ",pct("profit","pct-profit")," %"),h("dd",{text:won(t.profit)}),
          h("dt",{text:"공급가액"}),h("dd",{text:won(t.supply)}),h("dt",{},"부가세 ",pct("vat","pct-vat")," %"),h("dd",{text:won(t.vat)}),
          h("dt",{class:"total",text:"합계"}),h("dd",{class:"total",text:won(t.total)+"원"}),
          h("dt",{text:"공사 면적 평당"}),h("dd",{text:won(t.total/Math.max(py,0.1))+"원"})),
        h("div",{class:"row"},h("button",{class:"btn primary",onclick:async()=>{try{await downloads.save({filename:(S.name.replace(/[\\/:*?"<>|]/g,"")||"견적서")+".csv",data:csv()});msg.textContent="CSV로 저장했습니다. 엑셀에서 바로 열립니다.";}catch(e){msg.textContent=e&&e.code==="declined"?"저장을 취소했습니다.":"이 화면에서는 파일 저장이 안 됩니다. '견적 복사'를 사용하세요.";}}},"엑셀용 CSV 저장"),
          h("button",{class:"btn",onclick:async()=>{try{await navigator.clipboard.writeText(txt());msg.textContent="견적 요약을 복사했습니다.";}catch(e){msg.textContent="복사가 막혀 있습니다. 표를 직접 선택해 복사하세요.";}}},"견적 복사")),msg)));}

/* ---------- 시작 ---------- */
(async()=>{try{const r=await fetch("/api/config");if(r.ok)CFG=await r.json();}catch(e){}AI=!!CFG.ai;await hydrate();render();})();
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>render());

