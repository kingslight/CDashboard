const md = require ('md-2-json');
const fs = require ('fs');
const xlsx = require ('xlsx');
const path = require ('path');
const process = require ('process');
const cheerio = require ('cheerio');
const PDFParser = require ('pdf2json');

var jsonparsed;
//var currdir = __dirname;
let RC_Version = process.argv[7];
let basedir = path.join(__dirname, '');
var directory = [basedir]
var narrativeQs =['your name', 'SkillSet', 'exp']
var answers =[process.argv[2], process.argv[3], process.argv[4]];
var Headers = ['ChangeId', 'Issue No','Incident','Change Description', 'Change Date (MM/DD/YYYY)', 'ExcutorTeam','DownStream Dependency','Change Type'];
//var currdir = _dirname;

let files;
let htmlobj = '<h2>Change Details Report</h2>';
let workbook = xlsx.utils.book_new();
let worksheet = xlsx.utils.aoa_to_sheet([Headers]);
xlsx.utils.sheet_add_aoa(worksheet, [Headers],{origin:'A1'});
xlsx.utils.book_append_sheet(workbook, worksheet);
console.log("nothing like htat")
//narrative();

fs.readFile('changedetails.json',function(err, data){
if(err){
    htmlobj += '<table><tr>change Details not generated</tr></table>';
    }
else if(data != ' '){
    htmlobj += '<table><tr>';
    htmlobj += '<h3>Change Details:</h3></tr><tr>';
    console.log("Data change")
    for(let i=0;i<Headers.length;i++){
        htmlobj += '<td>'+Headers[i]+'</td>';
    }
    htmlobj += '</tr>'
    var jdata = data;
    jdataparse = JSON.parse(jdata);
    for(let i=0;i<jdataparse.length;i++){
        htmlobj += '<tr>';
        var markdownCD = md.parse(jdataparse[i].description);
        console.log ("value of MD :", markdownCD);
        var CD = markdownCD['Change Details'];
        console.log("### value of CD :"+CD);
        var CDData = [jdataparse[i].id, CD['Issue No'], CD['Incident'], CD['Change Description'],CD['Change Date (MM/DD/YYYY)'],CD['Implementer Team'],CD['DownStream Impact'], CD['Change Type']]
        var CDDetails =[];
        var formatedString =[];
        for(let j=0;j<CDData.length;j++){
            console.log('==row value==',JSON.stringify(CDData[j]))
            if(typeof(JSON.stringify(CDData[j])) !== 'undefined'){
            if(JSON.stringify(CDData[j]).includes("[x]")){
            console.log(" Json value "+JSON.stringify(CDData[j]))
                formatedString[j] = stringOps(JSON.stringify(CDData[j]));
                console.log (" ### "+formatedString[j]+"###");
                var str = formatedString[j].split("-",formatedString[j].length);
                for(let t=0;t<str.length;t++){
                    if(str[t].includes("[x]")){
                        var data1 = str[t];
                        CDDetails[j] = data1.replace("[x]", " ").trim();
                    }
                }
            } else {
                console.log('###row value###',JSON.stringify(CDData[j]))
                CDDetails[j] = stringOps(JSON.stringify(CDData[j]))
            }
        }
            htmlobj += '<td>'+CDDetails[j]+'</td>';
            
        }
        htmlobj += '</tr>'
        xlsx.utils.sheet_add_aoa(worksheet, [CDDetails],{origin: 'A' + (2+i)});
    }
    htmlobj += '</table><br>'
}

xlsx.writeFile(workbook,"Change Detials.xlsx");
htmlobj += '<h3 Marks Results: <h3>'
htmlobj += '<table><tr><td>Subject</td><td> Marks </td></tr>'
//html parser -- cheerio framework used for webscraping
for(let i=0;i<directory.length;i++){
    try{
files = fs.readdirSync(directory[i]);        
    }catch(err){
        console.error(``,err);
    }
    files.forEach(file =>{if(path.extname(file)!=".html") return;
    const extname = path.extname(file);
    const filename = path.basename(file, extname);
    const absolutepath = path.resolve(directory[i], file);
    if(filename == 'scordcard'){
    const $ = cheerio.load(fs.readFileSync(absolutepath))
    let selector = 0;
    const selectors = Array.from($("body > table > tbody > tr"))
    let total =0;
    for(let i=0; i<selector.length; i++){
      //  total += parseInt(selector, 10)
    }
    }
})
}
setTimeout(() => {callBack();}, 1000);
});

function callBack(){
    htmlobj += '</table><br><br>';
    const stream = fs.createWriteStream("changedetails.html");
stream.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Change Details</title>`)
stream.write(`<style>table{
    font-family: arial, sans-serif; 
    border-collapse: collapse;
    width: 100%;
}
th{
    border: 2px solid black;
    text-align: left;
    padding: 8px;
}
td, tr { border: 2px solid black; }

</style>`)

stream.write(htmlobj)
stream.close();

}

function stringOps(str){

    parameterstr = str;
    console.log("value of str "+str);
    return parameterstr.trim().split('\\n').join(' ').replace('{',' ').replace('}',' ').replace('"}',' ').replace('"raw":"',' ').replace('"',' ')
}