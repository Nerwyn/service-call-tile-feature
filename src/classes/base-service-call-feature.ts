import { HomeAssistant } from 'custom-card-helpers';

import { LitElement, CSSResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { IEntry } from '../models/interfaces';

@customElement('base-service-call-feature')
export class BaseServiceCallFeature extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) entry!: IEntry;

	constructor() {
		super();
	}

	setLabelToValue(element: HTMLElement, value: string) {
		if ('label' in this.entry && this.entry.label?.includes('VALUE')) {
			if ('icon' in this.entry) {
				element.nextElementSibling!.nextElementSibling!.innerHTML =
					value;
			} else {
				element.nextElementSibling!.innerHTML = value;
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
			const style = {
				color: this.entry.label_color,
			};
			// prettier-ignore
			label = html`<div class="label" style="${styleMap(style)}">${this.entry.label}</div>`;
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
