import { css, CSSResult, html, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
	CheckedValues,
	ToggleThumbType,
	UncheckedValues,
} from '../models/interfaces';
import { BaseCustomFeature } from './base-custom-feature';

@customElement('custom-feature-toggle')
export class CustomFeatureToggle extends BaseCustomFeature {
	@state() checked: boolean = false;
	direction?: 'left' | 'right';

	async onPointerUp(_e: PointerEvent) {
		if (!this.swiping) {
			if (this.direction) {
				// Only fire on swipe if it's in the right direction
				const checked = this.direction == (this.rtl ? 'left' : 'right');
				if (this.checked == checked) {
					this.endAction();
					this.resetGetValueFromHass();
					return;
				}
			}
			this.getValueFromHass = false;
			clearTimeout(this.getValueFromHassTimer);
			this.checked = !this.checked;
			this.fireHapticEvent('light');
			await this.sendAction('tap_action');
		}
		this.endAction();
		this.resetGetValueFromHass();
	}

	onPointerMove(e: PointerEvent) {
		super.onPointerMove(e);

		// Only consider significant enough movement
		const sensitivity = 40;
		const swipeSensitivity = 16;
		const horizontal = (this.currentX ?? 0) - (this.initialX ?? 0);
		if (
			Math.abs(horizontal) <
			Math.abs((this.currentY ?? 0) - (this.initialY ?? 0)) - sensitivity
		) {
			this.swiping = true;
			this.getValueFromHass = true;
			this.setValue();
		} else if (Math.abs(horizontal) > swipeSensitivity) {
			// Swipe detection
			this.direction = horizontal > 0 ? 'right' : 'left';
		}
	}

	endAction() {
		this.direction = undefined;
		super.endAction();
	}

	renderTemplate(str: string, context?: object) {
		context = {
			...context,
			checked: this.checked,
		};
		return super.renderTemplate(str, context);
	}

	setValue() {
		super.setValue();
		if (this.getValueFromHass) {
			// Allow vs block list flag
			const allow =
				String(
					this.renderTemplate(String(this.config.allow_list ?? true)),
				) == 'true';

			let values: string[];
			if ((this.config.checked_values ?? []).length) {
				// User defined list of values
				values = (this.config.checked_values ?? []).map((value) =>
					(
						(this.renderTemplate(value) as string) ?? ''
					).toLowerCase(),
				);
			} else if (allow) {
				// Allow list
				values = CheckedValues;
			} else {
				// Block list
				values = UncheckedValues;
			}

			// Value > 0 check flag
			const checkNumeric =
				String(
					this.renderTemplate(
						String(this.config.check_numeric ?? true),
					),
				) == 'true';

			this.checked =
				allow == values.includes(String(this.value).toLowerCase()) ||
				(checkNumeric && Number(this.value) > 0);
		}
	}

	buildMD3Switch() {
		const styles = this.rtl
			? `
				.container,
				.thumb > .icon {
					flex-direction: row-reverse !important;
					transform: scaleX(-1) !important;
				}
			`
			: '';
		return html`
			<div class="icon-label">
				${this.buildIcon(this.config.icon)}${this.buildLabel(
					this.config.label,
				)}
			</div>
			<div
				class="container md3-switch ${this.checked ? 'on' : 'off'}"
				@pointerdown=${this.onPointerDown}
				@pointerup=${this.onPointerUp}
				@pointermove=${this.onPointerMove}
				@pointercancel=${this.onPointerCancel}
				@pointerleave=${this.onPointerLeave}
				@contextmenu=${this.onContextMenu}
			>
				<div class="background"></div>
				<div class="thumb">
					${this.buildIcon(
						this.config[`${this.checked ? '' : 'un'}checked_icon`],
					)}
				</div>
			</div>
			<style>
				${styles}
			</style>
		`;
	}

