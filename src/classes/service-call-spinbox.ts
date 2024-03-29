import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { renderTemplate } from 'ha-nunjucks';

import { BaseServiceCallFeature } from './base-service-call-feature';
import './service-call-button';

@customElement('service-call-spinbox')
export class ServiceCallSpinbox extends BaseServiceCallFeature {
	range: [number, number] = [-32768, 32767];
	step: number = 1;
	debounceTimer?: ReturnType<typeof setTimeout>;
	debounceTime: number = 1000;

	onStart(e: TouchEvent | MouseEvent) {
		this.swiping = false;
		if ('targetTouches' in e) {
			this.initialX = e.targetTouches[0].clientX;
			this.initialY = e.targetTouches[0].clientY;
		} else {
			this.initialX = e.clientX;
			this.initialY = e.clientY;
		}
	}

	onEnd(e: TouchEvent | MouseEvent) {
		clearTimeout(this.debounceTimer);

		if (!this.swiping) {
			const operator = (e.currentTarget as HTMLElement).id as
				| 'increment'
				| 'decrement';

			clearTimeout(this.getValueFromHassTimer);
			this.getValueFromHass = false;

			const prevValue = parseFloat(this.value as string);
			let newValue = this.value as number;
			switch (operator) {
				case 'increment':
					newValue = prevValue + this.step;
					break;
				case 'decrement':
					newValue = prevValue - this.step;
					break;
				default:
					break;
			}

			this.value = Math.min(
				Math.max(newValue, this.range[0]),
				this.range[1],
			);

			this.debounceTimer = setTimeout(() => {
				this.sendAction('tap_action');
				this.resetGetValueFromHass();
			}, this.debounceTime);
		}
		this.endAction();
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
			clearTimeout(this.debounceTimer);
			this.swiping = true;
		}
	}

	buildButton(operator: 'increment' | 'decrement') {
		if (
			renderTemplate(
				this.hass,
				this.entry[operator]?.tap_action?.action ?? 'none',
			) != 'none' ||
			renderTemplate(
				this.hass,
				this.entry[operator]?.double_tap_action?.action ?? 'none',
			) != 'none' ||
			!['none', 'repeat'].includes(
				renderTemplate(
					this.hass,
					this.entry[operator]?.hold_action?.action ?? 'none',
				) as string,
			) ||
			renderTemplate(
				this.hass,
				this.entry[operator]?.momentary_start_action?.action ?? 'none',
			) != 'none' ||
			renderTemplate(
				this.hass,
				this.entry[operator]?.momentary_end_action?.action ?? 'none',
			) != 'none'
		) {
			return html`
				<service-call-button
					.hass=${this.hass}
					.entry=${this.entry[operator]}
					._shouldRenderRipple=${false}
					@contextMenu=${this.onContextMenu}
					style=${styleMap(
						this.buildStyle(this.entry[operator]?.style ?? {}),
					)}
				/>
			`;
		} else {
			if (!(operator in this.entry)) {
				this.entry[operator] = {};
			}
			if (!('icon' in this.entry[operator]!)) {
				this.entry[operator]!.icon =
					operator == 'increment' ? 'mdi:plus' : 'mdi:minus';
			}

			return html`
				<button
					class="button"
					id="${operator}"
					@mousedown=${this.onMouseDown}
					@mouseup=${this.onMouseUp}
					@mousemove=${this.onMouseMove}
					@touchstart=${this.onTouchStart}
					@touchend=${this.onTouchEnd}
					@touchmove=${this.onTouchMove}
					@contextmenu=${this.onContextMenu}
					style=${styleMap(
						this.buildStyle(
							this.entry[operator]?.background_style ??
								this.entry[operator]?.style ??
								{},
						),
					)}
				>
					${this.buildIcon(this.entry[operator])}
					${this.buildLabel(this.entry[operator])}
				</button>
			`;
		}
	}

	render() {
		this.setValue();

		if (this.entry.range) {
			this.range = [
				parseFloat(
					renderTemplate(
						this.hass,
						this.entry.range[0] as unknown as string,
					) as string,
				),
				parseFloat(
					renderTemplate(
						this.hass,
						this.entry.range[1] as unknown as string,
					) as string,
				),
			];
		}

		if (this.entry.step) {
			this.step = parseFloat(
				renderTemplate(
					this.hass,
					this.entry.step as unknown as string,
				) as string,
			);
		}

		if ('debounce_time' in this.entry) {
			this.debounceTime = parseFloat(
				renderTemplate(
					this.hass,
					this.entry.debounce_time as unknown as string,
				) as string,
			);
		}

		return html`
			${this.buildBackground()}${this.buildButton('decrement')}
			${this.buildIcon()}${this.buildLabel()}
			${this.buildButton('increment')}
		`;
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			super.styles as CSSResult,
			css`
				:host {
					place-content: center;
				}

				.icon-label-container {
					display: flex;
					flex-flow: column;
					align-items: center;
				}

				.icon {
					opacity: 0.77;
				}

				.label {
					width: fit-content;
					font-size: 14px;
					font-weight: 500;
					opacity: 0.77;
				}

				.button {
					position: absolute;
					background: none;
					cursor: pointer;
					display: flex;
					flex-flow: column;
					place-content: center space-evenly;
					align-items: center;
					height: inherit;
					width: initial;
					border: none;
					padding: 10px;
					color: inherit;
					z-index: 2;

					--mdc-icon-size: 16px;
				}

				.button::before {
					display: none;
				}

				#decrement {
					left: 0px;
				}

				#increment {
					right: 0px;
				}
			`,
		];
	}
}
