
/**
 * 
 * @param {String} area - Fetch area "A1:D4"
 * @param {String} sheetname - sheetname
 * @param {String} filename - Excel Worksheet
 * @returns Array
 */
 module.exports.read = async function (area, sheetname, filename) {
    const book = xlsx.readFile(filename);
    const ws = book.Sheets[sheetname];
    let arr = []
    let decodeRange = await getdecodeRange(area)
    for (let colIdx = decodeRange.s.c, m=0; colIdx <= decodeRange.e.c; colIdx++, m++) {
        arr[colIdx] = []
        for (let rowIdx = decodeRange.s.r, n=0; rowIdx <= decodeRange.e.r; rowIdx++, n++) {
            // セルのアドレスを取得する
            let address = await getencodeRange({ r: rowIdx, c: colIdx });
            let cell = ws[address];
            let k
            if (typeof cell == "undefined" || typeof cell.v == "undefined") k = ""
            else if (!isNaN(cell.v)) k = Math.round(cell.v * 1000) / 1000
            else k = cell.v
            arr[m][n] = k
        }
    }
    return arr
}

const xlsx = require('xlsx');
/**
 * 
 * @param {Array} data data to write in
 * @param {String} area area to write in, eg. A1:D3
 * @param {String}  sheetname sheetname to write
 * @param {String} filename The book of worksheet
 */
module.exports.write = async function (data, area, sheetname, filename) {
    const book = xlsx.readFile(filename);
    const ws = book.Sheets[sheetname];
    const decodeRange = await getdecodeRange(area)
    for (let colIdx = decodeRange.s.c, m=0; colIdx <= decodeRange.e.c; colIdx++, m++) {
        for (let rowIdx = decodeRange.s.r, n=0; rowIdx <= decodeRange.e.r; rowIdx++, n++) {  
            const address = await getencodeRange({ r: rowIdx, c: colIdx })
            if (!data[m][n]) { }
            else if (isNaN(data[m][n])) {
                ws[address] = {
                    t: 'f',
                    f: data[m][n]
                };
            }
            else {
                ws[address] = {
                    t: 'n',
                    v: data[m][n]
                };
            }
        }
    } 
    book.Sheets[sheetname] = ws;
    xlsx.writeFile(book, filename);
    return 0
}


/**
 * 
 * @param {String} range input of Conversion
 * @returns - { s: { c: start col, r: start row }, e: { c: end col , r: end row } }

 */
 async function getdecodeRange(range) {
    return xlsx.utils.decode_range(range);
}
async function getencodeRange(a) {
    return xlsx.utils.encode_cell(a);
}