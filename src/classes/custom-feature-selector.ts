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
					class="option"
					id=${this.renderTemplate(option.option as string)}
					@pointerdown=${this.onPointerDown}
					@pointerup=${this.onPointerUp}
					@pointermove=${this.onPointerMove}
					@pointercancel=${this.onPointerCancel}
					@pointerleave=${this.onPointerLeave}
					@contextmenu=${this.onContextMenu}
					@keydown=${this.optionOnKeyDown}
				/>`,
			);
		}

		return html`${selector}${this.buildStyles(this.config.styles)}`;
	}

	async onKeyDown(_e: KeyboardEvent) {}
	async onKeyUp(_e: KeyboardEvent) {}
	async optionOnKeyDown(e: KeyboardEvent) {
		if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
			e.preventDefault();
			const direction = e.key == 'ArrowLeft' ? 'previous' : 'next';
			let target = (e.currentTarget as HTMLElement)?.[
				`${direction}ElementSibling`
			] as HTMLElement | null;
			if (!target?.className?.includes('option')) {
				const optionElements =
					this.shadowRoot?.querySelectorAll('.option');
				if (optionElements) {
					target = optionElements[
						e.key == 'ArrowLeft' ? optionElements.length - 1 : 0
					] as HTMLElement;
				}
			}
			target?.focus();
		}
	}

	onFocus(_e: FocusEvent) {
		const options = this.config.options ?? [];
		const optionElements = this.shadowRoot?.querySelectorAll(
			'.option',
		) as unknown as HTMLElement[];
		for (const i in options) {
			const selected =
				String(this.value) ==
				String(this.renderTemplate(options[i].option as string));
			if (selected) {
				optionElements[i].focus();
			}
		}
	}

	firstUpdated() {
		super.firstUpdated();
		this.removeAttribute('tabindex');
		this.addEventListener('focus', this.onFocus);
	}

	updated() {
		const options = this.config.options ?? [];
		const optionElements = this.shadowRoot?.querySelectorAll(
			'.option',
		) as unknown as HTMLElement[];
		for (const i in options) {
			const selected =
				String(this.value) ==
				String(this.renderTemplate(options[i].option as string));
			optionElements[i].className = `${
				selected ? 'selected' : ''
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
				:host(:focus-within) {
					box-shadow: 0 0 0 2px var(--feature-color);
				}

				.option {
					--opacity: 0;
					--background-opacity: 0;
				}
				.option:focus-visible {
					box-shadow: none;
					--opacity: 0.2;
				}

				.selected {
					--opacity: 1;
					--background-opacity: 1;
					--hover-opacity: 1;
				}
				.selected:focus-visible {
					--opacity: 1;
				}
			`,
		];
	}
}
