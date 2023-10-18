import { HomeAssistant } from 'custom-card-helpers';

import { LitElement, CSSResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { IEntry } from '../models/interfaces';

@customElement('base-service-call-feature')
export class BaseServiceCallFeature extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) entry!: IEntry;
	@property({ attribute: false }) itemid!: number;

	constructor() {
		super();
	}

	renderIcon(icon: string, color?: string) {
		const style: Record<string, string> = {};
		if (color) {
			style['color'] = color;
		}
		return html`<ha-icon
			.icon=${icon}
			style="${styleMap(style)}"
		></ha-icon>`;
	}

	renderLabel(text: string, color?: string) {
		const style: Record<string, string> = {};
		if (color) {
			style['color'] = color;
		}
		// prettier-ignore
		return html`<div class="label" style="${styleMap(style)}">${text}</div>`;
	}

	render() {
		// Icon
		let icon = html``;
		if ('icon' in this.entry) {
			icon = this.renderIcon(
				this.entry.icon as string,
				this.entry.icon_color,
			);
		}

		// Label
		let label = html``;
		if ('label' in this.entry) {
			label = this.renderLabel(
				this.entry.label as string,
				this.entry.label_color,
			);
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
