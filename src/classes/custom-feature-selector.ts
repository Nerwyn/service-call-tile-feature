import { css, CSSResult, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseCustomFeature } from './base-custom-feature';
import './custom-feature-button';

@customElement('custom-feature-selector')
export class CustomFeatureSelector extends BaseCustomFeature {
	onEnd(e: MouseEvent) {
		// Update value
		clearTimeout(this.getValueFromHassTimer);
		this.getValueFromHass = false;
		this.value = (e.currentTarget as HTMLElement).id;

		// Get all selection options
		const options = Array.from(
			(e.currentTarget as HTMLElement).parentNode?.children ?? [],
		).slice(1);

		// Set class of all selection options to default
		for (const option of options) {
			option.className = 'option';
		}

		// Set selected option class
		(e.currentTarget as HTMLElement).className = 'selected-option';
		this.resetGetValueFromHass();
	}

	render() {
		this.setValue();

		const selector = [this.buildBackground()];
		const options = this.entry.options ?? [];
		for (const option of options) {
			option.haptics = option.haptics ?? this.entry.haptics;
			selector.push(
				html`<custom-feature-button
					.hass=${this.hass}
					.entry=${option}
					.shouldRenderRipple=${false}
					id=${this.renderTemplate(option.option as string)}
					@mouseup=${this.onMouseUp}
					@touchend=${this.onTouchEnd}
					@contextmenu=${this.onContextMenu}
				/>`,
			);
		}

		return html`${selector}${this.buildStyles()}`;
	}

	updated() {
		const options = this.entry.options ?? [];
		const optionElements = Array.from(
			this.shadowRoot?.children ?? [],
		).slice(1);
		for (const i in options) {
			const optionName = this.renderTemplate(options[i].option as string);
			let optionClass = 'option';
			if (
				(this.value ?? '').toString() ==
					(optionName ?? '').toString() &&
				this.value != undefined
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
