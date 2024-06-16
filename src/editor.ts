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
									<ha-svg-icon
										.path=${'M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z'}
									></ha-svg-icon>
								</div>
								<div class="feature-content">
									<div>
										<span>${row.type}</span>
									</div>
								</div>
								<ha-icon-button
									class="edit-icon"
									.path=${'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z'}
								></ha-icon-button>
								<ha-icon-button
									class="remove-icon"
									.path=${'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z'}
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
				pointer-events: none;

				.handle {
					cursor: grab;
					padding-right: 8px;
					padding-inline-end: 8px;
					padding-inline-start: initial;
					direction: var(--direction);
					pointer-events: all;
				}
			}

			.feature-content {
				height: 60px;
				font-size: 16px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex-grow: 1;
				text-transform: capitalize;
			}

			.edit-icon,
			.remove-icon {
				color: var(--secondary-text-color);
				pointer-events: all;
				--mdc-icon-button-size: 36px;
			}
		`;
	}
}
