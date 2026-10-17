// JOY VIMO Memory Garden — original, finite offline memory challenge.
// No telemetry, urgency timer, autoplay, advertising or sensitive browsing data.
const PAIRS=Object.freeze([
 {key:'flower',emoji:'🌸'},
 {key:'leaf',emoji:'🌿'},
 {key:'star',emoji:'⭐'},
 {key:'cat',emoji:'🐈'}
]);
function hashSeed(seed){
 let h=2166136261;
 for(const ch of String(seed))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;
 return h>>>0;
}
function createMemoryGarden(seed){
 let value=hashSeed(seed);
 const cards=PAIRS.flatMap(({key,emoji})=>[
  {id:key+'-1',key,emoji},{id:key+'-2',key,emoji}
 ]);
 for(let i=cards.length-1;i>0;i--){
  value=(Math.imul(value,1664525)+1013904223)>>>0;
  const j=value%(i+1);
  [cards[i],cards[j]]=[cards[j],cards[i]];
 }
 return {cards,shown:[],matched:[],moves:0,completed:false};
}
function isMismatch(state){
 if(state.shown.length!==2)return false;
 const [a,b]=state.shown;
 return state.cards[a].key!==state.cards[b].key;
}
function chooseGardenCard(state,index){
 if(state.completed||!Number.isInteger(index)||index<0||index>=state.cards.length||
    state.matched.includes(index)||state.shown.includes(index)||state.shown.length>=2)return state;
 if(state.shown.length===0)return {...state,shown:[index]};
 const first=state.shown[0];
 const matched=state.cards[first].key===state.cards[index].key;
 const newMatched=matched?[...state.matched,first,index]:state.matched;
 return {...state,shown:matched?[]:[first,index],matched:newMatched,moves:state.moves+1,completed:newMatched.length===state.cards.length};
}
function closeGardenMismatch(state){
 return isMismatch(state)?{...state,shown:[]}:state;
}
module.exports={createMemoryGarden,isMismatch,chooseGardenCard,closeGardenMismatch};
