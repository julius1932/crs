var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var jsonfile = require('jsonfile')

//const MongoClient = require('mongodb').MongoClient;
//const urlll = "mongodb://localhost:27017/";

var START_URL='https://www.crsbis.in/BIS/listregmfr.do';
var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit=[START_URL];

var numItems=0;
var allItems=[];
const urll = new URL(START_URL);
const baseUrl=urll.protocol + "//" + urll.hostname;

function crawl() {
  if(pagesToVisit.length<=0 ) {
    console.log(`visited all pages. ${numItems} items scraped and saved`);
    var file = 'tvs.json'
    jsonfile.writeFile(file, allItems, {spaces: 2,flag: 'a'}, function (err) {
       console.error(err)
    });
     return;
  }
  var nextPage = pagesToVisit.shift();
  console.log(` effective pages<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>> left with ${pagesToVisit.length} pages to visit`)
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    if(nextPage==null){
      return;
    }
    pagesVisited[nextPage] = true;
    visitPage(nextPage, crawl);
  }
}
function requestPage(url, callback) {
  var agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36';
  var options = {
      url: url,
      headers: {
           'User-Agent': agent
        }
      };

  return new Promise(function(resolve, reject) {
      // Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
                callback();
            } else {
                resolve(body);
            }
        })
    })
}
async function visitPage(url, callback) {
  // Add page to our set
  numPagesVisited++;
  // Make the request
  console.log(numPagesVisited +" Visiting page " + url);
  var requestPag = requestPage(url,callback);
  requestPag.then(function(body) {
    var $ = cheerio.load(body);
    //collectLinks($);
    scrape($,url);
    callback();
  }, function(err) {
        console.log(err);
        callback ();
    })
  }

function scrape($,url){
   var count=0;
   console.log(`items scraped now `);
   $('table#tab1 tbody tr').each(function() {// looping over all table rows
        var index=0; // index of td and th in tr
         var item={};
        $(this).find('td').each(function() { // looping over all td in the current row
             var value=$(this).text().trim();// curr td value
             var key=$('table#tab1 thead tr th').eq(index).text().trim(); // colmun header

             if(key=='Manufacturing Unit Address'||key==='Organization'||key==='Brand Name'||
                   key==='Country'||key==='Product Category'||key==='Status'){
                   item[key]=value; // table colmun header is the key , td is the value
              }else if(key==='Sl.No.') {
                   //console.log(key+'========='+value);
                  //item["sNo"]=value;// unique
              }else if(key==='Models') {
                 item.Models=value.split(','); // comma seperated values to array
               }
               index++;
          });
          if(item['Models'].length>=0){
            numItems++;
            allItems.push(item);
            console.log(numItems);
           }else{
             console.log('nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn');
           }
        });
      }
  function saveToDb(item){

  }
crawl();
