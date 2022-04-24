# Variables
SHARP_VERSION=$(npm show sharp version)
NODE_VERSION=14
SHARP_DIRECTORY=sharp-$SHARP_VERSION
TARBALL=sharp-$SHARP_VERSION-aws-lambda-linux-x64-node-$NODE_VERSION.zip

# current dir where the build.sh is located
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

cd $DIR

# https://docs.aws.amazon.com/en_pv/lambda/latest/dg/configuration-layers.html#configuration-layers-path

# NPM install sharp
npm install --production --prefix ./nodejs sharp@$SHARP_VERSION

# Delete everything except for the sharp directory
#find ./nodejs/node_modules -mindepth 1 ! -regex '^./nodejs/node_modules/sharp\(/.*\)?' -delete

# Zip the resulting node_modules
zip -r $TARBALL nodejs
mkdir -p out
mv $TARBALL out

# Clean up
rm -rf nodejs/node_modules