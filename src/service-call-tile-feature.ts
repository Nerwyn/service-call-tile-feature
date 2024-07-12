import packageInfo from '../package.json';

import { LitElement, TemplateResult, html, css } from 'lit';
import { property } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { renderTemplate } from 'ha-nunjucks';

import { ServiceCallTileFeatureEditor } from './service-call-tile-feature-editor';
import { IConfig, IEntry } from './models/interfaces';
import './classes/service-call-button';
import './classes/service-call-slider';
import './classes/service-call-selector';
import './classes/service-call-spinbox';

console.info(
	`%c SERVICE-CALL-TILE-FEATURE v${packageInfo.version}`,
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
						/>`,
					);
					break;
				case 'selector':
					row.push(
						html`<service-call-selector
							.hass=${this.hass}
							.entry=${entry}
						/>`,
					);
					break;
				case 'spinbox':
					row.push(
						html`<service-call-spinbox
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

		const styles = this.config.styles
			? html`
					<style>
						:host {
							${renderTemplate(
							this.hass,
							this.config.styles,
							context,
						)}
						}
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

customElements.define('service-call', ServiceCallTileFeature);
customElements.define('service-call-editor', ServiceCallTileFeatureEditor);

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
