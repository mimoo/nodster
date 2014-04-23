// let's try to get rid of jQuery !
var fs = require("fs");
var request = require("request");
var http = require('http');

var buffer = fs.createWriteStream('buffer.mp3');
var audio = new Audio();
audio.src = 'buffer.mp3';


function getAudio(url){
    http.get(url, function(res) {
        res.on('data', function(chunk) {
            buffer.write(chunk);
        });
        res.on('end', function() {
            // done
        });
    });
}

document.getElementById('play').addEventListener('click', function(){
    audio.load();
    audio.play();
    return false;
});

var body = '';

document.getElementById('search').addEventListener('submit', function(e){
    var search = document.getElementById('music').value;

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

        if(data !== null){
            //document.write(data);
            data.forEach(function(item, i){
                if(i == 0)
                    return;
                document.getElementById('list').insertAdjacentHTML('beforebegin', '<a href="'+item+'" class="mp3">'+item+'</a>');
            });
        }

    });

    e.preventDefault();
}, false);

$(document).on('click', '.mp3', function(e){
    getAudio($(this).attr('href'));
    alert($(this).attr('href'));
    e.preventDefault();
});
