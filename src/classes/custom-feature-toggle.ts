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
		return html``;
	}

	buildMD2Switch() {
		return html``;
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
				<div class="checkbox">${this.buildIcon()}</div>
				${this.buildRipple()}
			</div>
			${this.buildLabel()}
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
				<div class="thumb">${this.buildIcon()}${this.buildLabel()}</div>
			</div>
		`;
	}

	render() {
		this.setValue();

		let toggle: TemplateResult<1>;
		switch (this.renderTemplate(this.config.thumb as ToggleThumbType)) {
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

		return html`${toggle}${this.buildStyles()} `;
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			super.styles as CSSResult,
			css`
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
				.on > .thumb {
					transform: translateX(100%);
				}

				:host:has(.checkbox) {
					display: flex;
					flex-direction: row;
					--mdc-icon-size: 18px;
					--icon-color: var(--mdc-checkbox-ink-color, #fff);
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
				}
				.off > .checkbox > .icon {
					visibility: hidden;
				}
			`,
		];
	}
}
