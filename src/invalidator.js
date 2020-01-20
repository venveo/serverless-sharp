const AWS = require('aws-sdk')

exports.handler = async (event) => {
  console.log(JSON.stringify(event))
  const cloudfront = new AWS.CloudFront()
  const paths = []

  event.Records.forEach((record) => {
    const filename = record.s3.object.key
    console.log(`File updated ${filename})`)
    paths.push(filename + '*')
  })

  const params = {
    DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: `SHARP-${new Date().getTime()}`,
      Paths: {
        Quantity: paths.length,
        Items: paths
      }
    }
  }
  console.log('Creating invalidation', JSON.stringify(params))
  cloudfront.createInvalidation(params, function (err, data) {
    console.log('Created?', err, data)
    if (err) {
      console.log(err, err.stack)
    } else {
      console.log(data)
    }
  }).promise().then((res) => {
    console.log(res)
  }).catch((e) => {
    console.error(e)
  })
}
