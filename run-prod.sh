git checkout .
git pull origin master
cp www/js/settings-prod.js www/js/settings.js
bower install
bower update
gulp