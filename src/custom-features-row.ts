import packageInfo from '../package.json';

import { LitElement, TemplateResult, html, css } from 'lit';
import { property } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { renderTemplate } from 'ha-nunjucks';

import { IConfig, IEntry } from './models/interfaces';
import { CustomFeaturesRowEditor } from './custom-features-row-editor';
import './classes/custom-feature-button';
import './classes/custom-feature-slider';
import './classes/custom-feature-selector';
import './classes/custom-feature-spinbox';

console.info(
	`%c CUSTOM-FEATURES-FOR-TILES-AND-MORE v${packageInfo.version}`,
	'color: white; font-weight: bold; background: cornflowerblue',
);

class CustomFeaturesRow extends LitElement {
	@property() hass!: HomeAssistant;
	@property() config!: IConfig;
	@property() stateObj!: HassEntity;

	constructor() {
		super();
	}

	static getConfigElement() {
		return document.createElement('custom-features-row-editor');
	}

	static getStubConfig() {
		return {
			type: 'custom:custom-features-row',
			entries: [],
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

		this.config = config;
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
				entry.value_attribute ?? 'state',
				context,
			) as string;

			const entryType = (
				(renderTemplate(this.hass, entry.type as string, context) ??
					'button') as string
			).toLowerCase();
			switch (entryType) {
				case 'slider':
					row.push(
						html`<custom-feature-slider
							.hass=${this.hass}
							.entry=${entry}
						/>`,
					);
					break;
				case 'selector':
					row.push(
						html`<custom-feature-selector
							.hass=${this.hass}
							.entry=${entry}
						/>`,
					);
					break;
				case 'spinbox':
					row.push(
						html`<custom-feature-spinbox
							.hass=${this.hass}
							.entry=${entry}
						/>`,
					);
					break;
				case 'button':
				default:
					row.push(
						html`<custom-feature-button
							.hass=${this.hass}
							.entry=${entry}
						/>`,
					);
					break;
			}
		}

		const styles = this.config.styles
			? html`
					<style>
						${renderTemplate(
							this.hass,
							this.config.styles,
							context,
						)}
					</style>
			  `
			: '';

		return html`<div class="row">${row}${styles}</div>`;
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

if (!window.structuredClone) {
	// eslint-disable-next-line
	// @ts-ignore
	window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

window.customTileFeatures = window.customTileFeatures || [];
customElements.define('service-call', CustomFeaturesRow); // Original name to not break old configs
customElements.define('custom-features-row-editor', CustomFeaturesRowEditor);
window.customTileFeatures.push({
	type: 'service-call',
	name: 'Custom Features Row',
	configurable: true,
});
