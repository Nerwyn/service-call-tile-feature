import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

import { IConfig } from './models/interfaces';

export class ServiceCallTileFeatureEditor extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) private config!: IConfig;
	@property({ attribute: false }) private stateObj!: HassEntity;

	static get properties() {
		return { hass: {}, _config: {} };
	}

	setConfig(config: IConfig) {
		this.config = config;
	}

	configChanged(config: IConfig) {
		const event = new Event('config-changed', {
			bubbles: true,
			composed: true,
		});
		event.detail = { config: config };
		this.dispatchEvent(event);
	}

	render() {
		if (!this.hass) {
			return html``;
		}

		return html`
			<ha-sortable>
				<div class="features">
					${this.config.entries.map((row) => {
						return html`
							<div class="feature">
								<div class="handle">
									<ha-icon .icon="mdi:dots-grid"></ha-icon>
								</div>
								<div class="feature-content">
									<div>
										<span>${row.type}</span>
									</div>
								</div>
								<ha-icon-button
									class="edit-icon"
								></ha-icon-button>
								<ha-icon-button
									class="remove-icon"
								></ha-icon-button>
							</div>
						`;
					})}
				</div>
				<ha-sortable> </ha-sortable
			></ha-sortable>
		`;
	}
}