	buildMD2Switch() {
		const styles = this.rtl
			? `
				.container,
				.thumb > .icon {
					transform: scaleX(-1) !important;
				}
			`
			: '';
		return html`
			<div class="icon-label">
				${this.buildIcon(this.config.icon)}${this.buildLabel(
					this.config.label,
				)}
			</div>
			<div
				class="container md2-switch ${this.checked ? 'on' : 'off'}"
				@pointerdown=${this.onPointerDown}
				@pointerup=${this.onPointerUp}
				@pointermove=${this.onPointerMove}
				@pointercancel=${this.onPointerCancel}
				@pointerleave=${this.onPointerLeave}
				@contextmenu=${this.onContextMenu}
			>
				<div class="background"></div>
				<div class="thumb">
					${this.buildIcon(
						this.config[`${this.checked ? '' : 'un'}checked_icon`],
					)}${this.buildRipple()}
				</div>
			</div>
			<style>
				${styles}
			</style>
		`;
	}

	buildCheckbox() {
		return html`
			<div
				class="container ${this.checked ? 'on' : 'off'}"
				@pointerdown=${this.onPointerDown}
				@pointerup=${this.onPointerUp}
				@pointermove=${this.onPointerMove}
				@pointercancel=${this.onPointerCancel}
				@pointerleave=${this.onPointerLeave}
				@contextmenu=${this.onContextMenu}
			>
				<div class="checkbox">
					${this.buildIcon(
						this.config[`${this.checked ? '' : 'un'}checked_icon`],
					)}
				</div>
				${this.buildRipple()}
			</div>
			<div class="icon-label">
				${this.buildIcon(this.config.icon)}${this.buildLabel(
					this.config.label,
				)}
			</div>
		`;
	}

	buildDefaultToggle() {
		const styles = this.rtl
			? `
			.container,
			.icon,
			.label {
				transform: scaleX(-1) !important;
			}
		`
			: '';
		return html`
			<div
				class="container ${this.checked ? 'on' : 'off'}"
				@pointerdown=${this.onPointerDown}
				@pointerup=${this.onPointerUp}
				@pointermove=${this.onPointerMove}
				@pointercancel=${this.onPointerCancel}
				@pointerleave=${this.onPointerLeave}
				@contextmenu=${this.onContextMenu}
			>
				<div class="background"></div>
				${this.buildIcon(this.config.checked_icon) || html`<div></div>`}
				${this.buildIcon(this.config.unchecked_icon) ||
				html`<div></div>`}
				<div class="thumb">
					${this.buildIcon(this.config.icon)}${this.buildLabel(
						this.config.label,
					)}
				</div>
			</div>
			<style>
				${styles}
			</style>
		`;
	}

	render() {
		this.setValue();
		this.rtl = getComputedStyle(this).direction == 'rtl';

		let toggle: TemplateResult<1>;
		switch (
			this.renderTemplate(
				this.config.thumb ?? 'default',
			) as ToggleThumbType
		) {
			case 'md3-switch':
				toggle = this.buildMD3Switch();
				break;
			case 'md2-switch':
				toggle = this.buildMD2Switch();
				break;
			case 'checkbox':
				toggle = this.buildCheckbox();
				break;
			case 'default':
			default:
				toggle = this.buildDefaultToggle();
				break;
		}

		return html`${toggle}${this.buildStyles(this.config.styles)}`;
	}

	firstUpdated() {
		// Firefox md checkbox and switch flex fixes
		// Because :host:has() doesn't work with Firefox
		if (this.renderTemplate(this.config.thumb ?? 'default') != 'default') {
			// Keeps toggles visible on small width displays
			this.style.setProperty('justify-content', 'flex-end');
			if (
				!this.shadowRoot?.querySelector('.icon-label')?.children.length
			) {
				// Makes checkboxes and toggles take up minimal space if they don't have an icon or label
				this.style.setProperty('flex', '0 0 min-content');
			}
		}
	}

