import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { BaseServiceCallFeature } from './base-service-call-feature';
import style from '../styles/button.css' assert { type: 'css' };

@customElement('service-call-button')
export class ServiceCallButton extends BaseServiceCallFeature {
	@property({ attribute: false }) shouldRenderRipple = true;

	clickTimer?: ReturnType<typeof setTimeout>;
	clickCount: number = 0;

	holdTimer?: ReturnType<typeof setTimeout>;
	holdInterval?: ReturnType<typeof setInterval>;
	hold: boolean = false;

	onClick(e: TouchEvent | MouseEvent) {
		e.stopImmediatePropagation();
		this.clickCount++;

		if (
			this.entry.double_tap_action &&
			this.renderTemplate(
				this.entry.double_tap_action?.action as string,
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
				const doubleTapWindow: number = this.entry.double_tap_action
					.double_tap_window
					? (this.renderTemplate(
							this.entry.double_tap_action
								.double_tap_window as unknown as string,
					  ) as number)
					: 200;
				if (!this.clickTimer) {
					this.clickTimer = setTimeout(() => {
						this.fireHapticEvent('light');
						this.sendAction('tap_action');
						this.endAction();
					}, doubleTapWindow);
				}
			}
		} else {
			// No double tap action defiend, tap action is triggered
			this.fireHapticEvent('light');
			this.sendAction('tap_action');
			this.endAction();
		}
	}

	onStart(e: TouchEvent | MouseEvent) {
		this.swiping = false;
		if ('targetTouches' in e) {
			this.initialX = e.targetTouches[0].clientX;
			this.initialY = e.targetTouches[0].clientY;
		} else {
			this.initialX = e.clientX;
			this.initialY = e.clientY;
		}

		if (
			this.entry.momentary_start_action &&
			this.renderTemplate(
				this.entry.momentary_start_action?.action ?? 'none',
			) != 'none'
		) {
			this.fireHapticEvent('light');
			this.buttonPressStart = performance.now();
			this.sendAction('momentary_start_action');
		} else if (
			this.entry.momentary_end_action &&
			this.renderTemplate(
				this.entry.momentary_end_action?.action ?? 'none',
			) != 'none'
		) {
			this.fireHapticEvent('light');
			this.buttonPressStart = performance.now();
		} else if (!this.holdTimer && this.entry.hold_action) {
			const holdTime = this.entry.hold_action.hold_time
				? (this.renderTemplate(
						this.entry.hold_action?.hold_time as unknown as string,
				  ) as number)
				: 500;
			const holdAction = this.renderTemplate(
				this.entry.hold_action?.action as string,
			);

			if (holdAction != 'none') {
				this.holdTimer = setTimeout(() => {
					if (!this.swiping) {
						this.hold = true;
						if (holdAction == 'repeat') {
							const repeatDelay = this.entry.hold_action
								?.repeat_delay
								? (this.renderTemplate(
										this.entry.hold_action
											?.repeat_delay as unknown as string,
								  ) as number)
								: 100;
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
				this.entry.momentary_end_action &&
				this.renderTemplate(
					this.entry.momentary_end_action?.action as string,
				) != 'none'
			) {
				this.fireHapticEvent('selection');
				this.buttonPressEnd = performance.now();
				this.sendAction('momentary_end_action');
				this.endAction();
			} else if (
				this.entry.momentary_start_action &&
				this.renderTemplate(
					this.entry.momentary_start_action?.action as string,
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
							this.entry.hold_action?.action as string,
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
		}
	}

	onMouseLeave(_e: MouseEvent) {
		this.endAction();
		this.swiping = true;
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

	render() {
		this.setValue();

		const ripple = this.shouldRenderRipple
			? html`<md-ripple></md-ripple>`
			: html``;

		const button = html`<button
			class=${this.className ?? ''}
			style=${styleMap(
				this.buildStyle(this.entry.background_style ?? {}),
			)}
			@mousedown=${this.onMouseDown}
			@mouseup=${this.onMouseUp}
			@mousemove=${this.onMouseMove}
			@mouseleave=${this.onMouseLeave}
			@touchstart=${this.onTouchStart}
			@touchend=${this.onTouchEnd}
			@touchmove=${this.onTouchMove}
			@contextmenu=${this.onContextMenu}
		>
			${ripple}
		</button>`;

		return html`${button}${this.buildIcon()}${this.buildLabel()}`;
	}

	static styles = [super.styles, style];
}
