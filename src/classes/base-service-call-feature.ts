import { HomeAssistant } from 'custom-card-helpers';

import { LitElement, CSSResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap, StyleInfo } from 'lit/directives/style-map.js';

import { IEntry, IConfirmation } from '../models/interfaces';

@customElement('base-service-call-feature')
export class BaseServiceCallFeature extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) entry!: IEntry;
	@property({ attribute: false }) value: string | number = 0;

	constructor() {
		super();
	}

	setValueInStyleFields(text?: string): string | undefined {
		if (text) {
			if (text.includes('VALUE')) {
				if (this.value) {
					text = text.replace(/VALUE/g, this.value.toString());
				} else {
					return '';
				}
			}

			if (text.includes('STATE')) {
				const state = this.hass.states[this.entry.entity_id!].state;
				text = text.replace(/STATE/g, state);
			}

			const pattern = /ATTRIBUTE\[(.*?)\]/g;
			const matches = text.match(pattern);
			if (matches) {
				for (const match of matches) {
					const attribute = match
						.replace('ATTRIBUTE[', '')
						.replace(']', '');
					let value =
						this.hass.states[this.entry.entity_id!].attributes[
							attribute
						];

					switch (attribute) {
						case 'brightness':
							if (value) {
								value = Math.round(
									100 * (parseInt(value ?? 0) / 255),
								).toString();
							} else {
								return '0';
							}
							break;
						case 'rgb_color':
							if (Array.isArray(value) && value.length == 3) {
								value = `rgb(${value[0]}, ${value[1]}, ${value[2]})`;
							} else {
								value = 'var(--primary-text-color)';
							}
							break;
						default:
							if (value == undefined || value == null) {
								return undefined;
							}
							break;
					}

					text = text.replace(`ATTRIBUTE[${attribute}]`, value);
				}
				return text;
			} else {
				return text;
			}
		} else {
			return '';
		}
	}

	callService() {
		if ('confirmation' in this.entry && this.entry.confirmation != false) {
			let text = `Are you sure you want to run action '${this.entry.service}'?`;
			if (this.entry.confirmation == true) {
				if (!confirm(text)) {
					return;
				}
			} else {
				if ('text' in (this.entry.confirmation as IConfirmation)) {
					text = this.setValueInStyleFields(
						(this.entry.confirmation as IConfirmation).text!,
					) as string;
				}
				if (
					'exemptions' in (this.entry.confirmation as IConfirmation)
				) {
					if (
						!(this.entry.confirmation as IConfirmation).exemptions
							.map((e) => e.user)
							.includes(this.hass.user.id)
					) {
						if (!confirm(text)) {
							return;
						}
					}
				} else if (!confirm(text)) {
					return;
				}
			}
		}

		const [domain, service] = this.entry.service.split('.');
		const data = JSON.parse(JSON.stringify(this.entry.data));
		for (const key in data) {
			if (data[key] == 'VALUE') {
				data[key] = this.value;
			} else if (data[key].toString().includes('VALUE')) {
				data[key] = data[key]
					.toString()
					.replace('VALUE', this.value as string);
			}
		}

		this.hass.callService(domain, service, data);
	}

	render() {
		const value_attribute = this.entry.value_attribute;
		if (value_attribute == 'state') {
			this.value = this.hass.states[this.entry.entity_id!].state;
		} else {
			let value =
				this.hass.states[this.entry.entity_id!].attributes[
					value_attribute as string
				];
			if (value_attribute == 'brightness') {
				value = Math.round(100 * (parseInt(value ?? 0) / 255));
			}
			this.value = value;
		}

		let icon = html``;
		if ('icon' in this.entry) {
			const style: StyleInfo = {};
			if (this.entry.icon_color) {
				style.color = this.setValueInStyleFields(this.entry.icon_color);
			}
			icon = html`<ha-icon
				.icon=${this.setValueInStyleFields(this.entry.icon)}
				style="${styleMap(style)}"
			></ha-icon>`;
		}

		let label = html``;
		if ('label' in this.entry) {
			const text = this.setValueInStyleFields(this.entry.label);
			if (text) {
				const style: StyleInfo = {};
				if (this.entry.label_color) {
					style.color = this.setValueInStyleFields(
						this.entry.label_color,
					);
				}
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
					overflow: hidden;
				}

				ha-icon {
					position: relative;
					pointer-events: none;
					display: inline-flex;
					flex-flow: column;
					place-content: center;
					z-index: 2;
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
					z-index: 2;
				}
			`,
		];
	}
}
