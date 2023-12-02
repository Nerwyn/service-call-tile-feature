import { HomeAssistant } from 'custom-card-helpers';

import { LitElement, CSSResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { IEntry, IConfirmation } from '../models/interfaces';
import { renderTemplate } from '../utils';

@customElement('base-service-call-feature')
export class BaseServiceCallFeature extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) entry!: IEntry;
	value: string | number = 0;

	callService() {
		if ('confirmation' in this.entry) {
			let confirmation = this.entry.confirmation;
			if (typeof confirmation == 'string') {
				confirmation = renderTemplate(
					this.hass,
					this.entry.confirmation as string,
				) as unknown as boolean;
			}
			if (confirmation != false) {
				let text: string;
				if ('text' in (this.entry.confirmation as IConfirmation)) {
					text = renderTemplate(
						this.hass,
						(this.entry.confirmation as IConfirmation)
							.text as string,
					);
				} else {
					text = `Are you sure you want to run action '${renderTemplate(
						this.hass,
						this.entry.service as string,
					)}'?`;
				}
				if (this.entry.confirmation == true) {
					if (!confirm(text)) {
						return;
					}
				} else {
					if (
						'exemptions' in
						(this.entry.confirmation as IConfirmation)
					) {
						if (
							!(this.entry.confirmation as IConfirmation)
								.exemptions!.map((exemption) =>
									renderTemplate(this.hass, exemption.user),
								)
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
		}

		if ('service' in this.entry) {
			const [domain, service] = renderTemplate(
				this.hass,
				this.entry.service as string,
			).split('.');
			const data = structuredClone(this.entry.data);
			for (const key in data) {
				data[key] = renderTemplate(this.hass, data[key] as string);
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
		const value_attribute = renderTemplate(
			this.hass,
			this.entry.value_attribute as string,
		);
		const entity_id = renderTemplate(
			this.hass,
			this.entry.entity_id as string,
		);
		if (value_attribute == 'state') {
			this.value = this.hass.states[entity_id].state;
		} else {
			let value =
				this.hass.states[entity_id].attributes[
					value_attribute as string
				];
			if (value_attribute == 'brightness') {
				value = Math.round((100 * parseInt(value ?? 0)) / 255);
			}
			this.value = value;
		}

		let icon = html``;
		if ('icon' in this.entry) {
			const style = structuredClone(this.entry.icon_style ?? {});
			for (const key in style) {
				style[key] = renderTemplate(this.hass, style[key] as string);
			}
			icon = html`<ha-icon
				.icon=${this.entry.icon}
				style=${styleMap(style)}
			></ha-icon>`;
		}

		let label = html``;
		if ('label' in this.entry) {
			let text = renderTemplate(this.hass, this.entry.label as string);
			if (text) {
				text +=
					renderTemplate(
						this.hass,
						this.entry.unit_of_measurement as string,
					) ?? '';
				const style = structuredClone(this.entry.label_style ?? {});
				for (const key in style) {
					style[key] = renderTemplate(
						this.hass,
						style[key] as string,
					);
				}
				// prettier-ignore
				label = html`<div class="label" style=${styleMap(style)}>${text}</div>`;
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

					--color: unset;
					--icon-color: inherit;
					--icon-filter: none;
					--label-color: inherit;
					--label-filter: none;
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
					color: var(--icon-color);
					filter: var(--icon-filter);
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
					color: var(--label-color);
					filter: var(--label-filter);
				}
			`,
		];
	}
}
