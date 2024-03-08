import { html, css, CSSResult } from 'lit';
import { customElement, eventOptions } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { renderTemplate } from 'ha-nunjucks';

import { IAction } from '../models/interfaces';
import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-slider')
export class ServiceCallSlider extends BaseServiceCallFeature {
	oldValue?: number;
	newValue?: number;
	speed: number = 2;
	range: [number, number] = [0, 100];
	class: string = 'slider';
	showTooltip: boolean = false;

	lastX?: number;
	lastY?: number;
	scrolling: boolean = false;

	onInput(e: InputEvent) {
		const slider = e.currentTarget as HTMLInputElement;

		if (!this.scrolling) {
			this.setTooltip(slider);
			this.getValueFromHass = false;

			const start = parseFloat(
				(this.oldValue as unknown as string) ?? this.value ?? '0',
			);
			const end = parseFloat(slider.value ?? start);
			slider.value = start.toString();
			this.newValue = end;

			if (end > this.range[0]) {
				slider.className = this.class;
			}

			let i = start;
			if (start > end) {
				const id = setInterval(() => {
					i -= this.speed;
					slider.value = i.toString();
					this.setLabel(slider);

					if (end >= i) {
						clearInterval(id);
						slider.value = end.toString();
						this.setLabel(slider);
						if (
							this.value == undefined ||
							(end <= this.range[0] &&
								this.class != 'slider-line-thumb')
						) {
							slider.className = 'slider-off';
						}
					}
				}, 1);
			} else if (start < end) {
				slider.className = this.class;
				const id = setInterval(() => {
					i += this.speed;
					slider.value = i.toString();
					this.setLabel(slider);

					if (end <= i) {
						clearInterval(id);
						slider.value = end.toString();
						this.setLabel(slider);
					}
				}, 1);
			} else {
				slider.value = end.toString();
			}

			this.oldValue = end;
		} else {
			this.setValue();
			slider.value = this.value.toString();
			this.setLabel(slider);
		}
	}

	onStart(e: TouchEvent | MouseEvent) {
		if (!this.scrolling) {
			const slider = e.currentTarget as HTMLInputElement;
			this.showTooltip = true;
			this.setTooltip(slider);
		} else {
			console.log('Scrolling detected (onStart)');
			this.scrolling = false;
			this.lastX = undefined;
			this.lastY = undefined;
		}
	}

	onEnd(e: TouchEvent | MouseEvent) {
		if (!this.scrolling) {
			const slider = e.currentTarget as HTMLInputElement;
			this.showTooltip = false;
			this.setTooltip(slider);

			if (!this.newValue && this.newValue != 0) {
				this.newValue = this.value as number;
			}
			if (this.newValue % 1 == 0) {
				this.newValue = Math.trunc(this.newValue);
			}
			this.value = this.newValue;
			this.sendAction('tap_action');
		} else {
			this.setValue();
			const slider = e.currentTarget as HTMLInputElement;
			slider.value = this.value.toString();
			this.setLabel(slider);
		}

		this.lastX = undefined;
		this.lastY = undefined;
		this.scrolling = false;
		setTimeout(() => (this.getValueFromHass = true), 1000);
	}

	@eventOptions({ passive: true })
	onMove(e: TouchEvent | MouseEvent) {
		this.getValueFromHass = false;

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

		if (this.lastY == undefined) {
			this.lastY = currentY;
		}
		if (this.lastX == undefined) {
			this.lastX = currentX;
		} else if (
			Math.abs(currentX - this.lastX) <
			Math.abs(currentY - this.lastY) - 20
		) {
			this.scrolling = true;
			this.getValueFromHass = true;
			this.setValue();
			const slider = e.currentTarget as HTMLInputElement;
			slider.value = this.value.toString();
			this.setLabel(slider);
			this.showTooltip = false;
			this.setTooltip(slider);
		}
	}

