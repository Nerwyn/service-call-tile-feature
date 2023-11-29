import { HomeAssistant } from 'custom-card-helpers';

import { renderString } from 'nunjucks';

import { LitElement, CSSResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap, StyleInfo } from 'lit/directives/style-map.js';

import { IEntry, IConfirmation } from '../models/interfaces';

@customElement('base-service-call-feature')
export class BaseServiceCallFeature extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) entry!: IEntry;
	evalEntry!: IEntry;
	value: string | number = 0;

	renderTemplate(entry: IEntry | string): IEntry | string {
		// Recursion!
		if (typeof entry == 'object' && entry != null) {
			for (const key in entry) {
				(entry as Record<string, string>)[key] = this.renderTemplate(
					(entry as Record<string, string>)[key],
				) as string;
			}
			return entry;
		}

		// Define Home Assistant templating functions for nunjucks context
		const hass = this.hass;

		function states(entity_id: string) {
			return hass.states[entity_id].state;
		}

		function is_state(entity_id: string, value: string) {
			return states(entity_id) == value;
		}

		function state_attr(entity_id: string, attribute: string) {
			return hass.states[entity_id].attributes[attribute];
		}

		function is_state_attr(
			entity_id: string,
			attribute: string,
			value: string,
		) {
			return state_attr(entity_id, attribute) == value;
		}

		function has_value(entity_id: string) {
			try {
				const state = states(entity_id);
				if ([false, 0, -0, ''].includes(state)) {
					return true;
				} else {
					return Boolean(state);
				}
			} catch {
				return false;
			}
		}

		const context = {
			True: true,
			False: false,
			None: null,
			eval,
			states,
			is_state,
			state_attr,
			is_state_attr,
			has_value,
		};

		if (
			typeof entry == 'string' &&
			(entry.includes('{{') || entry.includes('{%'))
		) {
			entry = renderString(entry, context).trim();
		}

		if (entry == undefined || entry == null) {
			entry = '';
		}

		return entry;
	}

	callService() {
		if (
			'confirmation' in this.evalEntry &&
			this.evalEntry.confirmation != false
		) {
			let text: string;
			if ('text' in (this.evalEntry.confirmation as IConfirmation)) {
				text = (this.evalEntry.confirmation as IConfirmation).text!;
			} else {
				text = `Are you sure you want to run action '${this.evalEntry.service}'?`;
			}
			if (this.evalEntry.confirmation == true) {
				if (!confirm(text)) {
					return;
				}
			} else {
				if (
					'exemptions' in
					(this.evalEntry.confirmation as IConfirmation)
				) {
					if (
						!(this.evalEntry.confirmation as IConfirmation)
							.exemptions!.map((e) => e.user)
							.includes(this.hass.user.id)
					) {
						if (!confirm(text)) {
							return;
						}
					}
				} else if (!confirm(text)) {
					return;
				}
			}
		}

		if ('service' in this.evalEntry) {
			const [domain, service] = this.evalEntry.service!.split('.');
			const data = JSON.parse(JSON.stringify(this.evalEntry.data));
			for (const key in data) {
				if (data[key] == 'VALUE') {
					data[key] = this.value;
				} else if (data[key].toString().includes('VALUE')) {
					data[key] = data[key]
						.toString()
						.replace('VALUE', this.value as string);
				}
			}

			this.hass.callService(domain, service, data);
		}
	}

	render() {
		this.evalEntry = this.renderTemplate(
			JSON.parse(JSON.stringify(this.entry)),
		) as IEntry;

		const value_attribute = this.evalEntry.value_attribute;
		if (value_attribute == 'state') {
			this.value = this.hass.states[this.evalEntry.entity_id!].state;
		} else {
			this.value =
				this.hass.states[this.evalEntry.entity_id!].attributes[
					value_attribute as string
				];
		}

		let icon = html``;
		if ('icon' in this.evalEntry) {
			const style: StyleInfo = {};
			if (this.evalEntry.icon_color) {
				style.color = this.evalEntry.icon_color;
			}
			icon = html`<ha-icon
				.icon=${this.evalEntry.icon}
				style="${styleMap(style)}"
			></ha-icon>`;
		}

		let label = html``;
		if ('label' in this.evalEntry) {
			let text = this.evalEntry.label;
			if (text) {
				text += this.evalEntry.unit_of_measurement ?? '';
				const style: StyleInfo = {};
				if (this.evalEntry.label_color) {
					style.color = this.evalEntry.label_color;
				}
				// prettier-ignore
				label = html`<div class="label" style="${styleMap(style)}">${text}</div>`;
			}
		}

		return html`${icon}${label}`;
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			css`
				:host {
					display: flex;
					flex-flow: column;
					place-content: center space-evenly;
					align-items: center;
					position: relative;
					height: 40px;
					width: 100%;
					border-radius: 10px;
					border: none;
					padding: 0px;
					box-sizing: border-box;
					line-height: 0;
					outline: 0px;
					overflow: hidden;
					font-size: inherit;
					color: inherit;
					flex-basis: 100%;
				}

				.container {
					all: inherit;
					height: 100%;
					overflow: hidden;
				}

				ha-icon {
					position: relative;
					pointer-events: none;
					display: inline-flex;
					flex-flow: column;
					place-content: center;
					z-index: 2;
					filter: invert(var(--invert-icon));
				}

				.label {
					position: relative;
					pointer-events: none;
					display: inline-flex;
					justify-content: center;
					align-items: center;
					height: 15px;
					width: inherit;
					font-family: inherit;
					font-size: 12px;
					z-index: 2;
					filter: invert(var(--invert-label));
				}
			`,
		];
	}
}
