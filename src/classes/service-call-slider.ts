import { html, css, CSSResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap, StyleInfo } from 'lit/directives/style-map.js';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-slider')
export class ServiceCallSlider extends BaseServiceCallFeature {
	@property({ attribute: false }) oldValue!: number;
	@property({ attribute: false }) newValue!: number;
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
		this.newValue = end;
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

		this.oldValue = end;
	}

	onEnd(_e: MouseEvent | TouchEvent) {
		const [domain, service] = this.entry.service.split('.');
		const data = JSON.parse(JSON.stringify(this.entry.data));
		for (const key in data) {
			if (data[key].toString().includes('VALUE')) {
				data[key] = data[key]
					.toString()
					.replace('VALUE', this.newValue);
			}
		}
		this.hass.callService(domain, service, data);
	}

	render() {
		const icon_label = super.render();

		const backgroundStyle: StyleInfo = {};
		if (this.entry.background_color) {
			backgroundStyle.background = this.setValueInStyleFields(
				this.entry.background_color,
			);
		}
		if (this.entry.background_opacity) {
			backgroundStyle.opacity = this.entry.background_opacity;
		}
		const background = html`<div
			class="slider-background"
			style=${styleMap(backgroundStyle)}
		></div>`;

		let [min, max] = [0, 100];
		if (this.entry.range) {
			[min, max] = this.entry.range!;
		}
		this.step = (max - min) / 50;
		let sliderClass = 'slider';
		switch (this.entry.thumb) {
			case 'line':
				sliderClass = 'slider-line-thumb';
				break;
			default:
				sliderClass = 'slider';
				break;
		}
		if (!this.value || this.value == 0) {
			sliderClass = 'slider-off';
		}
		const slider = html`
			<input
				type="range"
				class="${sliderClass}"
				min="${min}"
				max="${max}"
				value="${this.value}"
				@input=${this.onInput}
				@mouseup=${this.onEnd}
				@touchend=${this.onEnd}
			/>
		`;

		const style: StyleInfo = {};
		if (this.entry.color) {
			style['--slider-color'] = this.setValueInStyleFields(
				this.entry.color,
			);
		}
		if (this.entry.opacity) {
			style['--slider-opacity'] = this.entry.opacity?.toString();
		}

		return html`<div class="container" style=${styleMap(style)}>
			${background}${slider}${icon_label}
		</div>`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					--slider-opacity: 1;
				}
				.slider-background {
					position: absolute;
					width: inherit;
					height: inherit;
					background: var(--slider-color);
					opacity: 0.2;
				}

				.slider,
				.slider-line-thumb,
				.slider-off {
					position: absolute;
					appearance: none;
					-webkit-appearance: none;
					-moz-appearance: none;
					height: inherit;
					width: calc(100% - 10px);
					border-radius: 10px;
					background: none;
				}

				.slider::-webkit-slider-thumb {
					appearance: none;
					-webkit-appearance: none;
					height: 20px;
					width: 4px;
					border-radius: 12px;
					background: #ffffff;
					cursor: pointer;
					opacity: var(--slider-opacity);
					box-shadow:
						calc(-100vw - 6px) 0 0 100vw var(--slider-color),
						-6px 0 0 10px var(--slider-color);
				}

				.slider::-moz-range-thumb {
					appearance: none;
					-moz-appearance: none;
					height: 20px;
					width: 4px;
					border-radius: 12px;
					background: #ffffff;
					cursor: pointer;
					opacity: var(--slider-opacity);
					box-shadow:
						calc(-100vw - 6px) 0 0 100vw var(--slider-color),
						-6px 0 0 10px var(--slider-color);
				}

				.slider-line-thumb::-webkit-slider-thumb {
					appearance: none;
					-webkit-appearance: none;
					height: 20px;
					width: 4px;
					border-radius: 12px;
					background: #8a8c99;
					cursor: pointer;
					opacity: var(--slider-opacity);
					box-shadow:
						0 8px 0 3px #ffffff,
						0 -8px 0 3px #ffffff;
				}

				.slider-line-thumb::-moz-range-thumb {
					appearance: none;
					-moz-appearance: none;
					height: 20px;
					width: 4px;
					border-radius: 12px;
					background: #ffffff;
					cursor: pointer;
					opacity: var(--slider-opacity);
					box-shadow:
						0 8px 0 3px #ffffff,
						0 -8px 0 3px #ffffff;
				}

				.slider-off::-webkit-slider-thumb {
					visibility: hidden;
				}
				.slider-off::-moz-range-thumb {
					visibility: hidden;
				}
			`,
		];
	}
}
