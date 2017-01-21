cp www/js/settings-prod.js www/js/settings.js
cordova build android
cp platforms/android/build/outputs/apk/android-debug.apk SCHEDULOGY-DEBUG.apk
