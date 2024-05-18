import { html, css, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { IAction } from '../models/interfaces';
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

		const entries = this.entry.options ?? [];
		let options: string[] = [];
		if (this.entityId) {
			options =
				(this.hass.states[this.entityId].attributes
					.options as string[]) ?? new Array<string>(entries.length);
		}
		if (options.length < entries.length) {
			options = Object.assign(new Array(entries.length), options);
		}

		const selector = [this.buildBackground()];

		for (const i in entries) {
			if (
				!('tap_action' in entries[i]) &&
				!('double_tap_action' in entries[i]) &&
				!('hold_action' in entries[i])
			) {
				const [domain, _service] = (this.entityId ?? '').split('.');
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
				if (!('option' in data)) {
					data.option = options[i];
					tap_action.data = data;
				}
				if (!('entity_id' in data)) {
					data.entity_id = this.entityId as string;
					tap_action.data = data;
				}
				entries[i].tap_action = tap_action;
				entries[i].hold_action = tap_action;
			}

			const option =
				this.renderTemplate(entries[i].option as string) ?? options[i];
			let optionClass = 'option';
			if (this.value == option && this.value != undefined) {
				optionClass = 'selected-option';
			}
			const styleContext = {
				config: {
					option: option,
				},
			};

			selector.push(
				html`<service-call-button
					class=${optionClass}
					.hass=${this.hass}
					.entry=${entries[i]}
					._shouldRenderRipple=${false}
					@click=${this.onClick}
					@contextmenu=${this.onContextMenu}
					style=${styleMap(
						this.buildStyle(entries[i].style ?? {}, styleContext),
					)}
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

					--color: var(--tile-color);
					--background: var(--disabled-color);
					--hover-opacity: 0.3;
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
