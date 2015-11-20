#!/bin/sh

mkdir autodoc
mkdir autodoc/lib
cp node_modules/putstuffhere/lib/*.js autodoc/lib/
cp lib/*.js autodoc/lib/
autodoc --template index.html.mustache --javascripts lib/queue.js,lib/putstuffhere.js,lib/domutils.js, lib/ishmael.js,lib/view.js lib/layoutview.js
mv autodoc/index.html autodoc/layoutview.html

autodoc --template index.html.mustache lib/ishmael.js
mv autodoc/index.html autodoc/ishmael.html

autodoc --template index.html.mustache lib/domutils.js
mv autodoc/index.html autodoc/domutils.html

autodoc --template index.html.mustache --javascripts node_modules/putstuffhere/lib/queue.js,node_modules/putstuffhere/lib/putstuffhere.js,lib/ishmael.js, lib/domutils.js, lib/layoutview.js lib/view.js
mv autodoc/index.html autodoc/view.html


docco --output annotated/ lib/*.js
