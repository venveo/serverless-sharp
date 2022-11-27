"use strict";(self.webpackChunk_serverless_sharp_docs=self.webpackChunk_serverless_sharp_docs||[]).push([[545],{5318:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>m});var n=r(7378);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var i=n.createContext({}),l=function(e){var t=n.useContext(i),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},c=function(e){var t=l(e.components);return n.createElement(i.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,i=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),f=l(r),m=o,d=f["".concat(i,".").concat(m)]||f[m]||u[m]||a;return r?n.createElement(d,s(s({ref:t},c),{},{components:r})):n.createElement(d,s({ref:t},c))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,s=new Array(a);s[0]=f;var p={};for(var i in t)hasOwnProperty.call(t,i)&&(p[i]=t[i]);p.originalType=e,p.mdxType="string"==typeof e?e:o,s[1]=p;for(var l=2;l<a;l++)s[l]=r[l];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},5987:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>i,contentTitle:()=>s,default:()=>m,frontMatter:()=>a,metadata:()=>p,toc:()=>l});var n=r(5773),o=(r(7378),r(5318));const a={},s="Security",p={unversionedId:"usage/security",id:"usage/security",title:"Security",description:"This guide explains how abuse is prevented using query hashes.",source:"@site/docs/usage/security.md",sourceDirName:"usage",slug:"/usage/security",permalink:"/serverless-sharp/docs/usage/security",draft:!1,editUrl:"https://github.com/venveo/serverless-sharp/tree/master/docs/docs/usage/security.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Parameters",permalink:"/serverless-sharp/docs/usage/parameters"},next:{title:"Caching",permalink:"/serverless-sharp/docs/caching"}},i={},l=[{value:"Request Query Hashing",id:"request-query-hashing",level:2}],c=(u="Note",function(e){return console.warn("Component "+u+" was not imported, exported, or provided by MDXProvider as global scope"),(0,o.kt)("div",e)});var u;const f={toc:l};function m(e){let{components:t,...r}=e;return(0,o.kt)("wrapper",(0,n.Z)({},f,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"security"},"Security"),(0,o.kt)("p",null,"This guide explains how abuse is prevented using query hashes."),(0,o.kt)("h2",{id:"request-query-hashing"},"Request Query Hashing"),(0,o.kt)("p",null,"To prevent abuse of your Lambda function, you can set a security key. When the security key environment variable is set,\nevery request is required to have the ",(0,o.kt)("inlineCode",{parentName:"p"},"s")," query parameter set. This parameter is a simple md5 hash of the following:"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"SECURITY KEY + / + PATH + QUERY")),(0,o.kt)("p",null,"For example, if my security key is set to ",(0,o.kt)("inlineCode",{parentName:"p"},"asdf")," and someone requests:"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://something.cloudfront.net/web/general-images/photo.jpg?auto=compress%2Cformat&crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&h=380&q=80&w=700"},"https://something.cloudfront.net/web/general-images/photo.jpg?auto=compress%2Cformat&crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&h=380&q=80&w=700")),(0,o.kt)(c,{type:"tip",mdxType:"Note"},(0,o.kt)("p",null,"The parameters are URI encoded!")),(0,o.kt)("p",null,"They would also need to pass a security key param, ",(0,o.kt)("inlineCode",{parentName:"p"},"s"),","),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"md5('asdf' + '/' + 'web/general-images/photo.jpg' + '?auto=compress%2Cformat&crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&h=380&q=80&w=700')")),(0,o.kt)("p",null,"or to be more exact..."),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"md5('asdf/web/general-images/photo.jpg?auto=compress%2Cformat&crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&h=380&q=80&w=700')")),(0,o.kt)("p",null,"which equals..."),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"a0144a80b5b67d7cb6da78494ef574db")),(0,o.kt)("p",null,"and on our URL..."),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"https://something.cloudfront.net/web/general-images/photo.jpg?auto=compress%2Cformat&crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&h=380&q=80&w=700&s=a0144a80b5b67d7cb6da78494ef574db")))}m.isMDXComponent=!0}}]);