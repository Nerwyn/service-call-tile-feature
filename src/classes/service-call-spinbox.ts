import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { IEntry } from '../models/interfaces';
import { BaseServiceCallFeature } from './base-service-call-feature';
import './service-call-button';
import style from '../styles/spinbox.css';

@customElement('service-call-spinbox')
export class ServiceCallSpinbox extends BaseServiceCallFeature {
	range: [number, number] = [-32768, 32767];
	step: number = 1;
	debounceTimer?: ReturnType<typeof setTimeout>;
	debounceTime: number = 1000;

	holdTimer?: ReturnType<typeof setTimeout>;
	holdInterval?: ReturnType<typeof setInterval>;

	onStart(e: TouchEvent | MouseEvent) {
		this.swiping = false;
		if ('targetTouches' in e) {
			this.initialX = e.targetTouches[0].clientX;
			this.initialY = e.targetTouches[0].clientY;
		} else {
			this.initialX = e.clientX;
			this.initialY = e.clientY;
		}

		const operator = (e.currentTarget as HTMLElement).id as
			| 'increment'
			| 'decrement';
		if (
			this.renderTemplate(this.entry.hold_action?.action ?? 'none') ==
				'repeat' &&
			!this.holdTimer
		) {
			const holdTime = this.entry.hold_action?.hold_time
				? (this.renderTemplate(
						this.entry[operator]?.hold_action
							?.hold_time as unknown as string,
				  ) as number)
				: 500;
			this.holdTimer = setTimeout(() => {
				clearTimeout(this.debounceTimer);
				clearTimeout(this.getValueFromHassTimer);
				this.getValueFromHass = false;

				if (!this.swiping) {
					const repeatDelay = this.entry.hold_action?.repeat_delay
						? (this.renderTemplate(
								this.entry.hold_action
									?.repeat_delay as unknown as string,
						  ) as number)
						: 100;
					if (!this.holdInterval) {
						this.holdInterval = setInterval(() => {
							this.operateValue(operator);
							this.fireHapticEvent('selection');
						}, repeatDelay);
					}
				}
			}, holdTime);
		}
	}

	onEnd(e: TouchEvent | MouseEvent) {
		clearTimeout(this.debounceTimer);

		if (!this.swiping) {
			clearTimeout(this.getValueFromHassTimer);
			this.getValueFromHass = false;

			const operator = (e.currentTarget as HTMLElement).id as
				| 'increment'
				| 'decrement';
			this.operateValue(operator);

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
			this.getValueFromHass = true;
			this.setValue();
		}
	}

	operateValue(operator: 'increment' | 'decrement') {
		const prevValue = parseFloat((this.value ?? this.range[0]) as string);
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
		this.value = Math.min(Math.max(newValue, this.range[0]), this.range[1]);
	}

	endAction() {
		clearTimeout(this.holdTimer);
		clearTimeout(this.holdInterval);
		this.holdTimer = undefined;
		this.holdInterval = undefined;

		super.endAction();
	}

	buildButton(operator: 'increment' | 'decrement') {
		const actions = this.entry[operator] ?? {};
		if (!actions.icon) {
			actions.icon = operator == 'increment' ? 'mdi:plus' : 'mdi:minus';
		}

		if (
			this.renderTemplate(actions?.tap_action?.action ?? 'none') !=
				'none' ||
			this.renderTemplate(actions?.double_tap_action?.action ?? 'none') !=
				'none' ||
			!['none', 'repeat'].includes(
				this.renderTemplate(
					actions?.hold_action?.action ?? 'none',
				) as string,
			) ||
			this.renderTemplate(
				actions?.momentary_start_action?.action ?? 'none',
			) != 'none' ||
			this.renderTemplate(
				actions?.momentary_end_action?.action ?? 'none',
			) != 'none'
		) {
			const label_style = {
				'font-size': '14px',
				'font-weight': '500',
				opacity: '0.77',
			};
			actions.label_style = {
				...label_style,
				...actions.label_style,
			};

			const context = {
				config: {
					...actions,
					entity: this.renderTemplate(actions.entity_id ?? ''),
					attribute: this.renderTemplate(
						actions.value_attribute ?? '',
					),
					operator: operator,
				},
			};

			return html`
				<service-call-button
					id=${operator}
					.hass=${this.hass}
					.entry=${actions}
					.shouldRenderRipple=${false}
					@contextMenu=${this.onContextMenu}
					style=${styleMap(
						this.buildStyle(actions.style ?? {}, context),
					)}
				/>
			`;
		} else {
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
							actions.background_style ?? actions.style ?? {},
						),
					)}
				>
					${this.buildIcon(actions)}${super.buildLabel(actions)}
				</button>
			`;
		}
	}

	buildLabel(entry: IEntry = this.entry, context?: object) {
		return this.value != undefined
			? super.buildLabel(entry, context)
			: html``;
	}

	render() {
		this.setValue();

		if (this.entry.range) {
			this.range = [
				parseFloat(
					this.renderTemplate(
						this.entry.range[0] as unknown as string,
					) as string,
				),
				parseFloat(
					this.renderTemplate(
						this.entry.range[1] as unknown as string,
					) as string,
				),
			];
		}

		if (this.entry.step) {
			this.step = parseFloat(
				this.renderTemplate(
					this.entry.step as unknown as string,
				) as string,
			);
		}
		const splitStep = this.step.toString().split('.');
		if (splitStep.length > 1) {
			this.precision = splitStep[1].length;
		} else {
			this.precision = 0;
		}

		if (this.entry.debounce_time) {
			this.debounceTime = parseFloat(
				this.renderTemplate(
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

	static get styles() {
		return [super.styles, style];
	}
}
