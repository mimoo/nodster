Nodster
=======
> Node-webkit + Napster

![nodster](http://i.imgur.com/cwVEQiF.png)

![nodster2](http://i.imgur.com/wqXmKzb.png)

Nodster is a crawler that finds mp3 and stream them from any source.

/!\ **This is super early work**! If you wanna help, fork away!

This is just for fun and this is not a serious project as there are obvious legal issues.

If you want to try it, just:
* put all these files in [node-webkit](https://github.com/rogerwang/node-webkit).
* install the dependencies with `npm install` (you'll have to install node.js first and you can find the dependencies in the `package.json`.
* get the relevant `ffmpegsumo.dll` from `libraries` and use it instead of node-webkit's default (you need that to read mp3s).
* launch the `nw` executable.