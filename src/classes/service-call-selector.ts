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

				if (style.getPropertyValue('--invert-icon') == '1') {
					style.setProperty('--invert-icon', '0');
				}
				if (style.getPropertyValue('--invert-label') == '1') {
					style.setProperty('--invert-label', '0');
				}
			}
		}

		const style = (e.currentTarget as HTMLElement).style;
		style.setProperty('background-color', 'var(--selection-color)');
		style.setProperty('opacity', 'var(--selection-opacity)');

		if (style.getPropertyValue('--invert-icon') == '0') {
			style.setProperty('--invert-icon', '1');
		}
		if (style.getPropertyValue('--invert-label') == '0') {
			style.setProperty('--invert-label', '1');
		}
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

		const backgroundStyle: StyleInfo = {};
		if (this.entry.background_color) {
			backgroundStyle.background = this.setValueInStyleFields(
				this.entry.background_color,
			);
		}
		if (
			this.entry.background_opacity ||
			this.entry.background_opacity == 0
		) {
			backgroundStyle.opacity = this.entry.background_opacity;
		}
		const selector = [
			html`<div
				class="selector-background"
				style=${styleMap(backgroundStyle)}
			></div>`,
		];

		const gInvertIcon = this.entry.invert_icon == true;
		const gInvertLabel = this.entry.invert_label == true;
		for (const i in entries) {
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
			const option = entry.option ?? options[i];
			let invertIcon: boolean;
			if ('invert_icon' in entry) {
				invertIcon = entry.invert_icon == true;
			} else {
				invertIcon = gInvertIcon;
			}
			let invertLabel: boolean;
			if ('invert_label' in entry) {
				invertLabel = entry.invert_label == true;
			} else {
				invertLabel = gInvertLabel;
			}

			const style: StyleInfo = {};
			if (this.value == option && this.value != undefined) {
				style.backgroundColor = 'var(--selection-color)';
				style.opacity = 'var(--selection-opacity)';
				if (invertIcon) {
					style['--invert-icon'] = '1';
				}
				if (invertLabel) {
					style['--invert-label'] = '1';
				}
			} else {
				style.backgroundColor = '';
				style.opacity = '';
				if (invertIcon) {
					style['--invert-icon'] = '0';
				}
				if (invertLabel) {
					style['--invert-label'] = '0';
				}
			}
			if ('color' in entry) {
				style['--selection-color'] = entry.color;
			}
			if ('flex_basis' in entry) {
				style['flex-basis'] = entry.flex_basis;
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
