var google = require('google');
var request = require("request");

// check google links
google.resultsPerPage = 25;
google('chvrches mp3', function(err, next, links){
    if (err) console.error(err);

    var mp3_sites = [];

    for (var i = 0; i < links.length; ++i) {

        var uri = links[i].link.match(/http:\/\/([^/]*)(.*)/);

        // is this an amazon website ?
        if(uri[1].indexOf("amazon") == -1){
            mp3_sites.push(links[i].link);
        }

    }

    check_link(mp3_sites, 0);
});

// check each link
var mp3s = [];
function check_link(links, ii){
    request(links[ii],
     function(error, response, body) {
        if(error || response.statusCode != 200){
            console.log(error);
            return false;
        }

        var re = /http[^=]*\.mp3(?=")/g;
        mp3s = mp3s.concat(body.match(re));
        console.log(mp3s);

        ++ii;
        if(ii < links.length)
            check_link(links, ii);
        else if(mp3s.length != 0)
            check_mp3(mp3s, 0);
    });
}

// check each mp3 file
function check_mp3(){

}
