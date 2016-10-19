mv www/js/settings-prod.js www/js/settings.js
gulp
rm -rf www/js
rm -rf www/css
rm -rf www/templates
rm -rf www/index-dev.html
rm -rf www/index-min.html
cordova build android --release -- --keystore=my-release-key.keystore --alias=SCHEDULOGY
cp platforms/android/build/outputs/apk/android-release.apk SCHEDULOGY.apk
git checkout .