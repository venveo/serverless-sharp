FROM amazon/aws-lambda-nodejs:16 as builder
RUN yum -y install make gcc* zip
WORKDIR /app
COPY . .
RUN ["chmod", "+x", "build.sh"]
CMD ["sh", "build.sh"]
ENTRYPOINT []