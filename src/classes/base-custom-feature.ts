import { HomeAssistant, HapticType, forwardHaptic } from 'custom-card-helpers';

import { LitElement, CSSResult, html, css } from 'lit';
import {
	customElement,
	eventOptions,
	property,
	state,
} from 'lit/decorators.js';
import { renderTemplate } from 'ha-nunjucks';

import {
	IEntry,
	ITarget,
	IAction,
	IActions,
	ActionType,
} from '../models/interfaces';

@customElement('base-custom-feature')
export class BaseCustomFeature extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) entry!: IEntry;

	@state() value?: string | number | boolean = 0;
	entityId?: string;
	valueAttribute?: string;
	getValueFromHass: boolean = true;
	getValueFromHassTimer?: ReturnType<typeof setTimeout>;
	valueUpdateInterval?: ReturnType<typeof setInterval>;

	unitOfMeasurement: string = '';
	precision?: number;

	buttonPressStart?: number;
	buttonPressEnd?: number;
	fireMouseEvent?: boolean = true;

	swiping: boolean = false;
	initialX?: number;
	initialY?: number;

	fireHapticEvent(haptic: HapticType) {
		if (
			this.renderTemplate(this.entry.haptics as unknown as string) ??
			false
		) {
			forwardHaptic(haptic);
		}
	}

	endAction() {
		clearInterval(this.valueUpdateInterval);
		this.valueUpdateInterval = undefined;

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
		const domainService = this.renderTemplate(
			action.service as string,
		) as string;

		const [domain, service] = domainService.split('.');
		const data = structuredClone(action.data);
		for (const key in data) {
			if (Array.isArray(data[key])) {
				for (const i in data[key] as string[]) {
					(data[key] as string[])[i] = this.renderTemplate(
						(data[key] as string[])[i],
					) as string;
				}
			} else {
				data[key] = this.renderTemplate(data[key] as string);
			}
		}
		const target = structuredClone(action.target);
		for (const key in target) {
			if (Array.isArray(target[key as keyof ITarget])) {
				for (const i in target[key as keyof ITarget] as string[]) {
					(target[key as keyof ITarget] as string[])[i] =
						this.renderTemplate(
							(target[key as keyof ITarget] as string[])[i],
						) as string;
				}
			} else {
				target[key as keyof ITarget] = this.renderTemplate(
					target[key as keyof ITarget] as string,
				) as string;
			}
		}
		this.hass.callService(domain, service, data, target);
	}

	navigate(action: IAction) {
		const path = this.renderTemplate(
			action.navigation_path as string,
		) as string;
		const replace = this.renderTemplate(
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
		let url = this.renderTemplate(action.url_path as string) as string;
		if (!url.includes('//')) {
			url = `https://${url}`;
		}
		window.open(url);
	}

	assist(action: IAction) {
		const pipelineId = this.renderTemplate(
			action.pipeline_id as string,
		) as string;
		const startListening = this.renderTemplate(
			action.start_listening as unknown as string,
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
					start_listening: startListening ?? true,
				},
			});
		} else {
			window.open(`${window.location.href}?conversation=1`, '_self');
			// TODO figure out how to make this work on desktop browsers
			// const event = new Event('show-dialog', {
			// 	bubbles: true,
			// 	cancelable: true,
			// 	composed: true,
			// });
			// event.detail = {
			// 	dialogTag: 'ha-voice-command-dialog',
			// 	dialogImport: () =>
			// 		Object.getPrototypeOf(
			// 			document.createElement('ha-voice-command-dialog'),
			// 		),
			// 	dialogParams: {
			// 		pipeline_id: pipelineId ?? 'last_used',
			// 		start_listening: startListening ?? false,
			// 	},
			// };
			// this.dispatchEvent(event);
		}
	}

	moreInfo(action: IAction) {
		const entityId = this.renderTemplate(
			(action.target?.entity_id ??
				action.data?.entity_id ??
				'') as string,
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

	handleConfirmation(action: IAction): boolean {
		if ('confirmation' in action) {
			let confirmation = action.confirmation;
			if (typeof confirmation == 'string') {
				confirmation = this.renderTemplate(
					action.confirmation as string,
				) as boolean;
			}
			if (confirmation != false) {
				this.fireHapticEvent('warning');

				let text: string;
				if (confirmation != true && confirmation?.text) {
					text = this.renderTemplate(confirmation.text) as string;
				} else {
					text = `Are you sure you want to run action '${
						this.renderTemplate(action.action as string) as string
					}'?`;
				}
				if (confirmation == true) {
					if (!confirm(text)) {
						return false;
					}
				} else {
					if (confirmation?.exemptions) {
						if (
							!confirmation.exemptions
								?.map((exemption) =>
									this.renderTemplate(exemption.user),
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
		this.entityId = this.renderTemplate(
			this.entry.entity_id as string,
		) as string;

		this.unitOfMeasurement =
			(this.renderTemplate(
				this.entry.unit_of_measurement as string,
			) as string) ?? '';

		if (this.getValueFromHass && this.entityId) {
			clearInterval(this.valueUpdateInterval);
			this.valueUpdateInterval = undefined;

			this.valueAttribute = (
				this.renderTemplate(
					(this.entry.value_attribute as string) ?? 'state',
				) as string
			).toLowerCase();
			if (!this.hass.states[this.entityId]) {
				this.value = undefined;
			} else if (this.valueAttribute == 'state') {
				this.value = this.hass.states[this.entityId].state;
			} else {
				let value:
					| string
					| number
					| boolean
					| string[]
					| number[]
					| undefined;
				const indexMatch = this.valueAttribute.match(/\[\d+\]$/);
				if (indexMatch) {
					const index = parseInt(indexMatch[0].replace(/\[|\]/g, ''));
					this.valueAttribute = this.valueAttribute.replace(
						indexMatch[0],
						'',
					);
					value =
						this.hass.states[this.entityId].attributes[
							this.valueAttribute
						];
					if (value && Array.isArray(value) && value.length) {
						value = value[index];
					} else {
						value = undefined;
					}
				} else {
					value =
						this.hass.states[this.entityId].attributes[
							this.valueAttribute
						];
				}

				if (value != undefined || this.valueAttribute == 'elapsed') {
					switch (this.valueAttribute) {
						case 'brightness':
							this.value = Math.round(
								(100 * parseInt((value as string) ?? 0)) / 255,
							);
							break;
						case 'media_position':
							try {
								const setIntervalValue = () => {
									if (
										this.hass.states[
											this.entityId as string
										].state == 'playing'
									) {
										this.value = Math.min(
											Math.floor(
												Math.floor(value as number) +
													(Date.now() -
														Date.parse(
															this.hass.states[
																this
																	.entityId as string
															].attributes
																.media_position_updated_at,
														)) /
														1000,
											),
											Math.floor(
												this.hass.states[
													this.entityId as string
												].attributes.media_duration,
											),
										);
									} else {
										this.value = value as number;
									}
								};

								setIntervalValue();
								this.valueUpdateInterval = setInterval(
									setIntervalValue,
									500,
								);
							} catch (e) {
								console.error(e);
								this.value = value as string | number | boolean;
							}
							break;
						case 'elapsed':
							if (this.entityId.startsWith('timer.')) {
								if (
									this.hass.states[this.entityId as string]
										.state == 'idle'
								) {
									this.value = 0;
								} else {
									const durationHMS =
										this.hass.states[
											this.entityId as string
										].attributes.duration.split(':');
									const durationSeconds =
										parseInt(durationHMS[0]) * 3600 +
										parseInt(durationHMS[1]) * 60 +
										parseInt(durationHMS[2]);
									const endSeconds = Date.parse(
										this.hass.states[
											this.entityId as string
										].attributes.finishes_at,
									);
									try {
										const setIntervalValue = () => {
											if (
												this.hass.states[
													this.entityId as string
												].state == 'active'
											) {
												const remainingSeconds =
													(endSeconds - Date.now()) /
													1000;
												const value = Math.floor(
													durationSeconds -
														remainingSeconds,
												);
												this.value = Math.min(
													value,
													durationSeconds,
												);
											} else {
												const remainingHMS =
													this.hass.states[
														this.entityId as string
													].attributes.remaining.split(
														':',
													);
												const remainingSeconds =
													parseInt(remainingHMS[0]) *
														3600 +
													parseInt(remainingHMS[1]) *
														60 +
													parseInt(remainingHMS[2]);
												this.value = Math.floor(
													durationSeconds -
														remainingSeconds,
												);
											}
										};

										setIntervalValue();
										this.valueUpdateInterval = setInterval(
											setIntervalValue,
											500,
										);
									} catch (e) {
										console.error(e);
										this.value = 0;
									}
								}
								break;
							}
						// falls through
						default:
							this.value = value as string | number | boolean;
							break;
					}
				} else {
					this.value = value;
				}
			}
		}
	}

	renderTemplate(
		str: string | number | boolean,
		context?: object,
	): string | number | boolean {
		let holdSecs: number = 0;
		if (this.buttonPressStart && this.buttonPressEnd) {
			holdSecs = (this.buttonPressEnd - this.buttonPressStart) / 1000;
		}

		context = {
			VALUE: this.value as string,
			HOLD_SECS: holdSecs,
			UNIT: this.unitOfMeasurement,
			value: this.value as string,
			hold_secs: holdSecs,
			unit: this.unitOfMeasurement,
			config: {
				...this.entry,
				entity: this.entityId,
				attribute: this.valueAttribute,
			},
			...context,
		};
		context = {
			render: (str2: string) => this.renderTemplate(str2, context),
			...context,
		};

		let value: string | number = context['value' as keyof typeof context];
		if (
			value != undefined &&
			typeof value == 'number' &&
			this.precision != undefined
		) {
			value = Number(value).toFixed(this.precision);
			context = {
				...context,
				VALUE: value,
				value: value,
			};
		}

		const res = renderTemplate(this.hass, str as string, context);
		if (res != str) {
			return res;
		}

		// Legacy string interpolation
		if (typeof str == 'string') {
			for (const key of ['VALUE', 'HOLD_SECS', 'UNIT']) {
				if (str == key) {
					return context[key as keyof object] as string;
				} else if (str.includes(key)) {
					str = str.replace(
						new RegExp(key, 'g'),
						(context[key as keyof object] ?? '') as string,
					);
				}
			}
		}

		return str;
	}

	resetGetValueFromHass() {
		const valueFromHassDelay = this.renderTemplate(
			this.entry.value_from_hass_delay ?? 1000,
		) as number;
		this.getValueFromHassTimer = setTimeout(
			() => (this.getValueFromHass = true),
			valueFromHassDelay,
		);
	}

	buildStyles(entry: IEntry = this.entry, context?: object) {
		return entry.styles
			? html`
					<style>
						${(
							this.renderTemplate(entry.styles, context) as string
						).replace(/;(?<! !important;)/g, ' !important;')}
					</style>
			  `
			: '';
	}

	buildBackground() {
		return html` <div class="background"></div>`;
	}

	buildIcon(entry: IEntry = this.entry, context?: object) {
		let icon = html``;
		if (entry.icon) {
			icon = html`<ha-icon
				class="icon"
				.icon=${this.renderTemplate(entry.icon as string, context)}
			></ha-icon>`;
		}
		return icon;
	}

	buildLabel(entry: IEntry = this.entry, context?: object) {
		if (entry.label) {
			const text: string = this.renderTemplate(
				entry.label as string,
				context,
			) as string;
			if (text) {
				return html`<pre class="label">${text}</pre>`;
			}
		}
		return '';
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

	static get styles(): CSSResult | CSSResult[] {
		return css`
			:host {
				display: flex;
				flex-flow: column;
				place-content: center space-evenly;
				align-items: center;
				position: relative;
				height: var(--feature-height, 40px);
				width: 100%;
				border: none;
				border-radius: 10px;
				padding: 0px;
				box-sizing: border-box;
				outline: 0px;
				overflow: hidden;
				font-size: inherit;
				color: inherit;
				flex-basis: 100%;
			}

			.container {
				all: inherit;
				overflow: hidden;
				height: 100%;
			}

			.background {
				position: absolute;
				width: inherit;
				height: var(--background-height, 100%);
				background: var(
					--background,
					var(--color, var(--disabled-color))
				);
				opacity: var(--background-opacity, 0.2);
				z-index: 1;
			}

			.icon {
				position: relative;
				pointer-events: none;
				display: inline-flex;
				flex-flow: column;
				place-content: center;
				z-index: 2;
				color: var(--icon-color, inherit);
				filter: var(--icon-filter, inherit);
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
				color: var(--label-color, inherit);
				filter: var(--label-filter, none);
			}
		`;
	}
}
