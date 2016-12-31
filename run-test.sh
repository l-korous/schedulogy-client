git checkout .
git pull origin master
cp www/js/settings-test.js www/js/settings.js
cd www
bower install
bower update