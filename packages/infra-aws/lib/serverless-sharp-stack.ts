import * as cdk from '@aws-cdk/core';
const path = require('path');

export class ServerlessSharpStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // const getImageTransformFunction = new aws_lambda.Function(this, 'GetImageTransformFunction', {
        //     runtime: aws_lambda.Runtime.NODEJS_14_X,
        //     handler: 'index.handler',
        //     code: aws_lambda.Code.fromAsset(path.join(__dirname, '../../serverless-sharp/src')),
        //     tracing: aws_lambda.Tracing.ACTIVE
        // })


        // const getImageTransformApi = new aws_apigatewayv2.CfnApi(this, "ImageTransformApi", {})

        // const proxyIntegration = new aws_apigatewayv2.CfnIntegration()

        // const cloudfrontDistribution = new aws_cloudfront.Distribution(this, 'GetImageTransformDistribution', {

        // })
    }
}
