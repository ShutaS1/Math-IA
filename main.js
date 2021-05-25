/*
RULE!
stocks tiles only that are not seen
when tenpai, others throw random tiles
phase*2+1 kinds accepted, *3 tiles remains*/

const filename = 'output.xlsx'
const sheetname = 'output'
const area="B2:H117"
const excel = require('./module')
async function sevenpair(phase){
    let round=0, remains=116, prob
    while(phase>=0){
        do {
            if(remains<=0) return
            prob = ( 6*phase+3 )/(remains)
            remains--
            round++
        } while (prob<(Math.random()))
        phase--
    }
    return round-1
}

let data=new Array(7)

async function main() {
    for (let n = 0; n < 7; n++) {
        data[n] = new Array(117).fill(0);
        for (let m = 0; m < 100000; m++) {
            const k = await sevenpair(n)
            data[n][k]++
        }
    }
    console.log(data);
    excel.write(data, area, sheetname, filename)
}
main()
