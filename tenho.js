console.time("Time")
const sleep = a => new Promise(b =>setTimeout(b,a));
const PieSet = [
  1, 2, 3, 4, 5, 6, 7, 8, 9,            //m
  11, 12, 13, 14, 15, 16, 17, 18, 19,   //s
  21, 22, 23, 24, 25, 26, 27, 28, 29,   //p
  31, 32, 33, 34, 35, 36, 37          //w
]
let Numtrial=0
let result={
  success:0,
  chiitoi:0,
  kokushi:0,
  other:0
}
const sample=require('./sample')

let Getpi=()=>{
  return new Promise( function( resolve, reject ) {
    let Hand = new Array(38).fill(0), tile = new Array(14).fill(0)

  //------------
  //Resolved num: 0:fail 1:success 2:chiitoi 3:kokushi 4:undefined
  let FindHead = new Promise(async function(resolve, reject) {
    let org=[]
    for (let a=0; a<136; a++) org.push(a)
    for (let k = 0; k < 14; k++) tile[k] = org.splice(Math.random()*(135-k)|0,1)
    for (let n = 0; n < 38; n++) Hand[PieSet[tile[n] % 34]]++
  
    // finish making hand, now check if win
    //------Test Hand-------------
    //Hand=[].concat(tenhosample)
    //-------Test Hand-----------

    let Head_temp=[], Head, Pairs=0, kokushi=true
    let a
    Hand.forEach((val, ind)=>{
      if(val===2) Pairs++
      a=val?true:false
      if (a^sample.kokushi[ind]) kokushi=false
    })
    if(!Pairs) return reject('No head')
    if (Pairs===7) return resolve("chiitoi") //7 pair
    if (kokushi) return resolve("kokushi")
    //removed 7p and 13orphans
    //now find head

    for(let k=0;k<Hand.length;k++){
      if ((Hand[k] === 1 || Hand[k] === 4) && (k > 30 || !(Hand[k + 1] || Hand[k - 1]))) return reject("Failed: Lone tile"); //if W is alone or 4, reject
      if (k <= 30 && Hand[k] > 1) //find possible head on number tile
        if (Hand[k] === 2 && !Hand[k + 1] && !Hand[k - 1]) //find confirmed head 
          if (Head) return reject("Failed: Too many heads");
          else Head = k;
        else Head_temp.push(k);
      if (k > 30 && Hand[k] === 2)
        if (Head)return reject("Too many heads");
        else Head = k;
    }

    if(Head){
      const c=await Findblock(Head)
      if(c) return resolve("other")
      else return reject("Failed: No 4 block")
    }
    else if(Head_temp.length){
      for(let k=0;k<Head_temp.length;k++){
        const c=await Findblock(Head_temp[k])
        if(c) return resolve("other")
      }
      return reject("Failed: No 4 block")
    }
    else reject("Failed: No head exist")
    async function Findblock(a) { //gets id of head
      let Remainblock=4
      let TryHand=[].concat(Hand)
      TryHand[a]-=2
      let Triplet=[]
      TryHand.forEach((val,ind,arr)=>{
        if(val>=3) {
          if(!(arr[ind + 1] || arr[ind - 1])){ //alone triplets
            TryHand[ind]-=3
            Remainblock--
            if(!Remainblock) return 1 //su-anko-nya-! return for Findblock
          }
          else Triplet.push(ind)
        }
      })
      for (let k = 0; k < 2**Triplet.length; k++) {
        let b=Array.from(k.toString(2))
        b.forEach((val,ind)=>{
          if(parseInt(val)===1) TryHand[Triplet[ind]]-=3
        })
        if(!Remainblock) return 1 //su-anko-nya-!
        for(let d=0;d<38;d++){
          while (TryHand[d]) {
            if(TryHand[d+1] && TryHand[d+2]){
              for (let c = 0; c < 3; c++) TryHand[d+c]--
              Remainblock--
              if(!Remainblock) return 1
            }
            else return 0
          }
        }
      }
      return 0
    }
    
  })
  //now groups
  FindHead.then((num)=>{
    result.success++
    result[num]++
    Numtrial++
    let out=""
    Hand.forEach((a,ind)=>{
      if(ind%10===1) out+=" "
      if(ind/10===1) out=`${out}\tNumtrial:${Numtrial}\n`
      if(ind/10===2) out=`${out}\tSucceeded:${num}\n`
      if(ind/10===3) out=`${out}\n`
      out+=a
    })
    console.log(out+"\n");
    progress()
    return resolve()
  }).catch(e=>{
    Numtrial++
    progress()
    return resolve()
  })
})
}
let j=100000
calc()
async function calc() {
  for (let i = 0; i < j/10000; i++) {
    for (let k = 0; k < 10000; k++) {
      Getpi()      
    }
    while(Numtrial<=10000*(i+1)-1) await sleep(1)
  }
}
function progress(){
  if(Numtrial%(j/10)===0){
    console.log(Numtrial/j*100+"% done")
    if(Numtrial===j) {
      console.log("Calculation Ended"+"")
      console.timeEnd("Time")
      console.log(`Numtrial:${Numtrial} Sucess:${result.success} Chiitoi:${result.chiitoi} Kokushi:${result.kokushi} Other:${result.other}`)
    }
  }
}
//
