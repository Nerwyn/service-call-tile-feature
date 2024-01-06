import { html, css, CSSResult, TemplateResult } from 'lit';
import {
	customElement,
	eventOptions,
	property,
	queryAsync,
} from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { Ripple } from '@material/mwc-ripple';
import { RippleHandlers } from '@material/mwc-ripple/ripple-handlers';

import { renderTemplate } from 'ha-nunjucks';

import { ActionType } from '../models/interfaces';
import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-button')
export class ServiceCallButton extends BaseServiceCallFeature {
	// https://github.com/home-assistant/frontend/blob/80edeebab9e6dfcd13751b5ed8ff005452826118/src/components/ha-control-button.ts#L31-L77
	@property({ attribute: false }) _shouldRenderRipple = true;
	@queryAsync('mwc-ripple') private _ripple!: Promise<Ripple | null>;
	private _rippleHandlers: RippleHandlers = new RippleHandlers(() => {
		return this._ripple;
	});

	clickTimer?: ReturnType<typeof setTimeout>;
	clickCount: number = 0;

	holdTimer?: ReturnType<typeof setTimeout>;
	holdInterval?: ReturnType<typeof setInterval>;
	hold: boolean = false;

	scrolling: boolean = false;

	clickAction(actionType: ActionType) {
		clearTimeout(this.clickTimer as ReturnType<typeof setTimeout>);
		this.clickTimer = undefined;
		this.clickCount = 0;

		this.sendAction(actionType);
	}

	onClick(e: TouchEvent | MouseEvent) {
		e.stopImmediatePropagation();
		this.clickCount++;

		if (
			'double_tap_action' in this.entry &&
			this.entry.double_tap_action!.action != 'none'
		) {
			// Double tap action is defined
			if (this.clickCount > 1) {
				// Double tap action is triggered
				this.clickAction('double_tap_action');
			} else {
				// Single tap action is triggered if double tap is not within 200ms
				this.clickTimer = setTimeout(() => {
					this.clickAction('tap_action');
				}, 200);
			}
		} else {
			// No double tap action defiend, tap action is triggered
			this.clickAction('tap_action');
		}
	}

	@eventOptions({ passive: true })
	onHoldStart(e: TouchEvent | MouseEvent) {
		this._rippleHandlers.startPress(e as unknown as Event);
		this.scrolling = false;

		if (
			'hold_action' in this.entry &&
			this.entry.hold_action!.action != 'none'
		) {
			this.holdTimer = setTimeout(() => {
				this.hold = true;
			}, 500);
		}
	}

	onHoldEnd(e: TouchEvent | MouseEvent) {
		this._rippleHandlers.endPress();

		clearTimeout(this.holdTimer as ReturnType<typeof setTimeout>);
		clearInterval(this.holdInterval as ReturnType<typeof setInterval>);

		if (!this.scrolling) {
			if (this.hold) {
				// Hold action is triggered
				this.hold = false;
				e.stopImmediatePropagation();
				e.preventDefault();
				this.clickAction('hold_action');
			} else {
				// Hold action is not triggered, fire tap action
				this.onClick(e);
			}
		}

		this.holdTimer = undefined;
		this.holdInterval = undefined;
		this.scrolling = false;
	}

	onHoldMove(_e: TouchEvent | MouseEvent) {
		this.scrolling = true;
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

		let button: TemplateResult<1>;
		if (this.touchscreen) {
			button = html`<button
				class=${this.className ?? ''}
				style=${styleMap(style)}
				@touchstart=${this.onHoldStart}
				@touchend=${this.onHoldEnd}
				@touchmove=${this.onHoldMove}
				@touchcancel=${this._rippleHandlers.endPress}
				@mouseenter=${this._rippleHandlers.startHover}
				@mouseleave=${this._rippleHandlers.endHover}
				@focus=${this._rippleHandlers.startFocus}
				@blur=${this._rippleHandlers.endFocus}
			>
				${ripple}
			</button>`;
		} else {
			button = html`<button
				class=${this.className ?? ''}
				style=${styleMap(style)}
				@mousedown=${this.onHoldStart}
				@mouseup=${this.onHoldEnd}
				@mousemove=${this.onHoldMove}
				@touchcancel=${this._rippleHandlers.endPress}
				@mouseenter=${this._rippleHandlers.startHover}
				@mouseleave=${this._rippleHandlers.endHover}
				@focus=${this._rippleHandlers.startFocus}
				@blur=${this._rippleHandlers.endFocus}
			>
				${ripple}
			</button>`;
		}

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
					overflow: hidden;
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
