import { css, CSSResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import {
	DOUBLE_TAP_WINDOW,
	HOLD_TIME,
	REPEAT_DELAY,
} from '../models/constants';
import { BaseCustomFeature } from './base-custom-feature';

@customElement('custom-feature-button')
export class CustomFeatureButton extends BaseCustomFeature {
	@property() shouldRenderRipple = true;
	@state() renderRipple = true;
	renderRippleOff?: ReturnType<typeof setTimeout>;
	renderRippleOn?: ReturnType<typeof setTimeout>;

	clickTimer?: ReturnType<typeof setTimeout>;
	clickCount: number = 0;

	holdTimer?: ReturnType<typeof setTimeout>;
	holdInterval?: ReturnType<typeof setInterval>;
	hold: boolean = false;

	onClick(e: TouchEvent | MouseEvent) {
		e.stopImmediatePropagation();
		this.clickCount++;

		if (
			this.config.double_tap_action &&
			this.renderTemplate(
				this.config.double_tap_action?.action as string,
			) != 'none'
		) {
			// Double tap action is defined
			if (this.clickCount > 1) {
				// Double tap action is triggered
				this.fireHapticEvent('success');
				this.sendAction('double_tap_action');
				this.endAction();
			} else {
				// Single tap action is triggered if double tap is not within 200ms
				const doubleTapWindow: number = this.config.double_tap_action
					.double_tap_window
					? (this.renderTemplate(
							this.config.double_tap_action
								.double_tap_window as unknown as string,
						) as number)
					: DOUBLE_TAP_WINDOW;
				if (!this.clickTimer) {
					this.clickTimer = setTimeout(() => {
						this.fireHapticEvent('light');
						this.sendAction('tap_action');
						this.endAction();
					}, doubleTapWindow);
				}
			}
		} else {
			// No double tap action defined, tap action is triggered
			this.fireHapticEvent('light');
			this.sendAction('tap_action');
			this.endAction();
		}
	}

	onStart(e: TouchEvent | MouseEvent) {
		clearTimeout(this.renderRippleOff);
		clearTimeout(this.renderRippleOn);
		this.renderRipple = true;
		this.swiping = false;
		if ('targetTouches' in e) {
			this.initialX = e.targetTouches[0].clientX;
			this.initialY = e.targetTouches[0].clientY;
		} else {
			this.initialX = e.clientX;
			this.initialY = e.clientY;
		}

		if (
			this.config.momentary_start_action &&
			this.renderTemplate(
				this.config.momentary_start_action?.action ?? 'none',
			) != 'none'
		) {
			this.fireHapticEvent('light');
			this.buttonPressStart = performance.now();
			this.sendAction('momentary_start_action');
		} else if (
			this.config.momentary_end_action &&
			this.renderTemplate(
				this.config.momentary_end_action?.action ?? 'none',
			) != 'none'
		) {
			this.fireHapticEvent('light');
			this.buttonPressStart = performance.now();
		} else if (!this.holdTimer && this.config.hold_action) {
			const holdTime = this.config.hold_action.hold_time
				? (this.renderTemplate(
						this.config.hold_action?.hold_time as unknown as string,
					) as number)
				: HOLD_TIME;
			const holdAction = this.renderTemplate(
				this.config.hold_action?.action as string,
			);

			if (holdAction != 'none') {
				this.holdTimer = setTimeout(() => {
					if (!this.swiping) {
						this.hold = true;
						if (holdAction == 'repeat') {
							const repeatDelay = this.config.hold_action
								?.repeat_delay
								? (this.renderTemplate(
										this.config.hold_action
											?.repeat_delay as unknown as string,
									) as number)
								: REPEAT_DELAY;
							if (!this.holdInterval) {
								this.holdInterval = setInterval(() => {
									this.fireHapticEvent('selection');
									this.sendAction('tap_action');
								}, repeatDelay);
							}
						} else {
							this.fireHapticEvent('selection');
						}
					}
				}, holdTime);
			}
		}
	}

	onEnd(e: TouchEvent | MouseEvent) {
		if (!this.swiping) {
			if (
				this.config.momentary_end_action &&
				this.renderTemplate(
					this.config.momentary_end_action?.action as string,
				) != 'none'
			) {
				this.fireHapticEvent('selection');
				this.buttonPressEnd = performance.now();
				this.sendAction('momentary_end_action');
				this.endAction();
			} else if (
				this.config.momentary_start_action &&
				this.renderTemplate(
					this.config.momentary_start_action?.action as string,
				) != 'none'
			) {
				this.endAction();
			} else if (this.hold) {
				// Hold action is triggered
				e.stopImmediatePropagation();
				e.preventDefault();
				if (
					!(
						this.renderTemplate(
							this.config.hold_action?.action as string,
						) == 'repeat'
					)
				) {
					this.fireHapticEvent('medium');
					this.sendAction('hold_action');
				}
				this.endAction();
			} else {
				// Hold action is not triggered, fire tap action
				this.onClick(e);
			}
			this.toggleRipple();
		}
	}

	onMove(e: TouchEvent | MouseEvent) {
		let currentX: number;
		let currentY: number;
		if ('targetTouches' in e) {
			currentX = e.targetTouches[0].clientX;
			currentY = e.targetTouches[0].clientY;
		} else {
			currentX = e.clientX;
			currentY = e.clientY;
		}

		const diffX = (this.initialX ?? currentX) - currentX;
		const diffY = (this.initialY ?? currentY) - currentY;

		// Only consider significant enough movement
		const sensitivity = 8;
		if (Math.abs(Math.abs(diffX) - Math.abs(diffY)) > sensitivity) {
			this.endAction();
			this.swiping = true;
			this.toggleRipple();
		}
	}

	onMouseLeave(_e: MouseEvent) {
		this.endAction();
		this.swiping = true;
		this.toggleRipple();
	}

	onTouchCancel(_e: TouchEvent) {
		this.toggleRipple();
	}

	endAction() {
		clearTimeout(this.clickTimer as ReturnType<typeof setTimeout>);
		this.clickTimer = undefined;
		this.clickCount = 0;

		clearTimeout(this.holdTimer as ReturnType<typeof setTimeout>);
		clearInterval(this.holdInterval as ReturnType<typeof setInterval>);
		this.holdTimer = undefined;
		this.holdInterval = undefined;
		this.hold = false;

		super.endAction();
	}

	toggleRipple() {
		clearTimeout(this.renderRippleOff);
		clearTimeout(this.renderRippleOn);
		this.renderRippleOff = setTimeout(
			() => (this.renderRipple = false),
			2000,
		);
		this.renderRippleOn = setTimeout(
			() => (this.renderRipple = true),
			2500,
		);
	}

	render() {
		this.setValue();

		const ripple =
			this.shouldRenderRipple && this.renderRipple
				? html`<md-ripple></md-ripple>`
				: html``;

		const button = html`<button
			class=${`${this.className} background`}
			@mousedown=${this.onMouseDown}
			@mouseup=${this.onMouseUp}
			@mousemove=${this.onMouseMove}
			@mouseleave=${this.onMouseLeave}
			@touchstart=${this.onTouchStart}
			@touchend=${this.onTouchEnd}
			@touchmove=${this.onTouchMove}
			@touchcanecel=${this.onTouchCancel}
			@contextmenu=${this.onContextMenu}
		>
			${ripple}
		</button>`;

		return html`${button}${this.buildIcon()}${this.buildLabel()}${this.buildStyles()}`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					-webkit-tap-highlight-color: transparent;
					-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
					--md-ripple-hover-opacity: var(
						--ha-ripple-hover-opacity,
						0.08
					);
					--md-ripple-pressed-opacity: var(
						--ha-ripple-pressed-opacity,
						0.12
					);
					--ha-ripple-color: var(--secondary-text-color);
					--mdc-ripple-hover-color: var(
						--ha-ripple-hover-color,
						var(--ha-ripple-color, var(--secondary-text-color))
					);
					--md-ripple-pressed-color: var(
						--ha-ripple-pressed-color,
						var(--ha-ripple-color, var(--secondary-text-color))
					);
				}

				button {
					background: 0px 0px !important;
					opacity: 1 !important;
					position: absolute;
					cursor: pointer;
					height: 100%;
					width: 100%;
					border: none;
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
					opacity: var(--opacity, 0.2);
				}

				@media (hover: hover) {
					.option:hover {
						opacity: var(--hover-opacity) !important;
						background: var(
							--color,
							var(--state-inactive-color, var(--disabled-color))
						) !important;
					}
				}
				.option:active {
					opacity: var(--hover-opacity) !important;
					background: var(
						--color,
						var(--state-inactive-color, var(--disabled-color))
					) !important;
				}
			`,
		];
	}
}
