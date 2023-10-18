import { HomeAssistant } from 'custom-card-helpers';

import { LitElement, TemplateResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { IEntry } from '../models/interfaces';

@customElement('service-call-button')
export class ServiceCallButton extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) entry!: IEntry;
	@property({ attribute: false }) itemid!: number;

	constructor() {
		super();
	}

	onClick(e: MouseEvent) {
		e.stopImmediatePropagation();
		const [domain, service] = this.entry.service.split('.');
		const data = this.entry.data || {};

		this.hass.callService(domain, service, data);
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

	render(): TemplateResult {
		const style: Record<string, string | number> = {};
		if (this.entry.color) {
			style['background-color'] = this.entry.color;
		}
		if (this.entry.opacity) {
			style['opacity'] = this.entry.opacity;
		}

		const button = html`<button
			class="button"
			itemid=${this.itemid}
			@click=${this.onClick}
			style=${styleMap(style)}
		></button>`;

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

		return html`${button}${icon}${label} `;
	}
	static get styles() {
		return css`
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
