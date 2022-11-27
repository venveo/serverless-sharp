# Variables
SHARP_VERSION=$(npm show sharp version)
NODE_VERSION=18
SHARP_DIRECTORY=sharp-$SHARP_VERSION
TARBALL=sharp-$SHARP_VERSION-aws-lambda-linux-x64-node-$NODE_VERSION.zip

#LIBVIPS_VERSION_MAJOR=8
#LIBVIPS_VERSION_MINOR=13
#LIBVIPS_VERSION_PATCH=2
#LIBVIPS_VERSION=$LIBVIPS_VERSION_MAJOR.$LIBVIPS_VERSION_MINOR.$LIBVIPS_VERSION_PATCH

# current dir where the build.sh is located
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

## https://docs.aws.amazon.com/en_pv/lambda/latest/dg/configuration-layers.html#configuration-layers-path
#
#cd /tmp && \
#  curl -L https://github.com/libvips/libvips/releases/download/v$LIBVIPS_VERSION/vips-$LIBVIPS_VERSION.tar.gz > vips-$LIBVIPS_VERSION.tar.gz && \
#  tar xf vips-$LIBVIPS_VERSION.tar.gz && \
#  cd vips-$LIBVIPS_VERSION && \
#  ./configure --enable-debug=no --without-python --without-magick && \
#  make && make install && ldconfig
#
#pkg-config --modversion vips-cpp

cd $DIR

# https://docs.aws.amazon.com/en_pv/lambda/latest/dg/configuration-layers.html#configuration-layers-path

# NPM install sharp
npm install --production --prefix ./nodejs sharp@$SHARP_VERSION
#npm install  --arch=x64 --platform=linux --libc=glibc sharp --production --prefix ./nodejs sharp@$SHARP_VERSION

# Delete everything except for the sharp directory
#find ./nodejs/node_modules -mindepth 1 ! -regex '^./nodejs/node_modules/sharp\(/.*\)?' -delete

# Zip the resulting node_modules
zip -r $TARBALL nodejs
mkdir -p out
mv $TARBALL out

# Clean up
rm -rf nodejs/node_modules