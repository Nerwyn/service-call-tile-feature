import { LitElement, html, css } from 'lit';
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

	static get styles() {
		return css`
			.feature {
				display: flex;
				align-items: center;

				.handle {
					cursor: grab;
					padding-right: 8px;
					padding-inline-end: 8px;
					padding-inline-start: initial;
					direction: var(--direction);
				}
			}

			.feature-content {
				height: 60px;
				font-size: 16px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex-grow: 1;
			}

			.edit-icon,
			.remove-icon {
				color: var(--secondary-text-color);
				--mdc-icon-button-size: 36px;
			}
		`;
	}
}
