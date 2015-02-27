#!/bin/sh

autodoc --template index.html.mustache ishmael.js
mv autodoc/index.html autodoc/ishmael.html

autodoc --template index.html.mustache ishmael-domutils.js
mv autodoc/index.html autodoc/ishmael-domutils.html

autodoc --template index.html.mustache ishmael-htmlparser.js
mv autodoc/index.html autodoc/ishmael-htmlparser.html

autodoc --template index.html.mustache --javascripts queue.js,putstuffhere.js,ishmael.js,ishmael-layoutview.js ishmael-view.js
mv autodoc/index.html autodoc/ishmael-view.html

autodoc --template index.html.mustache --javascripts queue.js,putstuffhere.js,ishmael.js,ishmael-view.js ishmael-layoutview.js
mv autodoc/index.html autodoc/ishmael-layoutview.html

docco --output annotated/ ishmael.js
