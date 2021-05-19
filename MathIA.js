const sleep = a => new Promise(b => setTimeout(b, a));
const PieSet = [
    1, 2, 3, 4, 5, 6, 7, 8, 9,            //m
    11, 12, 13, 14, 15, 16, 17, 18, 19,   //s
    21, 22, 23, 24, 25, 26, 27, 28, 29,   //p
    31, 32, 33, 34, 35, 36, 37          //w
]
  
const chiitoiorg4 = [31, 32, 33, 34]
const chiitoiorg3 = [31, 32, 33]
let ResArr_Pinhu = new Array(20).fill(0)
let ResArr_Chiitoi = new Array(20).fill(0)

const excel = require('./src/module')
const filename = 'data.xlsx'
const sheetname = 'Sheet1'
const area="A2:B21"

//main()
Pinhu()
async function main() {
    for (let m = 0; m < 100000; m++) {
        await Pinhu()
    }
    for (let m = 0; m < 100000; m++) {
        await MakeChiitoi(4)
    }
    const writedata = [ResArr_Pinhu, ResArr_Chiitoi]
    await excel.write(writedata, area, sheetname, filename)
    
}

//-------------


async function Pinhu() {
  let Hand = new Array(38).fill(0)
    let org = []
    let Tsumo=0
    for (let m = 0; m < 136; m++) org.push(m)
    //make initial hand
    for (let m = 0; m < 14; m++) Hand[PieSet[org.splice(Math.random() * (136 - m) | 0, 1) % 34]]++
    for (let m = 1; m < 20; m++) {
        let convertedHand = await convert(Hand)
        console.log(`Hand in ${m} round:\n${convertedHand}`);
        const Flag = await FindPinhuHead(Hand,Tsumo)

        if (Flag) {
            ResArr_Pinhu[m]++
            return
        }
        //if falilde, pick another
        else {
            Tsumo = PieSet[org.splice(Math.random() * (136 - (14 + m)) | 0, 1) % 34]
            Hand[Tsumo]++
        }
    }
}

async function FindPinhuHead(Hand,Tsumo) {
    let Pair_Temp=[], Pair, Flag
    for (let m = 0; m < Hand.length; m++) {
        if (Hand[m] >= 2) {
            let Lone_Flag = await FindLone(Hand, m)
            if (Lone_Flag) Pair = m
            else Pair_Temp.push(m)
        }
    }
    if (Pair) Flag = await FindPinhuBlock(Hand,Pair,Tsumo)
    else if (Pair_Temp.length) {
        for (let m = 0; m < Pair_Temp.length; m++) {
            Flag = await FindPinhuBlock(Hand, Pair_Temp[m],Tsumo)
        }
    }
    return Flag
}
async function FindPinhuBlock([...Hand], Head,Tsumo) {
    let Ryanmens=[], NotRyanmens=[], RyanmenFlag=true
    let Blocks=0, Flag=0
    Hand[Head] -= 2
    for (let n = 0; n < 30; n++) {
        if (Hand[n] && Hand[n + 1] && Hand[n + 2]) {
            for (let o = 0; o < 3; o++) Hand[n + o]--
            Blocks++
            if (Blocks >= 4) Flag = 1
            NotRyanmens.push(n+1)
            switch (n % 10) {
                case 1:
                    Ryanmens.push(n)
                    NotRyanmens.push(n + 2)
                    break
                case 7:
                    NotRyanmens.push(n)
                    Ryanmens.push(n + 2)
                    break
                default:
                    Ryanmens.push(n)
                    NotRyanmens.push(n+2)
            }
        }
    }
    if (Flag) {
        for (let m = 0; m < NotRyanmens.length; m++) {
            if(NotRyanmens[m]===Tsumo) RyanmenFlag=false
        }
        for (let m = 0; m < Ryanmens.length; m++) {
            if(Ryanmens[m]===Tsumo) RyanmenFlag=true
        }
        if (Tsumo === 0 || RyanmenFlag) return true
        else return false
    }
}

async function FindLone(Hand, m) {
    if(m>30) return true
    const Tile_Under = (m % 10 <= 2) ? false : (Hand[m - 1] && Hand[m - 2])
    const Tile_Mid = (m % 10 === 1 || m % 10 === 9) ? false : (Hand[m - 1] && Hand[m + 1])
    const Tile_Upper = (m % 10 >= 8) ? false : (Hand[m + 1] && Hand[m + 2])
    if (!(Tile_Under || Tile_Mid || Tile_Upper)) return true
    else return false
}
  
async function MakeChiitoi(num) {
    let Hand = new Array(38).fill(0)
    let org=[]
    for (let m = 0; m < 136; m++) org.push(m)
      //make initial hand
    for (let m = 0; m < 2; m++) {
        for (let n = 0; n < num; n++) {
            if(num===3) org.splice(chiitoiorg3[n]+36*m,1)
            if(num===4) org.splice(chiitoiorg4[n]+36*m,1) 
        }
        
    }
      for (let m = 0; m < 14-(2*num); m++) Hand[PieSet[org.splice(Math.random() * (136 - (2*num+m)) | 0, 1) % 34]]++
      for (let m = 1; m < 20; m++) {
          const Flag = await FindPairs(Hand,num)
  
          if (Flag) {
              ResArr_Chiitoi[m]++
              return
          }
          //if falilde, pick another
          else Hand[PieSet[org.splice(Math.random() * (136 - (14 + m)) | 0, 1) % 34]]++
      }
}
async function FindPairs([...Hand],num) {
    let Pair_cnt = 0
    for (let m = 0; m < Hand.length; m++) {
        if (Hand[m] >= 2) Pair_cnt++
    }
    if(Pair_cnt>=7-num) return 1
}

async function convert([...Hand]) {
    let out=0
    Hand.forEach((a,ind)=>{
        if(ind%10===1) out+=" "
        if(ind/10===1) out=`${out}\n`
        if(ind/10===2) out=`${out}\n`
        if(ind/10===3) out=`${out}\n`
        out += a
    })
    return out
}