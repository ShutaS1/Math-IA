const excel = require('./src/module')
const filename = 'data.xlsx'
const sheetname = 'Sheet1'
const area="A1:B21"

main()
async function main() {
    let FetchedData = await excel.read(area, sheetname, filename)
    console.log(FetchedData)
}
