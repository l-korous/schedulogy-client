cp -f ./www/index-dev.html ./www/index.html
cordova build android
cp -f ./platforms/android/build/outputs/apk/android-debug.apk Schedulogy-debug.apk