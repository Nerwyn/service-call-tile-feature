import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

import { IConfig, IEntry } from './models/interfaces';

export class ServiceCallTileFeatureEditor extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) private config!: IConfig;
	@property({ attribute: false }) private stateObj!: HassEntity;

	static get properties() {
		return { hass: {}, config: {} };
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
		this.requestUpdate();
	}

	entryMoved(e: CustomEvent) {
		e.stopPropagation();
		const { oldIndex, newIndex } = e.detail;
		const entries = this.config.entries.concat();
		entries.splice(newIndex, 0, entries.splice(oldIndex, 1)[0]);
		const config = {
			...this.config,
			entries: entries,
		};
		this.configChanged(config);
	}

	buildListEntry(entry: IEntry) {
		return html`
			<div class="feature">
				<div class="handle">
					<ha-icon .icon="${'mdi:drag'}"></ha-icon>
				</div>
				<div class="feature-content">
					<div>
						<span>${entry.type ?? 'Button'}</span>
					</div>
				</div>
				<ha-icon-button class="edit-icon">
					<ha-icon .icon="${'mdi:pencil'}"></ha-icon>
					></ha-icon-button
				>
				<ha-icon-button class="remove-icon">
					<ha-icon .icon="${'mdi:delete'}"></ha-icon>
					></ha-icon-button
				>
			</div>
		`;
	}

	render() {
		if (!this.hass) {
			return html``;
		}

		return html`
			<div class="content">
				<ha-sortable
					handle-selector=".handle"
					@item-moved=${this.entryMoved}
				>
					<div class="features">
						${this.config.entries.map((entry) =>
							this.buildListEntry(entry),
						)}
					</div>
					<ha-sortable> </ha-sortable
				></ha-sortable>
			</div>
		`;
	}

	static get styles() {
		return css`
			.content {
				padding: 12px;
			}

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
