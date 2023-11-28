import { version } from '../package.json';

import { LitElement, TemplateResult, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { StyleInfo, styleMap } from 'lit/directives/style-map.js';

import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

import { IConfig, IEntry, TileFeatureType } from './models/interfaces';
import './classes/service-call-button';
import './classes/service-call-slider';
import './classes/service-call-selector';

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

		for (let entry of config.entries) {
			entry = this.updateDeprecatedEntryFields(entry);
			for (let option of entry.options ?? []) {
				option = this.updateDeprecatedEntryFields(option);
			}
		}

		this.config = config;
	}

	setTemplates(entry: IEntry | string): IEntry | string {
		if (typeof entry == 'object' && entry != null) {
			for (const key in entry) {
				(entry as Record<string, string>)[key] = this.setTemplates(
					(entry as Record<string, string>)[key],
				) as string;
			}
			return entry;
		}

		if (
			typeof entry == 'string' &&
			(entry.includes('{{') || entry.includes('{%'))
		) {
			// Define template functions
			const hass = this.hass;

			/* eslint-disable */
			function states(entity_id: string) {
				return hass.states[entity_id].state;
			}

			function is_state(entity_id: string, value: string) {
				return states(entity_id) == value;
			}

			function state_attr(entity_id: string, attribute: string) {
				return hass.states[entity_id].attributes[attribute];
			}

			function is_state_attr(
				entity_id: string,
				attribute: string,
				value: string,
			) {
				return state_attr(entity_id, attribute) == value;
			}

			function has_value(entity_id: string) {
				try {
					const state = states(entity_id);
					if ([false, 0, -0, ''].includes(state)) {
						return true;
					} else {
						return Boolean(state);
					}
				} catch {
					return false;
				}
			}
			/* eslint-enable */

			const templates = (entry as string).match(/{{.*?}}/g);
			if (templates) {
				for (const template of templates) {
					const code = template.replace(/{{|}}/g, '').trim();
					let executed: string;
					try {
						executed = eval(code);
					} catch {
						executed = '';
					}
					entry = (entry as string).replace(template, executed);
				}
			}
		}

		return entry;
	}

	render() {
		if (!this.config || !this.hass || !this.stateObj) {
			return null;
		}

		const row: TemplateResult[] = [];
		for (let entry of this.config.entries) {
			// Set entity ID to tile card entity ID if no other ID is present
			if (entry.autofill_entity_id ?? true) {
				entry = this.populateMissingEntityId(
					entry,
					this.stateObj.entity_id,
				);

				for (let option of entry.options ?? []) {
					option = this.populateMissingEntityId(
						option,
						entry.entity_id!,
					);
				}
			}

			entry = this.setTemplates(entry) as IEntry;

			const style: StyleInfo = {};
			if ('flex_basis' in entry) {
				style['flex-basis'] = entry.flex_basis;
			}

			const entryType = (entry.type ?? 'button').toLowerCase();
			switch (entryType) {
				case 'slider':
					row.push(
						html`<service-call-slider
							.hass=${this.hass}
							.entry=${entry}
							style=${styleMap(style)}
						/>`,
					);
					break;
				case 'selector':
					row.push(
						html`<service-call-selector
							.hass=${this.hass}
							.entry=${entry}
							style=${styleMap(style)}
						/>`,
					);
					break;
				case 'button':
				default:
					row.push(
						html`<service-call-button
							.hass=${this.hass}
							.entry=${entry}
							style=${styleMap(style)}
						/>`,
					);
					break;
			}
		}

		return html`<div class="row">${row}</div>`;
	}

	updateDeprecatedEntryFields(entry: IEntry) {
		// Merge target and data fields
		entry.data = {
			...(entry.data || {}),
			...(entry.target || {}),
		};

		// Set entry type to button if not present
		entry.type = (entry.type ?? 'button').toLowerCase() as TileFeatureType;

		// Set value attribute to state as default
		entry.value_attribute = (
			entry.value_attribute ?? 'state'
		).toLowerCase();
		return entry;
	}

	populateMissingEntityId(entry: IEntry, parentEntityId: string) {
		if (
			!('entity_id' in entry.data!) &&
			!('device_id' in entry.data!) &&
			!('area_id' in entry.data!)
		) {
			entry.data!.entity_id = entry.entity_id ?? parentEntityId;
		}
		if (!('entity_id' in entry)) {
			entry.entity_id = (entry.data?.entity_id ??
				parentEntityId) as string;
		}
		return entry;
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
