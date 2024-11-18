import { css, CSSResult, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseCustomFeature } from './base-custom-feature';

@customElement('custom-feature-dropdown')
export class CustomFeatureDropdown extends BaseCustomFeature {
	onEnd(e: MouseEvent | TouchEvent) {
		clearTimeout(this.getValueFromHassTimer);
		this.getValueFromHass = false;
		this.value = (e.currentTarget as HTMLElement).id;
		this.resetGetValueFromHass();
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
			${dropdownOptions}
		</select>`;

		return html`${dropdown}${this.buildStyles()}`;
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
		return [super.styles as CSSResult, css``];
	}
}
