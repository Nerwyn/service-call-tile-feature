import { version } from '../package.json';

import { LitElement, TemplateResult, html, css } from 'lit';
import { property } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

import { IConfig, IEntry, TileFeatureType } from './models/interfaces';
import './classes/service-call-button';
import './classes/service-call-slider';

console.info(
	`%c SERVICE-CALL-TILE-FEATURE v${version}`,
	'color: white; font-weight: bold; background: cornflowerblue',
);

class ServiceCallTileFeature extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) private config!: IConfig;
	@property({ attribute: false }) private stateObj!: HassEntity;

	constructor() {
		super();
	}

	static getStubConfig() {
		return {
			type: 'custom:service-call',
			entries: [
				{
					type: 'button',
					service: '',
				},
			],
		};
	}

	setConfig(config: IConfig) {
		if (!config) {
			throw new Error('Invalid configuration');
		}
		config = JSON.parse(JSON.stringify(config));

		// Rename buttons to entries
		if ('buttons' in config && !('entries' in config)) {
			(config as IConfig).entries = (
				config as Record<'buttons', IEntry[]>
			).buttons as IEntry[];
		}

		for (const entry of config.entries) {
			// Merge target and data fields
			entry.data = {
				...(entry.data || {}),
				...(entry.target || {}),
			};

			// Set entry type to button if not present
			entry.type = (
				entry.type ?? 'button'
			).toLowerCase() as TileFeatureType;

			// Set value attribute to state as default
			entry.value_attribute = (
				entry.value_attribute ?? 'state'
			).toLowerCase();
		}

		this.config = config;
	}

	render() {
		if (!this.config || !this.hass || !this.stateObj) {
			return null;
		}

		const row: TemplateResult[] = [];
		for (const entry of this.config.entries) {
			// Set entity ID to tile card entity ID if no other ID is present
			if (
				!('entity_id' in entry.data!) &&
				!('device_id' in entry.data!) &&
				!('area_id' in entry.data!)
			) {
				entry.data!['entity_id'] = this.stateObj.entity_id;
			}

			const entryType = (entry.type ?? 'button').toLowerCase();
			switch (entryType) {
				case 'slider':
					row.push(
						html`<service-call-slider
							.hass=${this.hass}
							.entry=${entry}
						/>`,
					);
					break;
				case 'button':
				default:
					row.push(
						html`<service-call-button
							.hass=${this.hass}
							.entry=${entry}
						/>`,
					);
					break;
			}
		}

		return html`<div class="row">${row}</div>`;
	}

	static get styles() {
		return css`
			.row {
				display: flex;
				flex-flow: row;
				justify-content: center;
				align-items: center;
				padding: 0 12px 12px;
				gap: 12px;
				width: auto;
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
