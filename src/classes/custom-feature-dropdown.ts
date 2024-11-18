import { css, CSSResult, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseCustomFeature } from './base-custom-feature';

@customElement('custom-feature-dropdown')
export class CustomFeatureDropdown extends BaseCustomFeature {
	onStart(e: MouseEvent | TouchEvent) {
		clearTimeout(this.renderRippleOff);
		clearTimeout(this.renderRippleOn);
		this.renderRipple = true;
		this.swiping = false;
		if ('targetTouches' in e) {
			this.initialX = e.targetTouches[0].clientX;
			this.initialY = e.targetTouches[0].clientY;
		} else {
			this.initialX = e.clientX;
			this.initialY = e.clientY;
		}
	}

	onEnd(e: MouseEvent | TouchEvent) {
		if (!this.swiping) {
			clearTimeout(this.getValueFromHassTimer);
			this.getValueFromHass = false;
			this.value = (e.currentTarget as HTMLElement).id;
			this.resetGetValueFromHass();
			this.toggleRipple();
		}
	}

	render() {
		this.setValue();

		const dropdownOptions = [];
		const options = this.config.options ?? [];
		for (const option of options) {
			option.haptics = option.haptics ?? this.config.haptics;
			dropdownOptions.push(
				html`<option value=${this.renderTemplate(option.option ?? '')}>
					${this.renderTemplate(option.label ?? '')}
				</option>`,
			);
		}
		const dropdown = html`<select>
			${this.buildRipple()}${dropdownOptions}
		</select>`;

		const ripple =
			this.shouldRenderRipple && this.renderRipple
				? html`<md-ripple></md-ripple>`
				: html``;

		return html`${dropdown}${this.buildStyles()}`;
	}

	updated() {
		const options = this.config.options ?? [];
		const optionElements = Array.from(
			this.shadowRoot?.querySelector('select')?.children ?? [],
		).splice(1);
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
					-webkit-tap-highlight-color: transparent;
					-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
					--md-ripple-hover-opacity: var(
						--ha-ripple-hover-opacity,
						0.08
					);
					--md-ripple-pressed-opacity: var(
						--ha-ripple-pressed-opacity,
						0.12
					);
					--ha-ripple-color: var(--secondary-text-color);
					--mdc-ripple-hover-color: var(
						--ha-ripple-hover-color,
						var(--ha-ripple-color, var(--secondary-text-color))
					);
					--md-ripple-pressed-color: var(
						--ha-ripple-pressed-color,
						var(--ha-ripple-color, var(--secondary-text-color))
					);
				}

				select {
					background: 0px 0px !important;
					opacity: 1 !important;
					position: absolute;
					cursor: pointer;
					height: 100%;
					width: 100%;
					border: none;
					overflow: hidden;
				}
				select::before {
					content: '';
					position: absolute;
					top: 0px;
					left: 0px;
					height: 100%;
					width: 100%;
					background: var(--color, var(--disabled-color));
					opacity: var(--opacity, 0.2);
				}
			`,
		];
	}
}
