import { CSSResult, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseServiceCallFeature } from './base-service-call-feature';
import './service-call-button';

@customElement('service-call-selector')
export class ServiceCallSelector extends BaseServiceCallFeature {
	onClick(e: MouseEvent) {
		// Get all selection options
		const options =
			(e.currentTarget as HTMLElement).parentNode?.children ?? [];

		// Set class of all selection options to default
		for (const option of options) {
			if (option.tagName.toLowerCase() == 'service-call-button') {
				option.className = 'option';
			}
		}

		// Set selected option class
		(e.currentTarget as HTMLElement).className = 'selected-option';
	}

	render() {
		this.setValue();

		const selector = [this.buildBackground()];

		const options = this.entry.options ?? [];
		for (const i in options) {
			const optionName = this.renderTemplate(options[i].option as string);
			let optionClass = 'option';
			if (this.value == optionName && this.value != undefined) {
				optionClass = 'selected-option';
			}

			selector.push(
				html`<service-call-button
					class=${optionClass}
					.hass=${this.hass}
					.entry=${options[i]}
					.shouldRenderRipple=${false}
					@click=${this.onClick}
					@contextmenu=${this.onContextMenu}
				/>`,
			);
		}

		return html`${selector}${this.buildStyles()}`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					flex-flow: row;

					--color: var(--tile-color);
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
