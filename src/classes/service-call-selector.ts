import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap, StyleInfo } from 'lit/directives/style-map.js';

import { BaseServiceCallFeature } from './base-service-call-feature';
import './service-call-button';

@customElement('service-call-selector')
export class ServiceCallSelector extends BaseServiceCallFeature {
	onClick(e: MouseEvent) {
		// Get all selection options
		const options = (e.currentTarget as HTMLElement).parentNode!.children;

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
		super.render();

		const entries = this.entry.options ?? [];
		let options =
			(this.hass.states[this.entry.entity_id!].attributes
				.options as string[]) ?? new Array<string>(entries.length);
		if (options.length < entries.length) {
			options = Object.assign(new Array(entries.length), options);
		}

		const background_style = styleMap(this.entry.background_style ?? {});
		const selector = [
			html`<div
				class="selector-background"
				style=${background_style}
			></div>`,
		];

		for (const i in entries) {
			const entry = this.entry.options![i];

			if (!('service' in entry)) {
				entry.service = 'input_select.select_option';
				if (!('option' in entry.data!)) {
					entry.data!.option = options[i];
				}
			}

			const option = entry.option ?? options[i];

			let optionClass = 'option';
			if (this.value == option && this.value != undefined) {
				optionClass = 'selected-option';
			}

			const style: StyleInfo = entry.style ?? {};
			if (!('--opacity' in style)) {
				style['--opacity'] = 0;
			}

			selector.push(
				html`<service-call-button
					class=${optionClass}
					.hass=${this.hass}
					.entry=${entry}
					@click=${this.onClick}
					style=${styleMap(style)}
				/>`,
			);
		}

		return html`${selector}`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					flex-flow: row;

					--background: var(--disabled-color);
					--background-opacity: 0.2;
					--selection-color: var(--tile-color);
					--selection-opacity: 1;
				}

				.selector-background {
					position: absolute;
					width: inherit;
					height: inherit;
					background: var(--background);
					opacity: var(--background-opacity);
				}

				.option {
					background: none;
					opacity: 0;
				}

				.selected-option {
					background: var(--selection-color);
					opacity: var(--selection-opacity);
				}
			`,
		];
	}
}
