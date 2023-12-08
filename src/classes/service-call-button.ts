import { html, css, CSSResult } from 'lit';
import { customElement, property, queryAsync } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { Ripple } from '@material/mwc-ripple';
import { RippleHandlers } from '@material/mwc-ripple/ripple-handlers';

import { renderTemplate } from 'ha-nunjucks';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-button')
export class ServiceCallButton extends BaseServiceCallFeature {
	// https://github.com/home-assistant/frontend/blob/80edeebab9e6dfcd13751b5ed8ff005452826118/src/components/ha-control-button.ts#L31-L77
	@property({ attribute: false }) _shouldRenderRipple = true;
	@queryAsync('mwc-ripple') private _ripple!: Promise<Ripple | null>;
	private _rippleHandlers: RippleHandlers = new RippleHandlers(() => {
		return this._ripple;
	});

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

		const ripple = this._shouldRenderRipple
			? html`<mwc-ripple></mwc-ripple>`
			: html``;

		const button = html`<button
			class=${this.className ?? ''}
			style=${styleMap(style)}
			@click=${this.onClick}
			@focus=${this._rippleHandlers.startFocus}
			@blur=${this._rippleHandlers.endFocus}
			@mousedown=${this._rippleHandlers.startPress}
			@mouseup=${this._rippleHandlers.endPress}
			@mouseenter=${this._rippleHandlers.startHover}
			@mouseleave=${this._rippleHandlers.endHover}
			@touchstart=${this._rippleHandlers.startPress}
			@touchend=${this._rippleHandlers.endPress}
			@touchcancel=${this._rippleHandlers.endPress}
		>
			${ripple}
		</button>`;

		return html`${button}${icon_label}`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					--opacity: 0.2;
					--mdc-ripple-color: var(--color, var(--disabled-color));
				}

				button {
					background: 0px 0px;
					position: absolute;
					cursor: pointer;
					height: inherit;
					width: inherit;
					border-radius: 10px;
					border: none;
					z-index: 0;
				}
				button::before {
					content: '';
					position: absolute;
					top: 0px;
					left: 0px;
					height: 100%;
					width: 100%;
					background: var(--color, var(--disabled-color));
					opacity: var(--opacity);
				}

				@media (hover: hover) {
					.option:hover {
						opacity: var(--hover-opacity) !important;
						background-color: var(--color, var(--disabled-color));
					}
				}
				.option:active {
					opacity: var(--hover-opacity) !important;
					background-color: var(--color, var(--disabled-color));
				}
			`,
		];
	}
}
