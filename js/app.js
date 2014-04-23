'use strict';
var fs = require("fs");
var request = require("request");
var http = require('http');
var mm = require('musicmetadata');

// test
//url = 'www.p1x3L.com/mp3s/03%20Bluebird.mp3';

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


function check_mp3(mp3s, ii){
    // get metadata
    http.get(mp3s[ii], function(res){
        // simple checks
        if(res.statusCode == 200 && res.headers['content-length'] !== undefined && res.headers['content-length'] > 10000){
            // check metadata
            var name;
            var cache = fs.createWriteStream('cache.mp3');
            var cache_read = fs.createReadStream('cache.mp3');

            res.on('data', function(chunk) {
                cache.write(chunk);
                var parser = mm(cache_read);
                parser.on('metadata', function (result) {
                    name = result.artist+' - '+result.title;
                    document.getElementById('end').insertAdjacentHTML('beforebegin', '<li><a href="'+url+'" class="mp3">'+name+'</a> ('+response.headers['content-length']+')</li>');
                    res.destroy();
                    // check next mp3
                    ii++;
                    if(ii < mp3s.length)
                        check_mp3(mp3s, ii);
                });
            });
        }
        else{
            // skip
            // check next mp3
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

//
//  NEW SEARCH
//
document.getElementById('search').addEventListener('submit', function(e){
    var search = document.getElementById('music').value;
    search = search.trim();
    search = search.replace(' ', '_');
    $('.mp3').parent().remove();

    //
    //  LOOKING IN MP3SKULL.COM
    //
    request("http://mp3skull.com/mp3/"+ search +".html",
     function(error, response, body) {
        if(error || response.statusCode != 200){
            alert()
            document.write(error);
            return false;
        }

        var re = /(http.*\.mp3)/g;
        var mp3s = body.match(re);
        console.log(mp3s);
        //
        // CHECKING LIST OF MP3s
        //
        if(mp3s !== null){
            console.log(mp3s);
            check_mp3(mp3s, 0);
        }
    });

    //
    e.preventDefault();
});

/*
            data.forEach(function(item, i){
                // check size
               // var uri = item.match(/http:\/\/([^/]*)(.*)/);
                //
                // CHECK FOR METADATA (doesn't work :()
                //
                /*
                http.get(item, function(res){
                    // we can open the file?
                    if(res.statusCode == 200){
                        // check headers fo size
                        if(res.headers['content-length'] !== undefined && res.headers['content-length'] > 10000){
                            // check metadata
                            var name;
                            var cache = fs.createWriteStream('cache_'+i);
                            res.on('data', function(chunk) {
                                cache.write(chunk);
                                var parser = mm(fs.createReadStream('cache_'+i));
                                parser.on('metadata', function (result) {
                                    name = result.artist+' - '+result.title;
                                    console.log(result);
                                    res.destroy();
                                });

                              });

                            document.getElementById('end').insertAdjacentHTML('beforebegin', '<li><a href="'+item+'" class="mp3">'+name+'</a> ('+response.headers['content-length']+')</li>');
                        }
                    }
                    else{
                        // skip
                    }
                }).on('error', function(e) {
                    console.log("Got error: " + e.message);
                });
                */
                //
                // OLD METHOD, CHECK FOR SIZE
                //
                /*
                request.head(item, function(error, response, body){
                    if(!error && response.statusCode == 200){
                        if(response.headers['content-length'] !== undefined && response.headers['content-length'] > 10000){

                            name = item.replace(/(http:\/\/.*\/)/,'');
                            name = name.replace('.mp3', '');
                            name = name.replace(/[A-Za-z-_]*\.[com]|[net]|[ru]/, '');
                            document.getElementById('end').insertAdjacentHTML('beforebegin', '<li><a href="'+item+'" class="mp3">'+name+'</a></li>');
                            console.log(response);
                        }
                    }
                    else{
                        // skip
                    }
                });
            });
        }

    });

    e.preventDefault();
}, false);*/

// in the list of mp3
// when clicking on a link
$(document).on('click', '.mp3', function(e){
    getAudio($(this).attr('href'));
    e.preventDefault();
});
