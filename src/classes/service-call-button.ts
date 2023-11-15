import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap, StyleInfo } from 'lit/directives/style-map.js';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-button')
export class ServiceCallButton extends BaseServiceCallFeature {
	onClick(e: MouseEvent) {
		e.stopImmediatePropagation();

		this.callService();
	}

	render() {
		const icon_label = super.render();

		const style: StyleInfo = {};
		if (this.entry.color) {
			style['background-color'] = this.setValueInStyleFields(
				this.entry.color,
			);
		}
		if (this.entry.opacity || this.entry.opacity == 0) {
			style.opacity = this.entry.opacity;
		}

		const button = html`<button
			class="button"
			@click=${this.onClick}
			style=${styleMap(style)}
		></button>`;

		return html`${button}${icon_label}`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
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
			`,
		];
	}
}
