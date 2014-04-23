// let's try to get rid of jQuery !
var fs = require("fs");
var request = require("request");
var http = require('http');

// create buffer for reading mp3
var buffer;
var audio = new Audio();
audio.src = 'buffer.mp3';

// get the audio from url into a stream
// current problem: if I load() the audio before "end" it will only play until "at that time what was the last" chunck and stop.
function getAudio(url){
    buffer = fs.createWriteStream('buffer.mp3');
    audio.pause();
    var buffed = 0;
    http.get(url, function(res) {
        if(res.statusCode != 200){
            alert('no mp3');
            return false;
        }
        res.on('data', function(chunk) {
            buffer.write(chunk);
            buffed += chunk.length;
        });
        res.on('end', function() {
            audio.load();
            audio.play();
        });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}

// simple button to play
document.getElementById('play').addEventListener('click', function(){
    audio.load();
    audio.play();
    return false;
});


// on form submit
// get mp3 list
var body = '';
document.getElementById('search').addEventListener('submit', function(e){
    var search = document.getElementById('music').value;
    search = search.trim();
    search = search.replace(' ', '_');

    request({
      uri: "http://mp3skull.com/mp3/"+ search +".html",
    }, function(error, response, body) {
        if(error !== null){
            document.write(error);
            return false;
        }
        data = body;
        var re = /(http.*\.mp3)/g;
        data = data.match(re);

        $('.mp3').parent().remove();

        if(data !== null){
            //document.write(data);
            data.forEach(function(item, i){
                if(i == 0)
                    return;
                name = item.replace(/(http:\/\/.*\/)/,'')
                document.getElementById('end').insertAdjacentHTML('beforebegin', '<li><a href="'+item+'" class="mp3">'+name+'</a></li>');
            });
        }

    });

    e.preventDefault();
}, false);

// in the list of mp3
// when clicking on a link
$(document).on('click', '.mp3', function(e){
    getAudio($(this).attr('href'));
    e.preventDefault();
});
