#!/bin/sh

autodoc --template index.html.mustache --javascripts queue.js,putstuffhere.js,ishmael.js,ishmael-view.js,ishmael-domutils.js ishmael-layoutview.js
mv autodoc/index.html autodoc/ishmael-layoutview.html

autodoc --template index.html.mustache ishmael.js
mv autodoc/index.html autodoc/ishmael.html

autodoc --template index.html.mustache ishmael-domutils.js
mv autodoc/index.html autodoc/ishmael-domutils.html

autodoc --template index.html.mustache --javascripts queue.js,putstuffhere.js,ishmael.js,ishmael-layoutview.js ishmael-view.js
mv autodoc/index.html autodoc/ishmael-view.html


docco --output annotated/ ishmael.js
