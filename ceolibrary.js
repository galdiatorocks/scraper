const request = require('request');
const cheerio = require('cheerio');

const LeaderModel = require("./leader_model");

async function start(){
    for(let i=1; i<=1; i+=1){ //loop through all the 132 pages of books listings
        const pageDone = await scrapeBooksList('https://www.theceolibrary.com/books/page/' + i);
        console.log('page number done:', i, pageDone)
    }
}

function scrapeBooksList(homeURL){ //scrape the books page for listing

    return new Promise((resolve, reject)=> {

    request(homeURL, function(err, response, body){
        if (err) {
            console.error('scrapeBooksList err: ', err);
            reject(err);
        }

        if(response.statusCode !== 200){
            console.error('response.statusCode, homeURL, response');
            reject(response.statusCode);
        } else {
            let $ = cheerio.load(body);
            console.log(homeURL, response.statusCode);
            const elements = $('.fcl-entry')

            elements.each(async function(i,e) {
                    
                    const card = $(e)
                    let book = {};
                                            
                    book.bookLink = card.find('a')
                                        .attr('href');
                    book.bookName = card.find('.book-title')
                                        .text();
                    book.bookImgPath = card .find('.book-cover')
                                            .attr('data-bgset');
                    book.bookAuthor = card.find('.book-info')
                                        .children('a')
                                        .text();

                    await scrapeBook(book);
                    console.log('scrapebookdone: ', i);

                    if (i == elements.length - 1) {
                        resolve(homeURL + ' scrapebooksList done');
                    }
            })
        }
    })
})
}

function scrapeBook(book){
    return new Promise((resolve, reject) => {
    
        request(book.bookLink, function(err, response, body){
            if (err) {
                console.error('scrapeBook err: ', err);
                reject(err);
            }
            if(response.statusCode !== 200){
                console.error('response.statusCode, book.bookLink, response');
                reject(response.statusCode);
            } else {
                let $ = cheerio.load(body);
                console.log(book.bookLink, response.statusCode);
                const elements =  $('.re-entry');

                elements.each(async function(i,e){

                    const card = $(e);
                    let leader = {};
                                        
                    leader.leaderLink = "https://www.theceolibrary.com/" + card.find('a')
                                        .attr('href');
                    leader.leaderName = card.find('strong')
                                        .text();
                    leader.leaderSector = card  .find('p')
                                                .text()
                                                .replace(/^[" (]/,"")
                                                .replace(/[)"]$/,"");
                    book.quote = card.text();

                    let reco = $('.sources-list>li');
                    let recoCard = $(reco[i]);

                    book.whereRecommended = recoCard.find('a')
                                                    .attr('href')
                                            
                    leader = await scrapeLeader(leader).catch(e => console.error(e));
                    console.log('scrapeLeader done: ', i, leader, book);

                    leader.booksReco = [];
                    leader.booksReco.push(book);

                    if (i == elements.length - 1) {
                        resolve(book.bookLink + ' scrapeBook done');
                    }
                })
            }
        })
    })
}

function scrapeLeader(leader){
new Promise((resolve, reject)=> {

    console.log(leader.leaderLink);

        request(leader.leaderLink, function(err, response, body){
            if (err) {
                console.log('leaderLink err: ', err);
                reject(err);
            }
            if(response.statusCode !== 200){
                console.log('response.statusCode, leader.leaderLink, response');
                reject(response.statusCode);
            } else {
                let $ = cheerio.load(body);

                console.log(leader.leaderLink, response.statusCode);
                const card =  $('.tag-description');

                if(!card.find('img').attr('src')){
                    resolve(leader);
                }

                leader.imagepath = card .find('img')
                                        .attr('src');
                leader.leaderBio  = card;
                
                console.log(leader, response);
                resolve(leader);
            }
        })
    })
}

module.exports = start()