	setLabel(slider: HTMLInputElement) {
		if (this.renderedLabel && this.renderedLabel.includes('VALUE')) {
			this.value = slider.value;

			const unitOfMeasurement =
				(renderTemplate(
					this.hass,
					this.entry.unit_of_measurement as string,
				) as string) ?? '';
			const text = structuredClone(this.renderedLabel).replace(
				/VALUE/g,
				`${(this.value ?? '').toString()}${unitOfMeasurement}`,
			);

			const labels =
				slider.parentElement?.getElementsByClassName('label');

			if (labels) {
				const label = labels[0];

				// Cannot set textContent directly or lit will shriek in console and crash window
				const children = label.childNodes;
				for (const child of children) {
					if (child.nodeName == '#text') {
						child.nodeValue = text;
					}
				}

				if (
					this.value == undefined ||
					(Number(this.value) <= this.range[0] &&
						this.class != 'slider-line-thumb')
				) {
					(label as HTMLElement).style.display = 'none';
					slider.className = 'slider-off';
				} else {
					(label as HTMLElement).style.display = 'inherit';
					slider.className = this.class;
				}
			}
		}
	}

	setTooltip(slider: HTMLInputElement) {
		const tooltip = slider.parentElement
			?.previousElementSibling as HTMLElement;
		if (tooltip) {
			this.value = slider.value;

			const unitOfMeasurement =
				(renderTemplate(
					this.hass,
					this.entry.unit_of_measurement as string,
				) as string) ?? '';

			const children = tooltip.childNodes;
			for (const child of children) {
				if (child.nodeName == '#text') {
					child.nodeValue = `${this.value.toString()}${unitOfMeasurement}`;
				}
			}

			if (this.showTooltip) {
				tooltip.className = 'tooltip faded-in';
			} else {
				tooltip.className = 'tooltip faded-out';
			}
		}
	}

	render() {
		this.setValue();

		if (this.oldValue == undefined) {
			this.oldValue = parseFloat(this.value as string);
		}
		if (this.newValue == undefined) {
			this.newValue = parseFloat(this.value as string);
		}

		const entity_id = renderTemplate(
			this.hass,
			this.entry.entity_id as string,
		) as string;
		const [domain, _service] = (entity_id ?? '').split('.');

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
				this.hass.states[entity_id].attributes.min,
				this.hass.states[entity_id].attributes.max,
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
				data.entity_id = entity_id;
				tap_action.data = data;
			}
			this.entry.tap_action = tap_action;
		}

		this.speed = (this.range[1] - this.range[0]) / 50;

		let step: number;
		if (this.entry.step) {
			step = this.entry.step;
		} else if (['number', 'input_number'].includes(domain)) {
			step = this.hass.states[entity_id].attributes.step;
		} else {
			step = (this.range[1] - this.range[0]) / 100;
		}

		const background_style = structuredClone(
			this.entry.background_style ?? {},
		);
		for (const key in background_style) {
			background_style[key] = renderTemplate(
				this.hass,
				background_style[key] as string,
			) as string;
		}
		const background = html`<div
			class="slider-background"
			style=${styleMap(background_style)}
		></div>`;

		this.class = 'slider';
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
		let _class = this.class;
		if (
			this.value == undefined ||
			(this.value == this.range[0] && this.class != 'slider-line-thumb')
		) {
			_class = 'slider-off';
		}
		const slider_style = structuredClone(this.entry.slider_style ?? {});
		for (const key in slider_style) {
			slider_style[key] = renderTemplate(
				this.hass,
				slider_style[key] as string,
			) as string;
		}

		const slider = html`
			<input
				type="range"
				class="${_class}"
				style=${styleMap(slider_style)}
				min="${this.range[0]}"
				max="${this.range[1]}"
				step=${step}
				value="${this.value}"
				@input=${this.onInput}
				@touchstart=${this.onStart}
				@touchend=${this.onEnd}
				@touchmove=${this.onMove}
				@mousedown=${this.onStart}
				@mouseup=${this.onEnd}
				@mousemove=${this.onMove}
			/>
		`;

		const icon_label = super.render();
		return html`<div class="tooltip faded-out">${this.value}</div>
			<div class="container">${background}${slider}${icon_label}</div>`;
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
					height: 15px;
					width: fit-content;
					line-height: 15px;
					top: -24px;
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
