/*! For license information please see service-call-tile-feature.js.LICENSE.txt */
(()=>{"use strict";var t={393:function(t,e,i){var r=this&&this.__decorate||function(t,e,i,r){var s,n=arguments.length,o=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,r);else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(o=(n<3?s(o):n>3?s(e,i,o):s(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o};Object.defineProperty(e,"__esModule",{value:!0}),e.BaseServiceCallFeature=void 0;const s=i(677),n=i(595),o=i(921);let l=class extends s.LitElement{constructor(){super(...arguments),this.value=0}setValueInStyleFields(t){if(t){if(t.includes("VALUE")){if(!this.value)return"";t=t.replace(/VALUE/g,this.value.toString())}if(t.includes("STATE")){const e=this.hass.states[this.entry.entity_id].state;t=t.replace(/STATE/g,e)}const e=/ATTRIBUTE\[(.*?)\]/g,i=t.match(e);if(i){for(const e of i){const i=e.replace("ATTRIBUTE[","").replace("]","");let r=this.hass.states[this.entry.entity_id].attributes[i];switch(i){case"brightness":if(!r)return"0";r=Math.round(parseInt(null!=r?r:0)/255*100).toString();break;case"rgb_color":r=Array.isArray(r)&&3==r.length?`rgb(${r[0]}, ${r[1]}, ${r[2]})`:"var(--primary-text-color)";break;default:if(null==r||null==r)return}t=t.replace(`ATTRIBUTE[${i}]`,r)}return t}return t}return""}callService(){if("confirmation"in this.entry&&0!=this.entry.confirmation){let t=`Are you sure you want to run action '${this.entry.service}'?`;if(1==this.entry.confirmation){if(!confirm(t))return}else if("text"in this.entry.confirmation&&(t=this.setValueInStyleFields(this.entry.confirmation.text)),"exemptions"in this.entry.confirmation){if(!this.entry.confirmation.exemptions.map((t=>t.user)).includes(this.hass.user.id)&&!confirm(t))return}else if(!confirm(t))return}if("service"in this.entry){const[t,e]=this.entry.service.split("."),i=JSON.parse(JSON.stringify(this.entry.data));for(const t in i)"VALUE"==i[t]?i[t]=this.value:i[t].toString().includes("VALUE")&&(i[t]=i[t].toString().replace("VALUE",this.value));this.hass.callService(t,e,i)}}render(){const t=this.entry.value_attribute;if("state"==t)this.value=this.hass.states[this.entry.entity_id].state;else{let e=this.hass.states[this.entry.entity_id].attributes[t];"brightness"==t&&(e=Math.round(parseInt(null!=e?e:0)/255*100)),this.value=e}let e=s.html``;if("icon"in this.entry){const t={};this.entry.icon_color&&(t.color=this.setValueInStyleFields(this.entry.icon_color)),e=s.html`<ha-icon
				.icon=${this.setValueInStyleFields(this.entry.icon)}
				style="${(0,o.styleMap)(t)}"
			></ha-icon>`}let i=s.html``;if("label"in this.entry){const t=this.setValueInStyleFields(this.entry.label);if(t){const e={};this.entry.label_color&&(e.color=this.setValueInStyleFields(this.entry.label_color)),i=s.html`<div class="label" style="${(0,o.styleMap)(e)}">${t}</div>`}}return s.html`${e}${i}`}static get styles(){return[s.css`
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
					flex-basis: 100%;
				}

				.container {
					all: inherit;
					height: 100%;
					overflow: hidden;
				}

				ha-icon {
					position: relative;
					pointer-events: none;
					display: inline-flex;
					flex-flow: column;
					place-content: center;
					z-index: 2;
					filter: invert(var(--invert-icon));
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
					z-index: 2;
					filter: invert(var(--invert-label));
				}
			`]}};e.BaseServiceCallFeature=l,r([(0,n.property)({attribute:!1})],l.prototype,"hass",void 0),r([(0,n.property)({attribute:!1})],l.prototype,"entry",void 0),r([(0,n.property)({attribute:!1})],l.prototype,"value",void 0),e.BaseServiceCallFeature=l=r([(0,n.customElement)("base-service-call-feature")],l)},827:function(t,e,i){var r=this&&this.__decorate||function(t,e,i,r){var s,n=arguments.length,o=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,r);else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(o=(n<3?s(o):n>3?s(e,i,o):s(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o};Object.defineProperty(e,"__esModule",{value:!0}),e.ServiceCallButton=void 0;const s=i(677),n=i(595),o=i(921),l=i(393);let a=class extends l.BaseServiceCallFeature{onClick(t){this.callService()}render(){const t=super.render(),e={};this.entry.color&&(e["background-color"]=this.setValueInStyleFields(this.entry.color)),(this.entry.opacity||0==this.entry.opacity)&&(e.opacity=this.entry.opacity);const i=s.html`<button
			class="button"
			@click=${this.onClick}
			style=${(0,o.styleMap)(e)}
		></button>`;return s.html`${i}${t}`}static get styles(){return[super.styles,s.css`
				.button {
					background-color: var(--disabled-color);
					opacity: 0.2;
					transition:
						background-color 180ms ease-in-out 0s,
						opacity 180ms ease-in-out 0s;
					position: absolute;
					cursor: pointer;
					height: inherit;
					width: inherit;
					border-radius: 10px;
					border: none;
				}
				@media (hover: hover) {
					.button:hover {
						opacity: 0.3 !important;
						background-color: var(
							--selection-color,
							var(--disabled-color)
						);
					}
				}
				.button:active {
					opacity: 0.3 !important;
					background-color: var(
						--selection-color,
						var(--disabled-color)
					);
				}
			`]}};e.ServiceCallButton=a,e.ServiceCallButton=a=r([(0,n.customElement)("service-call-button")],a)},369:function(t,e,i){var r=this&&this.__decorate||function(t,e,i,r){var s,n=arguments.length,o=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,r);else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(o=(n<3?s(o):n>3?s(e,i,o):s(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o};Object.defineProperty(e,"__esModule",{value:!0}),e.ServiceCallSelector=void 0;const s=i(677),n=i(595),o=i(921),l=i(393);i(827);let a=class extends l.BaseServiceCallFeature{onClick(t){const e=t.currentTarget.parentElement.children;for(const t of e)if("service-call-button"==t.tagName.toLowerCase()){const e=t.style;e.removeProperty("background-color"),e.removeProperty("opacity"),"1"==e.getPropertyValue("--invert-icon")&&e.setProperty("--invert-icon","0"),"1"==e.getPropertyValue("--invert-label")&&e.setProperty("--invert-label","0")}const i=t.currentTarget.style;i.setProperty("background-color","var(--selection-color)"),i.setProperty("opacity","var(--selection-opacity)"),"0"==i.getPropertyValue("--invert-icon")&&i.setProperty("--invert-icon","1"),"0"==i.getPropertyValue("--invert-label")&&i.setProperty("--invert-label","1")}render(){var t,e,i;super.render();const r=null!==(t=this.entry.options)&&void 0!==t?t:[];let n=null!==(e=this.hass.states[this.entry.entity_id].attributes.options)&&void 0!==e?e:new Array(r.length);n.length<r.length&&(n=Object.assign(new Array(r.length),n));const l={};this.entry.background_color&&(l.background=this.setValueInStyleFields(this.entry.background_color)),(this.entry.background_opacity||0==this.entry.background_opacity)&&(l.opacity=this.entry.background_opacity);const a=[s.html`<div
				class="selector-background"
				style=${(0,o.styleMap)(l)}
			></div>`],c=1==this.entry.invert_icon,h=1==this.entry.invert_label;for(const t in r){const e=this.entry.options[t];"service"in e||(e.service="input_select.select_option","option"in e.data||(e.data.option=n[t])),"opacity"in e||(e.opacity=0);const r=null!==(i=e.option)&&void 0!==i?i:n[t];let l,d;l="invert_icon"in e?1==e.invert_icon:c,d="invert_label"in e?1==e.invert_label:h;const u={};this.value==r&&null!=this.value?(u.backgroundColor="var(--selection-color)",u.opacity="var(--selection-opacity)",l&&(u["--invert-icon"]="1"),d&&(u["--invert-label"]="1")):(u.backgroundColor="",u.opacity="",l&&(u["--invert-icon"]="0"),d&&(u["--invert-label"]="0")),"color"in e&&(u["--selection-color"]=e.color),"flex_basis"in e&&(u["flex-basis"]=e.flex_basis),a.push(s.html`<service-call-button
					.hass=${this.hass}
					.entry=${e}
					@click=${this.onClick}
					style=${(0,o.styleMap)(u)}
				/>`)}const d={};return this.entry.color&&(d["--selection-color"]=this.entry.color),(this.entry.opacity||0==this.entry.opacity)&&(d["--selection-opacity"]=this.entry.opacity),s.html`<div class="container" style=${(0,o.styleMap)(d)}>
			${a}
		</div>`}static get styles(){return[super.styles,s.css`
				:host {
					flex-flow: row;
					--selection-opacity: 1;
					--selection-color: var(--tile-color);
				}

				.selector-background {
					position: absolute;
					width: inherit;
					height: inherit;
					background: var(--disabled-color);
					opacity: 0.2;
				}
			`]}};e.ServiceCallSelector=a,e.ServiceCallSelector=a=r([(0,n.customElement)("service-call-selector")],a)},719:function(t,e,i){var r=this&&this.__decorate||function(t,e,i,r){var s,n=arguments.length,o=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,r);else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(o=(n<3?s(o):n>3?s(e,i,o):s(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o};Object.defineProperty(e,"__esModule",{value:!0}),e.ServiceCallSlider=void 0;const s=i(677),n=i(595),o=i(921),l=i(393);let a=class extends l.BaseServiceCallFeature{constructor(){super(...arguments),this.speed=2,this.range=[0,100],this.class="slider"}onInput(t){var e,i,r;t.preventDefault(),t.stopImmediatePropagation();const s=t.currentTarget,n=parseFloat(null!==(i=null!==(e=this.oldValue)&&void 0!==e?e:this.value)&&void 0!==i?i:"0"),o=parseFloat(null!==(r=s.value)&&void 0!==r?r:n);s.value=n.toString(),this.newValue=o,o>this.range[0]&&(s.className=this.class);let l=n;if(n>o){const t=setInterval((()=>{l-=this.speed,s.value=l.toString(),o>=l&&(clearInterval(t),s.value=o.toString(),o<=this.range[0]&&"slider-line-thumb"!=this.class&&(s.className="slider-off"))}),1)}else if(n<o){const t=setInterval((()=>{l+=this.speed,s.value=l.toString(),o<=l&&(clearInterval(t),s.value=o.toString())}),1)}else s.value=o.toString();this.oldValue=o}onEnd(t){this.newValue||0==this.newValue||(this.newValue=this.value),this.newValue%1==0&&(this.newValue=Math.trunc(this.newValue)),this.value=this.newValue,this.callService()}render(){var t;const e=super.render();null==this.oldValue&&(this.oldValue=parseFloat(this.value)),null==this.newValue&&(this.newValue=parseFloat(this.value)),this.entry.range&&(this.range=this.entry.range);let i=(this.range[1]-this.range[0])/100;this.entry.step&&(i=this.entry.step),this.speed=(this.range[1]-this.range[0])/50;const r={};this.entry.background_color&&(r.background=this.setValueInStyleFields(this.entry.background_color)),(this.entry.background_opacity||0==this.entry.background_opacity)&&(r.opacity=this.entry.background_opacity);const n=s.html`<div
			class="slider-background"
			style=${(0,o.styleMap)(r)}
		></div>`;switch(this.class="slider",this.entry.thumb){case"line":this.class="slider-line-thumb";break;case"flat":this.class="slider-flat-thumb";break;default:this.class="slider"}(null==this.value||0==this.value&&"slider-line-thumb"!=this.class)&&(this.class="slider-off");const l=s.html`
			<input
				type="range"
				class="${this.class}"
				min="${this.range[0]}"
				max="${this.range[1]}"
				step=${i}
				value="${this.value}"
				@input=${this.onInput}
				@mouseup=${this.onEnd}
				@touchend=${this.onEnd}
			/>
		`,a={};return this.entry.color&&(a["--slider-color"]=this.setValueInStyleFields(this.entry.color)),(this.entry.opacity||0==this.entry.opacity)&&(a["--slider-opacity"]=null===(t=this.entry.opacity)||void 0===t?void 0:t.toString()),s.html`<div class="container" style=${(0,o.styleMap)(a)}>
			${n}${l}${e}
		</div>`}static get styles(){return[super.styles,s.css`
				:host {
					--slider-opacity: 1;
				}
				.slider-background {
					position: absolute;
					width: inherit;
					height: inherit;
					background: var(--slider-color);
					opacity: 0.2;
				}

				.slider,
				.slider-line-thumb,
				.slider-flat-thumb,
				.slider-off {
					position: absolute;
					appearance: none;
					-webkit-appearance: none;
					-moz-appearance: none;
					height: inherit;
					border-radius: 10px;
					background: none;
				}

				.slider,
				.slider-flat-thumb,
				.slider-off {
					width: inherit;
					overflow: hidden;
				}

				.slider-line-thumb {
					width: calc(100% - 5px);
				}

				.slider::-webkit-slider-thumb {
					appearance: none;
					-webkit-appearance: none;
					height: 30px;
					width: 12px;
					border-style: solid;
					border-width: 4px;
					border-radius: 12px;
					border-color: var(--slider-color);
					background: #ffffff;
					cursor: pointer;
					opacity: var(--slider-opacity);
					box-shadow:
						calc(-100vw - 6px) 0 0 100vw var(--slider-color),
						-4px 0 0 6px var(--slider-color);
				}

				.slider::-moz-range-thumb {
					appearance: none;
					-moz-appearance: none;
					height: 30px;
					width: 12px;
					border-style: solid;
					border-width: 4px;
					border-radius: 12px;
					border-color: var(--slider-color);
					background: #ffffff;
					cursor: pointer;
					opacity: var(--slider-opacity);
					box-shadow:
						calc(-100vw - 6px) 0 0 100vw var(--slider-color),
						-4px 0 0 6px var(--slider-color);
				}

				.slider-line-thumb::-webkit-slider-thumb {
					appearance: none;
					-webkit-appearance: none;
					height: 28px;
					width: 10px;
					border-style: solid;
					border-color: #ffffff;
					border-width: 3px;
					border-radius: 12px;
					background: #8a8c99;
					cursor: pointer;
					opacity: var(--slider-opacity);
					box-shadow:
						0 7px 0 0 #ffffff,
						0 -7px 0 0 #ffffff;
				}

				.slider-line-thumb::-moz-range-thumb {
					appearance: none;
					-moz-appearance: none;
					height: 28px;
					width: 10px;
					border-style: solid;
					border-color: #ffffff;
					border-width: 3px;
					border-radius: 12px;
					background: #8a8c99;
					cursor: pointer;
					opacity: var(--slider-opacity);
					box-shadow:
						0 7px 0 0 #ffffff,
						0 -7px 0 0 #ffffff;
				}

				.slider-flat-thumb::-webkit-slider-thumb {
					appearance: none;
					-webkit-appearance: none;
					height: 40px;
					width: 24px;
					background: var(--slider-color);
					cursor: pointer;
					z-index: 1;
					box-shadow: -100vw 0 0 100vw var(--slider-color);
				}

				.slider-flat-thumb::-moz-range-thumb {
					appearance: none;
					-moz-appearance: none;
					height: 40px;
					width: 24px;
					background: var(--slider-color);
					cursor: pointer;
					z-index: 1;
					box-shadow: -100vw 0 0 100vw var(--slider-color);
				}

				.slider-off::-webkit-slider-thumb {
					visibility: hidden;
				}

				.slider-off::-moz-range-thumb {
					visibility: hidden;
				}
			`]}};e.ServiceCallSlider=a,e.ServiceCallSlider=a=r([(0,n.customElement)("service-call-slider")],a)},114:function(t,e,i){var r=this&&this.__decorate||function(t,e,i,r){var s,n=arguments.length,o=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,r);else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(o=(n<3?s(o):n>3?s(e,i,o):s(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o};Object.defineProperty(e,"__esModule",{value:!0});const s=i(147),n=i(677),o=i(595),l=i(921);i(827),i(719),i(369),console.info(`%c SERVICE-CALL-TILE-FEATURE v${s.version}`,"color: white; font-weight: bold; background: cornflowerblue");class a extends n.LitElement{constructor(){super()}static getStubConfig(){return{type:"custom:service-call",entries:[{type:"button"}]}}setConfig(t){var e;if(!t)throw new Error("Invalid configuration");"buttons"in(t=JSON.parse(JSON.stringify(t)))&&!("entries"in t)&&(t.entries=t.buttons);for(let i of t.entries){i=this.updateDeprecatedEntryFields(i);for(let t of null!==(e=i.options)&&void 0!==e?e:[])t=this.updateDeprecatedEntryFields(t)}this.config=t}render(){var t,e,i;if(!this.config||!this.hass||!this.stateObj)return null;const r=[];for(let s of this.config.entries){if(null===(t=s.autofill_entity_id)||void 0===t||t){s=this.populateMissingEntityId(s,this.stateObj.entity_id);for(let t of null!==(e=s.options)&&void 0!==e?e:[])t=this.populateMissingEntityId(t,s.entity_id)}const o={};switch("flex_basis"in s&&(o["flex-basis"]=s.flex_basis),(null!==(i=s.type)&&void 0!==i?i:"button").toLowerCase()){case"slider":r.push(n.html`<service-call-slider
							.hass=${this.hass}
							.entry=${s}
							style=${(0,l.styleMap)(o)}
						/>`);break;case"selector":r.push(n.html`<service-call-selector
							.hass=${this.hass}
							.entry=${s}
							style=${(0,l.styleMap)(o)}
						/>`);break;default:r.push(n.html`<service-call-button
							.hass=${this.hass}
							.entry=${s}
							style=${(0,l.styleMap)(o)}
						/>`)}}return n.html`<div class="row">${r}</div>`}updateDeprecatedEntryFields(t){var e,i;return t.data=Object.assign(Object.assign({},t.data||{}),t.target||{}),t.type=(null!==(e=t.type)&&void 0!==e?e:"button").toLowerCase(),t.value_attribute=(null!==(i=t.value_attribute)&&void 0!==i?i:"state").toLowerCase(),t}populateMissingEntityId(t,e){var i,r,s;return"entity_id"in t.data||"device_id"in t.data||"area_id"in t.data||(t.data.entity_id=null!==(i=t.entity_id)&&void 0!==i?i:e),"entity_id"in t||(t.entity_id=null!==(s=null===(r=t.data)||void 0===r?void 0:r.entity_id)&&void 0!==s?s:e),t}static get styles(){return n.css`
			.row {
				display: flex;
				flex-flow: row;
				justify-content: center;
				align-items: center;
				padding: 0 12px 12px;
				gap: 12px;
				width: auto;
			}
		`}}r([(0,o.property)({attribute:!1})],a.prototype,"hass",void 0),r([(0,o.property)({attribute:!1})],a.prototype,"config",void 0),r([(0,o.property)({attribute:!1})],a.prototype,"stateObj",void 0),customElements.define("service-call",a),window.customTileFeatures=window.customTileFeatures||[],window.customTileFeatures.push({type:"service-call",name:"Service Call",configurable:!0})},692:(t,e,i)=>{var r;i.d(e,{Al:()=>B,Jb:()=>k,Ld:()=>C,YP:()=>x,dy:()=>E,sY:()=>q});const s=window,n=s.trustedTypes,o=n?n.createPolicy("lit-html",{createHTML:t=>t}):void 0,l="$lit$",a=`lit$${(Math.random()+"").slice(9)}$`,c="?"+a,h=`<${c}>`,d=document,u=()=>d.createComment(""),p=t=>null===t||"object"!=typeof t&&"function"!=typeof t,v=Array.isArray,y=t=>v(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),f="[ \t\n\f\r]",b=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,g=/-->/g,m=/>/g,_=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),$=/'/g,A=/"/g,w=/^(?:script|style|textarea|title)$/i,S=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),E=S(1),x=S(2),k=Symbol.for("lit-noChange"),C=Symbol.for("lit-nothing"),P=new WeakMap,O=d.createTreeWalker(d,129,null,!1);function T(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==o?o.createHTML(e):e}const R=(t,e)=>{const i=t.length-1,r=[];let s,n=2===e?"<svg>":"",o=b;for(let e=0;e<i;e++){const i=t[e];let c,d,u=-1,p=0;for(;p<i.length&&(o.lastIndex=p,d=o.exec(i),null!==d);)p=o.lastIndex,o===b?"!--"===d[1]?o=g:void 0!==d[1]?o=m:void 0!==d[2]?(w.test(d[2])&&(s=RegExp("</"+d[2],"g")),o=_):void 0!==d[3]&&(o=_):o===_?">"===d[0]?(o=null!=s?s:b,u=-1):void 0===d[1]?u=-2:(u=o.lastIndex-d[2].length,c=d[1],o=void 0===d[3]?_:'"'===d[3]?A:$):o===A||o===$?o=_:o===g||o===m?o=b:(o=_,s=void 0);const v=o===_&&t[e+1].startsWith("/>")?" ":"";n+=o===b?i+h:u>=0?(r.push(c),i.slice(0,u)+l+i.slice(u)+a+v):i+a+(-2===u?(r.push(void 0),e):v)}return[T(t,n+(t[i]||"<?>")+(2===e?"</svg>":"")),r]};class M{constructor({strings:t,_$litType$:e},i){let r;this.parts=[];let s=0,o=0;const h=t.length-1,d=this.parts,[p,v]=R(t,e);if(this.el=M.createElement(p,i),O.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(r=O.nextNode())&&d.length<h;){if(1===r.nodeType){if(r.hasAttributes()){const t=[];for(const e of r.getAttributeNames())if(e.endsWith(l)||e.startsWith(a)){const i=v[o++];if(t.push(e),void 0!==i){const t=r.getAttribute(i.toLowerCase()+l).split(a),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:s,name:e[2],strings:t,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:V})}else d.push({type:6,index:s})}for(const e of t)r.removeAttribute(e)}if(w.test(r.tagName)){const t=r.textContent.split(a),e=t.length-1;if(e>0){r.textContent=n?n.emptyScript:"";for(let i=0;i<e;i++)r.append(t[i],u()),O.nextNode(),d.push({type:2,index:++s});r.append(t[e],u())}}}else if(8===r.nodeType)if(r.data===c)d.push({type:2,index:s});else{let t=-1;for(;-1!==(t=r.data.indexOf(a,t+1));)d.push({type:7,index:s}),t+=a.length-1}s++}}static createElement(t,e){const i=d.createElement("template");return i.innerHTML=t,i}}function U(t,e,i=t,r){var s,n,o,l;if(e===k)return e;let a=void 0!==r?null===(s=i._$Co)||void 0===s?void 0:s[r]:i._$Cl;const c=p(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==c&&(null===(n=null==a?void 0:a._$AO)||void 0===n||n.call(a,!1),void 0===c?a=void 0:(a=new c(t),a._$AT(t,i,r)),void 0!==r?(null!==(o=(l=i)._$Co)&&void 0!==o?o:l._$Co=[])[r]=a:i._$Cl=a),void 0!==a&&(e=U(t,a._$AS(t,e.values),a,r)),e}class j{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:r}=this._$AD,s=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:d).importNode(i,!0);O.currentNode=s;let n=O.nextNode(),o=0,l=0,a=r[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new N(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new F(n,this,t)),this._$AV.push(e),a=r[++l]}o!==(null==a?void 0:a.index)&&(n=O.nextNode(),o++)}return O.currentNode=d,s}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class N{constructor(t,e,i,r){var s;this.type=2,this._$AH=C,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=r,this._$Cp=null===(s=null==r?void 0:r.isConnected)||void 0===s||s}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=U(this,t,e),p(t)?t===C||null==t||""===t?(this._$AH!==C&&this._$AR(),this._$AH=C):t!==this._$AH&&t!==k&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):y(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==C&&p(this._$AH)?this._$AA.nextSibling.data=t:this.$(d.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:r}=t,s="number"==typeof r?this._$AC(t):(void 0===r.el&&(r.el=M.createElement(T(r.h,r.h[0]),this.options)),r);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===s)this._$AH.v(i);else{const t=new j(s,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=P.get(t.strings);return void 0===e&&P.set(t.strings,e=new M(t)),e}T(t){v(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,r=0;for(const s of t)r===e.length?e.push(i=new N(this.k(u()),this.k(u()),this,this.options)):i=e[r],i._$AI(s),r++;r<e.length&&(this._$AR(i&&i._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class V{constructor(t,e,i,r,s){this.type=1,this._$AH=C,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=C}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,r){const s=this.strings;let n=!1;if(void 0===s)t=U(this,t,e,0),n=!p(t)||t!==this._$AH&&t!==k,n&&(this._$AH=t);else{const r=t;let o,l;for(t=s[0],o=0;o<s.length-1;o++)l=U(this,r[i+o],e,o),l===k&&(l=this._$AH[o]),n||(n=!p(l)||l!==this._$AH[o]),l===C?t=C:t!==C&&(t+=(null!=l?l:"")+s[o+1]),this._$AH[o]=l}n&&!r&&this.j(t)}j(t){t===C?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class I extends V{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===C?void 0:t}}const H=n?n.emptyScript:"";class L extends V{constructor(){super(...arguments),this.type=4}j(t){t&&t!==C?this.element.setAttribute(this.name,H):this.element.removeAttribute(this.name)}}class z extends V{constructor(t,e,i,r,s){super(t,e,i,r,s),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=U(this,t,e,0))&&void 0!==i?i:C)===k)return;const r=this._$AH,s=t===C&&r!==C||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,n=t!==C&&(r===C||s);s&&this.element.removeEventListener(this.name,this,r),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class F{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){U(this,t)}}const B={O:l,P:a,A:c,C:1,M:R,L:j,R:y,D:U,I:N,V,H:L,N:z,U:I,F},D=s.litHtmlPolyfillSupport;null==D||D(M,N),(null!==(r=s.litHtmlVersions)&&void 0!==r?r:s.litHtmlVersions=[]).push("2.8.0");const q=(t,e,i)=>{var r,s;const n=null!==(r=null==i?void 0:i.renderBefore)&&void 0!==r?r:e;let o=n._$litPart$;if(void 0===o){const t=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:null;n._$litPart$=o=new N(e.insertBefore(u(),t),t,void 0,null!=i?i:{})}return o._$AI(t),o}},595:(t,e,i)=>{i.r(e),i.d(e,{customElement:()=>r,eventOptions:()=>c,property:()=>o,query:()=>h,queryAll:()=>d,queryAssignedElements:()=>y,queryAssignedNodes:()=>f,queryAsync:()=>u,state:()=>l});const r=t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:r}=e;return{kind:i,elements:r,finisher(e){customElements.define(t,e)}}})(t,e),s=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}},n=(t,e,i)=>{e.constructor.createProperty(i,t)};function o(t){return(e,i)=>void 0!==i?n(t,e,i):s(t,e)}function l(t){return o({...t,state:!0})}const a=({finisher:t,descriptor:e})=>(i,r)=>{var s;if(void 0===r){const r=null!==(s=i.originalKey)&&void 0!==s?s:i.key,n=null!=e?{kind:"method",placement:"prototype",key:r,descriptor:e(i.key)}:{...i,key:r};return null!=t&&(n.finisher=function(e){t(e,r)}),n}{const s=i.constructor;void 0!==e&&Object.defineProperty(i,r,e(r)),null==t||t(s,r)}};function c(t){return a({finisher:(e,i)=>{Object.assign(e.prototype[i],t)}})}function h(t,e){return a({descriptor:i=>{const r={get(){var e,i;return null!==(i=null===(e=this.renderRoot)||void 0===e?void 0:e.querySelector(t))&&void 0!==i?i:null},enumerable:!0,configurable:!0};if(e){const e="symbol"==typeof i?Symbol():"__"+i;r.get=function(){var i,r;return void 0===this[e]&&(this[e]=null!==(r=null===(i=this.renderRoot)||void 0===i?void 0:i.querySelector(t))&&void 0!==r?r:null),this[e]}}return r}})}function d(t){return a({descriptor:e=>({get(){var e,i;return null!==(i=null===(e=this.renderRoot)||void 0===e?void 0:e.querySelectorAll(t))&&void 0!==i?i:[]},enumerable:!0,configurable:!0})})}function u(t){return a({descriptor:e=>({async get(){var e;return await this.updateComplete,null===(e=this.renderRoot)||void 0===e?void 0:e.querySelector(t)},enumerable:!0,configurable:!0})})}var p;const v=null!=(null===(p=window.HTMLSlotElement)||void 0===p?void 0:p.prototype.assignedElements)?(t,e)=>t.assignedElements(e):(t,e)=>t.assignedNodes(e).filter((t=>t.nodeType===Node.ELEMENT_NODE));function y(t){const{slot:e,selector:i}=null!=t?t:{};return a({descriptor:r=>({get(){var r;const s="slot"+(e?`[name=${e}]`:":not([name])"),n=null===(r=this.renderRoot)||void 0===r?void 0:r.querySelector(s),o=null!=n?v(n,t):[];return i?o.filter((t=>t.matches(i))):o},enumerable:!0,configurable:!0})})}function f(t,e,i){let r,s=t;return"object"==typeof t?(s=t.slot,r=t):r={flatten:e},i?y({slot:s,flatten:e,selector:i}):a({descriptor:t=>({get(){var t,e;const i="slot"+(s?`[name=${s}]`:":not([name])"),n=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(i);return null!==(e=null==n?void 0:n.assignedNodes(r))&&void 0!==e?e:[]},enumerable:!0,configurable:!0})})}},921:(t,e,i)=>{i.r(e),i.d(e,{styleMap:()=>l});var r=i(692);class s{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}const n="important",o=" !"+n,l=(a=class extends s{constructor(t){var e;if(super(t),1!==t.type||"style"!==t.name||(null===(e=t.strings)||void 0===e?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce(((e,i)=>{const r=t[i];return null==r?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`}),"")}update(t,[e]){const{style:i}=t.element;if(void 0===this.ht){this.ht=new Set;for(const t in e)this.ht.add(t);return this.render(e)}this.ht.forEach((t=>{null==e[t]&&(this.ht.delete(t),t.includes("-")?i.removeProperty(t):i[t]="")}));for(const t in e){const r=e[t];if(null!=r){this.ht.add(t);const e="string"==typeof r&&r.endsWith(o);t.includes("-")||e?i.setProperty(t,e?r.slice(0,-11):r,e?n:""):i[t]=r}}return r.Jb}},(...t)=>({_$litDirective$:a,values:t}));var a},677:(t,e,i)=>{i.r(e),i.d(e,{CSSResult:()=>l,LitElement:()=>x,ReactiveElement:()=>$,UpdatingElement:()=>E,_$LE:()=>C,_$LH:()=>S.Al,adoptStyles:()=>h,css:()=>c,defaultConverter:()=>b,getCompatibleStyle:()=>d,html:()=>S.dy,isServer:()=>P,noChange:()=>S.Jb,notEqual:()=>g,nothing:()=>S.Ld,render:()=>S.sY,supportsAdoptingStyleSheets:()=>s,svg:()=>S.YP,unsafeCSS:()=>a});const r=window,s=r.ShadowRoot&&(void 0===r.ShadyCSS||r.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),o=new WeakMap;class l{constructor(t,e,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}}const a=t=>new l("string"==typeof t?t:t+"",void 0,n),c=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,r)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[r+1]),t[0]);return new l(i,t,n)},h=(t,e)=>{s?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const i=document.createElement("style"),s=r.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=e.cssText,t.appendChild(i)}))},d=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return a(e)})(t):t;var u;const p=window,v=p.trustedTypes,y=v?v.emptyScript:"",f=p.reactiveElementPolyfillSupport,b={toAttribute(t,e){switch(e){case Boolean:t=t?y:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},g=(t,e)=>e!==t&&(e==e||t==t),m={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:g},_="finalized";class $ extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const r=this._$Ep(i,e);void 0!==r&&(this._$Ev.set(r,i),t.push(r))})),t}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,r=this.getPropertyDescriptor(t,i,e);void 0!==r&&Object.defineProperty(this.prototype,t,r)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(r){const s=this[t];this[e]=r,this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||m}static finalize(){if(this.hasOwnProperty(_))return!1;this[_]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(d(t))}else void 0!==t&&e.push(d(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return h(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=m){var r;const s=this.constructor._$Ep(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==(null===(r=i.converter)||void 0===r?void 0:r.toAttribute)?i.converter:b).toAttribute(e,i.type);this._$El=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$El=null}}_$AK(t,e){var i;const r=this.constructor,s=r._$Ev.get(t);if(void 0!==s&&this._$El!==s){const t=r.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:b;this._$El=s,this[s]=n.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let r=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||g)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):r=!1),!this.isUpdatePending&&r&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}$[_]=!0,$.elementProperties=new Map,$.elementStyles=[],$.shadowRootOptions={mode:"open"},null==f||f({ReactiveElement:$}),(null!==(u=p.reactiveElementVersions)&&void 0!==u?u:p.reactiveElementVersions=[]).push("1.6.3");var A,w,S=i(692);const E=$;class x extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=(0,S.sY)(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return S.Jb}}x.finalized=!0,x._$litElement$=!0,null===(A=globalThis.litElementHydrateSupport)||void 0===A||A.call(globalThis,{LitElement:x});const k=globalThis.litElementPolyfillSupport;null==k||k({LitElement:x});const C={_$AK:(t,e,i)=>{t._$AK(e,i)},_$AL:t=>t._$AL};(null!==(w=globalThis.litElementVersions)&&void 0!==w?w:globalThis.litElementVersions=[]).push("3.3.3");const P=!1},147:t=>{t.exports=JSON.parse('{"name":"service-call-tile-feature","version":"2.1.1","description":"Service Call Tile Feature for Home Assistant Tile Card","main":"./dist/service-call-tile-feature.js","scripts":{"test":"echo \\"Error: no test specified\\" && exit 1","build":"npx webpack","prelint":"tsc --noemit","lint":"eslint ./src --fix --ext .ts --config ./.eslintrc.js","pretty-quick":"pretty-quick","postinstall":"husky install","build-css":"tcm src"},"repository":{"type":"git","url":"git+https://github.com/Nerwyn/service-call-tile-feature.git"},"keywords":[],"author":"Nerwyn","license":"Apache-2.0","bugs":{"url":"https://github.com/Nerwyn/service-call-tile-feature/issues"},"homepage":"https://github.com/Nerwyn/service-call-tile-feature#readme","husky":{"hooks":{"pre-commit":"pretty-quick --staged"}},"dependencies":{"custom-card-helpers":"^1.9.0","lit":"^2.8.0"},"devDependencies":{"@typescript-eslint/eslint-plugin":"^6.6.0","@typescript-eslint/parser":"^6.6.0","eslint":"^8.48.0","husky":"^8.0.3","prettier":"^3.0.3","pretty-quick":"^3.1.3","ts-loader":"^9.4.4","typescript":"^5.2.2","webpack":"^5.88.2","webpack-cli":"^5.1.4"}}')}},e={};function i(r){var s=e[r];if(void 0!==s)return s.exports;var n=e[r]={exports:{}};return t[r].call(n.exports,n,n.exports,i),n.exports}i.d=(t,e)=>{for(var r in e)i.o(e,r)&&!i.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),i.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i(114)})();