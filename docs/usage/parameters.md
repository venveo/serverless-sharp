# Parameters

We chose to base our API around the [Imgix service](https://docs.imgix.com/apis/url) to allow for backwards compatibility
with the already popular service. The idea is that all CMS plugins should be able to seamlessly use this service in-place of
an Imgix URL. We've only implemented a hand-full of the features Imgix offers; however, the one's we've
implemented should cover most use-cases.

The benefits of using this method over other methods (such as hashing the entire URL payload in base64) are:
- Much more intuitive
- Easier to develop & debug
- Provides clear prefix matching your original object's path with which you can create invalidations with wildcards

You may access images in your `SOURCE_BUCKET` via the Cloudfront URL that is generated for your distribution just like
normal images. Transforms can be appended to the filename as query parameters.


## `fm` - output format 

Can be one of: `webp`, `png`, `jpeg`, `tiff`

## `w` - width

Scales image to supplied width while maintaining aspect ratio

## `h` - height 

Scales image to supplied height while maintaining aspect ratio

<Note type="tip">

*If both width and height are supplied, the aspect ratio will be preserved and scaled to minimum of either width/height*

</Note>

## `q` - quality 

(75) - 1-100

## `ar` - aspect-ratio 

(1.0:1.0) - When fit=crop, an aspect ratio such as 16:9 can be supplied, optionally with a
 height or width. If neither height or width are defined, the original image size will be used.
 
 
## `dpr` - device-pixel-ratio 

(1) - scales requested image dimensions by this multiplier.

## `fit` - resize fitting mode
 
Can be one of: `fill`, `scale`, `crop`, `clip`, `min`, `max`

## `fill-color`
 
used when `fit` is set to `fill` can be a loosely formatted color such as "red" or "rgb(255,0,0)"

## `crop` - resize fitting mode

can be one of: `focalpoint`, `entropy`, any comma separated combination of `top`, `bottom`, `left` `right`

### `crop=focalpoint`

Uses the `fp-x` and `fp-y` parameters to crop as close to the supplied point as possible.

### `crop=entropy`

Crops the image around the region with the highest [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_%28information_theory%29) 

### `crop=top,left` (or `bottom`, `right`)

Crops the image around the region specified. Supply up to two region identifiers comma separated.

## `fp-x`, `fp-y` - focal point x & y
 
Percentage, 0 to 1 for where to focus on the image when cropping with focalpoint mode

## `s` - security hash 

See [Security](/usage/security.md#request-query-hashing) section

## `auto`

Can be a comma separated combination of: `compress`, `format`

### `auto=format`
If `auto` includes format, the service will try to determine the ideal format to convert the image to. The rules are:
- If the browser supports it, everything except for gifs is returned as webp
- If a png is requested and that png has no alpha channel, it will be returned as a jpeg

### `auto=compress`
The `compress` parameter will try to run post-processed optimizations on the image prior to returning it.
- `png` images will run through `pngquant`


## `blur` - gaussian blur

Between 0-2000
