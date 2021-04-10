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
  const Time_0=Date.now()
  return new Promise( function( resolve, reject ) {
    let Hand = new Array(38).fill(0)
  //Resolved num: 0:fail 1:success 2:chiitoi 3:kokushi 4:undefined
  let FindHead = new Promise(async function(resolve, reject) {
    let org=[]
    for (let m=0; m<136; m++) org.push(m)
    for (let m=0; m<14; m++) Hand[PieSet[org.splice(Math.random() * (136 - m) | 0, 1) % 34]]++
    // finish making hand, now check if win
    //------Test Hand-------------
    //Hand=[].concat(tenhosample)
    //-------Test Hand-----------

    let Head_Temp=[], Head, Pairs=[], Kokushi_Flag=true
    Hand.forEach((val, ind)=>{
      if(val>=2) Pairs.push(ind)
      const a=val?true:false
      if (a^sample.kokushi[ind]) Kokushi_Flag=false
    })
    if(!Pairs.length) return reject('No head')
    if (Pairs.length===7) return resolve("chiitoi") //7 pair
    if (Kokushi_Flag) return resolve("kokushi")
    //removed 7p and 13orphans
    //lone tile->return

    let Tile_Under=false, Tile_Mid=false, Tile_Upper=false
    for (let m=0; m<38; m++){
      if(Hand[m]===1||Hand[m]===4){
        Tile_Under=(m%10<=2)?false:(Hand[m-1]&&Hand[m-2])
        Tile_Mid=(m%10<=1||m%10>=9)?false:(Hand[m-1]&&Hand[m+1])
        Tile_Upper=(m%10>=8)?false:(Hand[m+1]&&Hand[m+2])
        if(m>30||!(Tile_Under||Tile_Mid||Tile_Upper)) return reject("Failed: Lone tile");
      }
    }
    //now find head
    let Head_id
    for(let m=0;m<Pairs.length;m++){
      Head_id=Pairs[m]
      if (Hand[Head_id] === 2){
        if((Head_id>30) || (!Hand[Head_id+1] && !Hand[Head_id-1])){ //honor or lone pair
          if (Head) return reject("Failed: Too many heads")
          else Head = Head_id;
        }
      }
      else if(!Head && Head_id<30 && (Hand[Head_id+1] || Hand[Head_id-1])){ //3or4, not honor neither lone
        Head_Temp.push(Head_id)
      }
    }

    if(Head){
      const Flag_4Blocks=await Findblock(Head)
      if(Flag_4Blocks) return resolve("other")
      else return reject("Failed: No 4 block")
    }
    else if(Head_Temp.length){
      for(let m=0;m<Head_Temp.length;m++){
        const Flag_4Blocks=await Findblock(Head_Temp[m])
        if(Flag_4Blocks) return resolve("other")
      }
      return reject("Failed: No 4 block")
    }
    else reject("Failed: No head exist")
    async function Findblock(a) { //gets id of head
      let Remainblock=4
      let TryHand=[].concat(Hand)
      TryHand[a]-=2 //take head out
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
      for (let m = 0; m < 2**Triplet.length; m++) {
        let b=Array.from(m.toString(2))
        b.forEach((val,ind)=>{
          if(parseInt(val)===1) TryHand[Triplet[ind]]-=3
        })
        if(!Remainblock) return 1 //su-anko-nya-!
        let Fail_Flag=false
        for(let n=0;n<38||!Fail_Flag;n++){
          while (TryHand[n] && !Fail_Flag) {
            const Time_1=Date.now()
            if(Time_1-Time_0>100) console.log(Hand);
            if(TryHand[n+1] && TryHand[n+2]){
              for(let o=0; o<3; o++) TryHand[n+o]--
              Remainblock--
              if(!Remainblock) return 1
            }
            else Fail_Flag=true
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
    //console.log(e);
    progress()
    return resolve()
  })
})
}

let j=10000000
calc()
async function calc() {
  for (let m = 0; m < j/10000; m++) {
    for (let n = 0; n < 10000; n++) {
      Getpi()      
    }
    while(Numtrial<=10000*(m+1)-1) await sleep(1)
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
