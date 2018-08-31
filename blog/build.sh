#!/bin/sh

jekyll build
cp -r _site/* ../blog/
rm -rf _site
