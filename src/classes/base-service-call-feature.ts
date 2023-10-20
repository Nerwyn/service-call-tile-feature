import { HomeAssistant } from 'custom-card-helpers';

import { LitElement, CSSResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { IEntry } from '../models/interfaces';

@customElement('base-service-call-feature')
export class BaseServiceCallFeature extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) entry!: IEntry;
	@property({ attribute: false }) entity_id!: string;
	@property({ attribute: false }) value: string | number = 0;

	constructor() {
		super();
	}

	setValueInStyleFields(text?: string): string {
		if (text) {
			if (text.includes('VALUE')) {
				if (this.value) {
					text = text.replace('VALUE', this.value.toString());
				} else {
					return '';
				}
			}

			if (text.includes('STATE')) {
				const state = this.hass.states[this.entity_id].state;
				text = text.replace('STATE', state);
			}

			const pattern = /ATTRIBUTE\[(.*?)\]/gm;
			let match;
			while ((match = pattern.exec(text)) != null) {
				const attribute = match[1];
				let value =
					this.hass.states[this.entity_id].attributes[attribute];

				switch (attribute) {
					case 'brightness':
						if (value) {
							value = Math.round(
								100 * (parseInt(value) / 255),
							).toString();
						} else {
							return '0';
						}
						break;
					case 'color':
					case 'rgb_color':
						if (Array.isArray(value) && value.length == 3) {
							value = `rgb(${value[0]}, ${value[1]}, ${value[2]})`;
						} else {
							value = 'var(--primary-text-color)';
						}
						break;
					default:
						if (value == undefined || value == null) {
							return '';
						}
						break;
				}

				text = text.replace(`ATTRIBUTE[${match[1]}]`, value);
			}
			return text;
		} else {
			return '';
		}
	}

	render() {
		if (Array.isArray(this.entry.data!.entity_id)) {
			this.entity_id = this.entry.data!.entity_id[0];
		} else {
			this.entity_id = (this.entry.data!.entity_id as string) ?? '';
		}
		const value_attribute = this.entry.value_attribute;
		if (value_attribute == 'state') {
			this.value = this.hass.states[this.entity_id].state;
		} else {
			let value =
				this.hass.states[this.entity_id].attributes[
					value_attribute as string
				];
			if (value_attribute == 'brightness') {
				value = Math.round(100 * (parseInt(value) / 255));
			}
			this.value = value;
		}

		let icon = html``;
		if ('icon' in this.entry) {
			const style = {
				color: this.setValueInStyleFields(this.entry.icon_color),
			};
			icon = html`<ha-icon
				.icon=${this.setValueInStyleFields(this.entry.icon)}
				style="${styleMap(style)}"
			></ha-icon>`;
		}

		let label = html``;
		if ('label' in this.entry) {
			const text = this.setValueInStyleFields(this.entry.label);
			if (text) {
				const style = {
					color: this.setValueInStyleFields(this.entry.label_color),
				};
				// prettier-ignore
				label = html`<div class="label" style="${styleMap(style)}">${text}</div>`;
			}
		}

		return html`${icon}${label}`;
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			css`
				:host {
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

				.container {
					all: inherit;
					height: 100%;
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
			`,
		];
	}
}
