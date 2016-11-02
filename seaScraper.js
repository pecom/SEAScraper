var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var deptLinks = [];


hrefScraping();


function hrefScraping(){
  console.log("doing the link scrape");
  new Nightmare()
    .goto('http://bulletin.engineering.columbia.edu/key-course-listings')
    .evaluate(function (){
      return document.querySelector('#block-menu_block-1').innerHTML;
    })
    .end()
    .then(function(htmlThingo){
      $ = cheerio.load(htmlThingo);
      $('li', '.content').each(function(i, elem){
        deptLinks[i] = $('a', elem).attr('href');
      });
      deptLinks.splice(1, 1);             //Get rid of "key-course-listings"
      
    })
    .catch(function (error) {
      console.error('Search failed:', error);
    });

}
