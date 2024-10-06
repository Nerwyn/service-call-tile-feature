import { css, CSSResult, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseCustomFeature } from './base-custom-feature';
import './custom-feature-button';

@customElement('custom-feature-selector')
export class CustomFeatureSelector extends BaseCustomFeature {
	onEnd(e: MouseEvent | TouchEvent) {
		clearTimeout(this.getValueFromHassTimer);
		this.getValueFromHass = false;
		this.value = (e.currentTarget as HTMLElement).id;
		this.resetGetValueFromHass();
	}

	render() {
		this.setValue();

		const selector = [this.buildBackground()];
		const options = this.config.options ?? [];
		for (const option of options) {
			option.haptics = option.haptics ?? this.config.haptics;
			selector.push(
				html`<custom-feature-button
					.hass=${this.hass}
					.config=${option}
					.shouldRenderRipple=${false}
					id=${this.renderTemplate(option.option as string)}
					@mousedown=${this.onMouseDown}
					@mouseup=${this.onMouseUp}
					@mousemove=${this.onMouseMove}
					@touchstart=${this.onTouchStart}
					@touchend=${this.onTouchEnd}
					@touchmove=${this.onTouchMove}
					@contextmenu=${this.onContextMenu}
				/>`,
			);
		}

		return html`${selector}${this.buildStyles()}`;
	}

	updated() {
		const options = this.config.options ?? [];
		const optionElements = Array.from(
			this.shadowRoot?.children ?? [],
		).slice(1);
		for (const i in options) {
			const optionName = this.renderTemplate(options[i].option as string);
			let optionClass = 'option';
			if (
				this.value != undefined &&
				(this.value ?? '').toString() == (optionName ?? '').toString()
			) {
				optionClass = 'selected-option';
			}

			optionElements[i].className = optionClass;
		}
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					flex-flow: row;

					--color: var(--feature-color);
					--background: var(--disabled-color);
					--hover-opacity: 0.2;
				}

				.option {
					--opacity: 0;
					--background-opacity: 0;
				}

				.selected-option {
					--opacity: 1;
					--background-opacity: 1;
					--hover-opacity: 1;
				}
			`,
		];
	}
}
