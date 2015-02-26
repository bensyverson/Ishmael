#!/bin/sh

autodoc --template autodoc/index.html.mustache ishmael.js
mv autodoc/index.html autodoc/ishmael.html

autodoc --template autodoc/index.html.mustache --javascripts ishmael.js,ishmael-layoutview.js ishmael-view.js
mv autodoc/index.html autodoc/ishmael-view.html

autodoc --template autodoc/index.html.mustache --javascripts ishmael.js,ishmael-view.js ishmael-layoutview.js
mv autodoc/index.html autodoc/ishmael-layoutview.html

docco --output annotated/ ishmael.js
