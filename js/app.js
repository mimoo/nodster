"use strict";
var request = require("request");
var http = require('http');
var fs = require("fs");
var mm = require('musicmetadata');

// CONFIG

var maximum = 10; // maximum of mp3s it will find

// AUDIO

var audio = new Audio();
audio.src = 'buffer.mp3';

// get the audio from url into a stream
var buffering = false;
var interrupting = false;

function getAudio(url){
    if(buffering){
        interrupting = true;
        while(interrupting){
            // wait
        }
        buffering = false;
        getAudio(url);
        return false;
    }
    else{
        audio.pause();
        var buffed = 0;
        var buffer = fs.createWriteStream('buffer.mp3');

        http.get(url, function(res) {
            if(res.statusCode != 200){
                alert('no mp3');
                return false;
            }

            buffering = true;

            res.on('data', function(chunk) {
                if(interrupting){
                    res.destroy();
                    interrupting = false;
                    return false;
                }
                buffer.write(chunk);
                buffed += chunk.length;
                $('.progress').css('width', buffed * 100 / res.headers['content-length']+ '%');
                // do we need buffed? we need buffed/total
            });

            // we're done downloading the file, no streaming yet
            // that would be cool if we could start playing the
            // mp3 while loading it though...
            res.on('end', function() {
                $('.progress').fadeOut();
                // buffering
                buffering = false;
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
}

// function called after a search ended
function end_search(){
    $('.fa-spin').hide();
    $('input[type=submit]').show();
}

var mp3s = [];
// check each link
function check_link(links, ii){
    request(links[ii],
     function(error, response, body) {
        if(ii == 0)
            mp3s = [];
        // let's crawl this link
        if(!error && response.statusCode == 200){
            var newmp3 = [];
            /* using jQuery to parse the html,
            this produces error in the console,
            the document is trying to GET images
            that are on the page :s */
            $(body).find('a').each(function(index){
                var href = $(this).attr('href');
                if(href !== undefined && href.indexOf(".mp3") > -1 && href.indexOf("http") > -1){
                    newmp3.push(href);
                }
            })
            if(newmp3 !== null)
                mp3s = mp3s.concat(newmp3);
        }
        else
            console.log('can\'t access link',links[ii], error);

        // next links
        ii++;
        if(ii < links.length){
            check_link(links, ii);
        }
        else if(mp3s.length != 0){
            console.log(mp3s);
            check_mp3(mp3s, 0);
        }
        else{
            end_search();
        }
    });
}

// check each mp3 file for metadatas
// should try to do that asynchronously but limit it to 10 or something?
// THIS IS NOT WORKING PROPERLY.. droping a lot of mp3s dunno why
var mp3s_found = 0;

function check_mp3(mp3s, ii){
    if(ii == 0)
        mp3s_found = 0;

    var metadata_found = false;

    http.get(mp3s[ii], function(res){
        // simple checks
        if(res.statusCode == 200 && res.headers['content-length'] !== undefined && res.headers['content-length'] > 2000000){
            // check metadata
            var metadata_found = false;
            var parser = mm(res);

            parser.on('metadata', function (result) {
                // no duplicates
                if(!metadata_found){
                    mp3s_found++;
                    console.log(result);
                    var name = mp3s[ii].match(/([^/]*)(?=\.mp3)/)[0];
                    if(result.artist[0] != "" || result.title != ""){
                        if(result.artist[0] != "" && result.title.indexOf(result.artist[0]) > -1)
                            name = result.title;
                        else
                            name = result.artist[0]+' - '+result.title;

                    }
                    document.getElementById('end').insertAdjacentHTML('beforebegin', '<li><a href="'+mp3s[ii]+'" class="mp3" title="'+res.headers['content-length']+'">'+name+'</a></li>');
                    res.destroy();
                    metadata_found = true;

                    // check next mp3
                    ii++;
                    if(mp3s_found < maximum && ii < mp3s.length)
                        check_mp3(mp3s, ii);
                    else{
                        end_search();
                    }
                }

            });
        }
        else{
            // skip & check next mp3
            console.log(res.headers);
            res.destroy();
            ii++;
            if(ii < mp3s.length )
                check_mp3(mp3s, ii);
            else{
                end_search();
            }
        }
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        // check next mp3
        ii++;
        if(ii < mp3s.length)
            check_mp3(mp3s, ii);
        else{
            end_search();
        }
    });
}

// new search
// DOESNT WORK WELL IF WE DO A SEARCH WHILE ONE IS GOING ON!
function search(){
    // view
    $('.mp3').parent().remove();
    $('.fa-spin').show();
    $('input[type=submit]').hide();

    // format search
    var search = document.getElementById('music').value;
    search = search.replace(' ', '+') + ' mp3 -facebook -youtube -soundcloud -last.fm -amazon -dailymotion -bleep';

    // check google links
    request('http://www.google.com/search?q='+search, function(error, response, body){

        var links = [];

        // parse relevant links
        // (could avoid & at the end with /http[^&]*/g)
        $(body).find('.r a').each(function(index){
            links.push($(this).attr('href').match(/http.*/g)[0]);
        });

        console.log(links);

        // let's check those websites
        if(links.length > 0){
            check_link(links, 0);
        }

    });
}

// on search submit
document.getElementById('search').addEventListener('submit', function(e){

    // search
    search();

    //
    e.preventDefault();
});

// in the list of mp3
// when clicking on a link
$(document).on('click', '.mp3', function(e){
    getAudio($(this).attr('href'));
    $('.info').html($(this).text());
    $('.progress').show();
    e.preventDefault();
});

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