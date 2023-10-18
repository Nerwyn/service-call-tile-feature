import { version } from '../package.json';

import { LitElement, TemplateResult, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

import { IConfig, IEntry } from './models/interfaces';
import './classes/service-call-button';

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

		// Legacy config updates
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
			if (!('type' in entry)) {
				(entry as IEntry).type = 'button';
			}
		}

		this.config = config;
	}

	renderIcon(icon: string, color?: string) {
		let style = ``;
		if (color) {
			style = `color: ${color};`;
		}
		return html`<ha-icon .icon=${icon} style="${style}"></ha-icon>`;
	}

	renderLabel(text: string, color?: string) {
		let style = ``;
		if (color) {
			style = `color: ${color};`;
		}
		return html`<div class="label" style="${style}">${text}</div>`;
	}

	onSlide(e: InputEvent) {
		e.preventDefault();
		e.stopImmediatePropagation();

		const slider = e.currentTarget as HTMLInputElement;
		let value = parseInt(slider.value) ?? 0;

		if (value < 0) {
			value = 0;
		} else if (value > 100) {
			value = 100;
		}

		// TODO - store this somewhere else
		const start = slider.parentElement!.children[2].innerHTML;
		slider.value = start;

		let i = parseInt(start);
		const t = 1;
		if (i > value) {
			const id = setInterval(() => {
				if (value >= i) {
					clearInterval(id);
				}
				i -= 1;
				slider.value = i.toString();
			}, t);
		} else if (i < value) {
			const id = setInterval(() => {
				if (value <= i) {
					clearInterval(id);
				}
				i += 1;
				slider.value = i.toString();
			}, t);
		}

		// TODO - store this somewhere else
		(
			e.currentTarget as HTMLInputElement
		).parentElement!.children[2].innerHTML = value.toString();
	}

	renderSlider(itemid: number, _entry: IEntry) {
		const slider = html`
			<div class="slider-background"></div>
			<input
				type="range"
				class="slider"
				min="0"
				max="100"
				itemid=${itemid}
				@input=${this.onSlide}
			/>
			${this.renderLabel('50')}
		`;

		return slider;
	}

	render() {
		if (!this.config || !this.hass || !this.stateObj) {
			return null;
		}

		const entries: TemplateResult[] = [];
		for (const [itemid, entry] of this.config.entries.entries()) {
			let renderedEntry: TemplateResult;

			// Set entity ID to tile card entity ID if no other ID is present
			if (
				!('entity_id' in entry.data!) &&
				!('device_id' in entry.data!) &&
				!('area_id' in entry.data!)
			) {
				entry.data!['entity_id'] = this.stateObj.entity_id;
			}

			const entryType = entry.type;
			switch (entryType.toLowerCase()) {
				case 'slider':
					renderedEntry = this.renderSlider(itemid, entry);
					entries.push(
						html`<div class="container">${renderedEntry}</div>`,
					);
					break;
				case 'button':
				default:
					renderedEntry = html` <service-call-button
						.hass=${this.hass}
						.entry=${entry}
						.itemid=${itemid}
					/>`;
					entries.push(renderedEntry);
					break;
			}
		}

		return html`<div class="row">${entries}</div>`;
	}

	static get styles() {
		return css`
			.row {
				display: flex;
				flex-direction: row;
				flex-flow: row;
				justify-content: center;
				align-items: center;
				padding: 0 12px 12px;
				gap: 12px;
				width: auto;
			}
			.container {
				display: flex;
				flex-flow: column;
				place-content: center space-evenly;
				align-items: center;
				position: relative;
				height: 40px;
				width: 100%;
				border-radius: 10px;
				border: none;
				padding: 0px;
				box-sizing: border-box;
				line-height: 0;
				outline: 0px;
				overflow: hidden;
				font-size: inherit;
				color: inherit;
			}
			.button {
				background-color: var(--disabled-color);
				opacity: 0.2;
				transition: background-color 180ms ease-in-out;
				position: absolute;
				cursor: pointer;
				height: inherit;
				width: inherit;
				border-radius: 10px;
				border: none;
			}
			@media (hover: hover) {
				.button:hover {
					opacity: 0.3;
				}
			}
			.button:active {
				opacity: 0.3;
			}

			.slider-background {
				position: absolute;
				width: inherit;
				height: inherit;
				background: var(--slider-color);
				opacity: 0.2;
			}

			.slider {
				position: absolute;
				appearance: none;
				-webkit-appearance: none;
				-moz-appearance: none;
				height: inherit;
				width: inherit;
				overflow: hidden;
				border-radius: 10px;
				background: none;
			}

			.slider::-webkit-slider-thumb {
				appearance: none;
				-webkit-appearance: none;
				height: 18px;
				width: 4px;
				border-radius: 12px;
				background: #ffffff;
				cursor: pointer;
				box-shadow: calc(-100vw + 6px) 0 0 100vw var(--slider-color);
			}

			.slider::-moz-range-thumb {
				appearance: none;
				-moz-appearance: none;
				height: 18px;
				width: 4px;
				border-radius: 12px;
				background: #ffffff;
				cursor: pointer;
				box-shadow: calc(-100vw + 6px) 0 0 100vw var(--slider-color);
			}

			ha-icon {
				position: relative;
				pointer-events: none;
				display: inline-flex;
				flex-flow: column;
				place-content: center;
			}

			.label {
				position: relative;
				pointer-events: none;
				display: inline-flex;
				justify-content: center;
				align-items: center;
				height: 15px;
				width: inherit;
				font-family: inherit;
				font-size: 12px;
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
