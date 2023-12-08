import '@material/mwc-ripple';
import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { renderTemplate } from 'ha-nunjucks';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-button')
export class ServiceCallButton extends BaseServiceCallFeature {
	onClick(_e: MouseEvent) {
		this.callService();
	}

	render() {
		const icon_label = super.render();

		const style = structuredClone(this.entry.background_style ?? {});
		for (const key in style) {
			style[key] = renderTemplate(
				this.hass,
				style[key] as string,
			) as string;
		}

		const button = html`<button
			class="button"
			style=${styleMap(style)}
			@click=${this.onClick}
		></button>`;

		return html`${button}${icon_label}<mwc-ripple></mwc-ripple>`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					--opacity: 0.2;
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
						background-color: var(--color, var(--disabled-color));
					}
				}
				.button:active {
					opacity: var(--hover-opacity) !important;
					background-color: var(--color, var(--disabled-color));
				}
			`,
		];
	}
}
