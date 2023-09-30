import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { IConfig } from './models/interfaces';

@customElement('service-call')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
			data: {
				entity_id: '',
			},
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
		this.hass.callService(
			domain,
			entity,
			this.config.data || { entity_id: this.stateObj.entity_id },
		);
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
				--mdc-ripple-color: var(--disabled-color);
				font-size: inherit;
				color: inherit;
			}
		`;
	}
}

window.customTileFeatures = window.customTileFeatures || [];
window.customTileFeatures.push({
	type: 'service-call',
	name: 'Service Call',
	supported: true,
	configurable: true,
});
