#"Real Life" Backbone Demo#

This is a really simple Backbone demo that aims to show a basic usage of
Backbone Models and Views; For simplicity the API was build with NodeJS and
Express.

![Screenshot](https://raw.github.com/erickrdch/rlbb/master/screenshots/002.png)

* Developer: [Erick Ruiz de Chavez](http://erickrdch.com)
* Server Side: [NodeJS](http://nodejs.org)
* Server Side Framework: [Express](http://expressjs.com)
* JavaScript Framework: [Backbone](http://backbonejs.org)
* Styles, Dialogs: [Twitter's Bootstrap](http://twitter.github.com/bootstrap/)
* Profile Pictures: [Gravatar](http://gravatar.com/)
* Random Pictures: [Lorem Pixel](http://lorempixel.com/)

## Grunt Task

The provided grunt task is just an experiment on grunt's usage to create a "production" build of the code. By running `grunt` the default task will `clean` any build folder, `lint` the code (both node and browser), `concat` javascript files, `minify` concatenated file, and finaly `replace` javascript references on the resulting index.html to point the code to the minified version. Once you have your build version, you do not need to install grunt tasks on it, so only do `npm install --production` inside build folder.