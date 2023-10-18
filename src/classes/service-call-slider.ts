import { html, css, CSSResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-slider')
export class ServiceCallSlider extends BaseServiceCallFeature {
	@property({ attribute: false }) oldValue!: number;
	@property({ attribute: false }) inputEnd: boolean = true;
	@property({ attribute: false }) step: number = 1;

	constructor() {
		super();
	}

	onInput(e: InputEvent) {
		this.inputEnd = false;
		e.preventDefault();
		e.stopImmediatePropagation();

		const slider = e.currentTarget as HTMLInputElement;
		const start = this.oldValue ?? 0;
		const end = parseInt(slider.value ?? start);
		slider.value = start.toString();

		let i = start;
		if (start > end) {
			const id = setInterval(() => {
				i -= this.step;
				slider.value = i.toString();

				if (end >= i) {
					clearInterval(id);
					slider.value = end.toString();
					this.inputEnd = true;
				}
			}, 1);
		} else if (start < end) {
			const id = setInterval(() => {
				i += this.step;
				slider.value = i.toString();

				if (end <= i) {
					clearInterval(id);
					slider.value = end.toString();
					this.inputEnd = true;
				}
			}, 1);
		}

		this.setLabelToValue(slider, end.toString());
		this.oldValue = end;
	}

	onEnd(e: MouseEvent | TouchEvent) {
		const slider = e.currentTarget as HTMLInputElement;

		const [domain, service] = this.entry.service.split('.');
		const data = JSON.parse(JSON.stringify(this.entry.data));

		const id = setInterval(() => {
			if (this.inputEnd) {
				clearInterval(id);

				const value = slider.value ?? '0';
				for (const key in data) {
					if (data[key].toString().includes('VALUE')) {
						data[key] = data[key]
							.toString()
							.replace('VALUE', value);
					}
				}

				this.hass.callService(domain, service, data);
			}
		}, 1);
	}

	render() {
		let [min, max] = [0, 100];
		if (this.entry.range) {
			[min, max] = this.entry.range!;
		}
		this.step = (max - min) / 50;

		const slider = html`
			<div class="slider-background"></div>
			<input
				type="range"
				class="slider"
				min="${min}"
				max="${max}"
				@input=${this.onInput}
				@mouseup=${this.onEnd}
				@touchend=${this.onEnd}
			/>
			${super.render()}
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
