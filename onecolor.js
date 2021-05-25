
console.time("t")
Pinhu()
function Pinhu() {
    let pos=new Array(9).fill(0)
    let ll=new Array(10).fill(0)
    let a = new Array(4).fill(0)
    for (let m = 0; m < 1947792; m++) {
        let Hand = new Array(10).fill(0)
        let org = []
        for (let m = 0; m < 36; m++) org.push(m)
        for (let m = 0; m < 6; m++) {
            const p = org.splice(Math.random() * (36 - m) | 0, 1) % 9 + 1
            Hand[p]++
            ll[p]++
        }
        
        let Fail = false
        let Blocks = 0
        let place=[]
        for (let n = 1; n < 8 && !Fail ; n++) {
            while (Hand[n]&&!Fail) {
                if (Hand[n + 1] && Hand[n + 2]) {
                    for (let o = 0; o < 3; o++) Hand[n + o]--
                    Blocks++
                    place.push(n)
                }
                else Fail=true
            }
        }
        if (Blocks === 2) {
            if (place[1] - place[0] === 0) {
                a[3]++
                pos[place[1]]++
            }
            else if (place[1] - place[0] === 1) a[2]++
            else if (place[1] - place[0] === 2) a[1]++
            else a[0]++

            
        }
    }
    console.log(a);
    // console.log(ll);
    console.log(pos);
}
console.timeEnd("t")