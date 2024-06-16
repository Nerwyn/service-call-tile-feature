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
import { ServiceCallTileFeatureEditor } from './editor';
import './classes/service-call-button';
import './classes/service-call-slider';
import './classes/service-call-selector';
import './classes/service-call-spinbox';

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
		config.entries = config.entries ?? [];
		if ('buttons' in config) {
			config.entries.push(
				...(config as Record<'buttons', IEntry[]>).buttons,
			);
		}

		for (let entry of config.entries) {
			entry = this.updateDeprecatedEntryFields(entry);
			for (let option of entry.options ?? []) {
				option = this.updateDeprecatedEntryFields(option);
			}
			if (entry.increment) {
				entry.increment = this.updateDeprecatedEntryFields(
					entry.increment,
				);
			}
			if (entry.decrement) {
				entry.decrement = this.updateDeprecatedEntryFields(
					entry.decrement,
				);
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
		const actionTypes = [
			'tap_action',
			'hold_action',
			'double_tap_action',
			'momentary_start_action',
			'momentary_end_action',
		];
		for (const actionType of actionTypes) {
			if (actionType in entry) {
				const action = entry[actionType as keyof IActions] as IAction;

				// Populate action field
				if (!action.action) {
					if (action.service) {
						action.action = 'call-service';
					} else if (action.navigation_path) {
						action.action = 'navigate';
					} else if (action.url_path) {
						action.action = 'url';
					} else if (action.browser_mod) {
						action.action = 'fire-dom-event';
					} else if (action.pipeline_id || action.start_listening) {
						action.action = 'assist';
					} else {
						action.action = 'none';
					}
				}

				// Merge service_data, target, and data fields
				if (
					['data', 'target', 'service_data'].some(
						(key) => key in action,
					)
				) {
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
			}
		}

		// Set entry type to button if not present
		entry.type = (entry.type ?? 'button').toLowerCase() as TileFeatureType;

		// Set value attribute to state as default
		entry.value_attribute = entry.value_attribute ?? 'state';

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
					if (!data.entity_id && !data.device_id && !data.area_id) {
						data.entity_id = entry.entity_id ?? parentEntityId;
						action.data = data;
						entry[actionType as keyof IActions] = action;
					}
				}
			}
		}

		if (!('entity_id' in entry)) {
			let entity_id = entry.tap_action?.data?.entity_id ?? parentEntityId;
			if (Array.isArray(entity_id)) {
				entity_id = entity_id[0];
			}
			entry.entity_id = entity_id as string;
		}

		return entry;
	}

	render() {
		if (!this.config || !this.hass || !this.stateObj) {
			return null;
		}

		// Render template context
		const context = {
			config: {
				...this.config,
				entity: this.stateObj.entity_id,
			},
		};

		// Hide and show checks
		if ('hide' in this.config) {
			if (
				renderTemplate(
					this.hass,
					this.config.hide as unknown as string,
					context,
				)
			) {
				context.config.hide = true;
				this.style.setProperty('display', 'none');
			} else {
				context.config.hide = false;
				this.style.removeProperty('display');
			}
		}
		if ('show' in this.config) {
			if (
				renderTemplate(
					this.hass,
					this.config.show as unknown as string,
					context,
				)
			) {
				context.config.show = true;
				this.style.removeProperty('display');
			} else {
				context.config.show = false;
				this.style.setProperty('display', 'none');
			}
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
					if (option.autofill_entity_id ?? true) {
						option = this.populateMissingEntityId(
							option,
							entry.entity_id as string,
						);
					}
				}

				if (entry.increment) {
					entry.increment = this.populateMissingEntityId(
						entry.increment as IEntry,
						entry.entity_id as string,
					);
				}
				if (entry.decrement) {
					entry.decrement = this.populateMissingEntityId(
						entry.decrement as IEntry,
						entry.entity_id as string,
					);
				}
			}

			const context = {
				config: {
					...entry,
					entity: '',
				},
			};
			context.config.entity = renderTemplate(
				this.hass,
				entry.entity_id ?? '',
				context,
			) as string;
			const style: StyleInfo = {};
			for (const key in entry.style ?? {}) {
				style[key] = renderTemplate(
					this.hass,
					(entry.style ?? {})[key] as string,
					context,
				) as string;
			}

			const entryType = (
				(renderTemplate(this.hass, entry.type as string, context) ??
					'button') as string
			).toLowerCase();
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
				case 'spinbox':
					row.push(
						html`<service-call-spinbox
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
customElements.define('service-call-editor', ServiceCallTileFeatureEditor);

window.customTileFeatures = window.customTileFeatures || [];
window.customTileFeatures.push({
	type: 'service-call',
	name: 'Service Call',
	configurable: true,
});

if (!window.structuredClone) {
	window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
