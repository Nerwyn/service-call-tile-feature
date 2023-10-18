import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-slider')
export class ServiceCallSlider extends BaseServiceCallFeature {
	constructor() {
		super();
	}

	onInput(e: InputEvent) {
		e.preventDefault();
		e.stopImmediatePropagation();

		const slider = e.currentTarget as HTMLInputElement;
		const value = parseInt(slider.value ?? '0');

		// TODO - store this somewhere else
		const start = slider.nextElementSibling?.innerHTML ?? '0';
		slider.value = start;

		let i = parseInt(start);
		const t = 1;
		if (i > value) {
			const id = setInterval(() => {
				if (value >= i) {
					clearInterval(id);
				}
				i -= 1;
				slider.value = i.toString();
				console.log(slider.value);
			}, t);
		} else if (i < value) {
			const id = setInterval(() => {
				if (value <= i) {
					clearInterval(id);
				}
				i += 1;
				slider.value = i.toString();
				console.log(slider.value);
			}, t);
		}

		// TODO - store this somewhere else
		slider.nextElementSibling!.innerHTML = value.toString();
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
