!function(){"use strict";var t="/simpleform/docs/".replace(/([^/])$/,"$1/"),e=location.pathname,n=e.startsWith(t)&&decodeURI("/".concat(e.slice(t.length)));if(n){var a=document,c=a.head,r=a.createElement.bind(a),i=function(t,e,n){var a,c=e.r[t]||(null===(a=Object.entries(e.r).find((function(e){var n=e[0];return new RegExp("^".concat(n.replace(/\/:[^/]+/g,"/[^/]+").replace("/*","/.+"),"$")).test(t)})))||void 0===a?void 0:a[1]);return null==c?void 0:c.map((function(t){var a=e.f[t][1],c=e.f[t][0];return{type:c.split(".").pop(),url:"".concat(n.publicPath).concat(c),attrs:[["data-".concat(e.b),"".concat(e.p,":").concat(a)]]}}))}(n,{"p":"simpleform","b":"webpack","f":[["5.e8c51481.chunk.css",5],["5.09d208ad.async.js",5],["nm__dumi__dist__client__pages__Demo__index.578aa5c0.chunk.css",9],["nm__dumi__dist__client__pages__Demo__index.31b7349d.async.js",9],["nm__dumi__dist__client__pages__404.8b85f2d9.chunk.css",65],["nm__dumi__dist__client__pages__404.4b72a5f7.async.js",65],["docs__render__README.md.efeaf87d.async.js",278],["nm__dumi__theme-default__layouts__DocLayout__index.b2716ea7.async.js",519],["docs__editor__usage.md.88ab4ba6.async.js",543],["docs__editor__README.md.9a8ef3f3.async.js",762],["docs__form__README.md.d88b0ea6.async.js",763],["docs__render__usage.md.65d1301a.async.js",798],["dumi__tmp-production__dumi__theme__ContextWrapper.adaf24d5.async.js",923],["docs__index.md.8a8a3b8a.async.js",935],["docs__guide.md.0a5872d2.async.js",937],["docs__form__usage.md.322e1371.async.js",949]],"r":{"/*":[4,5,0,1,7,12],"/":[13,0,1,7,12],"/editor":[9,0,1,7,12],"/render":[6,0,1,7,12],"/form":[10,0,1,7,12],"/guide":[14,0,1,7,12],"/~demos/:id":[2,3,12],"/editor/usage":[8,0,1,7,12],"/render/usage":[11,0,1,7,12],"/form/usage":[15,0,1,7,12]}},{publicPath:"/simpleform/docs/"});null==i||i.forEach((function(t){var e,n=t.type,a=t.url;if("js"===n)(e=r("script")).src=a,e.async=!0;else{if("css"!==n)return;(e=r("link")).href=a,e.rel="preload",e.as="style"}t.attrs.forEach((function(t){e.setAttribute(t[0],t[1]||"")})),c.appendChild(e)}))}}();