	updated() {
		// md3-switch fix for themes that don't set different button and track colors
		if (
			this.renderTemplate(this.config.thumb ?? 'default') == 'md3-switch'
		) {
			const background = this.shadowRoot?.querySelector(
				'.background',
			) as HTMLElement;
			try {
				const style = getComputedStyle(background);

				const buttonChecked = style.getPropertyValue(
					'--switch-checked-button-color',
				);
				const trackChecked = style.getPropertyValue(
					'--switch-checked-track-color',
				);
				const trackUnchecked = style.getPropertyValue(
					'--switch-unchecked-track-color',
				);
				const buttonUnchecked = style.getPropertyValue(
					'--switch-unchecked-button-color',
				);
				if (
					trackChecked == buttonChecked ||
					trackUnchecked == buttonUnchecked
				) {
					if (this.checked) {
						background?.style.removeProperty('background');
						background?.style.setProperty('opacity', '54%');
					} else {
						background?.style.removeProperty('opacity');
						background?.style.setProperty(
							'background',
							'rgba(from var(--switch-unchecked-track-color) r g b / 38%)',
						);
					}
				} else {
					background?.style.removeProperty('background');
					background?.style.removeProperty('opacity');
				}
			} catch (e) {
				console.error(e);
				background?.style.removeProperty('background');
				background?.style.removeProperty('opacity');
			}
		}
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			super.styles as CSSResult,
			css`
				/* Default toggle */
				:host {
					flex-direction: row;
					touch-action: pan-y;
					border-radius: 0;
				}
				.container {
					justify-content: space-around;
					border-radius: var(--feature-border-radius, 12px);
					--md-ripple-hover-opacity: var(
						--ha-ripple-hover-opacity,
						0.08
					);
					--md-ripple-pressed-opacity: var(
						--ha-ripple-pressed-opacity,
						0.12
					);
					--md-ripple-hover-color: var(
						--ha-ripple-hover-color,
						var(--ha-ripple-color)
					);
					--md-ripple-pressed-color: var(
						--ha-ripple-pressed-color,
						var(--ha-ripple-color)
					);
				}
				.background {
					cursor: pointer;
					background: var(
						--background,
						var(
							--color,
							var(--feature-color, var(--state-inactive-color))
						)
					);
				}
				.off > .background {
					background: var(
						--background,
						var(--color, var(--state-inactive-color))
					);
				}
				.thumb {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					position: absolute;
					left: 0;
					cursor: pointer;
					height: 100%;
					width: 50%;
					background: var(
						--color,
						var(--feature-color, var(--state-inactive-color))
					);
					opacity: var(--opacity, 1);
					border-radius: var(--feature-border-radius, 12px);
					transition:
						transform 180ms ease-in-out,
						background-color 180ms ease-in-out;
				}
				.off > .thumb {
					background: var(--color, var(--state-inactive-color));
				}
				.on > .thumb {
					transform: translateX(100%);
				}

				/* Material Design Checkbox */
				.container:has(.checkbox) {
					height: var(--mdc-checkbox-touch-target-size, 40px);
					width: var(--mdc-checkbox-touch-target-size, 40px);
					border-radius: var(--mdc-checkbox-touch-target-size, 40px);
					justify-content: center;
					flex-basis: auto;
					flex-shrink: 0;
					background: 0 0;
					--mdc-icon-size: 18px;
					--ha-ripple-pressed-opacity: 0.1;
					--ha-ripple-hover-color: var(
						--checkbox-unchecked-icon-color,
						var(--primary-text-color)
					);
					--ha-ripple-pressed-color: var(
						--checkbox-checked-border-color,
						var(--mdc-checkbox-checked-color, var(--primary-color))
					);
				}
				.container.on:has(.checkbox) {
					--ha-ripple-hover-color: var(
						--checkbox-checked-border-color,
						var(--mdc-checkbox-checked-color, var(--primary-color))
					);
					--ha-ripple-pressed-color: var(
						--checkbox-unchecked-icon-color,
						var(--primary-text-color)
					);
				}
				.checkbox {
					height: 18px;
					width: 18px;
					border-radius: 2px;
					border: solid 2px;
					background: transparent;
					border-color: var(
						--checkbox-unchecked-border-color,
						var(
							--mdc-checkbox-unchecked-color,
							var(--secondary-text-color)
						)
					);
					cursor: pointer;
					--icon-color: var(
						--checkbox-unchecked-icon-color,
						var(--primary-text-color)
					);
				}
				.on > .checkbox {
					background: var(
						--checkbox-checked-border-color,
						var(--mdc-checkbox-checked-color, var(--primary-color))
					);
					border-color: var(
						--checkbox-checked-border-color,
						var(--mdc-checkbox-checked-color, var(--primary-color))
					);
					--icon-color: var(
						--checkbox-checked-icon-color,
						var(--mdc-checkbox-ink-color, #fff)
					);
				}
				@media (hover: hover) {
					.off:hover > .checkbox {
						border-color: var(
							--checkbox-unchecked-icon-color,
							var(--primary-text-color)
						);
					}
				}

				:host:has(.icon-label:empty) {
					flex: 0 0 min-content;
				}
				.icon-label {
					display: flex;
					flex-direction: row;
					align-items: center;
					gap: 10px;
					height: 100%;
					width: 100%;
					min-width: 0;
				}
				.icon-label:empty {
					display: none;
				}
				.icon-label > .label {
					justify-content: flex-start;
					white-space: pre-line;
					height: 100%;
					overflow: hidden;
					text-overflow: clip;
				}

				/* Material Design 2 Switch */
				:host:has(.md2-switch),
				:host:has(.md3-switch) {
					justify-content: flex-end;
				}
				.md2-switch {
					justify-content: flex-start;
					flex-basis: auto;
					flex-shrink: 0;
					height: 14px;
					width: 36px;
					overflow: visible;
					margin: calc((var(--feature-height, 40px) - 14px) / 2) 12px;
					cursor: pointer;
					--ha-ripple-color: #aaa;
				}
				.md2-switch > .background {
					border-radius: 32px;
					opacity: 0.38;
					background: var(--switch-unchecked-track-color);
					transition:
						opacity 90ms cubic-bezier(0.4, 0, 0.2, 1),
						background-color 90ms cubic-bezier(0.4, 0, 0.2, 1),
						border-color 90ms cubic-bezier(0.4, 0, 0.2, 1);
				}
				.md2-switch.on > .background {
					background: var(--switch-checked-track-color);
					border-color: var(--switch-checked-track-color);
					opacity: 0.54;
				}
				.md2-switch > .thumb {
					background: 0 0;
					height: 40px;
					width: 40px;
					border-radius: 40px;
					left: -10px;
					transition:
						transform 90ms cubic-bezier(0.4, 0, 0.2, 1),
						background-color 90ms cubic-bezier(0.4, 0, 0.2, 1),
						border-color 90ms cubic-bezier(0.4, 0, 0.2, 1);
				}
				.md2-switch > .thumb::before {
					content: '';
					box-shadow:
						rgba(0, 0, 0, 0.2) 0px 3px 1px -2px,
						rgba(0, 0, 0, 0.14) 0px 2px 2px 0px,
						rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;
					box-sizing: border-box;
					position: absolute;
					height: 20px;
					width: 20px;
					border: 10px solid;
					border-radius: 50%;
					background: var(--switch-unchecked-button-color);
					border-color: var(--switch-unchecked-button-color);
				}
				.md2-switch.on > .thumb {
					transform: translateX(18px);
				}
				.md2-switch.on > .thumb::before {
					background: var(--switch-checked-button-color);
					border-color: var(--switch-checked-button-color);
				}

				/* Material Design 3 Switch */
				.md3-switch {
					justify-content: flex-start;
					flex-basis: auto;
					flex-shrink: 0;
					height: 28px;
					width: 48px;
					overflow: visible;
					margin: calc((var(--feature-height, 40px) - 32px) / 2) 6px;
					cursor: pointer;
					--thumb-size: 16px;
				}
				.md3-switch.on {
					--thumb-size: 24px;
				}
				.md3-switch:active {
					--thumb-size: 30px !important;
				}
				.md3-switch.on:active {
					--thumb-size: 28px !important;
				}
				.md3-switch > .background {
					border-radius: 52px;
					background: var(--switch-unchecked-track-color);
					border: 2px solid var(--switch-unchecked-button-color);
					opacity: 1;
					transition:
						opacity 90ms cubic-bezier(0.4, 0, 0.2, 1),
						background-color 90ms cubic-bezier(0.4, 0, 0.2, 1),
						border-color 90ms cubic-bezier(0.4, 0, 0.2, 1);
				}
				.md3-switch.on > .background {
					background: var(--switch-checked-track-color);
					border-color: var(--switch-checked-track-color);
				}
				.md3-switch > .thumb {
					background: 0 0;
					height: 40px;
					width: 40px;
					border-radius: 40px;
					left: -4px;
					transition:
						transform 90ms cubic-bezier(0.4, 0, 0.2, 1),
						background-color 90ms cubic-bezier(0.4, 0, 0.2, 1),
						border-color 90ms cubic-bezier(0.4, 0, 0.2, 1);
				}
				.md2-switch:has(.icon),
				.md3-switch:has(.icon) {
					--thumb-size: 24px;
					--mdc-icon-size: 16px;
					--icon-color: var(
						--switch-unchecked-icon-color,
						var(--input-background-color)
					);
				}
				.md2-switch.on:has(.icon),
				.md3-switch.on:has(.icon) {
					--icon-color: var(
						--switch-checked-icon-color,
						var(--input-background-color)
					);
				}
				.md3-switch > .thumb::before {
					content: '';
					box-sizing: border-box;
					position: absolute;
					height: var(--thumb-size);
					width: var(--thumb-size);
					border-radius: 50%;
					background: var(--switch-unchecked-button-color);
					transition:
						height 0.2s cubic-bezier(0.2, 0, 0, 1),
						width 0.2s cubic-bezier(0.2, 0, 0, 1);
				}
				.md3-switch.on > .thumb {
					transform: translateX(20px);
				}
				.md3-switch.on > .thumb::before {
					background: var(--switch-checked-button-color);
				}
				.md3-switch > .background::after {
					content: '';
					position: absolute;
					height: 32px;
					width: 52px;
					border-radius: 32px;
					pointer-events: none;
					top: -2px;
					left: -2px;
					z-index: 1;
					opacity: 0;
					background: var(
						--switch-unchecked-track-state-layer,
						var(--primary-text-color)
					);
					transition: opacity 0.1s cubic-bezier(0.4, 0, 1, 1) 0s;
				}
				.md3-switch.on:hover > .background::after {
					background: var(--switch-checked-track-color);
				}
				@media (hover: hover) {
					.md3-switch:hover > .background::after {
						opacity: 0.08;
					}
				}
				.md3-switch:focus-visible > .background::after,
				.md3-switch:active > .background::after {
					opacity: 0.1;
				}
				@media (hover: hover) {
					.md3-switch:hover > .thumb::before {
						background: var(
							--switch-unchecked-button-state-layer,
							var(--secondary-text-color)
						) !important;
					}
					.md3-switch.on:hover > .thumb::before {
						background: var(
							--switch-checked-button-state-layer,
							var(--accent-color)
						) !important;
					}
				}
				.md3-switch:focus-visible .thumb::before,
				.md3-switch:active .thumb::before {
					background: var(
						--switch-unchecked-button-state-layer,
						var(--secondary-text-color)
					) !important;
				}
				.md3-switch.on:focus-visible .thumb::before,
				.md3-switch.on:active .thumb::before {
					background: var(
						--switch-checked-button-state-layer,
						var(--accent-color)
					) !important;
				}
			`,
		];
	}
}
