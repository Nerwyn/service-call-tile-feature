import { HomeAssistant } from 'custom-card-helpers';

import { LitElement, CSSResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { IEntry } from '../models/interfaces';

@customElement('base-service-call-feature')
export class BaseServiceCallFeature extends LitElement {
	@property({ attribute: false }) entry!: IEntry;
	@property({ attribute: false }) entity_id!: string;
	@property({ attribute: false }) value: string | number = 0;

	constructor() {
		super();
	}

	set hass(hass: HomeAssistant) {
		if (this.entry.value_attribute) {
			if (this.entry.value_attribute == 'state') {
				this.value = hass.states[this.entity_id].state;
			} else {
				this.value =
					hass.states[this.entity_id].attributes[
						this.entry.value_attribute
					];
			}
		}
	}

	setLabelToValue(element: HTMLElement, value: string) {
		if ('label' in this.entry && this.entry.label?.includes('VALUE')) {
			if ('icon' in this.entry) {
				element.nextElementSibling!.nextElementSibling!.innerHTML =
					this.entry.label.replace('VALUE', value);
			} else {
				element.nextElementSibling!.innerHTML =
					this.entry.label.replace('VALUE', value);
			}
		}
	}

	render() {
		let icon = html``;
		if ('icon' in this.entry) {
			const style = {
				color: this.entry.icon_color,
			};
			icon = html`<ha-icon
				.icon=${this.entry.icon}
				style="${styleMap(style)}"
			></ha-icon>`;
		}

		let label = html``;
		if ('label' in this.entry) {
			let text = this.entry.label!;

			if (text.includes('VALUE')) {
				text = text.replace('VALUE', '');
			}

			if (text.includes('STATE')) {
				const state = this.hass.states[this.entity_id].state;
				text = text.replace('STATE', state);
			}

			const pattern = /ATTRIBUTE\[(.*?)\]/gm;
			let match;
			while ((match = pattern.exec(text)) != null) {
				const attribute =
					this.hass.states[this.entity_id].attributes[match[1]];
				text = text.replace(`ATTRIBUTE[${match[1]}]`, attribute);
			}

			const style = {
				color: this.entry.label_color,
			};
			// prettier-ignore
			label = html`<div class="label" style="${styleMap(style)}">${text}</div>`;
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
