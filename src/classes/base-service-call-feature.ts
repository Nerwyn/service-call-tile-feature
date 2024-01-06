import { HomeAssistant, forwardHaptic } from 'custom-card-helpers';

import { LitElement, CSSResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { renderTemplate } from 'ha-nunjucks';

import {
	IEntry,
	IConfirmation,
	IAction,
	IActions,
	ActionType,
} from '../models/interfaces';

@customElement('base-service-call-feature')
export class BaseServiceCallFeature extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) entry!: IEntry;

	value: string | number = 0;
	touchscreen = 'ontouchstart' in document.documentElement;

	sendAction(
		actionType: ActionType,
		actions: IActions = this.entry as IActions,
	) {
		let action;
		switch (actionType) {
			case 'hold_action':
				action = actions.hold_action ?? actions.tap_action!;
				break;
			case 'double_tap_action':
				action = actions.double_tap_action! ?? actions.tap_action!;
				break;
			case 'tap_action':
			default:
				action = actions.tap_action ?? ({ action: 'none' } as IAction);
				break;
		}

		if (!this.handleConfirmation(action)) {
			return;
		}

		switch (action.action) {
			case 'call-service':
				this.callService(action);
				break;
			case 'navigate':
				this.navigate(action);
				break;
			case 'url':
				this.toUrl(action);
				break;
			case 'assist':
				this.assist(action);
				break;
			case 'more-info':
				this.moreInfo(action);
				break;
			case 'none':
			default:
				break;
		}
	}

	callService(action: IAction) {
		const domainService = renderTemplate(
			this.hass,
			action.service as string,
		) as string;

		const [domain, service] = domainService.split('.');
		const data = structuredClone(action.data);
		const context = { value: this.value };
		for (const key in data) {
			data[key] = renderTemplate(this.hass, data[key] as string, context);

			if (data[key]) {
				if (data[key] == 'VALUE') {
					data[key] = this.value;
				} else if (data[key].toString().includes('VALUE')) {
					data[key] = data[key]
						.toString()
						.replace(/VALUE/g, (this.value ?? '').toString());
				}
			}
		}

		this.hass.callService(domain, service, data);
	}

	navigate(action: IAction) {
		const path =
			(renderTemplate(this.hass, action.navigation_path!) as string) ??
			'';
		const replace =
			(renderTemplate(
				this.hass,
				(action.navigation_replace as unknown as string)!,
			) as boolean) ?? false;
		if (path.includes('//')) {
			console.error(
				'Protocol detected in navigation path. To navigate to another website use the action "url" with the key "url_path" instead.',
			);
			return;
		}
		if (replace == true) {
			window.history.replaceState(
				window.history.state?.root ? { root: true } : null,
				'',
				path,
			);
		} else {
			window.history.pushState(null, '', path);
		}
		const event = new Event('location-changed', {
			bubbles: false,
			cancelable: true,
			composed: false,
		});
		event.detail = { replace: replace == true };
		window.dispatchEvent(event);
	}

	toUrl(action: IAction) {
		let url = (renderTemplate(this.hass, action.url_path!) as string) ?? '';
		if (!url.includes('//')) {
			url = `https://${url}`;
		}
		window.open(url);
	}

	assist(action: IAction) {
		// eslint-disable-next-line
		// @ts-ignore
		if (this.hass?.auth?.external?.config?.hasAssist) {
			// eslint-disable-next-line
			// @ts-ignore
			this.hass?.auth?.external?.fireMessage({
				type: 'assist/show',
				payload: {
					pipeline_id: action.pipeline_id ?? 'last_used',
					start_listening: action.start_listening ?? false,
				},
			});
		} else {
			window.open(`${window.location.href}?conversation=1`, '_self');
		}
	}

	moreInfo(action: IAction) {
		const entityId = renderTemplate(
			this.hass,
			action.data!.entity_id as string,
		);

		const event = new Event('hass-more-info', {
			bubbles: true,
			cancelable: true,
			composed: true,
		});
		event.detail = { entityId };
		this.dispatchEvent(event);
	}

	handleConfirmation(action: IAction) {
		if ('confirmation' in action) {
			let confirmation = action.confirmation;
			if (typeof confirmation == 'string') {
				confirmation = renderTemplate(
					this.hass,
					action.confirmation as string,
				) as unknown as boolean;
			}
			if (confirmation != false) {
				forwardHaptic('warning');

				let text: string;
				if (
					confirmation != true &&
					'text' in (confirmation as IConfirmation)
				) {
					text = renderTemplate(
						this.hass,
						(confirmation as IConfirmation).text as string,
					) as string;
				} else {
					text = `Are you sure you want to run action '${renderTemplate(
						this.hass,
						action.service as string,
					)}'?`;
				}
				if (confirmation == true) {
					if (!confirm(text)) {
						return false;
					}
				} else {
					if ('exemptions' in (confirmation as IConfirmation)) {
						if (
							!(confirmation as IConfirmation)
								.exemptions!.map((exemption) =>
									renderTemplate(this.hass, exemption.user),
								)
								.includes(this.hass.user.id)
						) {
							if (!confirm(text)) {
								return false;
							}
						}
					} else if (!confirm(text)) {
						return false;
					}
				}
			}
		}
		return true;
	}

	setValue() {
		const value_attribute = renderTemplate(
			this.hass,
			this.entry.value_attribute as string,
		);
		const entity_id = renderTemplate(
			this.hass,
			this.entry.entity_id as string,
		) as string;
		if (entity_id) {
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
		}
	}

	render() {
		this.setValue();

		let icon = html``;
		if ('icon' in this.entry) {
			const style = structuredClone(this.entry.icon_style ?? {});
			for (const key in style) {
				style[key] = renderTemplate(
					this.hass,
					style[key] as string,
				) as string;
			}
			icon = html`<ha-icon
				.icon=${renderTemplate(this.hass, this.entry.icon as string)}
				style=${styleMap(style)}
			></ha-icon>`;
		}

		let label = html``;
		if ('label' in this.entry) {
			let text = renderTemplate(this.hass, this.entry.label as string);
			if (text) {
				if (typeof text == 'string' && text.includes('VALUE')) {
					text = text.replace(
						/VALUE/g,
						(this.value ?? '').toString(),
					);
				}
				text +=
					(renderTemplate(
						this.hass,
						this.entry.unit_of_measurement as string,
					) as string) ?? '';
				const style = structuredClone(this.entry.label_style ?? {});
				for (const key in style) {
					style[key] = renderTemplate(
						this.hass,
						style[key] as string,
					) as string;
				}
				// prettier-ignore
				label = html`<pre class="label" style=${styleMap(style)}>${text}</pre>`;
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
					margin: 0;
					font-family: inherit;
					font-size: 12px;
					font-weight: bold;
					z-index: 2;
					color: var(--label-color);
					filter: var(--label-filter);
				}
			`,
		];
	}
}
