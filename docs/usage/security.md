# Security

## Request Query Hashing
To prevent abuse of your Lambda function, you can set a security key. When the security key environment variable is set,
every request is required to have the `s` query parameter set. This parameter is a simple md5 hash of the following:

`SECURITY KEY + / + PATH + QUERY`

For example, if my security key is set to `asdf` and someone requests:

https://something.cloudfront.net/web/general-images/photo.jpg?auto=compress%2Cformat&crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&h=380&q=80&w=700

<Note type="tip">

The parameters are URI encoded!

</Note>

They would also need to pass a security key param, `s`,

`md5('asdf' + '/' + 'web/general-images/photo.jpg' + '?auto=compress%2Cformat&crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&h=380&q=80&w=700')`

or to be more exact...

`md5('asdf/web/general-images/photo.jpg?auto=compress%2Cformat&crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&h=380&q=80&w=700')`

which equals...

`a0144a80b5b67d7cb6da78494ef574db`

and on our URL...

`https://something.cloudfront.net/web/general-images/photo.jpg?auto=compress%2Cformat&crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&h=380&q=80&w=700&s=a0144a80b5b67d7cb6da78494ef574db`
