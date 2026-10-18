// Prevent an asynchronous adult leaderboard action from continuing after
// age-mode changes or the start of on-device erasure. This cannot revoke an RPC
// which was already sent; the server still needs authorization and rate limits.
function createCloudActionGate(initialAge=null){
 let age=initialAge,epoch=0,suspended=false;
 function setAge(nextAge){
  if(age!==nextAge){age=nextAge;epoch++}
 }
 function suspend(){suspended=true;epoch++}
 function resume(nextAge){age=nextAge;suspended=false;epoch++}
 function capture(){return !suspended&&age==='adult'?epoch:null}
 function permits(capturedEpoch){
  return capturedEpoch!==null&&!suspended&&age==='adult'&&epoch===capturedEpoch;
 }
 return {setAge,suspend,resume,capture,permits};
}
module.exports={createCloudActionGate};
