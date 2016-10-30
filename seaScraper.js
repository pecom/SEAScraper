var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var nightmare = Nightmare({ show: false });





function hrefScraping(){
  new Nightmare().goto('http://bulletin.engineering.columbia.edu/key-course-listings')
  .evaluate(function(){
    return document.querySelector('#block-menu_block-1').innerHTML + document.querySelector('.colb ul').innerHTML;
  })
  .end()
  .then(function(htmlThingo){
    $ = cheerio.load(htmlThingo);
    
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  });
}
