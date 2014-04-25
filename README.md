Nodster
=======
> Node-webkit + Napster

![nodster](http://i.imgur.com/6hWLBl0.png)
[it looks like that in action](https://www.youtube.com/watch?v=ynExKXtopPY&feature=youtu.be) (note that it is an old version and it is much much faster now).

Nodster is a crawler that finds mp3 and stream them from any source.

/!\ **This is super early work**! If you wanna help, fork away!
This is also just for the fun and not a serious project as there are obvious legal issues.

If you want to try it, just:
* put all these files in [node-webkit](https://github.com/rogerwang/node-webkit).
* install the dependencies with `npm install` (you'll have to install node.js first and you can find the dependencies in the `package.json`.
* get the relevant `ffmpegsumo` from `libraries` and use it instead of node-webkit's default (you need that to read mp3s).
* launch the `nw` executable.

If you wanna help, here's the to do list:

* pause/play the music with the [space button](https://github.com/rogerwang/node-webkit/wiki/Native-UI-API-Manual)
* stream the music instead of downloading and playing
* add a [persistent](https://github.com/rogerwang/node-webkit/wiki/Save-persistent-data-in-app) playlist