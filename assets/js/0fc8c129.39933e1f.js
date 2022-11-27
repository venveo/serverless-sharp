"use strict";(self.webpackChunk_serverless_sharp_docs=self.webpackChunk_serverless_sharp_docs||[]).push([[277],{5318:(e,t,i)=>{i.d(t,{Zo:()=>d,kt:()=>m});var a=i(7378);function n(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function r(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,a)}return i}function o(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?r(Object(i),!0).forEach((function(t){n(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):r(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function l(e,t){if(null==e)return{};var i,a,n=function(e,t){if(null==e)return{};var i,a,n={},r=Object.keys(e);for(a=0;a<r.length;a++)i=r[a],t.indexOf(i)>=0||(n[i]=e[i]);return n}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)i=r[a],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(n[i]=e[i])}return n}var p=a.createContext({}),s=function(e){var t=a.useContext(p),i=t;return e&&(i="function"==typeof e?e(t):o(o({},t),e)),i},d=function(e){var t=s(e.components);return a.createElement(p.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var i=e.components,n=e.mdxType,r=e.originalType,p=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),u=s(i),m=n,h=u["".concat(p,".").concat(m)]||u[m]||c[m]||r;return i?a.createElement(h,o(o({ref:t},d),{},{components:i})):a.createElement(h,o({ref:t},d))}));function m(e,t){var i=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var r=i.length,o=new Array(r);o[0]=u;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:n,o[1]=l;for(var s=2;s<r;s++)o[s]=i[s];return a.createElement.apply(null,o)}return a.createElement.apply(null,i)}u.displayName="MDXCreateElement"},8550:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>c,frontMatter:()=>r,metadata:()=>l,toc:()=>s});var a=i(5773),n=(i(7378),i(5318));const r={},o="Parameters",l={unversionedId:"usage/parameters",id:"usage/parameters",title:"Parameters",description:"Image transformations are supported by these query parameters.",source:"@site/docs/usage/parameters.md",sourceDirName:"usage",slug:"/usage/parameters",permalink:"/serverless-sharp/docs/usage/parameters",draft:!1,editUrl:"https://github.com/venveo/serverless-sharp/tree/master/docs/docs/usage/parameters.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Integrations",permalink:"/serverless-sharp/docs/usage/integrations"},next:{title:"Security",permalink:"/serverless-sharp/docs/usage/security"}},p={},s=[{value:"<code>fm</code> - output format",id:"fm---output-format",level:2},{value:"<code>w</code> - width",id:"w---width",level:2},{value:"<code>h</code> - height",id:"h---height",level:2},{value:"<code>q</code> - quality",id:"q---quality",level:2},{value:"<code>ar</code> - aspect-ratio",id:"ar---aspect-ratio",level:2},{value:"<code>dpr</code> - device-pixel-ratio",id:"dpr---device-pixel-ratio",level:2},{value:"<code>fit</code> - resize fitting mode",id:"fit---resize-fitting-mode",level:2},{value:"<code>fill</code> - fill mode when fit is fill or fillmax",id:"fill---fill-mode-when-fit-is-fill-or-fillmax",level:2},{value:"<code>fill-color</code>",id:"fill-color",level:2},{value:"<code>crop</code> - resize fitting mode",id:"crop---resize-fitting-mode",level:2},{value:"<code>crop=focalpoint</code>",id:"cropfocalpoint",level:3},{value:"<code>crop=entropy</code>",id:"cropentropy",level:3},{value:"<code>crop=top,left</code> (or <code>bottom</code>, <code>right</code>)",id:"croptopleft-or-bottom-right",level:3},{value:"<code>fp-x</code>, <code>fp-y</code> - focal point x &amp; y",id:"fp-x-fp-y---focal-point-x--y",level:2},{value:"<code>s</code> - security hash",id:"s---security-hash",level:2},{value:"<code>auto</code>",id:"auto",level:2},{value:"<code>auto=format</code>",id:"autoformat",level:3},{value:"<code>auto=compress</code>",id:"autocompress",level:3},{value:"<code>blur</code> - gaussian blur",id:"blur---gaussian-blur",level:2},{value:"<code>px</code> - pixelate",id:"px---pixelate",level:2},{value:"<code>bri</code> - brightness",id:"bri---brightness",level:2}],d={toc:s};function c(e){let{components:t,...i}=e;return(0,n.kt)("wrapper",(0,a.Z)({},d,i,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",{id:"parameters"},"Parameters"),(0,n.kt)("p",null,"Image transformations are supported by these query parameters."),(0,n.kt)("p",null,"We chose to base our API around the ",(0,n.kt)("a",{parentName:"p",href:"https://docs.imgix.com/apis/url"},"Imgix service")," to allow for backwards compatibility\nwith the already popular service. The idea is that all CMS plugins should be able to seamlessly use this service in-place of\nan Imgix URL. We've only implemented a hand-full of the features Imgix offers; however, the one's we've\nimplemented should cover most use-cases."),(0,n.kt)("p",null,"The benefits of using this method over other methods (such as hashing the entire URL payload in base64) are:"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"Much more intuitive"),(0,n.kt)("li",{parentName:"ul"},"Easier to develop & debug"),(0,n.kt)("li",{parentName:"ul"},"Provides clear prefix matching your original object's path with which you can create invalidations with wildcards")),(0,n.kt)("p",null,"You may access images in your ",(0,n.kt)("inlineCode",{parentName:"p"},"SOURCE_BUCKET")," via the Cloudfront URL that is generated for your distribution just like\nnormal images. Transforms can be appended to the filename as query parameters."),(0,n.kt)("h2",{id:"fm---output-format"},(0,n.kt)("inlineCode",{parentName:"h2"},"fm")," - output format"),(0,n.kt)("p",null,"Can be one of: ",(0,n.kt)("inlineCode",{parentName:"p"},"webp"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"png"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"jpeg"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"tiff")),(0,n.kt)("h2",{id:"w---width"},(0,n.kt)("inlineCode",{parentName:"h2"},"w")," - width"),(0,n.kt)("p",null,"Scales image to supplied width while maintaining aspect ratio"),(0,n.kt)("h2",{id:"h---height"},(0,n.kt)("inlineCode",{parentName:"h2"},"h")," - height"),(0,n.kt)("p",null,"Scales image to supplied height while maintaining aspect ratio"),(0,n.kt)("admonition",{type:"info"},(0,n.kt)("p",{parentName:"admonition"},(0,n.kt)("em",{parentName:"p"},"If both width and height are supplied, the aspect ratio will be preserved and scaled to minimum of either width/height"))),(0,n.kt)("h2",{id:"q---quality"},(0,n.kt)("inlineCode",{parentName:"h2"},"q")," - quality"),(0,n.kt)("p",null,"(75) - 1-100"),(0,n.kt)("h2",{id:"ar---aspect-ratio"},(0,n.kt)("inlineCode",{parentName:"h2"},"ar")," - aspect-ratio"),(0,n.kt)("p",null,"(1.0:1.0) - When fit=crop, an aspect ratio such as 16:9 can be supplied, optionally with a\nheight or width. If neither height or width are defined, the original image size will be used."),(0,n.kt)("h2",{id:"dpr---device-pixel-ratio"},(0,n.kt)("inlineCode",{parentName:"h2"},"dpr")," - device-pixel-ratio"),(0,n.kt)("p",null,"(1) - scales requested image dimensions by this multiplier."),(0,n.kt)("h2",{id:"fit---resize-fitting-mode"},(0,n.kt)("inlineCode",{parentName:"h2"},"fit")," - resize fitting mode"),(0,n.kt)("p",null,"Can be one of: ",(0,n.kt)("inlineCode",{parentName:"p"},"fill"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"fillmax"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"scale"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"crop"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"clip"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"min"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"max")),(0,n.kt)("h2",{id:"fill---fill-mode-when-fit-is-fill-or-fillmax"},(0,n.kt)("inlineCode",{parentName:"h2"},"fill")," - fill mode when fit is fill or fillmax"),(0,n.kt)("p",null,"Can be one of: ",(0,n.kt)("inlineCode",{parentName:"p"},"solid"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"blur")),(0,n.kt)("p",null,"Default is ",(0,n.kt)("inlineCode",{parentName:"p"},"solid")),(0,n.kt)("h2",{id:"fill-color"},(0,n.kt)("inlineCode",{parentName:"h2"},"fill-color")),(0,n.kt)("p",null,"used when ",(0,n.kt)("inlineCode",{parentName:"p"},"fit")," is set to ",(0,n.kt)("inlineCode",{parentName:"p"},"fill"),' can be a loosely formatted color such as "red" or "rgb(255,0,0)"'),(0,n.kt)("h2",{id:"crop---resize-fitting-mode"},(0,n.kt)("inlineCode",{parentName:"h2"},"crop")," - resize fitting mode"),(0,n.kt)("p",null,"can be one of: ",(0,n.kt)("inlineCode",{parentName:"p"},"focalpoint"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"entropy"),", any comma separated combination of ",(0,n.kt)("inlineCode",{parentName:"p"},"top"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"bottom"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"left")," ",(0,n.kt)("inlineCode",{parentName:"p"},"right")),(0,n.kt)("h3",{id:"cropfocalpoint"},(0,n.kt)("inlineCode",{parentName:"h3"},"crop=focalpoint")),(0,n.kt)("p",null,"Uses the ",(0,n.kt)("inlineCode",{parentName:"p"},"fp-x")," and ",(0,n.kt)("inlineCode",{parentName:"p"},"fp-y")," parameters to crop as close to the supplied point as possible."),(0,n.kt)("h3",{id:"cropentropy"},(0,n.kt)("inlineCode",{parentName:"h3"},"crop=entropy")),(0,n.kt)("p",null,"Crops the image around the region with the highest ",(0,n.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Entropy_%28information_theory%29"},"Shannon entropy")," "),(0,n.kt)("h3",{id:"croptopleft-or-bottom-right"},(0,n.kt)("inlineCode",{parentName:"h3"},"crop=top,left")," (or ",(0,n.kt)("inlineCode",{parentName:"h3"},"bottom"),", ",(0,n.kt)("inlineCode",{parentName:"h3"},"right"),")"),(0,n.kt)("p",null,"Crops the image around the region specified. Supply up to two region identifiers comma separated."),(0,n.kt)("h2",{id:"fp-x-fp-y---focal-point-x--y"},(0,n.kt)("inlineCode",{parentName:"h2"},"fp-x"),", ",(0,n.kt)("inlineCode",{parentName:"h2"},"fp-y")," - focal point x & y"),(0,n.kt)("p",null,"Percentage, 0 to 1 for where to focus on the image when cropping with focalpoint mode"),(0,n.kt)("h2",{id:"s---security-hash"},(0,n.kt)("inlineCode",{parentName:"h2"},"s")," - security hash"),(0,n.kt)("p",null,"See ",(0,n.kt)("a",{parentName:"p",href:"/serverless-sharp/docs/usage/security#request-query-hashing"},"Security")," section"),(0,n.kt)("h2",{id:"auto"},(0,n.kt)("inlineCode",{parentName:"h2"},"auto")),(0,n.kt)("p",null,"Can be a comma separated combination of: ",(0,n.kt)("inlineCode",{parentName:"p"},"compress"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"format")),(0,n.kt)("h3",{id:"autoformat"},(0,n.kt)("inlineCode",{parentName:"h3"},"auto=format")),(0,n.kt)("p",null,"If ",(0,n.kt)("inlineCode",{parentName:"p"},"auto")," includes format, the service will try to determine the ideal format to convert the image to. The rules are:"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"If the browser supports it, everything except for gifs is returned as webp"),(0,n.kt)("li",{parentName:"ul"},"If a png is requested and that png has no alpha channel, it will be returned as a jpeg")),(0,n.kt)("h3",{id:"autocompress"},(0,n.kt)("inlineCode",{parentName:"h3"},"auto=compress")),(0,n.kt)("p",null,"The ",(0,n.kt)("inlineCode",{parentName:"p"},"compress")," parameter will try to run post-processed optimizations on the image prior to returning it."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("inlineCode",{parentName:"li"},"png")," images will run through ",(0,n.kt)("inlineCode",{parentName:"li"},"pngquant"))),(0,n.kt)("h2",{id:"blur---gaussian-blur"},(0,n.kt)("inlineCode",{parentName:"h2"},"blur")," - gaussian blur"),(0,n.kt)("p",null,"Between 0-2000"),(0,n.kt)("h2",{id:"px---pixelate"},(0,n.kt)("inlineCode",{parentName:"h2"},"px")," - pixelate"),(0,n.kt)("p",null,"Between 0-100"),(0,n.kt)("h2",{id:"bri---brightness"},(0,n.kt)("inlineCode",{parentName:"h2"},"bri")," - brightness"),(0,n.kt)("p",null,"Between -200-200"))}c.isMDXComponent=!0}}]);