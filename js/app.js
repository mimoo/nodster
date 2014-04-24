'use strict';
var google = require('google');
var request = require("request");
var http = require('http');
var fs = require("fs");
var mm = require('musicmetadata');

var audio = new Audio();
audio.src = 'buffer.mp3';

// get the audio from url into a stream
// current problem: if I load() the audio before "end" it will only play until "at that time what was the last" chunck and stop.
// also if we click multiple times, it opens multiple getAudio instances...
function getAudio(url){
    var buffer = fs.createWriteStream('buffer.mp3');

    audio.pause();
    var buffed = 0;

    //request('http://google.com/doodle.png').pipe(fs.createWriteStream('doodle.png'))
    http.get(url, function(res) {
        if(res.statusCode != 200){
            alert('no mp3');
            return false;
        }
        res.on('data', function(chunk) {
            buffer.write(chunk);
            buffed += chunk.length; // do we need buffed ? we need buffed/total
        });
        // we're done downloading the file u_u, no streaming :F
        res.on('end', function() {
            // play
            audio.load();
            audio.play();
            if($('.play').attr('display') != 'none')
            {
                $('.play').hide();
                $('.pause').show();
            }
            // get metadata
            var parser = mm(fs.createReadStream('buffer.mp3'));
            parser.on('metadata', function (result) {
                console.log(result);
                $('.info').html(result.artist+' '+result.title);
            });
        });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}

// simple button to play
$('.play').click(function(){
    if($('.play').attr('display') != 'none')
    {
        $('.play').hide();
        $('.pause').show();
    }
    audio.load();
    audio.play();
    return false;
});
$('.pause').click(function(){
    if($('.pause').attr('display') != 'none')
    {
        $('.pause').hide();
        $('.play').show();
    }
    audio.pause();
    return false;
});

var duration;

// duration of the song
audio.addEventListener('durationchange', function() {
    duration = audio.duration
})

// update time of music
audio.addEventListener('timeupdate', function (){
    var curtime = parseInt(audio.currentTime, 10) * 100 / duration
    $(".load").css("width", curtime + "%")
})

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

        ++ii;
        if(ii < links.length){
            check_link(links, ii);
            console.log(ii);
        }
        else if(mp3s.length != 0){
            console.log('go');
            check_mp3(mp3s, 0);
        }
    });
}

// check each mp3 file for metadatas
function check_mp3(mp3s, ii){

    var parser;
    var metadata_found = false;

    http.get(mp3s[ii], function(res){
        // simple checks
        if(res.statusCode == 200 && res.headers['content-length'] !== undefined && res.headers['content-length'] > 10000){
            // check metadata
            var name;
            var metadata_found = false;
            var parser = mm(res);

            parser.on('metadata', function (result) {
                // no duplicates
                if(!metadata_found){
                    console.log(result);
                    name = result.artist+' - '+result.title;
                    document.getElementById('end').insertAdjacentHTML('beforebegin', '<li><a href="'+mp3s[ii]+'" class="mp3">'+name+'</a> ('+res.headers['content-length']+')</li>');
                    res.destroy();
                    metadata_found = true;

                    // check next mp3
                    ii++;
                    if(ii < mp3s.length)
                        check_mp3(mp3s, ii);
                }

            });
        }
        else{
            // skip &
            // check next mp3
            console.log(res.headers);
            ii++;
            if(ii < mp3s.length)
                check_mp3(mp3s, ii);
        }
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        // check next mp3

        ii++;
        if(ii < mp3s.length)
            check_mp3(mp3s, ii);
    });
}

// new search
document.getElementById('search').addEventListener('submit', function(e){
    var search = document.getElementById('music').value;
    $('.mp3').parent().remove();

   // check google links
   google.resultsPerPage = 15;
   google(search+' mp3', function(err, next, links){
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

    //
    e.preventDefault();
});


// in the list of mp3
// when clicking on a link
$(document).on('click', '.mp3', function(e){
    getAudio($(this).attr('href'));
    e.preventDefault();
});
