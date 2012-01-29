#!/bin/sh

jekyll
cp -r _site/* ../blog/
rm _site -rf
