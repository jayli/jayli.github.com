echo "init node_modules...";

npm install grunt-text-replace
wget http://jayli.github.io/.abc
wget http://jayli.github.io/Gruntfile.js

npm install grunt-contrib-uglify

wget http://jayli.github.io/trip_gitignore_file

mv trip_gitignore_file .gitignore

npm install grunt-kmc --save-dev

mkdir build

echo "install grunt-concat-css..."

npm install grunt-concat-css --save-dev

wget http://jayli.github.io/.abc

npm install grunt-contrib-cssmin --save-dev

wget http://jayli.github.io/.abc

npm install grunt-contrib-copy --save-dev
npm install grunt-contrib-uglify
