console.time("Time")
const sleep = a => new Promise(b =>setTimeout(b,a));
const PieSet = [
  1, 2, 3, 4, 5, 6, 7, 8, 9,            //m
  11, 12, 13, 14, 15, 16, 17, 18, 19,   //s
  21, 22, 23, 24, 25, 26, 27, 28, 29,   //p
  31, 32, 33, 34, 35, 36, 37          //w
]
let Numtrial = 0
let result = {
  success:0,
  pinhu:0,
  sannanko:0,
  suuanko:0,
  chiitoi:0,
  kokushi:0,
  other:0
}
const sample=require('./sample')

function Getpi(){
  let Hand = new Array(38).fill(0)
  function FindHead(){  
    return new Promise(async function(resolve, reject) {
      let org=[]
      for (let m=0; m<136; m++) org.push(m)
      for (let m=0; m<14; m++) Hand[PieSet[org.splice(Math.random() * (136 - m) | 0, 1) % 34]]++
      // finish making hand, now check if win
      //------Test Hand-------------
      //Hand=[].concat(tenhosample)
      //-------Test Hand-----------
      let Head_Temp=[], Head=0, Pairs=[], Kokushi_Flag=true
      Hand.forEach((val, ind)=>{
        if(val>=2) Pairs.push(ind)
        const a=val?true:false
        if (a^sample.kokushi[ind]) Kokushi_Flag=false
      })
      if(!Pairs.length) return reject('No head')
      if (Pairs.length===7) return resolve(7) //7 pair
      if (Kokushi_Flag) return resolve(13)
      //removed 7p and 13orphans
      //lone tile->return
      for (let m=0; m<38; m++){
        if (Hand[m] === 1 || Hand[m] === 4) {
          const Loan_Flag=await FindLone(Hand,m)
          if(Loan_Flag) return reject("Failed: Lone tile")
        }
      }
      //now find head
      let Head_id
      for(let m=0;m<Pairs.length;m++){
        Head_id = Pairs[m]
        const Loan_Flag = await FindLone(Hand, Head_id)
        if (Hand[Head_id] === 2) {
          if (Loan_Flag) { //honor or lone pair
            if (Head) return reject("Failed: Too many heads")
            else Head = Head_id;
          }
          if (!Head) Head_Temp.push(Head_id)
        }
        else if (!Loan_Flag) Head_Temp.push(Head_id)
      }

      if(Head){
        const Flag_4Blocks=await Findblock(Head)
        if(Flag_4Blocks>=0) return resolve(Flag_4Blocks)
        else return reject("Failed: No 4 block")
      }
      else if(Head_Temp.length){
        for(let m=0;m<Head_Temp.length;m++){
          const Flag_4Blocks=await Findblock(Head_Temp[m])
          if (Flag_4Blocks >= 0) return resolve(Flag_4Blocks)
        }
        return reject("Failed: No 4 block")
      }
      else reject("Failed: No head exist")
      async function Findblock(a) { //gets id of head
        let Block_Count=0, Triplet_Count=0
        let TryHand=[].concat(Hand)
        TryHand[a]-=2 //take head out
        let Triplet_Temp=[]
        for (let m = 0; m < 38; m++) {
          if(TryHand[m]>=3) {
            const Loan_Flag = FindLone(TryHand, m)
            if(Loan_Flag){ //alone triplets
              TryHand[m]-=3
              Block_Count++
              Triplet_Count++
              if(Block_Count===4) return 4 //su-anko-nya-! return for Findblock
            }
            else Triplet_Temp.push(m)
          }
        }
        for (let m = 0; m < 2**Triplet_Temp.length; m++){
          let TryHand_Temp=[].concat(TryHand)
          for(let n=0; n<3; n++){
            if(m&2**n){
              TryHand_Temp[Triplet_Temp[n]]-=3
              Block_Count++
              Triplet_Count++
            }
          }
          if(Block_Count===4) return 4 //su-anko-nya-!
          let Fail_Flag=false
          for(let n=0;n<30&&!Fail_Flag;n++){
            if(n%10>=8 && TryHand_Temp[n]) Fail_Flag=true
            while (n%10<8 && TryHand_Temp[n] && !Fail_Flag) {
              if(TryHand_Temp[n+1] && TryHand_Temp[n+2]){
                for(let o=0; o<3; o++) TryHand_Temp[n+o]--
                Block_Count++
                if(Block_Count===4) return Triplet_Count
              }
              else Fail_Flag=true
            }
          }
        } 
        return -1
      }
      
    })
  }
  //now groups
  let promise = Promise.resolve();
  promise
  .then(FindHead)
  .then(async num =>{
    const Type = await convert(num)
    result.success++
    result[Type]++
    Numtrial++
    let out=""
    Hand.forEach((a,ind)=>{
      if(ind%10===1) out+=" "
      if(ind/10===1) out=`${out}\tNumtrial:${Numtrial}\n`
      if(ind/10===2) out=`${out}\tSucceeded:${Type}\n`
      if(ind/10===3) out=`${out}\n`
      out+=a
    })
    console.log(out+"\n");
    progress()
  }).catch((e)=>{
    Numtrial++
    //console.log(e);
    progress()
  })
}
let j = 1000000
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
      console.log(`   Numtrial:${Numtrial} 
    Sucess:${result.success} Pinhu:${result.pinhu} 
    Sannanko:${result.sannanko} Chiitoi:${result.chiitoi} 
    Kokushi:${result.kokushi} Other:${result.other}`)

    }
  }
}

async function convert(a){
  switch(a){
    case 0:
      return "pinhu"
    case 1:
    case 2:
      return "other"
    case 3:
      return "sannanko"
    case 4:
      return "suuanko"
    case 7:
      return "chiitoi"
    case 13:
      return "kokushi"
    default:
      console.log("Error occured: unknown hand type")
  }
}

/**
 * 
 * @param {Array} Hand Hand to judge
 * @param {number} m id of the tile to judge
 * @returns boolean if loan
 */
async function FindLone(Hand, m) {
  if(m>30) return true
  const Tile_Under = (m % 10 <= 2) ? false : (Hand[m - 1] && Hand[m - 2])
  const Tile_Mid = (m % 10 === 1 || m % 10 === 9) ? false : (Hand[m - 1] && Hand[m + 1])
  const Tile_Upper = (m % 10 >= 8) ? false : (Hand[m + 1] && Hand[m + 2])
  if (!(Tile_Under || Tile_Mid || Tile_Upper)) return true
  else return false
}

/* async function transform(input){
  let Fin_Flag=false
  console.log("Input: " + input);
  let Theout = new Array(38).fill(0)

  const ValidInput = input.match(/(\d.+[mspz])+/g);
  console.log(ValidInput);
  if (!ValidInput) return console.log("invalid input");
  const Sets = input.split(/[mspz]/);
  Sets.pop();

  const Type = input.match(/[mspz]/g);

  for (let a = 0; a < Type.length; a++) {
    switch (Type[a]) {
      case "m":
        Type[a] = 0;
        break;
      case "s":
        Type[a] = 10;
        break;
      case "p":
        Type[a] = 20;
        break;
      case "z":
        Type[a] = 30;
        break;

      default:
        break;
    }
  }

  for (let m = 0; m < Type.length; m++) {
    let Tiles = Sets[m].split("");
    for (let a = 0; a < Tiles.length; a++) {
      Tiles[a] = Number(Tiles[a]) + Type[m];
    }
    Tiles.forEach((val) => {
      Theout[val]++;
    });
  }
  Fin_Flag=true

  while (!Fin_Flag) await sleep(1)
  return Theout
}
*/
