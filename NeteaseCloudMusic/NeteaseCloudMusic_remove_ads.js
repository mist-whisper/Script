/*
脚本引用 https://raw.githubusercontent.com/Keywos/rule/main/script/wy/js/wyres.js
*/
// @timestamp thenkey 2024-12-02 20:16:08
(()=>{var J=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function xe(p){return p&&p.__esModule&&Object.prototype.hasOwnProperty.call(p,"default")?p.default:p}function Ce(p){if(p.__esModule)return p;var x=p.default;if(typeof x=="function"){var M=function C(){return this instanceof C?Reflect.construct(x,arguments,this.constructor):x.apply(this,arguments)};M.prototype=x.prototype}else M={};return Object.defineProperty(M,"__esModule",{value:!0}),Object.keys(p).forEach(function(C){var h=Object.getOwnPropertyDescriptor(p,C);Object.defineProperty(M,C,h.get?h:{enumerable:!0,get:function(){return p[C]}})}),M}var Be={exports:{}},Y={exports:{}},we=Ce(Object.freeze(Object.defineProperty({__proto__:null,default:{}},Symbol.toStringTag,{value:"Module"}))),X;function L(){return X||(X=1,Y.exports=(p=p||function(x,M){var C;if(typeof window<"u"&&window.crypto&&(C=window.crypto),typeof self<"u"&&self.crypto&&(C=self.crypto),typeof globalThis<"u"&&globalThis.crypto&&(C=globalThis.crypto),!C&&typeof window<"u"&&window.msCrypto&&(C=window.msCrypto),!C&&J!==void 0&&J.crypto&&(C=J.crypto),!C)try{C=we}catch{}var h=function(){if(C){if(typeof C.getRandomValues=="function")try{return C.getRandomValues(new Uint32Array(1))[0]}catch{}if(typeof C.randomBytes=="function")try{return C.randomBytes(4).readInt32LE()}catch{}}throw new Error("Native crypto module could not be used to get secure random number.")},b=Object.create||function(){function e(){}return function(i){var s;return e.prototype=i,s=new e,e.prototype=null,s}}(),A={},o=A.lib={},w=o.Base=function(){return{extend:function(e){var i=b(this);return e&&i.mixIn(e),i.hasOwnProperty("init")&&this.init!==i.init||(i.init=function(){i.$super.init.apply(this,arguments)}),i.init.prototype=i,i.$super=this,i},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var i in e)e.hasOwnProperty(i)&&(this[i]=e[i]);e.hasOwnProperty("toString")&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}}}(),r=o.WordArray=w.extend({init:function(e,i){e=this.words=e||[],this.sigBytes=i!=M?i:4*e.length},toString:function(e){return(e||c).stringify(this)},concat:function(e){var i=this.words,s=e.words,g=this.sigBytes,t=e.sigBytes;if(this.clamp(),g%4)for(var n=0;n<t;n++){var v=s[n>>>2]>>>24-n%4*8&255;i[g+n>>>2]|=v<<24-(g+n)%4*8}else for(var a=0;a<t;a+=4)i[g+a>>>2]=s[a>>>2];return this.sigBytes+=t,this},clamp:function(){var e=this.words,i=this.sigBytes;e[i>>>2]&=4294967295<<32-i%4*8,e.length=x.ceil(i/4)},clone:function(){var e=w.clone.call(this);return e.words=this.words.slice(0),e},random:function(e){for(var i=[],s=0;s<e;s+=4)i.push(h());return new r.init(i,e)}}),l=A.enc={},c=l.Hex={stringify:function(e){for(var i=e.words,s=e.sigBytes,g=[],t=0;t<s;t++){var n=i[t>>>2]>>>24-t%4*8&255;g.push((n>>>4).toString(16)),g.push((15&n).toString(16))}return g.join("")},parse:function(e){for(var i=e.length,s=[],g=0;g<i;g+=2)s[g>>>3]|=parseInt(e.substr(g,2),16)<<24-g%8*4;return new r.init(s,i/2)}},B=l.Latin1={stringify:function(e){for(var i=e.words,s=e.sigBytes,g=[],t=0;t<s;t++){var n=i[t>>>2]>>>24-t%4*8&255;g.push(String.fromCharCode(n))}return g.join("")},parse:function(e){for(var i=e.length,s=[],g=0;g<i;g++)s[g>>>2]|=(255&e.charCodeAt(g))<<24-g%4*8;return new r.init(s,i)}},E=l.Utf8={stringify:function(e){try{return decodeURIComponent(escape(B.stringify(e)))}catch{throw new Error("Malformed UTF-8 data")}},parse:function(e){return B.parse(unescape(encodeURIComponent(e)))}},k=o.BufferedBlockAlgorithm=w.extend({reset:function(){this._data=new r.init,this._nDataBytes=0},_append:function(e){typeof e=="string"&&(e=E.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(e){var i,s=this._data,g=s.words,t=s.sigBytes,n=this.blockSize,v=t/(4*n),a=(v=e?x.ceil(v):x.max((0|v)-this._minBufferSize,0))*n,_=x.min(4*a,t);if(a){for(var R=0;R<a;R+=n)this._doProcessBlock(g,R);i=g.splice(0,a),s.sigBytes-=_}return new r.init(i,_)},clone:function(){var e=w.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});o.Hasher=k.extend({cfg:w.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){k.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(i,s){return new e.init(s).finalize(i)}},_createHmacHelper:function(e){return function(i,s){return new S.HMAC.init(e,s).finalize(i)}}});var S=A.algo={};return A}(Math),p)),Y.exports;var p}var q,Q={exports:{}};function Me(){return q||(q=1,Q.exports=(p=L(),function(){if(typeof ArrayBuffer=="function"){var x=p.lib.WordArray,M=x.init,C=x.init=function(h){if(h instanceof ArrayBuffer&&(h=new Uint8Array(h)),(h instanceof Int8Array||typeof Uint8ClampedArray<"u"&&h instanceof Uint8ClampedArray||h instanceof Int16Array||h instanceof Uint16Array||h instanceof Int32Array||h instanceof Uint32Array||h instanceof Float32Array||h instanceof Float64Array)&&(h=new Uint8Array(h.buffer,h.byteOffset,h.byteLength)),h instanceof Uint8Array){for(var b=h.byteLength,A=[],o=0;o<b;o++)A[o>>>2]|=h[o]<<24-o%4*8;M.call(this,A,b)}else M.apply(this,arguments)};C.prototype=x}}(),p.lib.WordArray)),Q.exports;var p}var Z,Re={exports:{}},ee={exports:{}},te={exports:{}},re={exports:{}};function Ae(){return Z||(Z=1,re.exports=(o=L(),x=(p=o).lib,M=x.WordArray,C=x.Hasher,h=p.algo,b=[],A=h.SHA1=C.extend({_doReset:function(){this._hash=new M.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(w,r){for(var l=this._hash.words,c=l[0],B=l[1],E=l[2],k=l[3],S=l[4],e=0;e<80;e++){if(e<16)b[e]=0|w[r+e];else{var i=b[e-3]^b[e-8]^b[e-14]^b[e-16];b[e]=i<<1|i>>>31}var s=(c<<5|c>>>27)+S+b[e];s+=e<20?1518500249+(B&E|~B&k):e<40?1859775393+(B^E^k):e<60?(B&E|B&k|E&k)-1894007588:(B^E^k)-899497514,S=k,k=E,E=B<<30|B>>>2,B=c,c=s}l[0]=l[0]+c|0,l[1]=l[1]+B|0,l[2]=l[2]+E|0,l[3]=l[3]+k|0,l[4]=l[4]+S|0},_doFinalize:function(){var w=this._data,r=w.words,l=8*this._nDataBytes,c=8*w.sigBytes;return r[c>>>5]|=128<<24-c%32,r[14+(c+64>>>9<<4)]=Math.floor(l/4294967296),r[15+(c+64>>>9<<4)]=l,w.sigBytes=4*r.length,this._process(),this._hash},clone:function(){var w=C.clone.call(this);return w._hash=this._hash.clone(),w}}),p.SHA1=C._createHelper(A),p.HmacSHA1=C._createHmacHelper(A),o.SHA1)),re.exports;var p,x,M,C,h,b,A,o}var ne,ie,oe,ae,se={exports:{}};function ye(){return ie||(ie=1,te.exports=function(h){return function(){var b=h,A=b.lib,o=A.Base,w=A.WordArray,r=b.algo,l=r.MD5,c=r.EvpKDF=o.extend({cfg:o.extend({keySize:4,hasher:l,iterations:1}),init:function(B){this.cfg=this.cfg.extend(B)},compute:function(B,E){for(var k,S=this.cfg,e=S.hasher.create(),i=w.create(),s=i.words,g=S.keySize,t=S.iterations;s.length<g;){k&&e.update(k),k=e.update(B).finalize(E),e.reset();for(var n=1;n<t;n++)k=e.finalize(k),e.reset();i.concat(k)}return i.sigBytes=4*g,i}});b.EvpKDF=function(B,E,k){return c.create(k).compute(B,E)}}(),h.EvpKDF}(L(),Ae(),(ne||(ne=1,se.exports=(p=L(),M=(x=p).lib.Base,C=x.enc.Utf8,void(x.algo.HMAC=M.extend({init:function(h,b){h=this._hasher=new h.init,typeof b=="string"&&(b=C.parse(b));var A=h.blockSize,o=4*A;b.sigBytes>o&&(b=h.finalize(b)),b.clamp();for(var w=this._oKey=b.clone(),r=this._iKey=b.clone(),l=w.words,c=r.words,B=0;B<A;B++)l[B]^=1549556828,c[B]^=909522486;w.sigBytes=r.sigBytes=o,this.reset()},reset:function(){var h=this._hasher;h.reset(),h.update(this._iKey)},update:function(h){return this._hasher.update(h),this},finalize:function(h){var b=this._hasher,A=b.finalize(h);return b.reset(),b.finalize(this._oKey.clone().concat(A))}})))),se.exports))),te.exports;var p,x,M,C}function ce(){return oe||(oe=1,ee.exports=(p=L(),ye(),void(p.lib.Cipher||function(x){var M=p,C=M.lib,h=C.Base,b=C.WordArray,A=C.BufferedBlockAlgorithm,o=M.enc;o.Utf8;var w=o.Base64,r=M.algo.EvpKDF,l=C.Cipher=A.extend({cfg:h.extend(),createEncryptor:function(t,n){return this.create(this._ENC_XFORM_MODE,t,n)},createDecryptor:function(t,n){return this.create(this._DEC_XFORM_MODE,t,n)},init:function(t,n,v){this.cfg=this.cfg.extend(v),this._xformMode=t,this._key=n,this.reset()},reset:function(){A.reset.call(this),this._doReset()},process:function(t){return this._append(t),this._process()},finalize:function(t){return t&&this._append(t),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(){function t(n){return typeof n=="string"?g:i}return function(n){return{encrypt:function(v,a,_){return t(a).encrypt(n,v,a,_)},decrypt:function(v,a,_){return t(a).decrypt(n,v,a,_)}}}}()});C.StreamCipher=l.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var c=M.mode={},B=C.BlockCipherMode=h.extend({createEncryptor:function(t,n){return this.Encryptor.create(t,n)},createDecryptor:function(t,n){return this.Decryptor.create(t,n)},init:function(t,n){this._cipher=t,this._iv=n}}),E=c.CBC=function(){var t=B.extend();function n(v,a,_){var R,D=this._iv;D?(R=D,this._iv=x):R=this._prevBlock;for(var O=0;O<_;O++)v[a+O]^=R[O]}return t.Encryptor=t.extend({processBlock:function(v,a){var _=this._cipher,R=_.blockSize;n.call(this,v,a,R),_.encryptBlock(v,a),this._prevBlock=v.slice(a,a+R)}}),t.Decryptor=t.extend({processBlock:function(v,a){var _=this._cipher,R=_.blockSize,D=v.slice(a,a+R);_.decryptBlock(v,a),n.call(this,v,a,R),this._prevBlock=D}}),t}(),k=(M.pad={}).Pkcs7={pad:function(t,n){for(var v=4*n,a=v-t.sigBytes%v,_=a<<24|a<<16|a<<8|a,R=[],D=0;D<a;D+=4)R.push(_);var O=b.create(R,a);t.concat(O)},unpad:function(t){var n=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=n}};C.BlockCipher=l.extend({cfg:l.cfg.extend({mode:E,padding:k}),reset:function(){var t;l.reset.call(this);var n=this.cfg,v=n.iv,a=n.mode;this._xformMode==this._ENC_XFORM_MODE?t=a.createEncryptor:(t=a.createDecryptor,this._minBufferSize=1),this._mode&&this._mode.__creator==t?this._mode.init(this,v&&v.words):(this._mode=t.call(a,this,v&&v.words),this._mode.__creator=t)},_doProcessBlock:function(t,n){this._mode.processBlock(t,n)},_doFinalize:function(){var t,n=this.cfg.padding;return this._xformMode==this._ENC_XFORM_MODE?(n.pad(this._data,this.blockSize),t=this._process(!0)):(t=this._process(!0),n.unpad(t)),t},blockSize:4});var S=C.CipherParams=h.extend({init:function(t){this.mixIn(t)},toString:function(t){return(t||this.formatter).stringify(this)}}),e=(M.format={}).OpenSSL={stringify:function(t){var n=t.ciphertext,v=t.salt;return(v?b.create([1398893684,1701076831]).concat(v).concat(n):n).toString(w)},parse:function(t){var n,v=w.parse(t),a=v.words;return a[0]==1398893684&&a[1]==1701076831&&(n=b.create(a.slice(2,4)),a.splice(0,4),v.sigBytes-=16),S.create({ciphertext:v,salt:n})}},i=C.SerializableCipher=h.extend({cfg:h.extend({format:e}),encrypt:function(t,n,v,a){a=this.cfg.extend(a);var _=t.createEncryptor(v,a),R=_.finalize(n),D=_.cfg;return S.create({ciphertext:R,key:v,iv:D.iv,algorithm:t,mode:D.mode,padding:D.padding,blockSize:t.blockSize,formatter:a.format})},decrypt:function(t,n,v,a){return a=this.cfg.extend(a),n=this._parse(n,a.format),t.createDecryptor(v,a).finalize(n.ciphertext)},_parse:function(t,n){return typeof t=="string"?n.parse(t,this):t}}),s=(M.kdf={}).OpenSSL={execute:function(t,n,v,a,_){if(a||(a=b.random(8)),_)R=r.create({keySize:n+v,hasher:_}).compute(t,a);else var R=r.create({keySize:n+v}).compute(t,a);var D=b.create(R.words.slice(n),4*v);return R.sigBytes=4*n,S.create({key:R,iv:D,salt:a})}},g=C.PasswordBasedCipher=i.extend({cfg:i.cfg.extend({kdf:s}),encrypt:function(t,n,v,a){var _=(a=this.cfg.extend(a)).kdf.execute(v,t.keySize,t.ivSize,a.salt,a.hasher);a.iv=_.iv;var R=i.encrypt.call(this,t,n,_.key,a);return R.mixIn(_),R},decrypt:function(t,n,v,a){a=this.cfg.extend(a),n=this._parse(n,a.format);var _=a.kdf.execute(v,t.keySize,t.ivSize,n.salt,a.hasher);return a.iv=_.iv,i.decrypt.call(this,t,n,_.key,a)}})}()))),ee.exports;var p}var le,ue={exports:{}},de={exports:{}};function Se(){return le||(le=1,de.exports=(p=L(),function(){var x=p,M=x.lib.WordArray;function C(h,b,A){for(var o=[],w=0,r=0;r<b;r++)if(r%4){var l=A[h.charCodeAt(r-1)]<<r%4*2|A[h.charCodeAt(r)]>>>6-r%4*2;o[w>>>2]|=l<<24-w%4*8,w++}return M.create(o,w)}x.enc.Base64={stringify:function(h){var b=h.words,A=h.sigBytes,o=this._map;h.clamp();for(var w=[],r=0;r<A;r+=3)for(var l=(b[r>>>2]>>>24-r%4*8&255)<<16|(b[r+1>>>2]>>>24-(r+1)%4*8&255)<<8|b[r+2>>>2]>>>24-(r+2)%4*8&255,c=0;c<4&&r+.75*c<A;c++)w.push(o.charAt(l>>>6*(3-c)&63));var B=o.charAt(64);if(B)for(;w.length%4;)w.push(B);return w.join("")},parse:function(h){var b=h.length,A=this._map,o=this._reverseMap;if(!o){o=this._reverseMap=[];for(var w=0;w<A.length;w++)o[A.charCodeAt(w)]=w}var r=A.charAt(64);if(r){var l=h.indexOf(r);l!==-1&&(b=l)}return C(h,b,o)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),p.enc。Base64)),de.exports;var p}var fe，pe，j，$，he={exports:{}};function De(){return fe||(fe=1,he.exports=(p=L()，function(x){var M=p,C=M.lib，h=C.WordArray，b=C.Hasher，A=M.algo，o=[];(function(){for(var E=0;E<64;E++)o[E]=4294967296*x.abs(x.sin(E+1))|0})();var w=A.MD5=b.extend({_doReset:function(){this。_hash=new h.init([1732584193，4023233417,2562383102，271733878])}，_doProcessBlock:function(E，k){for(var S=0;S<16;S++){var e=k+S,i=E[e];E[e]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8)}var s=this。_hash。words,g=E[k+0]，t=E[k+1]，n=E[k+2],v=E[k+3]，a=E[k+4],_=E[k+5]，R=E[k+6],D=E[k+7],O=E[k+8]，P=E[k+9]，z=E[k+10],F=E[k+11]，T=E[k+12],I=E[k+13]，H=E[k+14],G=E[k+15],u=s[0]，y=s[1]，d=s[2]，f=s[3];u=r(u,y,d,f,g,7,o[0]),f=r(f,u,y,d,t,12,o[1]),d=r(d,f,u,y,n,17,o[2]),y=r(y,d,f,u,v,22,o[3]),u=r(u,y,d,f,a,7,o[4]),f=r(f,u,y,d,_,12,o[5]),d=r(d,f,u,y,R,17,o[6]),y=r(y,d,f,u,D,22,o[7]),u=r(u,y,d,f,O,7,o[8]),f=r(f,u,y,d,P,12,o[9]),d=r(d,f,u,y,z,17,o[10]),y=r(y,d,f,u,F,22,o[11]),u=r(u,y,d,f,T,7,o[12]),f=r(f,u,y,d,I,12,o[13]),d=r(d,f,u,y,H,17,o[14]),u=l(u,y=r(y,d,f,u,G,22,o[15]),d,f,t,5,o[16]),f=l(f,u,y,d,R,9,o[17]),d=l(d,f,u,y,F,14,o[18]),y=l(y,d,f,u,g,20,o[19]),u=l(u,y,d,f,_,5,o[20]),f=l(f,u,y,d,z,9,o[21]),d=l(d,f,u,y,G,14,o[22]),y=l(y,d,f,u,a,20,o[23]),u=l(u,y,d,f,P,5,o[24]),f=l(f,u,y,d,H,9,o[25]),d=l(d,f,u,y,v,14,o[26]),y=l(y,d,f,u,O,20,o[27]),u=l(u,y,d,f,I,5,o[28]),f=l(f,u,y,d,n,9,o[29]),d=l(d,f,u,y,D,14,o[30]),u=c(u,y=l(y,d,f,u,T,20,o[31]),d,f,_,4,o[32]),f=c(f,u,y,d,O,11,o[33]),d=c(d,f,u,y,F,16,o[34]),y=c(y,d,f,u,H,23,o[35]),u=c(u,y,d,f,t,4,o[36]),f=c(f,u,y,d,a,11,o[37]),d=c(d,f,u,y,D,16,o[38]),y=c(y,d,f,u,z,23,o[39]),u=c(u,y,d,f,I,4,o[40]),f=c(f,u,y,d,g,11,o[41]),d=c(d,f,u,y,v,16,o[42]),y=c(y,d,f,u,R,23,o[43]),u=c(u,y,d,f,P,4,o[44]),f=c(f,u,y,d,T,11,o[45]),d=c(d,f,u,y,G,16,o[46]),u=B(u,y=c(y,d,f,u,n,23,o[47]),d,f,g,6,o[48]),f=B(f,u,y,d,D,10,o[49]),d=B(d,f,u,y,H,15,o[50]),y=B(y,d,f,u,_,21,o[51]),u=B(u,y,d,f,T,6,o[52]),f=B(f,u,y,d,v,10,o[53]),d=B(d,f,u,y,z,15,o[54]),y=B(y,d,f,u,t,21,o[55]),u=B(u,y,d,f,O,6,o[56]),f=B(f,u,y,d,G,10,o[57]),d=B(d,f,u,y,R,15,o[58]),y=B(y,d,f,u,I,21,o[59]),u=B(u,y,d,f,a,6,o[60]),f=B(f,u,y,d,F,10,o[61]),d=B(d,f,u,y,n,15,o[62]),y=B(y,d,f,u,P,21,o[63]),s[0]=s[0]+u|0,s[1]=s[1]+y|0,s[2]=s[2]+d|0,s[3]=s[3]+f|0},_doFinalize:function(){var E=this。_data,k=E.words，S=8*this._nDataBytes，e=8*E.sigBytes;k[e>>>5]|=128<<24-e%32;var i=x.floor(S/4294967296)，s=S;k[15+(e+64>>>9<<4)]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8),k[14+(e+64>>>9<<4)]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),E.sigBytes=4*(k.length+1)，this。_process();for(var g=this。_hash,t=g.words，n=0;n<4;n++){var v=t[n];t[n]=16711935&(v<<8|v>>>24)|4278255360&(v<<24|v>>>8)}return g},clone:function(){var E=b.clone。call(this);return E._hash=this。_hash。clone(),E}});function r(E,k，S，e，i，s，g){var t=E+(k&S|~k&e)+i+g;return(t<<s|t>>>32-s)+k}function l(E，k，S，e，i，s，g){var t=E+(k&e|S&~e)+i+g;return(t<<s|t>>>32-s)+k}function c(E，k，S，e，i，s，g){var t=E+(k^S^e)+i+g;return(t<<s|t>>>32-s)+k}function B(E，k,S，e，i，s，g){var t=E+(S^(k|~e))+i+g;return(t<<s|t>>>32-s)+k}M.MD5=b._createHelper(w),M.HmacMD5=b._createHmacHelper(w)}(Math),p.MD5)),he.exports;var p}var N=xe(Be.exports=function(p){return p}(L()，Me(),ae||(ae=1,Re.exports=($=L()，ce()，$.mode。ECB=((j=$.lib。BlockCipherMode。extend())。Encryptor=j.extend({processBlock:function(p，x){this。_cipher.encryptBlock(p,x)}}),j.Decryptor=j.extend({processBlock:function(p，x){this。_cipher。decryptBlock(p,x)}}),j)，$。mode。ECB))，function(){return pe?ue.exports:(pe=1,ue.exports=(p=L()，Se()，De()，ye()，ce()，function(){var x=p,M=x.lib。BlockCipher，C=x.algo，h=[]，b=[]，A=[]，o=[]，w=[]，r=[]，l=[]，c=[]，B=[]，E=[];(function(){for(var e=[]，i=0;i<256;i++)e[i]=i<128?i<<1:i<<1^283;var s=0，g=0;for(i=0;i<256;i++){var t=g^g<<1^g<<2^g<<3^g<<4;t=t>>>8^255&t^99,h[s]=t,b[t]=s;var n=e[s]，v=e[n]，a=e[v],_=257*e[t]^16843008*t;A[s]=_<<24|_>>>8,o[s]=_<<16|_>>>16,w[s]=_<<8|_>>>24,r[s]=_,_=16843009*a^65537*v^257*n^16843008*s,l[t]=_<<24|_>>>8,c[t]=_<<16|_>>>16,B[t]=_<<8|_>>>24,E[t]=_,s?(s=n^e[e[e[a^n]]],g^=e[e[g]]):s=g=1}})();var k=[0，1，2,4，8,16，32，64,128，27，54],S=C.AES=M.extend({_doReset:function(){if(!this。_nRounds||this。_keyPriorReset!==this。_key){for(var e=this。_keyPriorReset=this。_key，i=e.words，s=e.sigBytes/4，g=4*((this。_nRounds=s+6)+1)，t=this。_keySchedule=[],n=0;n<g;n++)n<s?t[n]=i[n]:(_=t[n-1],n%s?s>6&&n%s==4&&(_=h[_>>>24]<<24|h[_>>>16&255]<<16|h[_>>>8&255]<<8|h[255&_]):(_=h[(_=_<<8|_>>>24)>>>24]<<24|h[_>>>16&255]<<16|h[_>>>8&255]<<8|h[255&_],_^=k[n/s|0]<<24),t[n]=t[n-s]^_);for(var v=this。_invKeySchedule=[]，a=0;a<g;a++){if(n=g-a,a%4)var _=t[n];else _=t[n-4];v[a]=a<4||n<=4?_:l[h[_>>>24]]^c[h[_>>>16&255]]^B[h[_>>>8&255]]^E[h[255&_]]}}}，encryptBlock:function(e，i){this。_doCryptBlock(e,i,this。_keySchedule,A,o,w,r,h)},decryptBlock:function(e，i){var s=e[i+1];e[i+1]=e[i+3],e[i+3]=s,this。_doCryptBlock(e,i,this。_invKeySchedule,l,c,B,E,b),s=e[i+1],e[i+1]=e[i+3],e[i+3]=s},_doCryptBlock:function(e，i，s，g，t，n，v，a){for(var _=this。_nRounds，R=e[i]^s[0]，D=e[i+1]^s[1],O=e[i+2]^s[2]，P=e[i+3]^s[3],z=4，F=1;F<_;F++){var T=g[R>>>24]^t[D>>>16&255]^n[O>>>8&255]^v[255&P]^s[z++]，I=g[D>>>24]^t[O>>>16&255]^n[P>>>8&255]^v[255&R]^s[z++]，H=g[O>>>24]^t[P>>>16&255]^n[R>>>8&255]^v[255&D]^s[z++]，G=g[P>>>24]^t[R>>>16&255]^n[D>>>8&255]^v[255&O]^s[z++];R=T,D=I,O=H,P=G}T=(a[R>>>24]<<24|a[D>>>16&255]<<16|a[O>>>8&255]<<8|a[255&P])^s[z++],I=(a[D>>>24]<<24|a[O>>>16&255]<<16|a[P>>>8&255]<<8|a[255&R])^s[z++],H=(a[O>>>24]<<24|a[P>>>16&255]<<16|a[R>>>8&255]<<8|a[255&D])^s[z++],G=(a[P>>>24]<<24|a[R>>>16&255]<<16|a[D>>>8&255]<<8|a[255&O])^s[z++],e[i]=T,e[i+1]=I,e[i+2]=H,e[i+3]=G},keySize:8});x.AES=M._createHelper(S)}(),p.AES));var p}()));$request||$done({});$request.headers["x-aeapi"]==!0&&(console.log("\u89E3\u5BC6\u5931\u8D25\uFF1A"+$request.url)，$done({}));var Ee={words:[1698181731，1801809512，946104675，1751477816]，sigBytes:16};function Oe(p){try{return p=N.AES。decrypt({ciphertext:N.lib。WordArray。create(p)},Ee,{mode:N.mode。ECB，padding:N.pad。Pkcs7}),JSON.parse(N.enc。Utf8。stringify(p))}catch(x){return console.log(x.message)，null}}function Pe(p){p=N.AES。encrypt(JSON.stringify(p),Ee,{mode:N.mode。ECB，padding:N.pad。Pkcs7})。ciphertext;let x=new Uint8Array(p.sigBytes);for(let M=0;M<p.sigBytes;M++)x[M]=p.words[M>>>2]>>>24-M%4*8&255;return x}var W=$request.url，me={}，_e=W.match(/(?:^https?:\/\/[^\/]+)\/(?:e?api)(\/[a-z0-9-/]+)(\?.*)?/)，ve=_e?_e[1]:$done({})，m=Oe($response.body)，K=2e12，V=["PAGE_RECOMMEND_DAILY_RECOMMEND"，"PAGE_RECOMMEND_SPECIAL_CLOUD_VILLAGE_PLAYLIST"，"PAGE_RECOMMEND_SHORTCUT"，"HOMEPAGE_MUSIC_PARTNER"，"PAGE_RECOMMEND_RADAR"，"PAGE_RECOMMEND_RANK"];function ge(){if(be())try{let p={PRGG:"PAGE_RECOMMEND_GREETING"，PRDRD:"PAGE_RECOMMEND_DAILY_RECOMMEND"，PRSCVPT:"PAGE_RECOMMEND_SPECIAL_CLOUD_VILLAGE_PLAYLIST"，PRST:"PAGE_RECOMMEND_SHORTCUT"，HMPR:"HOMEPAGE_MUSIC_PARTNER"，PRRR:"PAGE_RECOMMEND_RADAR"，PRRK:"PAGE_RECOMMEND_RANK"，PRMST:"PAGE_RECOMMEND_MY_SHEET"，PRCN:"PAGE_RECOMMEND_COMBINATION"};try{U=JSON.parse($argument)}catch{U=$argument}V=Object.keys(U)。filter(x=>U[x]!=1)。map(x=>p[x])}catch{}}var U;function ke(p){p?.musicPackage&&(p.musicPackage&&(p.musicPackage。expireTime=K,p.musicPackage。vipLevel=7),p.associator&&(p.associator。expireTime=K,p.associator。vipLevel=7),p.voiceBookVip&&(p.voiceBookVip。expireTime=K,p.voiceBookVip。vipLevel=7),p.redplus={vipCode:300，expireTime:K,iconUrl:null，dynamicIconUrl:null，vipLevel:7，isSignDeduct:!1，isSignIap:!1，isSignIapDeduct:!1，isSign:!1},p.redVipLevel&&(p.redVipLevel=7))}try{if(m===null)throw new 错误("\u89E3\u5BC6\u5931\u8D25: "+ve);switch(ve){case"/batch":let x=(r，l={})=>{m[r]?.data&&(m[r]。data=l)};x("/api/comment/tips/v2/get"，{count:0,offset:0，records:[]})，x("/api/social/event/bff/ad/resources")，x("/api/ad/get"，{code:200,ads:{}});let M="/api/music-vip-membership/client/vip/info"，C="/api/v2/resource/comments",h="/api/comment/feed/inserted/resources",b="/api/event/rcmd/topic/list"，A="/api/platform/song/bff/grading/song/order/entrance";m[M]?.data&&ke(m[M]。data),m[C]?.data?.comments&&m[C]。data。comments。forEach(r=>{r.user?.followed===!1&&(r.user。followed=!0),r.user。vipRights=null,r.user。avatarDetail=null,r.userBizLevels=null,r.pendantData=null,r.tag。extDatas=[],r.tag。contentPicDatas=null}),m[h]?.data&&(m[h]。data={},m[h]。trp?.rules&&(m[h]。trp。rules=[])),m[b]?.data?.topicList&&(m[b]。data。topicList=[]),m[A]?.data?.songOrderEntrance&&(m[A]。data.songOrderEntrance={});break;case"/v2/resource/comment/floor/get":m.data?.ownerComment&&(m.data。ownerComment。user。vipRights=null,m.data。ownerComment。user。avatarDetail={},m.data。ownerComment。pendantData=null),m.data?.comments&&m.data。comments。forEach(r=>{r.user?.followed===!1&&(r.user。followed=!0),r.user。vipRights=null,r.user。avatarDetail=null,r.userBizLevels=null,r.pendantData=null,r.tag。extDatas=[],r.tag。contentPicDatas=null});break;case"/music-vip-membership/client/vip/info":ke(m.data);break;case"api/ad/get":m={code:200，ads:{}};break;case"/link/position/show/resource":m.data?.crossPlatformResource?.positionCode&&m.data。crossPlatformResource。positionCode==="MyPageBar"&&(m.data。crossPlatformResource={});break;case"/user/follow/users/mixed/get/v2":m.data?.records&&m.data。records。forEach(r=>{r.mutualFollowDay===null&&(r.showContent={message:"\u{1F4A2}\u4ED6/\u5979,\u672A\u5173\u6CE8\u4F60"，time:1e12，active:!0,boxContent:{}})});break;case"/vipnewcenter/app/resource/newaccountpage":m.data&&(m.data。mainTitle。vipCurrLevel=7,m.data。mainTitle。imgUrl="",m.data。mainTitle。jumpUrl="",m.data。mainTitle。reachMaxLevel=!0,m.data。subTitle。carousels=[],m.data。buttonTitle={});break;case"/link/home/framework/tab":let o=[]，w=!1;if(be())try{try{U=JSON.parse($argument)}catch{U=$argument}let r={MY:"\u6F2B\u6E38"，DT:"\u7B14\u8BB0"，FX:"\u53D1\u73B0"};o=Object.keys(U)。filter(l=>U[l]==1)。map(l=>r[l])}catch{w=!0}else w=!0;w&&(o=["\u6F2B\u6E38"]),m.data?.commonResourceList&&(m.data。commonResourceList=m.data。commonResourceList。filter(r=>!o.includes(r.title)),m.data。commonResourceList。forEach(r=>{r.title==="\u53D1\u73B0"&&(r.subCommonResourceList=r.subCommonResourceList。filter(l=>!["\u76F4\u64AD"]。includes(l.title)))}));break;case"/song/play/more/list/v2":if(m.data?.bottomItem?.itemNodeList){let r=m.data。bottomItem。itemNodeList[0]，l=r.find(B=>B.type==="effect")，c=r.indexOf(l);c!==-1&&(r.splice(c,1),r.unshift(l))}break;case"homepage/block/page":if(m.data?.blocks){for(let r=0;r<m.data。blocks。length;r++)if(m.data。blocks[r]。showType==="BANNER"){m.data。blocks[r]。extInfo。banners=m.data。blocks[r]。extInfo。banners.filter(l=>!["\u6D3B\u52A8"，"\u5E7F\u544A"]。includes(l.typeTitle));break}}break;case"/link/page/discovery/resource/show":if(m.data?.blockCodeOrderList)try{m.data。blockCodeOrderList=JSON.stringify(JSON.parse(m.data。blockCodeOrderList)。filter(r=>!["PAGE_DISCOVERY_BANNER"]。includes(r)))}catch{console.log("101123")}m.data?.blocks&&(m.data。blocks=m.data。blocks。filter(r=>!["PAGE_DISCOVERY_BANNER"]。includes(r.bizCode)));break;case"/link/page/rcmd/resource/show":if(ge(),m.data?.blocks&&(m.data。blocks=m.data。blocks。filter(r=>V.includes(r.bizCode)),m.data。blocks。length>0)){for(let r=0;r<m.data。blocks。length;r++)if(m.data。blocks[r]。bizCode==="PAGE_RECOMMEND_GREETING"){Object.keys(m.data。blocks[r]。dslData)。forEach(l=>{m.data。blocks[r]。dslData[l]。commonResourceList&&(m.data。blocks[r]。dslData[l]。commonResourceList=m.data。blocks[r]。dslData[l].commonResourceList。forEach(c=>{(c.summary||c.extraMap||c.title)&&(c.summary&&(c.summary=""),c.extraMap&&(c.extraMap={}),c.trp_id&&(c.trp_id=""),c.log&&(c.log={}),c.icon&&(c.icon=""),c.actionUrl&&(c.actionUrl=""),c.s_ctrp&&(c.s_ctrp=""),c.resourceType&&(c.resourceType=""))}))});break}}if(m.data?.blockCodeOrderList)try{m.data。blockCodeOrderList=JSON.stringify(JSON.parse(m.data。blockCodeOrderList)。filter(r=>V.includes(r)))}catch{}break;case"/link/page/rcmd/block/resource/multi/refresh":if(m.data&&(ge(),m.data=m.data。filter(r=>V.includes(r.blockCode)),m.data?.length>0)){for(let r=0;r<m.data.length;r++)if(m.data[r]。blockCode==="PAGE_RECOMMEND_GREETING"){Object.keys(m.data[r]。block。dslData)。forEach(l=>{m.data[r]。block。dslData[l]。commonResourceList&&(m.data[r]。block.dslData[l].commonResourceList=m.data[r].block。dslData[l].commonResourceList.forEach(c=>{(c.summary||c.extraMap||c.title)&&(c.summary&&(c.summary=""),c.extraMap&&(c.extraMap={}),c.trp_id&&(c.trp_id=""),c.log&&(c.log={}),c.icon&&(c.icon=""),c.actionUrl&&(c.actionUrl=""),c.s_ctrp&&(c.s_ctrp=""),c.resourceType&&(c.resourceType=""))}))});break}}break;default:console.log("\u672A\u5339\u914D\u5230: "+W),$done({})}me={body:Pe(m)}}catch(p){console.log(W),console.log(p.message)}finally{$done(me)}function be(){return typeof $argument<"u"&&$argument!==""}})();
