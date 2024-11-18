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
					<custom-feature-dropdown-option
						.hass=${this.hass}
						.config=${option}
						.stateObj=${this.stateObj}
					/>
				</option>`,
			);
		}
		const dropdown = html`<select
			@mousedown=${this.onMouseDown}
			@mouseup=${this.onMouseUp}
			@mousemove=${this.onMouseMove}
			@touchstart=${this.onTouchStart}
			@touchend=${this.onTouchEnd}
			@touchmove=${this.onTouchMove}
			@contextmenu=${this.onContextMenu}
		>
			${dropdownOptions}
		</select>`;

		return html`${this.buildBackground()}${dropdown}${this.buildRipple()}${this.buildStyles()}`;
	}

	updated() {
		const options = this.config.options ?? [];
		const optionElements = Array.from(
			this.shadowRoot?.querySelector('select')?.children ?? [],
		);
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
					--md-ripple-hover-color: var(
						--ha-ripple-hover-color,
						var(--ha-ripple-color, var(--secondary-text-color))
					);
					--md-ripple-pressed-color: var(
						--ha-ripple-pressed-color,
						var(--ha-ripple-color, var(--secondary-text-color))
					);
				}

				select {
					background: 0 0 !important;
					opacity: 1 !important;
					position: absolute;
					cursor: pointer;
					height: 100%;
					width: 100%;
					border: none;
					overflow: hidden;
				}
			`,
		];
	}
}

@customElement('custom-feature-dropdown-option')
export class CustomFeatureDropdownOption extends BaseCustomFeature {
	render() {
		return html`${this.buildBackground()}${this.buildIcon()}${this.buildLabel()}${this.buildStyles()}`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
				}
			`,
		];
	}
}
