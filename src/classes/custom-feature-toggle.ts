import { css, CSSResult, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
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

	renderTemplate(str: string, context: object) {
		context = {
			...context,
			checked: this.checked,
		};
		return super.renderTemplate(str, context);
	}

	render() {
		this.setValue();
		if (this.getValueFromHass) {
			this.checked =
				['true', 'yes', 'on', 'enable', '1'].includes(
					String(this.value).toLowerCase(),
				) || Number(this.value) > 0;
		}

		// TODO thumb variations
		return html`
			<div class="background"></div>
			<div class="thumb ${this.checked ? 'checked' : ''}">
				${this.buildIcon()}${this.buildLabel()}
			</div>
			${this.buildStyles()}
		`;
	}

	firstUpdated() {
		super.firstUpdated();
		this.addEventListener('pointerdown', this.onPointerDown);
		this.addEventListener('pointerup', this.onPointerUp);
		this.addEventListener('pointermove', this.onPointerMove);
		this.addEventListener('pointercancel', this.onPointerCancel);
		this.addEventListener('pointerleave', this.onPointerLeave);
		this.addEventListener('contextmenu', this.onContextMenu);
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			super.styles as CSSResult,
			css`
				:host {
					display: block;
					touch-action: pan-y;
					--color: var(--feature-color);
				}

				.thumb {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					height: 100%;
					width: 50%;
					background: var(--color, var(--state-inactive-color));
					opacity: var(--opacity, 1);
					border-radius: var(--feature-border-radius, 12px);
					transition:
						transform 180ms ease-in-out,
						background-color 180ms ease-in-out;
				}

				.checked {
					transform: translateX(100%);
				}
			`,
		];
	}
}
