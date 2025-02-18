# Untitled Blood Center Companion App
Open source blood donation app built for large-scale blood banks to facilitate donor logging, donor certificates, emergency blood donation and the works.

![outline](https://i.imgur.com/DPutcQh.png)

# Running The App

# iOS
cd into the project, and then follow the [Expo guide](https://docs.expo.dev/get-started/set-up-your-environment/). Copy the contents of `app.example.json` into a new file, `app.json`. Make sure you click **Development build** and toggle **Build with Expo Application Services** if you haven’t done this before. After that, run the project with the command ```npx expo start```

# Android
Setup for Android is similar to iOS, but requires more setup for Notifications and Google Maps
First, follow the instructions for iOS setup, but before running `npx expo start`, follow these instructions:
- [Google Maps setup](https://docs.expo.dev/versions/latest/sdk/map-view/#android). Make sure you click **For development builds**.
- [Notifications](https://docs.expo.dev/push-notifications/fcm-credentials/)


Finally, set up the backend by following these [instructions](https://github.com/mikidoodle/bloodbankapi)




