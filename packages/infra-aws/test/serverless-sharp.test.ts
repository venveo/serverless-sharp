import * as cdk from 'aws-cdk-lib';
import * as ServerlessSharpStack from '../lib/serverless-sharp-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ServerlessSharpStack.ServerlessSharpStack(app, 'MyTestStack');
    // THEN
    const actual = app.synth().getStackArtifact(stack.artifactId).template;
    expect(actual.Resources ?? {}).toEqual({});
});
