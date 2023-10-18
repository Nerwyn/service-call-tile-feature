import { html, css, CSSResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-slider')
export class ServiceCallSlider extends BaseServiceCallFeature {
	@property({ attribute: false }) oldValue!: number;
	@property({ attribute: false }) inputEnd: boolean = true;

	constructor() {
		super();
	}

	onInput(e: InputEvent) {
		this.inputEnd = false;
		e.preventDefault();
		e.stopImmediatePropagation();

		const slider = e.currentTarget as HTMLInputElement;
		const start = this.oldValue ?? 50;
		const end = parseInt(slider.value ?? start);
		slider.value = start.toString();

		let i = start;
		if (start > end) {
			const id = setInterval(() => {
				i -= 1;
				slider.value = i.toString();
				if (end >= i) {
					clearInterval(id);
					this.inputEnd = true;
				}
			}, 1);
		} else if (start < end) {
			const id = setInterval(() => {
				i += 1;
				slider.value = i.toString();
				if (end <= i) {
					clearInterval(id);
					this.inputEnd = true;
				}
			}, 1);
		}

		slider.nextElementSibling!.innerHTML = end.toString();
		this.oldValue = end;
	}

	onTouchEnd(e: TouchEvent) {
		const slider = e.currentTarget as HTMLInputElement;
		const id = setInterval(() => {
			if (this.inputEnd) {
				clearInterval(id);
				const value = parseInt(slider.value ?? '0');
				this.hass.callService('light', 'turn_on', {
					entity_id: this.entry.data!.entity_id,
					brightness_pct: value,
				});
			}
		}, 1);
	}

	render() {
		const slider = html`
			<div class="slider-background"></div>
			<input
				type="range"
				class="slider"
				min="0"
				max="100"
				@input=${this.onInput}
				@touchend=${this.onTouchEnd}
			/>
			${this.renderLabel('')}
		`;

		return slider;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				.slider-background {
					position: absolute;
					width: inherit;
					height: inherit;
					background: var(--slider-color);
					opacity: 0.2;
				}

				.slider {
					position: absolute;
					appearance: none;
					-webkit-appearance: none;
					-moz-appearance: none;
					height: inherit;
					width: inherit;
					overflow: hidden;
					border-radius: 10px;
					background: none;
				}

				.slider::-webkit-slider-thumb {
					appearance: none;
					-webkit-appearance: none;
					height: 18px;
					width: 4px;
					border-radius: 12px;
					background: #ffffff;
					cursor: pointer;
					box-shadow: calc(-100vw + 6px) 0 0 100vw var(--slider-color);
				}

				.slider::-moz-range-thumb {
					appearance: none;
					-moz-appearance: none;
					height: 18px;
					width: 4px;
					border-radius: 12px;
					background: #ffffff;
					cursor: pointer;
					box-shadow: calc(-100vw + 6px) 0 0 100vw var(--slider-color);
				}
			`,
		];
	}
}
