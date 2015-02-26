#!/bin/sh

autodoc --template autodoc/index.html.mustache ishmael.js
docco --output annotated/ ishmael.js