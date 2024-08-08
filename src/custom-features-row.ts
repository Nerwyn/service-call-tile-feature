import packageInfo from '../package.json';

import { LitElement, TemplateResult, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { HomeAssistant } from 'custom-card-helpers';
import { renderTemplate } from 'ha-nunjucks';
import { HassEntity } from 'home-assistant-js-websocket';

import './classes/custom-feature-button';
import './classes/custom-feature-selector';
import './classes/custom-feature-slider';
import './classes/custom-feature-spinbox';
import { CustomFeaturesRowEditor } from './custom-features-row-editor';
import { IConfig, IEntry } from './models/interfaces';
import { atLeastHaVersion } from './utils';

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
			type: 'custom:service-call', // Use old type to not break old configs
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
						${(
							renderTemplate(
								this.hass,
								this.config.styles,
								context,
							) as string
						)
							.replace(/!important/g, '')
							.replace(/;/g, ' !important;')}
					</style>
			  `
			: '';

		const version = this.hass.config.version;
		return html`<div
			class="row ${classMap({
				'no-padding': atLeastHaVersion(version, 2024, 8),
			})}"
		>
			${row}${styles}
		</div>`;
	}

	static get styles() {
		return css`
			:host {
				-webkit-tap-highlight-color: transparent;
				-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
				--mdc-icon-size: 20px;
			}
			.row {
				display: flex;
				flex-flow: row;
				justify-content: center;
				align-items: center;
				padding: 0 12px 12px;
				gap: var(--feature-button-spacing, 12px);
				width: auto;
			}
			.row.no-padding {
				padding: 0;
			}
		`;
	}
}

if (!window.structuredClone) {
	window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
if (!window.performance) {
	window.performance = window.Date as unknown as Performance;
}

customElements.define('custom-features-row-editor', CustomFeaturesRowEditor);
customElements.define('service-call', CustomFeaturesRow); // Original name to not break old configs
window.customCardFeatures = window.customCardFeatures || [];
window.customCardFeatures.push({
	type: 'service-call',
	name: 'Custom Features Row',
	configurable: true,
});
