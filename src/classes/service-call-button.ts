import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-button')
export class ServiceCallButton extends BaseServiceCallFeature {
	onClick(_e: MouseEvent) {
		this.callService();
	}

	render() {
		const icon_label = super.render();

		const button = html`<button
			class="button"
			@click=${this.onClick}
		></button>`;

		const style = styleMap(this.evalEntry.style ?? {});
		return html`<div class="container" style=${style}>
			${button}${icon_label}
		</div>`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				.container {
					--opacity: 0.2;
					--selection-color: unset;
					--selection-opacity: 0.3;
				}

				.button {
					background: var(--color, var(--disabled-color));
					opacity: var(--opacity);
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
						opacity: var(--selection-opacity) !important;
						background-color: var(
							--selection-color,
							var(--disabled-color)
						);
					}
				}
				.button:active {
					opacity: var(--selection-opacity) !important;
					background-color: var(
						--selection-color,
						var(--disabled-color)
					);
				}
			`,
		];
	}
}
