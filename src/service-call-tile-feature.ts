import { version } from '../package.json';

import { LitElement, TemplateResult, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { StyleInfo, styleMap } from 'lit/directives/style-map.js';

import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { renderTemplate } from 'ha-nunjucks';

import {
	IConfig,
	IEntry,
	TileFeatureType,
	IActions,
	IAction,
	IData,
} from './models/interfaces';
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
		config = structuredClone(config);

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

	updateDeprecatedEntryFields(entry: IEntry) {
		// Copy action fields to tap_action
		const actionKeys = [
			'service',
			'service_data',
			'data',
			'target',
			'navigation_path',
			'navigation_replace',
			'url_path',
			'confirmation',
			'pipeline_id',
			'start_listening',
		];
		const tapAction = entry.tap_action ?? ({} as IAction);
		let updateTapAction = false;
		for (const actionKey of actionKeys) {
			if (actionKey in entry) {
				updateTapAction = true;
				(tapAction as unknown as Record<string, string>)[actionKey] =
					entry[actionKey as keyof IEntry] as string;
			}
		}
		if (updateTapAction) {
			entry.tap_action = tapAction as IAction;
		}

		// For each type of action
		const actionTypes = ['tap_action', 'hold_action', 'double_tap_action'];
		for (const actionType of actionTypes) {
			if (actionType in entry) {
				const action = entry[actionType as keyof IActions] as IAction;
				if ('service' in action) {
					// Merge service_data, target, and data fields
					action.data = {
						...action.data,
						...(
							action as unknown as Record<
								string,
								IData | undefined
							>
						).service_data,
						...action.target,
					};
				}

				// Populate action field
				if (!('action' in action)) {
					if ('service' in action) {
						(action as IAction).action = 'call-service';
					} else if ('navigation_path' in action) {
						(action as IAction).action = 'navigate';
					} else if ('url_path' in action) {
						(action as IAction).action = 'url';
					} else if (
						'pipeline_id' in action ||
						'start_listening' in action
					) {
						(action as IAction).action = 'assist';
					} else {
						(action as IAction).action = 'none';
					}
				}
			}
		}

		// Set entry type to button if not present
		entry.type = (entry.type ?? 'button').toLowerCase() as TileFeatureType;

		// Set value attribute to state as default
		entry.value_attribute = (
			entry.value_attribute ?? 'state'
		).toLowerCase();

		// Move style fields to style object
		const deprecatedStyleFields: Record<string, string> = {
			color: '--color',
			opacity: '--opacity',
			icon_color: '--icon-color',
			label_color: '--label-color',
			background_color: '--background',
			background_opacity: '--background-opacity',
			flex_basis: 'flex-basis',
		};
		const style = entry.style ?? {};
		for (const field in deprecatedStyleFields) {
			if (field in entry) {
				style[deprecatedStyleFields[field]] = entry[
					field as keyof IEntry
				] as string;
			}
		}
		entry.style = style;

		return entry;
	}

	populateMissingEntityId(entry: IEntry, parentEntityId: string) {
		const actionTypes = ['tap_action', 'hold_action', 'double_tap_action'];
		for (const actionType of actionTypes) {
			if (actionType in entry) {
				const action =
					entry[actionType as keyof IActions] ?? ({} as IAction);
				if (['call-service', 'more-info'].includes(action.action)) {
					const data = action.data ?? ({} as IData);
					if (
						!('entity_id' in data) &&
						!('device_id' in data) &&
						!('area_id' in data)
					) {
						data.entity_id = entry.entity_id ?? parentEntityId;
						action.data = data;
						entry[actionType as keyof IActions] = action;
					}
				}
			}
		}

		if (!('entity_id' in entry)) {
			entry.entity_id = (entry.tap_action?.data?.entity_id ??
				parentEntityId) as string;
		}

		return entry;
	}

	populateDefaultSliderActions(entry: IEntry) {
		const entity_id = renderTemplate(
			this.hass,
			entry.entity_id as string,
		) as string;
		const [domain, _service] = (entity_id ?? '').split('.');

		if (!('tap_action' in entry)) {
			const tap_action = {} as IAction;
			tap_action.action = 'call-service';
			switch (domain) {
				case 'number':
					tap_action.service = 'number.set_value';
					break;
				case 'input_number':
				default:
					tap_action.service = 'input_number.set_value';
					break;
			}

			const data = tap_action.data ?? {};
			if (!('value' in data)) {
				data.value = 'VALUE';
				tap_action.data = data;
			}
			entry.tap_action = tap_action;
		}
		return entry;
	}

	populateDefaultSelectorActions(entry: IEntry) {
		const entity_id = renderTemplate(
			this.hass,
			entry.entity_id as string,
		) as string;
		const entries = entry.options ?? [];
		let options: string[] = [];
		if (entity_id) {
			options =
				(this.hass.states[entity_id].attributes.options as string[]) ??
				new Array<string>(entries.length);
		}
		if (options.length < entries.length) {
			options = Object.assign(new Array(entries.length), options);
		}

		for (const i in entries) {
			const option = entry.options![i];

			if (
				!('tap_action' in option) &&
				!('double_tap_action' in option) &&
				!('hold_action' in option)
			) {
				const [domain, _service] = (entity_id ?? '').split('.');
				const tap_action = {} as IAction;
				tap_action.action = 'call-service';
				switch (domain) {
					case 'select':
						tap_action.service = 'select.select_option';
						break;
					case 'input_select':
					default:
						tap_action.service = 'input_select.select_option';
						break;
				}

				const data = tap_action.data ?? {};
				if (!('option' in data!)) {
					data.option = options[i];
					tap_action.data = data;
				}
				option.tap_action = tap_action;
				option.hold_action = tap_action;
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

			const style: StyleInfo = {};
			for (const key in entry.style ?? {}) {
				style[key] = renderTemplate(
					this.hass,
					entry.style![key] as string,
				) as string;
			}

			const entryType = (
				(renderTemplate(this.hass, entry.type as string) ??
					'button') as string
			).toLowerCase();
			switch (entryType) {
				case 'slider':
					entry = this.populateDefaultSliderActions(entry);
					row.push(
						html`<service-call-slider
							.hass=${this.hass}
							.entry=${entry}
							style=${styleMap(style)}
						/>`,
					);
					break;
				case 'selector':
					entry = this.populateDefaultSelectorActions(entry);
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

		// Hide and show checks
		if ('hide' in this.config) {
			if (
				renderTemplate(this.hass, this.config.hide as unknown as string)
			) {
				this.style.setProperty('display', 'none');
			} else {
				this.style.removeProperty('display');
			}
		}
		if ('show' in this.config) {
			if (
				renderTemplate(this.hass, this.config.show as unknown as string)
			) {
				this.style.removeProperty('display');
			} else {
				this.style.setProperty('display', 'none');
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
