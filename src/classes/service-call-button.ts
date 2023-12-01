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

		const style = styleMap(this.entry.background_style ?? {});

		const button = html`<button
			class="button"
			style=${style}
			@click=${this.onClick}
		></button>`;

		return html`${button}${icon_label}`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					--opacity: 0.2;
					--selection-color: unset;
					--hover-opacity: 0.3;
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
						opacity: var(--hover-opacity) !important;
						background-color: var(
							--selection-color,
							var(--color, var(--disabled-color))
						);
					}
				}
				.button:active {
					opacity: var(--hover-opacity) !important;
					background-color: var(
						--selection-color,
						var(--color, var(--disabled-color))
					);
				}
			`,
		];
	}
}
