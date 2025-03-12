import { css, CSSResult, html, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ToggleThumbType } from '../models/interfaces';
import { BaseCustomFeature } from './base-custom-feature';

@customElement('custom-feature-toggle')
export class CustomFeatureToggle extends BaseCustomFeature {
	@state() checked: boolean = false;
	direction?: 'left' | 'right';

	async onPointerUp(_e: PointerEvent) {
		if (!this.swiping) {
			if (this.direction) {
				// TODO rtl fix?
				// Only fire on swipe if it's in the right direction
				const checked = this.direction == 'right';
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
			this.toggleRipple();
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
			this.toggleRipple();
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
			this.checked =
				['true', 'yes', 'on', 'enable', '1'].includes(
					String(this.value).toLowerCase(),
				) || Number(this.value) > 0;
		}
	}

	buildMD3Switch() {
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
					${this.buildIcon(this.config.thumb_icon)}
				</div>
			</div>
		`;
	}

	buildMD2Switch() {
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
						this.config.thumb_icon,
					)}${this.buildRipple()}
				</div>
			</div>
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
					${this.buildIcon(this.config.thumb_icon)}
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
				<div class="thumb">
					${this.buildIcon(this.config.icon)}${this.buildLabel(
						this.config.label,
					)}
				</div>
			</div>
		`;
	}

	render() {
		this.setValue();

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

	updated() {
		// md3-switch fix for themes that don't set different button and track colors
		if (
			this.renderTemplate(this.config.thumb ?? 'default') == 'md3-switch'
		) {
			try {
				const background = this.shadowRoot?.querySelector(
					'.background',
				) as HTMLElement;
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
					const opacity = this.checked ? '0.54' : '0.38';
					background?.style.setProperty(
						'--background-opacity',
						opacity,
					);
				} else {
					background?.style.removeProperty('--background-opacity');
				}
			} catch (e) {
				console.error(e);
			}
		}
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			super.styles as CSSResult,
			css`
				/* Default toggle */
				:host {
					display: block;
					touch-action: pan-y;
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
				:host:has(.checkbox) {
					display: flex;
					flex-direction: row;
					--mdc-icon-size: 18px;
					--ha-ripple-color: var(
						--mdc-checkbox-unchecked-color,
						#aaa
					);
				}
				:host:has(.on > .checkbox) {
					--ha-ripple-color: var(
						--mdc-checkbox-checked-color,
						#018786
					);
				}
				.container:has(.checkbox) {
					height: var(--mdc-checkbox-touch-target-size, 40px);
					width: var(--mdc-checkbox-touch-target-size, 40px);
					border-radius: var(--mdc-checkbox-touch-target-size, 40px);
					flex-basis: auto;
					flex-shrink: 0;
					background: 0 0;
				}
				.checkbox {
					height: 18px;
					width: 18px;
					border-radius: 2px;
					border: solid 2px;
					background: transparent;
					border-color: var(
						--mdc-checkbox-unchecked-color,
						rgba(0, 0, 0, 0.54)
					);
					cursor: pointer;
				}
				.on > .checkbox {
					background: var(
						--mdc-checkbox-checked-color,
						var(--mdc-theme-secondary, #018786)
					);
					border-color: var(
						--mdc-checkbox-checked-color,
						var(--mdc-theme-secondary, #018786)
					);
					--icon-color: var(--mdc-checkbox-ink-color, #fff);
				}
				.off > .checkbox > .icon {
					visibility: hidden;
				}
				.icon-label {
					display: flex;
					flex-direction: row;
					align-items: center;
					gap: 10px;
					height: 100%;
					width: 100%;
				}
				.icon-label:empty {
					display: none;
				}
				.icon-label > .label {
					justify-content: flex-start;
					white-space: pre-line;
				}

				/* Material Design 2 Switch */
				:host:has(.md2-switch),
				:host:has(.md3-switch) {
					display: flex;
					flex-direction: row;
					justify-content: flex-end;
					--ha-ripple-color: #aaa;
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
					position: absolute;
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
					transition:
						opacity 90ms cubic-bezier(0.4, 0, 0.2, 1),
						background-color 90ms cubic-bezier(0.4, 0, 0.2, 1),
						border-color 90ms cubic-bezier(0.4, 0, 0.2, 1);
					--background-opacity: 1;
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
					position: absolute;
					transition:
						transform 90ms cubic-bezier(0.4, 0, 0.2, 1),
						background-color 90ms cubic-bezier(0.4, 0, 0.2, 1),
						border-color 90ms cubic-bezier(0.4, 0, 0.2, 1);
					--mdc-icon-size: 18px;
				}
				.md2-switch:has(.icon),
				.md3-switch:has(.icon) {
					--thumb-size: 24px;
					--icon-color: var(
						--switch-unchecked-icon-color,
						var(--input-background-color)
					);
				}
				.md2-switch.on:has(.icon),
				.md3-switch.on:has(.icon) {
					--icon-color: var(
						--switch-checked-icon-color,
						var(--accent-color)
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
			`,
		];
	}
}
