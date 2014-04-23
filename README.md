Nodster
=======
> Node-webkit + Napster

![nodster](http://i.imgur.com/cwVEQiF.png)

![nodster2](http://i.imgur.com/wqXmKzb.png)

Nodster is a crawler that finds mp3 and stream them from any source.

/!\ **This is super early work**! At the moment it only crawls one website, but the idea is to crawl google and get as many source as possible. Test them, check their metadata, etc... and provide a mp3 to stream as fast as possible. If you wanna help, fork away!

This is just for fun and this is not a serious project as there are obvious legal issues.

If you want to try it, just put all these files in [node-webkit](https://github.com/rogerwang/node-webkit) and launch the `nw` executable.

Also you'll need to use the `ffmpegsumo.dll` I provided (because vanilla node-webkit doesn't read mp3s). It's the windows version. For Linux/MAC check the [popcorn-time repo](https://github.com/popcorn-time/popcorn-app/tree/master/libraries)
