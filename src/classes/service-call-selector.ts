import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { renderTemplate } from 'ha-nunjucks';

import { IAction } from '../models/interfaces';
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

		const entity_id = renderTemplate(
			this.hass,
			this.entry.entity_id as string,
		) as string;
		const entries = this.entry.options ?? [];
		let options: string[] = [];
		if (entity_id) {
			options =
				(this.hass.states[entity_id].attributes.options as string[]) ??
				new Array<string>(entries.length);
		}
		if (options.length < entries.length) {
			options = Object.assign(new Array(entries.length), options);
		}

		const background_style = structuredClone(
			this.entry.background_style ?? {},
		);
		for (const key in background_style) {
			background_style[key] = renderTemplate(
				this.hass,
				background_style[key] as string,
			) as string;
		}
		const selector = [
			html`<div
				class="selector-background"
				style=${styleMap(background_style)}
			></div>`,
		];

		for (const i in entries) {
			const entry = this.entry.options![i];

			if (
				!('tap_action' in entry) &&
				!('double_tap_action' in entry) &&
				!('hold_action' in entry)
			) {
				const [domain, _service] = (entity_id ?? '').split('.');
				const tap_action = {} as IAction;
				tap_action.action = 'call-service';
				switch (domain) {
					case 'select':
						tap_action.service = 'select.select_option';
						break;
					case 'input_select':
					default:
						tap_action.service = 'input_select.select_option';
						break;
				}

				const data = tap_action.data ?? {};
				if (!('option' in data!)) {
					data.option = options[i];
					tap_action.data = data;
				}
				if (!('entity_id' in data!)) {
					data.entity_id = entity_id;
					tap_action.data = data;
				}
				entry.tap_action = tap_action;
				entry.hold_action = tap_action;
			}

			const option =
				renderTemplate(this.hass, entry.option as string) ?? options[i];

			let optionClass = 'option';
			if (this.value == option && this.value != undefined) {
				optionClass = 'selected-option';
			}

			const style = structuredClone(entry.style ?? {});
			for (const key in style) {
				style[key] = renderTemplate(
					this.hass,
					style[key] as string,
				) as string;
			}

			selector.push(
				html`<service-call-button
					class=${optionClass}
					.hass=${this.hass}
					.entry=${entry}
					._shouldRenderRipple=${false}
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
					--color: var(--tile-color);
					--hover-opacity: 0.3;
				}

				.selector-background {
					position: absolute;
					width: inherit;
					height: inherit;
					background: var(--background, var(--disabled-color));
					opacity: var(--background-opacity);
				}

				.option {
					--opacity: 0;
				}

				.selected-option {
					--opacity: 1;
					--hover-opacity: 1;
				}
			`,
		];
	}
}
