/*! For license information please see service-call-tile-feature.js.LICENSE.txt */
(()=>{"use strict";var t={827:function(t,e,i){var n=this&&this.__decorate||function(t,e,i,n){var r,s=arguments.length,o=s<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,n);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(o=(s<3?r(o):s>3?r(e,i,o):r(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o};Object.defineProperty(e,"__esModule",{value:!0}),e.ServiceCallButton=void 0;const r=i(677),s=i(595),o=i(921);let l=class extends r.LitElement{constructor(){super()}onClick(t){t.stopImmediatePropagation();const[e,i]=this.entry.service.split("."),n=this.entry.data||{};this.hass.callService(e,i,n)}renderIcon(t,e){const i={};return e&&(i.color=e),r.html`<ha-icon
			.icon=${t}
			style="${(0,o.styleMap)(i)}"
		></ha-icon>`}renderLabel(t,e){const i={};return e&&(i.color=e),r.html`<div class="label" style="${(0,o.styleMap)(i)}">${t}</div>`}render(){const t={};this.entry.color&&(t["background-color"]=this.entry.color),this.entry.opacity&&(t.opacity=this.entry.opacity);const e=r.html`<button
			class="button"
			itemid=${this.itemid}
			@click=${this.onClick}
			style=${(0,o.styleMap)(t)}
		></button>`;let i=r.html``;"icon"in this.entry&&(i=this.renderIcon(this.entry.icon,this.entry.icon_color));let n=r.html``;return"label"in this.entry&&(n=this.renderLabel(this.entry.label,this.entry.label_color)),r.html`${e}${i}${n} `}static get styles(){return r.css`
			:host {
				display: flex;
				flex-flow: column;
				place-content: center space-evenly;
				align-items: center;
				position: relative;
				height: 40px;
				width: 100%;
				border-radius: 10px;
				border: none;
				padding: 0px;
				box-sizing: border-box;
				line-height: 0;
				outline: 0px;
				overflow: hidden;
				font-size: inherit;
				color: inherit;
			}
			.button {
				background-color: var(--disabled-color);
				opacity: 0.2;
				transition: background-color 180ms ease-in-out;
				position: absolute;
				cursor: pointer;
				height: inherit;
				width: inherit;
				border-radius: 10px;
				border: none;
			}
			@media (hover: hover) {
				.button:hover {
					opacity: 0.3;
				}
			}
			.button:active {
				opacity: 0.3;
			}

			ha-icon {
				position: relative;
				pointer-events: none;
				display: inline-flex;
				flex-flow: column;
				place-content: center;
			}

			.label {
				position: relative;
				pointer-events: none;
				display: inline-flex;
				justify-content: center;
				align-items: center;
				height: 15px;
				width: inherit;
				font-family: inherit;
				font-size: 12px;
			}
		`}};e.ServiceCallButton=l,n([(0,s.property)({attribute:!1})],l.prototype,"hass",void 0),n([(0,s.property)({attribute:!1})],l.prototype,"entry",void 0),n([(0,s.property)({attribute:!1})],l.prototype,"itemid",void 0),e.ServiceCallButton=l=n([(0,s.customElement)("service-call-button")],l)},114:function(t,e,i){var n=this&&this.__decorate||function(t,e,i,n){var r,s=arguments.length,o=s<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,n);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(o=(s<3?r(o):s>3?r(e,i,o):r(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o};Object.defineProperty(e,"__esModule",{value:!0});const r=i(147),s=i(677),o=i(595);i(827),console.info(`%c SERVICE-CALL-TILE-FEATURE v${r.version}`,"color: white; font-weight: bold; background: cornflowerblue");class l extends s.LitElement{constructor(){super()}static getStubConfig(){return{type:"custom:service-call",entries:[{type:"button",service:""}]}}setConfig(t){if(!t)throw new Error("Invalid configuration");"buttons"in(t=JSON.parse(JSON.stringify(t)))&&!("entries"in t)&&(t.entries=t.buttons);for(const e of t.entries)e.data=Object.assign(Object.assign({},e.data||{}),e.target||{}),"entity_id"in e.data||"device_id"in e.data||"area_id"in e.data||(e.data.entity_id=this.stateObj.entity_id),"type"in e||(e.type="button");this.config=t}renderIcon(t,e){let i="";return e&&(i=`color: ${e};`),s.html`<ha-icon .icon=${t} style="${i}"></ha-icon>`}renderLabel(t,e){let i="";return e&&(i=`color: ${e};`),s.html`<div class="label" style="${i}">${t}</div>`}onSlide(t){var e;t.preventDefault(),t.stopImmediatePropagation();const i=t.currentTarget;let n=null!==(e=parseInt(i.value))&&void 0!==e?e:0;n<0?n=0:n>100&&(n=100);const r=i.parentElement.children[2].innerHTML;i.value=r;let s=parseInt(r);if(s>n){const t=setInterval((()=>{n>=s&&clearInterval(t),s-=1,i.value=s.toString()}),1)}else if(s<n){const t=setInterval((()=>{n<=s&&clearInterval(t),s+=1,i.value=s.toString()}),1)}t.currentTarget.parentElement.children[2].innerHTML=n.toString()}renderSlider(t,e){return s.html`
			<div class="slider-background"></div>
			<input
				type="range"
				class="slider"
				min="0"
				max="100"
				itemid=${t}
				@input=${this.onSlide}
			/>
			${this.renderLabel("50")}
		`}render(){if(!this.config||!this.hass||!this.stateObj)return null;const t=[];for(const[e,i]of this.config.entries.entries()){let n;"slider"===i.type.toLowerCase()?(n=this.renderSlider(e,i),t.push(s.html`<div class="container">${n}</div>`)):n=s.html` <service-call-button
						.hass=${this.hass}
						.entry=${i}
						.itemid=${e}
					/>`}return s.html`<div class="row">${t}</div>`}static get styles(){return s.css`
			.row {
				display: flex;
				flex-direction: row;
				flex-flow: row;
				justify-content: center;
				align-items: center;
				padding: 0 12px 12px;
				gap: 12px;
				width: auto;
			}
			.container {
				display: flex;
				flex-flow: column;
				place-content: center space-evenly;
				align-items: center;
				position: relative;
				height: 40px;
				width: 100%;
				border-radius: 10px;
				border: none;
				padding: 0px;
				box-sizing: border-box;
				line-height: 0;
				outline: 0px;
				overflow: hidden;
				font-size: inherit;
				color: inherit;
			}
			.button {
				background-color: var(--disabled-color);
				opacity: 0.2;
				transition: background-color 180ms ease-in-out;
				position: absolute;
				cursor: pointer;
				height: inherit;
				width: inherit;
				border-radius: 10px;
				border: none;
			}
			@media (hover: hover) {
				.button:hover {
					opacity: 0.3;
				}
			}
			.button:active {
				opacity: 0.3;
			}

			.slider-background {
				position: absolute;
				width: inherit;
				height: inherit;
				background: var(--slider-color);
				opacity: 0.2;
			}

			.slider {
				position: absolute;
				appearance: none;
				-webkit-appearance: none;
				-moz-appearance: none;
				height: inherit;
				width: inherit;
				overflow: hidden;
				border-radius: 10px;
				background: none;
			}

			.slider::-webkit-slider-thumb {
				appearance: none;
				-webkit-appearance: none;
				height: 18px;
				width: 4px;
				border-radius: 12px;
				background: #ffffff;
				cursor: pointer;
				box-shadow: calc(-100vw + 6px) 0 0 100vw var(--slider-color);
			}

			.slider::-moz-range-thumb {
				appearance: none;
				-moz-appearance: none;
				height: 18px;
				width: 4px;
				border-radius: 12px;
				background: #ffffff;
				cursor: pointer;
				box-shadow: calc(-100vw + 6px) 0 0 100vw var(--slider-color);
			}

			ha-icon {
				position: relative;
				pointer-events: none;
				display: inline-flex;
				flex-flow: column;
				place-content: center;
			}

			.label {
				position: relative;
				pointer-events: none;
				display: inline-flex;
				justify-content: center;
				align-items: center;
				height: 15px;
				width: inherit;
				font-family: inherit;
				font-size: 12px;
			}
		`}}n([(0,o.property)({attribute:!1})],l.prototype,"hass",void 0),n([(0,o.property)({attribute:!1})],l.prototype,"config",void 0),n([(0,o.property)({attribute:!1})],l.prototype,"stateObj",void 0),customElements.define("service-call",l),window.customTileFeatures=window.customTileFeatures||[],window.customTileFeatures.push({type:"service-call",name:"Service Call",configurable:!0})},692:(t,e,i)=>{var n;i.d(e,{Al:()=>B,Jb:()=>C,Ld:()=>k,YP:()=>x,dy:()=>E,sY:()=>J});const r=window,s=r.trustedTypes,o=s?s.createPolicy("lit-html",{createHTML:t=>t}):void 0,l="$lit$",a=`lit$${(Math.random()+"").slice(9)}$`,c="?"+a,h=`<${c}>`,d=document,u=()=>d.createComment(""),p=t=>null===t||"object"!=typeof t&&"function"!=typeof t,v=Array.isArray,f=t=>v(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),y="[ \t\n\f\r]",$=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,g=/-->/g,m=/>/g,_=RegExp(`>|${y}(?:([^\\s"'>=/]+)(${y}*=${y}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),b=/'/g,A=/"/g,S=/^(?:script|style|textarea|title)$/i,w=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),E=w(1),x=w(2),C=Symbol.for("lit-noChange"),k=Symbol.for("lit-nothing"),P=new WeakMap,O=d.createTreeWalker(d,129,null,!1);function T(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==o?o.createHTML(e):e}const N=(t,e)=>{const i=t.length-1,n=[];let r,s=2===e?"<svg>":"",o=$;for(let e=0;e<i;e++){const i=t[e];let c,d,u=-1,p=0;for(;p<i.length&&(o.lastIndex=p,d=o.exec(i),null!==d);)p=o.lastIndex,o===$?"!--"===d[1]?o=g:void 0!==d[1]?o=m:void 0!==d[2]?(S.test(d[2])&&(r=RegExp("</"+d[2],"g")),o=_):void 0!==d[3]&&(o=_):o===_?">"===d[0]?(o=null!=r?r:$,u=-1):void 0===d[1]?u=-2:(u=o.lastIndex-d[2].length,c=d[1],o=void 0===d[3]?_:'"'===d[3]?A:b):o===A||o===b?o=_:o===g||o===m?o=$:(o=_,r=void 0);const v=o===_&&t[e+1].startsWith("/>")?" ":"";s+=o===$?i+h:u>=0?(n.push(c),i.slice(0,u)+l+i.slice(u)+a+v):i+a+(-2===u?(n.push(void 0),e):v)}return[T(t,s+(t[i]||"<?>")+(2===e?"</svg>":"")),n]};class U{constructor({strings:t,_$litType$:e},i){let n;this.parts=[];let r=0,o=0;const h=t.length-1,d=this.parts,[p,v]=N(t,e);if(this.el=U.createElement(p,i),O.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(n=O.nextNode())&&d.length<h;){if(1===n.nodeType){if(n.hasAttributes()){const t=[];for(const e of n.getAttributeNames())if(e.endsWith(l)||e.startsWith(a)){const i=v[o++];if(t.push(e),void 0!==i){const t=n.getAttribute(i.toLowerCase()+l).split(a),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:r,name:e[2],strings:t,ctor:"."===e[1]?L:"?"===e[1]?z:"@"===e[1]?q:j})}else d.push({type:6,index:r})}for(const e of t)n.removeAttribute(e)}if(S.test(n.tagName)){const t=n.textContent.split(a),e=t.length-1;if(e>0){n.textContent=s?s.emptyScript:"";for(let i=0;i<e;i++)n.append(t[i],u()),O.nextNode(),d.push({type:2,index:++r});n.append(t[e],u())}}}else if(8===n.nodeType)if(n.data===c)d.push({type:2,index:r});else{let t=-1;for(;-1!==(t=n.data.indexOf(a,t+1));)d.push({type:7,index:r}),t+=a.length-1}r++}}static createElement(t,e){const i=d.createElement("template");return i.innerHTML=t,i}}function R(t,e,i=t,n){var r,s,o,l;if(e===C)return e;let a=void 0!==n?null===(r=i._$Co)||void 0===r?void 0:r[n]:i._$Cl;const c=p(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==c&&(null===(s=null==a?void 0:a._$AO)||void 0===s||s.call(a,!1),void 0===c?a=void 0:(a=new c(t),a._$AT(t,i,n)),void 0!==n?(null!==(o=(l=i)._$Co)&&void 0!==o?o:l._$Co=[])[n]=a:i._$Cl=a),void 0!==a&&(e=R(t,a._$AS(t,e.values),a,n)),e}class H{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:n}=this._$AD,r=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:d).importNode(i,!0);O.currentNode=r;let s=O.nextNode(),o=0,l=0,a=n[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new M(s,s.nextSibling,this,t):1===a.type?e=new a.ctor(s,a.name,a.strings,this,t):6===a.type&&(e=new D(s,this,t)),this._$AV.push(e),a=n[++l]}o!==(null==a?void 0:a.index)&&(s=O.nextNode(),o++)}return O.currentNode=d,r}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class M{constructor(t,e,i,n){var r;this.type=2,this._$AH=k,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=n,this._$Cp=null===(r=null==n?void 0:n.isConnected)||void 0===r||r}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=R(this,t,e),p(t)?t===k||null==t||""===t?(this._$AH!==k&&this._$AR(),this._$AH=k):t!==this._$AH&&t!==C&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):f(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==k&&p(this._$AH)?this._$AA.nextSibling.data=t:this.$(d.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:n}=t,r="number"==typeof n?this._$AC(t):(void 0===n.el&&(n.el=U.createElement(T(n.h,n.h[0]),this.options)),n);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===r)this._$AH.v(i);else{const t=new H(r,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=P.get(t.strings);return void 0===e&&P.set(t.strings,e=new U(t)),e}T(t){v(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,n=0;for(const r of t)n===e.length?e.push(i=new M(this.k(u()),this.k(u()),this,this.options)):i=e[n],i._$AI(r),n++;n<e.length&&(this._$AR(i&&i._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class j{constructor(t,e,i,n,r){this.type=1,this._$AH=k,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=k}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,n){const r=this.strings;let s=!1;if(void 0===r)t=R(this,t,e,0),s=!p(t)||t!==this._$AH&&t!==C,s&&(this._$AH=t);else{const n=t;let o,l;for(t=r[0],o=0;o<r.length-1;o++)l=R(this,n[i+o],e,o),l===C&&(l=this._$AH[o]),s||(s=!p(l)||l!==this._$AH[o]),l===k?t=k:t!==k&&(t+=(null!=l?l:"")+r[o+1]),this._$AH[o]=l}s&&!n&&this.j(t)}j(t){t===k?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class L extends j{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===k?void 0:t}}const I=s?s.emptyScript:"";class z extends j{constructor(){super(...arguments),this.type=4}j(t){t&&t!==k?this.element.setAttribute(this.name,I):this.element.removeAttribute(this.name)}}class q extends j{constructor(t,e,i,n,r){super(t,e,i,n,r),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=R(this,t,e,0))&&void 0!==i?i:k)===C)return;const n=this._$AH,r=t===k&&n!==k||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,s=t!==k&&(n===k||r);r&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class D{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){R(this,t)}}const B={O:l,P:a,A:c,C:1,M:N,L:H,R:f,D:R,I:M,V:j,H:z,N:q,U:L,F:D},V=r.litHtmlPolyfillSupport;null==V||V(U,M),(null!==(n=r.litHtmlVersions)&&void 0!==n?n:r.litHtmlVersions=[]).push("2.8.0");const J=(t,e,i)=>{var n,r;const s=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:e;let o=s._$litPart$;if(void 0===o){const t=null!==(r=null==i?void 0:i.renderBefore)&&void 0!==r?r:null;s._$litPart$=o=new M(e.insertBefore(u(),t),t,void 0,null!=i?i:{})}return o._$AI(t),o}},595:(t,e,i)=>{i.r(e),i.d(e,{customElement:()=>n,eventOptions:()=>c,property:()=>o,query:()=>h,queryAll:()=>d,queryAssignedElements:()=>f,queryAssignedNodes:()=>y,queryAsync:()=>u,state:()=>l});const n=t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:n}=e;return{kind:i,elements:n,finisher(e){customElements.define(t,e)}}})(t,e),r=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}},s=(t,e,i)=>{e.constructor.createProperty(i,t)};function o(t){return(e,i)=>void 0!==i?s(t,e,i):r(t,e)}function l(t){return o({...t,state:!0})}const a=({finisher:t,descriptor:e})=>(i,n)=>{var r;if(void 0===n){const n=null!==(r=i.originalKey)&&void 0!==r?r:i.key,s=null!=e?{kind:"method",placement:"prototype",key:n,descriptor:e(i.key)}:{...i,key:n};return null!=t&&(s.finisher=function(e){t(e,n)}),s}{const r=i.constructor;void 0!==e&&Object.defineProperty(i,n,e(n)),null==t||t(r,n)}};function c(t){return a({finisher:(e,i)=>{Object.assign(e.prototype[i],t)}})}function h(t,e){return a({descriptor:i=>{const n={get(){var e,i;return null!==(i=null===(e=this.renderRoot)||void 0===e?void 0:e.querySelector(t))&&void 0!==i?i:null},enumerable:!0,configurable:!0};if(e){const e="symbol"==typeof i?Symbol():"__"+i;n.get=function(){var i,n;return void 0===this[e]&&(this[e]=null!==(n=null===(i=this.renderRoot)||void 0===i?void 0:i.querySelector(t))&&void 0!==n?n:null),this[e]}}return n}})}function d(t){return a({descriptor:e=>({get(){var e,i;return null!==(i=null===(e=this.renderRoot)||void 0===e?void 0:e.querySelectorAll(t))&&void 0!==i?i:[]},enumerable:!0,configurable:!0})})}function u(t){return a({descriptor:e=>({async get(){var e;return await this.updateComplete,null===(e=this.renderRoot)||void 0===e?void 0:e.querySelector(t)},enumerable:!0,configurable:!0})})}var p;const v=null!=(null===(p=window.HTMLSlotElement)||void 0===p?void 0:p.prototype.assignedElements)?(t,e)=>t.assignedElements(e):(t,e)=>t.assignedNodes(e).filter((t=>t.nodeType===Node.ELEMENT_NODE));function f(t){const{slot:e,selector:i}=null!=t?t:{};return a({descriptor:n=>({get(){var n;const r="slot"+(e?`[name=${e}]`:":not([name])"),s=null===(n=this.renderRoot)||void 0===n?void 0:n.querySelector(r),o=null!=s?v(s,t):[];return i?o.filter((t=>t.matches(i))):o},enumerable:!0,configurable:!0})})}function y(t,e,i){let n,r=t;return"object"==typeof t?(r=t.slot,n=t):n={flatten:e},i?f({slot:r,flatten:e,selector:i}):a({descriptor:t=>({get(){var t,e;const i="slot"+(r?`[name=${r}]`:":not([name])"),s=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(i);return null!==(e=null==s?void 0:s.assignedNodes(n))&&void 0!==e?e:[]},enumerable:!0,configurable:!0})})}},921:(t,e,i)=>{i.r(e),i.d(e,{styleMap:()=>l});var n=i(692);class r{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}const s="important",o=" !"+s,l=(a=class extends r{constructor(t){var e;if(super(t),1!==t.type||"style"!==t.name||(null===(e=t.strings)||void 0===e?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce(((e,i)=>{const n=t[i];return null==n?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${n};`}),"")}update(t,[e]){const{style:i}=t.element;if(void 0===this.ht){this.ht=new Set;for(const t in e)this.ht.add(t);return this.render(e)}this.ht.forEach((t=>{null==e[t]&&(this.ht.delete(t),t.includes("-")?i.removeProperty(t):i[t]="")}));for(const t in e){const n=e[t];if(null!=n){this.ht.add(t);const e="string"==typeof n&&n.endsWith(o);t.includes("-")||e?i.setProperty(t,e?n.slice(0,-11):n,e?s:""):i[t]=n}}return n.Jb}},(...t)=>({_$litDirective$:a,values:t}));var a},677:(t,e,i)=>{i.r(e),i.d(e,{CSSResult:()=>l,LitElement:()=>x,ReactiveElement:()=>b,UpdatingElement:()=>E,_$LE:()=>k,_$LH:()=>w.Al,adoptStyles:()=>h,css:()=>c,defaultConverter:()=>$,getCompatibleStyle:()=>d,html:()=>w.dy,isServer:()=>P,noChange:()=>w.Jb,notEqual:()=>g,nothing:()=>w.Ld,render:()=>w.sY,supportsAdoptingStyleSheets:()=>r,svg:()=>w.YP,unsafeCSS:()=>a});const n=window,r=n.ShadowRoot&&(void 0===n.ShadyCSS||n.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;class l{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(r&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}}const a=t=>new l("string"==typeof t?t:t+"",void 0,s),c=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[n+1]),t[0]);return new l(i,t,s)},h=(t,e)=>{r?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const i=document.createElement("style"),r=n.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=e.cssText,t.appendChild(i)}))},d=r?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return a(e)})(t):t;var u;const p=window,v=p.trustedTypes,f=v?v.emptyScript:"",y=p.reactiveElementPolyfillSupport,$={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},g=(t,e)=>e!==t&&(e==e||t==t),m={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:g},_="finalized";class b extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const n=this._$Ep(i,e);void 0!==n&&(this._$Ev.set(n,i),t.push(n))})),t}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,n=this.getPropertyDescriptor(t,i,e);void 0!==n&&Object.defineProperty(this.prototype,t,n)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(n){const r=this[t];this[e]=n,this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||m}static finalize(){if(this.hasOwnProperty(_))return!1;this[_]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(d(t))}else void 0!==t&&e.push(d(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return h(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=m){var n;const r=this.constructor._$Ep(t,i);if(void 0!==r&&!0===i.reflect){const s=(void 0!==(null===(n=i.converter)||void 0===n?void 0:n.toAttribute)?i.converter:$).toAttribute(e,i.type);this._$El=t,null==s?this.removeAttribute(r):this.setAttribute(r,s),this._$El=null}}_$AK(t,e){var i;const n=this.constructor,r=n._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=n.getPropertyOptions(r),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:$;this._$El=r,this[r]=s.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let n=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||g)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):n=!1),!this.isUpdatePending&&n&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}b[_]=!0,b.elementProperties=new Map,b.elementStyles=[],b.shadowRootOptions={mode:"open"},null==y||y({ReactiveElement:b}),(null!==(u=p.reactiveElementVersions)&&void 0!==u?u:p.reactiveElementVersions=[]).push("1.6.3");var A,S,w=i(692);const E=b;class x extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=(0,w.sY)(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return w.Jb}}x.finalized=!0,x._$litElement$=!0,null===(A=globalThis.litElementHydrateSupport)||void 0===A||A.call(globalThis,{LitElement:x});const C=globalThis.litElementPolyfillSupport;null==C||C({LitElement:x});const k={_$AK:(t,e,i)=>{t._$AK(e,i)},_$AL:t=>t._$AL};(null!==(S=globalThis.litElementVersions)&&void 0!==S?S:globalThis.litElementVersions=[]).push("3.3.3");const P=!1},147:t=>{t.exports=JSON.parse('{"name":"service-call-tile-feature","version":"2.0.0","description":"Service Call Tile Feature for Home Assistant Tile Card","main":"./dist/service-call-tile-feature.js","scripts":{"test":"echo \\"Error: no test specified\\" && exit 1","build":"npx webpack","prelint":"tsc --noemit","lint":"eslint ./src --fix --ext .ts --config ./.eslintrc.js","pretty-quick":"pretty-quick","postinstall":"husky install","build-css":"tcm src"},"repository":{"type":"git","url":"git+https://github.com/Nerwyn/service-call-tile-feature.git"},"keywords":[],"author":"Nerwyn","license":"Apache-2.0","bugs":{"url":"https://github.com/Nerwyn/service-call-tile-feature/issues"},"homepage":"https://github.com/Nerwyn/service-call-tile-feature#readme","husky":{"hooks":{"pre-commit":"pretty-quick --staged"}},"dependencies":{"custom-card-helpers":"^1.9.0","lit":"^2.8.0"},"devDependencies":{"@typescript-eslint/eslint-plugin":"^6.6.0","@typescript-eslint/parser":"^6.6.0","eslint":"^8.48.0","husky":"^8.0.3","prettier":"^3.0.3","pretty-quick":"^3.1.3","ts-loader":"^9.4.4","typescript":"^5.2.2","webpack":"^5.88.2","webpack-cli":"^5.1.4"}}')}},e={};function i(n){var r=e[n];if(void 0!==r)return r.exports;var s=e[n]={exports:{}};return t[n].call(s.exports,s,s.exports,i),s.exports}i.d=(t,e)=>{for(var n in e)i.o(e,n)&&!i.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),i.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i(114)})();