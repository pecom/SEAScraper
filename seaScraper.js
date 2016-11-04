var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var fs = require('fs');
var deptLinks = [];
var courseLinks = [];

hrefScraping();


function hrefScraping(){
  console.log("Getting dept hrefs");
  new Nightmare()
    .goto('http://bulletin.engineering.columbia.edu/key-course-listings')
    .evaluate(function (){
      return document.querySelector('#block-menu_block-1').innerHTML;           //Only get the menu bar on the left
    })
    .end()
    .then(function(htmlThingo){
      $ = cheerio.load(htmlThingo);
      $('li', '.content').each(function(i, elem){                               //For each li element within the object with class "content"
        deptLinks[i] = $('a', elem).attr('href');                               //Get the href tag for each a within the li elements
      });
      deptLinks.splice(0, 1);               //Get rid of "key-course-listings"
      deptLinks.splice(9, 1);               //Get rid of Computer engineering program
      //deptLinks.splice(1);                //For testing purposes only. Limits to applied physics and applied math
      console.log(deptLinks);
      getCourseThing(deptLinks);

    })
    .catch(function (error) {
      console.error('Search failed:', error);
    });

}

function getCourseThing(deptURLs){
  console.log("getting course urls");
  deptURLs.forEach(function(item, index, array){
    new Nightmare()
      .goto('http://bulletin.engineering.columbia.edu' + item)
      .evaluate(function(){
        return document.querySelector('.active-trail').innerHTML;               //Limit scope to just the .active-trail (the sublinks on the left)
      })
      .end()
      .then(function(listHTML){
        $ = cheerio.load(listHTML);
        console.log($('a','.last').attr('href') + " - " + item);
        getCourseNames($('a','.last').attr('href'));
      })
      .catch(function (error) {
        console.error('Search failed:', error);
      });
  });
}

function getCourseNames(courseURL){
  var jsonObject = [];
  console.log("getting the course stuff");
  new Nightmare()
    .goto("http://bulletin.engineering.columbia.edu" + courseURL)
    .evaluate(function(){
      return document.querySelector('#content-area').innerHTML;
    })
    .end()
    .then(function(courseContent){
      $ = cheerio.load(courseContent);
      $('.courseblock', '.content').each(function(i, elem){
        //console.log("there is a courseblock");
        periodText = $('.courseblocktitle', elem).text();
        console.log(periodText);
        while (periodText.search(/\./g) != -1){                                                   //A while loop to see if there is a '.' inside the string
          var firstPeriod = periodText.search(/\./g);                                             //Get the index of the 1st period (before the amount of credits)
          var secondPeriod = firstPeriod + periodText.substring(firstPeriod + 1).search(/\./g);   //Get the index of the 2nd period (after the amount of credits). The +1 is due to how .substring(n) works
          var numIndex = periodText.search(/\w\d{4}/g);                                           //Regex search for a chunk of 4 digits (assumption that this is where the course number is)
          var object = {                                                                          //Create an object
            number: periodText.substring(0, numIndex + 5),                                        //Get the number. The +4 is because there are 4 digits
            name: periodText.substring(numIndex + 6, firstPeriod),                                //Get the name. +5 is to take in account the 4 digits and the space (' ') that follows
            credits: periodText.substring(firstPeriod + 3, secondPeriod + 1),                     //Get the credits. +1 due to .substring(n)
            coreq: $('.coreq', '.courseblockdesc', elem).text(),                                        //Get the coreq which is in the coreq class
            prereq: $('.prereq','.courseblockdesc', elem).text()                                                  //Get the prereq which is in the prereq class
          };
          jsonObject.push(object);                                                               //Add the object to the array
          periodText = periodText.substring(secondPeriod + 2);                                    //Chop off everything before the 2nd period to allow for instances when there are multiple courses in one line
        }
      });
      console.log(jsonObject.length);
      jsonObject.forEach(function(elem){                                                             //Go through each jsonObject in the array
        fs.appendFile('test.json', JSON.stringify(elem, null, 4)  + ",\n" , function(err){        //Turn the object into JSON, make it pretty, then dump it to the file!
          if(err){
            console.log(err);
          } else {
            console.log("Added to test.json");
          }
        });
      });
    })
}
