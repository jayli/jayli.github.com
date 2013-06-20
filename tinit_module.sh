echo "init node_modules...";

npm install grunt
npm install grunt-text-replace
curl http://jayli.github.io/Gruntfile.js > txa

npm install grunt-contrib-uglify

curl http://jayli.github.io/trip_gitignore_file > txa

npm install grunt-kmc --save-dev

echo "install grunt-concat-css..."

npm install grunt-concat-css --save-dev

curl http://jayli.github.io/Gruntfile.js > txa

npm install grunt-contrib-cssmin --save-dev

curl http://jayli.github.io/Gruntfile.js > txa

npm install grunt-contrib-copy --save-dev
npm install grunt-contrib-uglify

rm txa
