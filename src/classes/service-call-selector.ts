import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap, StyleInfo } from 'lit/directives/style-map.js';

import { BaseServiceCallFeature } from './base-service-call-feature';
import './service-call-button';

@customElement('service-call-selector')
export class ServiceCallSelector extends BaseServiceCallFeature {
	onClick(e: MouseEvent) {
		const options = (e.currentTarget as HTMLElement).parentElement!
			.children;
		for (const option of options) {
			if (option.tagName.toLowerCase() == 'service-call-button') {
				(option as HTMLElement).style.backgroundColor = '';
				(option as HTMLElement).style.opacity = '';
			}
		}

		(e.currentTarget as HTMLElement).style.backgroundColor =
			'var(--selection-color)';
		(e.currentTarget as HTMLElement).style.opacity =
			'var(--selection-opacity)';
	}

	render() {
		const entity = this.hass.states[this.entry.entity_id!];
		const options = entity.attributes.options as string[];
		const currentOption = entity.state;

		const selector = [html`<div class="selector-background"></div>`];
		for (const i in options) {
			const entry = this.entry.options![i];
			if (!('service' in entry)) {
				entry.service = 'input_select.select_option';
				if (!('option' in entry.data!)) {
					entry.data!.option = options[i];
				}
			}

			if (!('opacity' in entry)) {
				entry.opacity = 0;
			}
			const style: StyleInfo = {};
			if (currentOption == options[i]) {
				style.backgroundColor = 'var(--selection-color)';
				style.opacity = 'var(--selection-opacity)';
			}

			selector.push(
				html`<service-call-button
					.hass=${this.hass}
					.entry=${entry}
					@click=${this.onClick}
					style=${styleMap(style)}
				/>`,
			);
		}
		const style: StyleInfo = {};
		if (this.entry.color) {
			style['--selection-color'] = this.entry.color;
		}
		if (this.entry.opacity || this.entry.opacity == 0) {
			style['--selection-opacity'] = this.entry.opacity;
		}

		return html`<div class="container" style=${styleMap(style)}>
			${selector}
		</div>`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					flex-flow: row;
					--selection-opacity: 1;
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
