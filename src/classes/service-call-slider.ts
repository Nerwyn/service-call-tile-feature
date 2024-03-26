import { html, css, CSSResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { renderTemplate } from 'ha-nunjucks';

import { IAction } from '../models/interfaces';
import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-slider')
export class ServiceCallSlider extends BaseServiceCallFeature {
	@state() showTooltip: boolean = false;
	@state() sliderOn: boolean = true;
	@state() currentValue = this.value;

	class: string = 'slider';
	oldValue?: number;
	newValue?: number;
	speed: number = 2;
	range: [number, number] = [0, 100];
	step: number = 1;

	precision: number = 0;
	tooltipPosition: number = 0;

	startX?: number;
	startY?: number;
	scrolling: boolean = false;

	onInput(e: InputEvent) {
		const slider = e.currentTarget as HTMLInputElement;

		if (!this.scrolling) {
			this.getValueFromHass = false;
			clearTimeout(this.getValueFromHassTimer);
			this.value = slider.value;
			this.currentValue = slider.value;
			this.setTooltip(slider, true);

			const start = parseFloat(
				(this.oldValue as unknown as string) ?? this.value ?? '0',
			);
			const end = parseFloat(slider.value ?? start);
			slider.value = start.toString();
			this.newValue = end;

			if (end > this.range[0]) {
				this.sliderOn = true;
			}

			let i = start;
			if (start > end) {
				const id = setInterval(() => {
					i -= this.speed;
					slider.value = i.toString();
					this.currentValue = slider.value;

					if (end >= i) {
						clearInterval(id);
						slider.value = end.toString();
						this.currentValue = slider.value;
						if (
							this.value == undefined ||
							(end <= this.range[0] &&
								this.class != 'slider-line-thumb')
						) {
							this.sliderOn = false;
						}
					}
				}, 1);
			} else if (start < end) {
				this.sliderOn = true;
				const id = setInterval(() => {
					i += this.speed;
					slider.value = i.toString();
					this.currentValue = slider.value;

					if (end <= i) {
						clearInterval(id);
						slider.value = end.toString();
						this.currentValue = slider.value;
					}
				}, 1);
			} else {
				slider.value = end.toString();
			}

			this.oldValue = end;
		} else {
			if (this.value == undefined) {
				this.getValueFromHass = true;
			}
			this.setValue();
			slider.value = (this.value ?? 0).toString();
			this.setTooltip(slider, false);
			this.currentValue = slider.value;
		}
	}

	onStart(e: TouchEvent | MouseEvent) {
		const slider = e.currentTarget as HTMLInputElement;

		if (!this.scrolling) {
			this.getValueFromHass = false;
			clearTimeout(this.getValueFromHassTimer);
			this.value = slider.value;
			this.currentValue = slider.value;
			this.setTooltip(slider, true);
		}
	}

	onEnd(e: TouchEvent | MouseEvent) {
		const slider = e.currentTarget as HTMLInputElement;
		this.setTooltip(slider, false);
		this.setValue();

		if (!this.scrolling) {
			if (!this.newValue && this.newValue != 0) {
				this.newValue = Number(this.value);
			}
			if (!this.precision) {
				this.newValue = Math.trunc(this.newValue);
			}
			this.value = this.newValue;
			this.sendAction('tap_action');
		} else {
			if (this.value == undefined) {
				this.getValueFromHass = true;
			}
			this.setValue();
			slider.value = (this.value ?? 0).toString();
			this.currentValue = slider.value;
		}

		this.scrolling = false;
		this.startX = undefined;
		this.startY = undefined;
		this.resetGetValueFromHass();
	}

	onMove(e: TouchEvent | MouseEvent) {
		const slider = e.currentTarget as HTMLInputElement;

		let currentX: number;
		if ('clientX' in e) {
			currentX = e.clientX;
		} else {
			currentX = e.touches[0].clientX;
		}
		let currentY: number;
		if ('clientY' in e) {
			currentY = e.clientY;
		} else {
			currentY = e.touches[0].clientY;
		}

		if (this.startY == undefined) {
			this.startY = currentY;
		}
		if (this.startX == undefined) {
			this.startX = currentX;
		} else if (
			Math.abs(currentX - this.startX) <
			Math.abs(currentY - this.startY) - 20
		) {
			this.scrolling = true;
			this.getValueFromHass = true;
			this.setValue();
			slider.value = (this.value ?? 0).toString();
			this.currentValue = slider.value;
			this.setTooltip(slider, false);
			this.sliderOn = !(
				this.value == undefined || Number(this.value) <= this.range[0]
			);
		}
	}

	setTooltip(slider: HTMLInputElement, show: boolean) {
		if (show) {
			this.tooltipPosition = Math.round(
				(slider.offsetWidth / (this.range[1] - this.range[0])) *
					(Number(this.currentValue) -
						(this.range[0] + this.range[1]) / 2),
			);
		}

		this.showTooltip = show;
	}

	buildLabel() {
		const value = this.getValueFromHass ? this.value : this.currentValue;
		const hide =
			this.value == undefined ||
			(Number(this.value) <= this.range[0] &&
				'class' in this &&
				this.class != 'slider-line-thumb');
		return super.buildLabel(this.entry, value, hide);
	}

	buildBackground() {
		const style = structuredClone(this.entry.background_style ?? {});
		for (const key in style) {
			style[key] = renderTemplate(
				this.hass,
				style[key] as string,
			) as string;
		}
		return html`<div
			class="slider-background"
			style=${styleMap(style)}
		></div>`;
	}

	buildTooltip() {
		const tooltipText = `${Number(this.currentValue).toFixed(
			this.precision,
		)}${this.unitOfMeasurement}`;
		const display = (
			'tooltip' in this.entry
				? renderTemplate(
						this.hass,
						this.entry.tooltip as unknown as string,
				  )
				: true
		)
			? 'initial'
			: 'none';
		// prettier-ignore
		return html`
			<div
				class="tooltip ${this.showTooltip ? 'faded-in' : 'faded-out'}"
				style=${styleMap({
					'--x-position': this.tooltipPosition.toString() + 'px',
					display: display
				})}
			>${tooltipText}</div>
		`;
	}

	buildSlider() {
		const value = this.getValueFromHass ? this.value : this.currentValue;
		switch (renderTemplate(this.hass, this.entry.thumb as string)) {
			case 'line':
				this.class = 'slider-line-thumb';
				break;
			case 'flat':
				this.class = 'slider-flat-thumb';
				break;
			default:
				this.class = 'slider';
				break;
		}
		this.sliderOn = !(
			value == undefined ||
			(Number(value) <= this.range[0] &&
				this.class != 'slider-line-thumb')
		);

		const style = structuredClone(this.entry.slider_style ?? {});
		for (const key in style) {
			style[key] = renderTemplate(
				this.hass,
				style[key] as string,
			) as string;
		}

		return html`
			<input
				type="range"
				class="${this.sliderOn ? this.class : 'slider-off'}"
				style=${styleMap(style)}
				min="${this.range[0]}"
				max="${this.range[1]}"
				step=${this.step}
				value="${value}"
				@input=${this.onInput}
				@mousedown=${this.onMouseDown}
				@mouseup=${this.onMouseUp}
				@mousemove=${this.onMouseMove}
				@touchstart=${this.onTouchStart}
				@touchend=${this.onTouchEnd}
				@touchmove=${this.onTouchMove}
				@contextmenu=${this.onContextMenu}
			/>
		`;
	}

	render() {
		this.setValue();
		if (this.getValueFromHass) {
			this.currentValue = this.value;
		}

		const entityId = renderTemplate(
			this.hass,
			this.entry.entity_id as string,
		) as string;
		const [domain, _service] = (entityId ?? '').split('.');

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
		} else if (['number', 'input_number'].includes(domain)) {
			this.range = [
				this.hass.states[entityId].attributes.min,
				this.hass.states[entityId].attributes.max,
			];
		}

		if (!('tap_action' in this.entry)) {
			const tap_action = {} as IAction;
			tap_action.action = 'call-service';
			switch (domain) {
				case 'number':
					tap_action.service = 'number.set_value';
					break;
				case 'input_number':
				default:
					tap_action.service = 'input_number.set_value';
					break;
			}

			const data = tap_action.data ?? {};
			if (!('value' in data)) {
				data.value = 'VALUE';
				tap_action.data = data;
			}
			if (!('entity_id' in data)) {
				data.entity_id = entityId;
				tap_action.data = data;
			}
			this.entry.tap_action = tap_action;
		}

		this.speed = (this.range[1] - this.range[0]) / 50;

		if (this.entry.step) {
			this.step = parseFloat(
				renderTemplate(
					this.hass,
					this.entry.step as unknown as string,
				) as string,
			);
		} else if (['number', 'input_number'].includes(domain)) {
			this.step = this.hass.states[entityId].attributes.step;
		} else {
			this.step = (this.range[1] - this.range[0]) / 100;
		}
		const splitStep = this.step.toString().split('.');
		if (splitStep.length > 1) {
			this.precision = splitStep[1].length;
		} else {
			this.precision = 0;
		}

		return html`
			${this.buildTooltip()}
			<div class="container">
				${this.buildBackground()}${this.buildSlider()}
				${this.buildIcon()}${this.buildLabel()}
			</div>
		`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					overflow: visible;

					--color: var(--tile-color);
					--background: var(--color, var(--state-inactive-color));
					--background-height: 100%;
					--background-opacity: 0.2;
					--opacity: 1;
				}

				.slider-background {
					position: absolute;
					width: inherit;
					height: var(--background-height);
					background: var(--background);
					opacity: var(--background-opacity);
				}

				.slider,
				.slider-line-thumb,
				.slider-flat-thumb,
				.slider-off {
					position: absolute;
					appearance: none;
					-webkit-appearance: none;
					-moz-appearance: none;
					height: inherit;
					border-radius: 10px;
					background: none;
				}

				.slider,
				.slider-flat-thumb,
				.slider-off {
					width: inherit;
					overflow: hidden;
					touch-action: pan-y;
				}

				.slider-line-thumb {
					width: calc(100% - 5px);
				}

				.slider::-webkit-slider-thumb {
					appearance: none;
					-webkit-appearance: none;
					height: 30px;
					width: 12px;
					border-style: solid;
					border-width: 4px;
					border-radius: 12px;
					border-color: var(--color);
					background: #ffffff;
					cursor: pointer;
					opacity: var(--opacity);
					box-shadow:
						calc(-100vw - 6px) 0 0 100vw var(--color),
						-4px 0 0 6px var(--color);
				}

				.slider::-moz-range-thumb {
					appearance: none;
					-moz-appearance: none;
					height: 22px;
					width: 4px;
					border-style: solid;
					border-width: 4px;
					border-radius: 12px;
					border-color: var(--color);
					background: #ffffff;
					cursor: pointer;
					opacity: var(--opacity);
					box-shadow:
						calc(-100vw - 6px) 0 0 100vw var(--color),
						-4px 0 0 6px var(--color);
				}

				.slider-flat-thumb::-webkit-slider-thumb {
					appearance: none;
					-webkit-appearance: none;
					height: 40px;
					width: 24px;
					background: var(--color);
					cursor: pointer;
					opacity: var(--opacity);
					z-index: 1;
					box-shadow: -100vw 0 0 100vw var(--color);
				}

				.slider-flat-thumb::-moz-range-thumb {
					appearance: none;
					-moz-appearance: none;
					height: 40px;
					width: 24px;
					border-color: var(--color);
					background: var(--color);
					cursor: pointer;
					opacity: var(--opacity);
					z-index: 1;
					box-shadow: -100vw 0 0 100vw var(--color);
					border-radius: 0px;
				}

				.slider-line-thumb::-webkit-slider-thumb {
					appearance: none;
					-webkit-appearance: none;
					height: 28px;
					width: 10px;
					border-style: solid;
					border-color: #ffffff;
					border-width: 3px;
					border-radius: 12px;
					background: #8a8c99;
					cursor: pointer;
					opacity: var(--opacity);
					box-shadow:
						0 7px 0 0 #ffffff,
						0 -7px 0 0 #ffffff;
				}

				.slider-line-thumb::-moz-range-thumb {
					appearance: none;
					-moz-appearance: none;
					height: 24px;
					width: 4px;
					border-style: solid;
					border-color: #ffffff;
					border-width: 3px;
					border-radius: 12px;
					background: #8a8c99;
					cursor: pointer;
					opacity: var(--opacity);
					box-shadow:
						0 7px 0 0 #ffffff,
						0 -7px 0 0 #ffffff;
				}

				.slider-off::-webkit-slider-thumb {
					visibility: hidden;
				}

				.slider-off::-moz-range-thumb {
					visibility: hidden;
				}

				.tooltip {
					z-index: 3;
					background: var(--clear-background-color);
					color: var(--primary-text-color);
					position: absolute;
					border-radius: 0.8em;
					padding: 0.2em 0.4em;
					height: 20px;
					width: fit-content;
					line-height: 20px;
					top: -29px;
					transform: translateX(var(--x-position));

					--x-position: 0px;
				}

				.faded-out {
					opacity: 0;
					transition:
						opacity 180ms ease-in-out 0s,
						left 180ms ease-in-out 0s,
						bottom 180ms ease-in-out 0s;
				}

				.faded-in {
					opacity: 1;
					transition: opacity 540ms ease-in-out 0s;
				}
			`,
		];
	}
}
