import { css, CSSResult, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseCustomFeature } from './base-custom-feature';
import './custom-feature-button';

@customElement('custom-feature-selector')
export class CustomFeatureSelector extends BaseCustomFeature {
	onConfirmationResult(result: boolean) {
		const options = (this.shadowRoot?.querySelectorAll('.option') ??
			[]) as BaseCustomFeature[];
		for (const option of options) {
			option.onConfirmationResult(result);
		}
	}

	onPointerUp(e: PointerEvent) {
		if (!this.swiping && this.initialX && this.initialY) {
			clearTimeout(this.getValueFromHassTimer);
			this.getValueFromHass = false;
			this.value = (e.currentTarget as HTMLElement).id;
			this.resetGetValueFromHass();
			this.endAction();
		}
	}

	render() {
		this.setValue();

		const selector = [this.buildBackground()];
		const options = this.config.options ?? [];
		for (const option of options) {
			option.haptics = option.haptics ?? this.config.haptics;
			selector.push(
				html`<custom-feature-button
					.hass=${this.hass}
					.config=${option}
					.shouldRenderRipple=${false}
					id=${this.renderTemplate(option.option as string)}
					@pointerdown=${this.onPointerDown}
					@pointerup=${this.onPointerUp}
					@pointermove=${this.onPointerMove}
					@pointercancel=${this.onPointerCancel}
					@pointerleave=${this.onPointerLeave}
					@contextmenu=${this.onContextMenu}
				/>`,
			);
		}

		return html`${selector}${this.buildStyles(this.config.styles)}`;
	}

	updated() {
		const options = this.config.options ?? [];
		const optionElements = Array.from(
			this.shadowRoot?.children ?? [],
		).slice(1);
		for (const i in options) {
			optionElements[i].className = `${
				String(this.value) ==
				String(this.renderTemplate(options[i].option as string))
					? 'selected'
					: ''
			} option`;
		}
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					flex-flow: row;

					--color: var(--feature-color);
					--background: var(--disabled-color);
					--hover-opacity: 0.2;
				}

				.option {
					--opacity: 0;
					--background-opacity: 0;
				}

				.selected {
					--opacity: 1;
					--background-opacity: 1;
					--hover-opacity: 1;
				}
			`,
		];
	}
}
