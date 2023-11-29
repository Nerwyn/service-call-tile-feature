import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap, StyleInfo } from 'lit/directives/style-map.js';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-button')
export class ServiceCallButton extends BaseServiceCallFeature {
	onClick(_e: MouseEvent) {
		this.callService();
	}

	render() {
		const icon_label = super.render();

		const style: StyleInfo = {};
		if (this.evalEntry.color) {
			style['background-color'] = this.setValueInStyleFields(
				this.evalEntry.color,
			);
		}
		if (this.evalEntry.opacity || this.evalEntry.opacity == 0) {
			style.opacity = this.evalEntry.opacity;
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
					transition:
						background-color 180ms ease-in-out 0s,
						opacity 180ms ease-in-out 0s;
					position: absolute;
					cursor: pointer;
					height: inherit;
					width: inherit;
					border-radius: 10px;
					border: none;
				}
				@media (hover: hover) {
					.button:hover {
						opacity: 0.3 !important;
						background-color: var(
							--selection-color,
							var(--disabled-color)
						);
					}
				}
				.button:active {
					opacity: 0.3 !important;
					background-color: var(
						--selection-color,
						var(--disabled-color)
					);
				}
			`,
		];
	}
}
