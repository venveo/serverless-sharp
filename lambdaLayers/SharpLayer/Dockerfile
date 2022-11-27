FROM amazon/aws-lambda-nodejs:18 as builder
RUN yum -y install make gcc* zip
#RUN yum -y install make gcc* zip automake build-essential curl tar gzip \
#   gobject-introspection gtk-doc-tools libglib2.0-dev libpng-dev \
#   libjpeg-turbo8-dev \
#   libwebp-dev libtiff5-dev libgif-dev libexif-dev libxml2-dev libpoppler-glib-dev \
#   swig libpango1.0-dev libmatio-dev libopenslide-dev libcfitsio-dev \
#   libgsf-1-dev fftw3-dev liborc-0.4-dev librsvg2-dev libimagequant-dev
WORKDIR /app
COPY . .
RUN ["chmod", "+x", "build.sh"]
CMD ["sh", "build.sh"]
ENTRYPOINT []