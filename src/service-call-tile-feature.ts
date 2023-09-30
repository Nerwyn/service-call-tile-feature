import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { IConfig } from './models/interfaces';

class ServiceCallTileFeature extends LitElement {
	@property({ attribute: false })
	hass!: HomeAssistant;
	@property({ attribute: false })
	private config!: IConfig;
	@property({ attribute: false })
	private stateObj!: HassEntity;

	constructor() {
		super();
	}

	static get properties() {
		return {
			hass: {},
			config: {},
			stateObj: {},
		};
	}

	static getStubConfig() {
		return {
			type: 'custom:service-call',
			service: '',
			data: {},
		};
	}

	setConfig(config: IConfig) {
		if (!config) {
			throw new Error('Invalid configuration');
		}
		this.config = config;
	}

	_press(e: Event) {
		e.stopPropagation();
		const [domain, entity] = this.config.service.split('.');
		const data = this.config.data;
		if (!data.entity_id) {
			data.entity_id = this.stateObj.entity_id;
		}
		this.hass.callService(domain, entity, data);
	}

	render() {
		if (!this.config || !this.hass || !this.stateObj) {
			return null;
		}

		return html`
			<div class="container">
				<button class="button" @click=${this._press}>
					<ha-icon
						.icon=${this.config.icon || 'mdi:radiobox-marked'}
					></ha-icon>
				</button>
			</div>
		`;
	}

	static get styles() {
		return css`
			.container {
				display: flex;
				flex-direction: row;
				padding: 0 12px 12px 12px;
				width: auto;
			}
			.button {
				z-index: 9 !important;
				background-color: var(--secondary-background-color);
				transition: background-color 180ms ease-in-out;
				position: relative;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				width: 100%;
				height: 40px;
				border-radius: 10px;
				border: none;
				margin: 0px;
				padding: 0px;
				box-sizing: border-box;
				line-height: 0;
				outline: 0px;
				overflow: hidden;
				font-size: inherit;
				color: inherit;
			}
			.button:hover {
				background-color: var(--disabled-color);
			}
		`;
	}
}

customElements.define('service-call', ServiceCallTileFeature);

window.customTileFeatures = window.customTileFeatures || [];
window.customTileFeatures.push({
	type: 'service-call',
	name: 'Service Call',
	configurable: true,
});
