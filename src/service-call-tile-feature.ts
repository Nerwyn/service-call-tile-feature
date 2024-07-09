import { version } from '../package.json';

import { LitElement, TemplateResult, html } from 'lit';
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
	ActionTypes,
	IData,
} from './models/interfaces';
import { ServiceCallTileFeatureEditor } from './service-call-tile-feature-editor';
import './classes/service-call-button';
import './classes/service-call-slider';
import './classes/service-call-selector';
import './classes/service-call-spinbox';
import style from './styles/main.css' assert { type: 'css' };

console.info(
	`%c SERVICE-CALL-TILE-FEATURE v${version}`,
	'color: white; font-weight: bold; background: cornflowerblue',
);

class ServiceCallTileFeature extends LitElement {
	@property() hass!: HomeAssistant;
	@property() config!: IConfig;
	@property() stateObj!: HassEntity;

	constructor() {
		super();
	}

	static getConfigElement() {
		return document.createElement('service-call-editor');
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
		for (const actionType of ActionTypes) {
			if (actionType in entry) {
				const action = entry[actionType as keyof IActions] as IAction;
				if (action) {
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
						} else if (
							action.pipeline_id ||
							action.start_listening
						) {
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

		// Outer element style
		if (this.config.style) {
			for (const key in this.config.style) {
				const value = renderTemplate(
					this.hass,
					this.config.style[key] as string,
					context,
				) as string;
				this.style.setProperty(key, value);
			}
		}

		// Deprecated hide and show checks
		if ('hide' in this.config) {
			if (
				renderTemplate(
					this.hass,
					this.config.hide as unknown as string,
					context,
				)
			) {
				this.style.setProperty('display', 'none');
			} else {
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
				this.style.removeProperty('display');
			} else {
				this.style.setProperty('display', 'none');
			}
		}

		const row: TemplateResult[] = [];
		for (const entry of this.config.entries) {
			const context = {
				config: {
					...entry,
					entity: '',
					attribute: '',
				},
			};
			context.config.entity = renderTemplate(
				this.hass,
				entry.entity_id ?? '',
				context,
			) as string;
			context.config.attribute = renderTemplate(
				this.hass,
				entry.value_attribute ?? '',
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

	static styles = [style];
}

customElements.define('service-call-editor', ServiceCallTileFeatureEditor);
customElements.define('service-call', ServiceCallTileFeature);

window.customTileFeatures = window.customTileFeatures || [];
window.customTileFeatures.push({
	type: 'service-call',
	name: 'Service Call',
	configurable: true,
});

if (!window.structuredClone) {
	// eslint-disable-next-line
	// @ts-ignore
	window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
