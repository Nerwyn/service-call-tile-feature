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
				const style = (option as HTMLElement).style;
				style.removeProperty('background-color');
				style.removeProperty('opacity');
			}
		}

		const style = (e.currentTarget as HTMLElement).style;
		style.setProperty('background-color', 'var(--selection-color)');
		style.setProperty('opacity', 'var(--selection-opacity)');
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

		const selector = [html`<div class="selector-background"></div>`];

		for (const i in entries) {
			const entry = this.entry.options![i];

			if (!('service' in entry)) {
				entry.service = 'input_select.select_option';
				if (!('option' in entry.data!)) {
					entry.data!.option = options[i];
				}
			}

			const option = entry.option ?? options[i];

			const style: StyleInfo = entry.style ?? {};
			if (this.value == option && this.value != undefined) {
				style.backgroundColor = 'var(--selection-color)';
				style.opacity = 'var(--selection-opacity)';
			}
			if (!('--opacity' in style)) {
				style['--opacity'] = 0;
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
					--selection-opacity: 1;
					--selection-color: var(--tile-color);
				}

				.selector-background {
					position: absolute;
					width: inherit;
					height: inherit;
					background: var(--background);
					opacity: var(--background-opacity);
				}
			`,
		];
	}
}
