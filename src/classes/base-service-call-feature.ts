import { HomeAssistant, HapticType, forwardHaptic } from 'custom-card-helpers';

import { LitElement, CSSResult, html, css } from 'lit';
import {
	customElement,
	eventOptions,
	property,
	state,
} from 'lit/decorators.js';
import { StyleInfo, styleMap } from 'lit/directives/style-map.js';
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

	@state() value: string | number | boolean = 0;
	getValueFromHass: boolean = true;
	getValueFromHassTimer?: ReturnType<typeof setTimeout>;

	unitOfMeasurement: string = '';
	precision: number = 0;

	buttonPressStart?: number;
	buttonPressEnd?: number;
	fireMouseEvent?: boolean = true;

	swiping: boolean = false;
	initialX?: number;
	initialY?: number;

	fireHapticEvent(haptic: HapticType) {
		if (
			renderTemplate(
				this.hass,
				this.entry.haptics as unknown as string,
			) ??
			false
		) {
			forwardHaptic(haptic);
		}
	}

	endAction() {
		this.buttonPressStart = undefined;
		this.buttonPressEnd = undefined;

		this.swiping = false;
		this.initialX = undefined;
		this.initialY = undefined;
	}

	sendAction(
		actionType: ActionType,
		actions: IActions = this.entry as IActions,
	) {
		let action;
		switch (actionType) {
			case 'momentary_start_action':
				action = actions.momentary_start_action;
				break;
			case 'momentary_end_action':
				action = actions.momentary_end_action;
				break;
			case 'hold_action':
				action = actions.hold_action ?? actions.tap_action;
				break;
			case 'double_tap_action':
				action = actions.double_tap_action ?? actions.tap_action;
				break;
			case 'tap_action':
			default:
				action = actions.tap_action;
				break;
		}

		if (!action || !this.handleConfirmation(action)) {
			return;
		}

		try {
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
				case 'fire-dom-event':
					this.fireDomEvent(action);
					break;
				case 'repeat':
				case 'none':
				default:
					break;
			}
		} catch (e) {
			this.endAction();
			throw e;
		}
	}

	callService(action: IAction) {
		const domainService = renderTemplate(
			this.hass,
			action.service as string,
		) as string;

		const [domain, service] = domainService.split('.');
		const data = structuredClone(action.data);
		for (const key in data) {
			if (Array.isArray(data[key])) {
				for (const i in data[key] as string[]) {
					(data[key] as string[])[i] = this.replaceValue(
						(data[key] as string[])[i],
					) as string;
				}
			} else {
				data[key] = this.replaceValue(data[key] as string);
			}
		}
		this.hass.callService(domain, service, data);
	}

	navigate(action: IAction) {
		const path = this.replaceValue(action.navigation_path!) as string;
		const replace = this.replaceValue(
			action.navigation_replace as unknown as string,
		) as boolean;
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
		let url = this.replaceValue(action.url_path!) as string;
		if (!url.includes('//')) {
			url = `https://${url}`;
		}
		window.open(url);
	}

	assist(action: IAction) {
		const pipelineId = this.replaceValue(action.pipeline_id!) as string;
		const startListening = this.replaceValue(
			action.start_listening!,
		) as boolean;

		// eslint-disable-next-line
		// @ts-ignore
		if (this.hass?.auth?.external?.config?.hasAssist) {
			// eslint-disable-next-line
			// @ts-ignore
			this.hass?.auth?.external?.fireMessage({
				type: 'assist/show',
				payload: {
					pipeline_id: pipelineId ?? 'last_used',
					start_listening: startListening ?? false,
				},
			});
		} else {
			window.open(`${window.location.href}?conversation=1`, '_self');
		}
	}

	moreInfo(action: IAction) {
		const entityId = this.replaceValue(
			action.data?.entity_id as string,
		) as string;

		const event = new Event('hass-more-info', {
			bubbles: true,
			cancelable: true,
			composed: true,
		});
		event.detail = { entityId };
		this.dispatchEvent(event);
	}

	fireDomEvent(action: IAction) {
		const event = new Event('ll-custom', {
			composed: true,
			bubbles: true,
		});
		event.detail = action;
		this.dispatchEvent(event);
	}

	handleConfirmation(action: IAction) {
		if ('confirmation' in action) {
			let confirmation = action.confirmation;
			if (typeof confirmation == 'string') {
				confirmation = this.replaceValue(
					action.confirmation as string,
				) as boolean;
			}
			if (confirmation != false) {
				this.fireHapticEvent('warning');

				let text: string;
				if (
					confirmation != true &&
					'text' in (confirmation as IConfirmation)
				) {
					text = this.replaceValue(
						(confirmation as IConfirmation).text as string,
					) as string;
				} else {
					text = `Are you sure you want to run action '${
						this.replaceValue(action.service as string) as string
					}'?`;
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
									this.replaceValue(exemption.user),
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
		this.unitOfMeasurement =
			(renderTemplate(
				this.hass,
				this.entry.unit_of_measurement as string,
			) as string) ?? '';

		if (this.getValueFromHass) {
			const entityId = renderTemplate(
				this.hass,
				this.entry.entity_id as string,
			) as string;
			let valueAttribute = renderTemplate(
				this.hass,
				this.entry.value_attribute as string,
			) as string;
			if (entityId) {
				if (valueAttribute == 'state') {
					this.value = this.hass.states[entityId].state;
				} else {
					let value;
					const indexMatch = valueAttribute.match(/\[\d+\]$/);
					if (indexMatch) {
						const index = parseInt(
							indexMatch[0].replace(/\[|\]/g, ''),
						);
						valueAttribute = valueAttribute.replace(
							indexMatch[0],
							'',
						);
						value =
							this.hass.states[entityId].attributes[
								valueAttribute
							];
						if (value && value.length) {
							value = value[index];
						} else {
							value == undefined;
						}
					} else {
						value =
							this.hass.states[entityId].attributes[
								valueAttribute
							];
					}
					if (valueAttribute == 'brightness') {
						value = Math.round((100 * parseInt(value ?? 0)) / 255);
					}
					this.value = value;
				}
			}
		}

		if (
			this.value != undefined &&
			typeof this.value == 'number' &&
			!this.precision
		) {
			this.value = Math.trunc(Number(this.value));
		}
	}

	replaceValue(
		str: string | number | boolean,
		context?: Record<string, string | number | boolean>,
	): string | number | boolean {
		if (!context) {
			let holdSecs: number = 0;
			if (this.buttonPressStart && this.buttonPressEnd) {
				holdSecs = (this.buttonPressEnd - this.buttonPressStart) / 1000;
			}
			context = {
				VALUE: this.value,
				HOLD_SECS: holdSecs ?? 0,
				UNIT: this.unitOfMeasurement,
			};
		}
		str = renderTemplate(this.hass, str as string, context);

		// Legacy VALUE interpolation (and others)
		if (typeof str == 'string') {
			for (const key in context) {
				if (key in context) {
					if (str == key) {
						str = context[key] as string;
					} else if (str.toString().includes(key)) {
						str = str
							.toString()
							.replace(
								new RegExp(key, 'g'),
								(context[key] ?? '').toString(),
							);
					}
				}
			}
		}

		return str;
	}

	resetGetValueFromHass() {
		const valueFromHassDelay =
			'value_from_hass_delay' in this.entry
				? (this.replaceValue(
						this.entry.value_from_hass_delay as unknown as string,
				  ) as number)
				: 1000;
		this.getValueFromHassTimer = setTimeout(
			() => (this.getValueFromHass = true),
			valueFromHassDelay,
		);
	}

	buildStyle(_style: StyleInfo = {}) {
		const style = structuredClone(_style);
		for (const key in style) {
			style[key] = this.replaceValue(style[key] as string) as string;
		}
		return style;
	}

	buildIcon(entry: IEntry = this.entry) {
		let icon = html``;
		if ('icon' in entry) {
			icon = html`<ha-icon
				.icon=${this.replaceValue(entry.icon as string)}
				style=${styleMap(this.buildStyle(entry.icon_style ?? {}))}
			></ha-icon>`;
		}
		return icon;
	}

	buildLabel(
		entry: IEntry = this.entry,
		value = this.value,
		hide: boolean = false,
	) {
		let label = html``;
		if ('label' in entry) {
			let holdSecs: number = 0;
			if (this.buttonPressStart && this.buttonPressEnd) {
				holdSecs = (this.buttonPressEnd - this.buttonPressStart) / 1000;
			}
			const context = {
				VALUE: value,
				HOLD_SECS: holdSecs ?? 0,
				UNIT: this.unitOfMeasurement,
			};

			if (
				value != undefined &&
				typeof value == 'number' &&
				this.precision !== undefined
			) {
				context.VALUE = Number(value).toFixed(this.precision);
			}
			let text: string = renderTemplate(
				this.hass,
				entry.label as string,
				context,
			).toString();
			if (text) {
				if (typeof text == 'string' && text.includes('VALUE')) {
					text = text.replace(
						/VALUE/g,
						`${(context.VALUE ?? '').toString()}${
							this.unitOfMeasurement
						}`,
					);
				}

				const style = this.buildStyle(entry.label_style ?? {});
				if (hide) {
					style.display = 'none';
				}

				// prettier-ignore
				label = html`<pre
					class="label"
					style=${styleMap(style)}
				>${text}</pre>`;
			}
		}
		return label;
	}

	// Skeletons for overridden event handlers
	onStart(_e: MouseEvent | TouchEvent) {}
	onEnd(_e: MouseEvent | TouchEvent) {}
	onMove(_e: MouseEvent | TouchEvent) {}

	@eventOptions({ passive: true })
	onMouseDown(e: MouseEvent | TouchEvent) {
		if (this.fireMouseEvent) {
			this.onStart(e);
		}
	}
	onMouseUp(e: MouseEvent | TouchEvent) {
		if (this.fireMouseEvent) {
			this.onEnd(e);
		}
		this.fireMouseEvent = true;
	}
	@eventOptions({ passive: true })
	onMouseMove(e: MouseEvent | TouchEvent) {
		if (this.fireMouseEvent) {
			this.onMove(e);
		}
	}

	@eventOptions({ passive: true })
	onTouchStart(e: TouchEvent) {
		this.fireMouseEvent = false;
		this.onStart(e);
	}
	onTouchEnd(e: TouchEvent) {
		this.fireMouseEvent = false;
		this.onEnd(e);
	}
	@eventOptions({ passive: true })
	onTouchMove(e: TouchEvent) {
		this.fireMouseEvent = false;
		this.onMove(e);
	}

	onContextMenu(e: PointerEvent) {
		if (!this.fireMouseEvent) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}

	buildBackground() {
		return html`
			<div
				class="background"
				style=${styleMap(
					this.buildStyle(this.entry.background_style ?? {}),
				)}
			></div>
		`;
	}

	render() {
		this.setValue();

		return html`${this.buildIcon()}${this.buildLabel()}`;
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
					--background: var(--color, var(--state-inactive-color));
					--background-height: 100%;
					--background-opacity: 0.2;
				}

				.container {
					all: inherit;
					overflow: hidden;
					height: 100%;
				}

				.background {
					position: absolute;
					width: inherit;
					height: var(--background-height);
					background: var(--background, var(--disabled-color));
					opacity: var(--background-opacity);
					z-index: 1;
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
					line-height: 15px;
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
