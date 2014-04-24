'use strict';
var request = require("request");
var http = require('http');
var fs = require("fs");
var mm = require('musicmetadata');

var audio = new Audio();
audio.src = 'buffer.mp3';

// get the audio from url into a stream
// if we click multiple times, it opens multiple getAudio instances...
function getAudio(url){

    audio.pause();
    var buffed = 0;
    var metadata_found = false;
    var buffer = fs.createWriteStream('buffer.mp3');

    //request('http://google.com/doodle.png').pipe(fs.createWriteStream('doodle.png'))
    http.get(url, function(res) {
        if(res.statusCode != 200){
            alert('no mp3');
            return false;
        }

        // get metadata
        var parser = mm(res);

        parser.on('metadata', function (result) {
            console.log(result);
            if(!metadata_found){
                parser = mm(res);
                $('.info').html(result.artist+' '+result.title);
                metadata_found = true;
            }
        });

        res.on('data', function(chunk) {
            buffer.write(chunk);
            buffed += chunk.length;
            // do we need buffed? we need buffed/total
        });

        // we're done downloading the file, no streaming yet
        // that would be cool if we could start playing the
        // mp3 while loading it though...
        res.on('end', function() {
            // play
            audio.load();
            audio.play();
            if($('.play').attr('display') != 'none')
            {
                $('.play').hide();
                $('.pause').show();
            }
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

        // let's crawl this link
        if(!error && response.statusCode == 200){
            var re = /http[^=]*\.mp3(?=")/g;
            var newmp3 = body.match(re);
            if(newmp3 !== null)
                mp3s = mp3s.concat(newmp3);
        }

        // next links
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
// DOESNT WORK WELL IF WE DO A SEARCH WHILE ONE IS GOING ON!
// im scared that it is the google library that does that...
document.getElementById('search').addEventListener('submit', function(e){
    var search = document.getElementById('music').value;
    $('.mp3').parent().remove();

   // check google links
    var google = require('google');
    google.resultsPerPage = 15;
    google(search+' mp3', function(err, next, links){
        if (err) console.error(err);

        var mp3_sites = [];

        for (var i = 0; i < links.length; ++i) {
            if(links[i].link === null)
                continue;
            var uri = links[i].link.match(/http:\/\/([^/]*)(.*)/);
            if(uri === null)
                continue;

            // is this an amazon website ?
            if(uri[1].indexOf("amazon") == -1 && uri[1].indexOf("soundcloud") == -1 && uri[1].indexOf("facebook") == -1 && uri[1].indexOf("youtube") == -1 && uri[1].indexOf("last.fm") == -1){
               mp3_sites.push(links[i].link);
            }

        }

        if(mp3_sites.length > 0)
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
