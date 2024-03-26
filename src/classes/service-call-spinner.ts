import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { renderTemplate } from 'ha-nunjucks';

import { BaseServiceCallFeature } from './base-service-call-feature';

@customElement('service-call-spinner')
export class ServiceCallSpinner extends BaseServiceCallFeature {
	step: number = 1;
	debounceTimer?: ReturnType<typeof setTimeout>;
	debounceTime: number = 1000;
	scrolling: boolean = false;

	onStart(_e: TouchEvent | MouseEvent) {
		this.scrolling = false;
	}

	onEnd(e: TouchEvent | MouseEvent) {
		if (!this.scrolling) {
			clearTimeout(this.debounceTimer);
			clearTimeout(this.getValueFromHassTimer);
			this.getValueFromHass = false;

			const prevValue = parseFloat(this.value as string);
			if (
				(e.currentTarget as HTMLElement).className.includes('increment')
			) {
				this.value = prevValue + this.step;
			} else {
				this.value = prevValue - this.step;
			}

			this.debounceTimer = setTimeout(() => {
				this.sendAction('tap_action');
				this.getValueFromHassTimer = setTimeout(() => {
					this.getValueFromHass = true;
				}, 1000);
			}, this.debounceTime);
		}

		this.scrolling = false;
	}

	onMove(_e: TouchEvent | MouseEvent) {
		this.scrolling = true;
	}

	render() {
		this.setValue();

		if (this.entry.step) {
			this.step = parseFloat(
				renderTemplate(
					this.hass,
					this.entry.step as unknown as string,
				) as string,
			);
		}

		if ('debounceTime' in this.entry) {
			this.debounceTime = parseFloat(
				renderTemplate(
					this.hass,
					this.entry.debounceTime as unknown as string,
				) as string,
			);
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
		const background = html`
			<div
				class="spinner-background"
				style=${styleMap(background_style)}
			></div>
		`;

		const decrementButton = html`
			<button
				class="button decrement"
				@mousedown=${this.onMouseDown}
				@mouseup=${this.onMouseUp}
				@mousemove=${this.onMouseMove}
				@touchstart=${this.onTouchStart}
				@touchend=${this.onTouchEnd}
				@touchmove=${this.onTouchMove}
				@contextmenu=${this.onContextMenu}
			>
				${this.buildIcon({ icon: 'mdi:minus' })}
			</button>
		`;

		const incrementButton = html`
			<button
				class="button increment"
				@mousedown=${this.onMouseDown}
				@mouseup=${this.onMouseUp}
				@mousemove=${this.onMouseMove}
				@touchstart=${this.onTouchStart}
				@touchend=${this.onTouchEnd}
				@touchmove=${this.onTouchMove}
				@contextmenu=${this.onContextMenu}
			>
				${this.buildIcon({ icon: 'mdi:plus' })}
			</button>
		`;

		const icon = this.buildIcon();
		const label = this.buildLabel();

		return html`
			${background}${decrementButton}
			<div class="icon-label-container">${icon}${label}</div>
			${incrementButton}
		`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					flex-flow: row;
					place-content: space-between;

					--background: var(--disabled-color);
					--background-opacity: 0.2;
				}

				.spinner-background {
					position: absolute;
					width: inherit;
					height: inherit;
					background: var(--background, var(--disabled-color));
					opacity: var(--background-opacity);
					z-index: 1;
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
					font-size: 14px;
					font-weight: 500;
					opacity: 0.77;
				}

				.button {
					background: none;
					cursor: pointer;
					display: flex;
					flex-flow: column;
					place-content: center space-evenly;
					align-items: center;
					height: inherit;
					width: 35px;
					border: none;
					padding: 0px;
					color: inherit;
					z-index: 2;

					--mdc-icon-size: 16px;
				}
			`,
		];
	}
}
