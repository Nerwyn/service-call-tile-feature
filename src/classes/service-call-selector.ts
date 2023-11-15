import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseServiceCallFeature } from './base-service-call-feature';
import './service-call-button';

@customElement('service-call-selector')
export class ServiceCallSelector extends BaseServiceCallFeature {
	onClick(e: MouseEvent) {
		const options = (e.currentTarget as HTMLElement).parentElement!
			.children;
		for (const option of options) {
			(option as HTMLElement).style.backgroundColor = '';
		}

		(e.currentTarget as HTMLElement).style.backgroundColor =
			'var(--selection-color)';
	}

	render() {
		const selector = [html`<div class="selector-background"></div>`];
		const options = this.hass.states[this.entry.entity_id!].attributes
			.options as string[];

		for (const i in options) {
			const entry = {
				service: 'input_select.select_option',
				data: {
					entity_id: this.entry.entity_id,
					option: options[i],
				},
				...this.entry.options![i],
			};

			selector.push(
				html`<service-call-button
					.hass=${this.hass}
					.entry=${entry}
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
					--selection-color: var(--tile-color);
				}

				.selector-background {
					position: absolute;
					width: inherit;
					height: inherit;
					background: var(--disabled-color);
					opacity: 0.2;
				}
			`,
		];
	}
}
