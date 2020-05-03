Reference: https://github.com/lovell/sharp/issues/1702#issuecomment-499331245

1. docker run --rm -v "$PWD":/var/task lambci/lambda:build-nodejs12.x npm install sharp
2. Copy new node_modules into nodejs folder
3. In a temporary directory, run `npm install --no-cache --arch=x64 --platform=linux --target=8.10.0 sharp`
4. Locate libvips.so.42.xx.x and libvips-cpp.so.xx.x and copy to lib folder
