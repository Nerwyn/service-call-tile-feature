import { html, css, CSSResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-slider')
export class ServiceCallSlider extends BaseServiceCallFeature {
	@property({ attribute: false }) oldValue!: number;

	constructor() {
		super();
	}

	onInput(e: InputEvent) {
		e.preventDefault();
		e.stopImmediatePropagation();

		const slider = e.currentTarget as HTMLInputElement;
		const start = this.oldValue ?? 50;
		const end = parseInt(slider.value ?? start);
		slider.value = start.toString();

		let i = start;
		const t = 1;
		if (start > end) {
			const id = setInterval(() => {
				if (end >= i) {
					clearInterval(id);
				}
				i -= 1;
				slider.value = i.toString();
			}, t);
		} else if (start < end) {
			const id = setInterval(() => {
				if (end <= i) {
					clearInterval(id);
				}
				i += 1;
				slider.value = i.toString();
			}, t);
		}

		slider.nextElementSibling!.innerHTML = end.toString();
		this.oldValue = end;
	}

	onMouseUp(e: MouseEvent) {
		const slider = e.currentTarget as HTMLInputElement;
		const value = parseInt(slider.value ?? '0');

		this.hass.callService('light', 'turn_on', {
			entity_id: this.entry.data!.entity_id,
			brightness_pct: value,
		});
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
				@mouseup=${this.onMouseUp}
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
