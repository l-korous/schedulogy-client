git checkout .
git pull origin master
cp www/js/settings-prod.js www/js/settings.js
cd www
bower install
bower update
cd ..
gulp