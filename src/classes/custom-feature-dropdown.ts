import { css, CSSResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { IEntry, IOption } from '../models/interfaces';
import { BaseCustomFeature } from './base-custom-feature';

@customElement('custom-feature-dropdown')
export class CustomFeatureDropdown extends BaseCustomFeature {
	@state() showDropdown: boolean = false;

	onStart(e: MouseEvent | TouchEvent) {
		clearTimeout(this.renderRippleOff);
		clearTimeout(this.renderRippleOn);
		this.renderRipple = true;
		this.swiping = false;
		if ('targetTouches' in e) {
			this.initialX = e.targetTouches[0].clientX;
			this.initialY = e.targetTouches[0].clientY;
		} else {
			this.initialX = e.clientX;
			this.initialY = e.clientY;
		}
	}

	onMove(e: TouchEvent | MouseEvent) {
		let currentX: number;
		let currentY: number;
		if ('targetTouches' in e) {
			currentX = e.targetTouches[0].clientX;
			currentY = e.targetTouches[0].clientY;
		} else {
			currentX = e.clientX;
			currentY = e.clientY;
		}

		const diffX = (this.initialX ?? currentX) - currentX;
		const diffY = (this.initialY ?? currentY) - currentY;

		// Only consider significant enough movement
		const sensitivity = 8;
		if (Math.abs(Math.abs(diffX) - Math.abs(diffY)) > sensitivity) {
			this.endAction();
			this.swiping = true;
			this.toggleRipple();
		}
	}

	onEnd(_e: MouseEvent | TouchEvent) {
		if (!this.swiping) {
			this.showDropdown = !this.showDropdown;
			this.toggleRipple();
		}
	}

	handleCloseDropdown(e: Event) {
		const value = e.detail?.value;
		if (value != undefined) {
			clearTimeout(this.getValueFromHassTimer);
			this.getValueFromHass = false;
			this.value = value;
			this.resetGetValueFromHass();
		}
		this.showDropdown = false;
	}

	buildDropdownStyles() {
		const styles = `
		${
			this.rtl
				? `
		.down-arrow {
			right: unset !important;
			left: 10px !important;
		}
		`
				: ''
		}
		`;

		return html`<style>
			${styles}
		</style>`;
	}

	render() {
		this.setValue();

		// Dropdown position and height
		this.rtl = getComputedStyle(this).direction == 'rtl';
		if (this.showDropdown) {
			// Calculate dropdown height without vertical scroll
			let optionHeight = parseInt(
				this.style
					.getPropertyValue('--mdc-menu-item-height')
					.replace(/D/g, ''),
			);
			optionHeight = isNaN(optionHeight) ? 48 : optionHeight;
			const dropdownHeight0 =
				optionHeight * (this.config.options?.length ?? 0) + 16;

			// Determine dropdown direction
			const rect = this.getBoundingClientRect();
			const edgeOffset = 32;
			let down = true;
			if (
				// If dropdown is too large
				dropdownHeight0 >
					window.innerHeight - edgeOffset - rect.bottom &&
				// If dropdown is on lower half of window
				rect.top + rect.bottom > window.innerHeight
			) {
				down = false;
			}

			const dropdownElement = this.shadowRoot?.querySelector(
				'.dropdown',
			) as HTMLElement;
			dropdownElement.style.setProperty(
				'max-height',
				`${(down ? window.innerHeight - rect.bottom : rect.top) - edgeOffset - 16}px`,
			);
			this.rtl
				? dropdownElement.style.setProperty(
						'right',
						`${window.innerWidth - rect.right}px`,
					)
				: dropdownElement.style.setProperty('left', `${rect.left}px`);
			dropdownElement.style.setProperty(
				down ? 'top' : 'bottom',
				`${down ? rect.bottom : window.innerHeight - rect.top}px`,
			);
			dropdownElement.style.removeProperty(down ? 'bottom' : 'top');
		}

		const dropdownOptions = [];
		const options = this.config.options ?? [];
		let selectedOption: IEntry | undefined = undefined;
		for (const option of options) {
			const optionName = this.renderTemplate(option.option as string);
			if (
				this.value != undefined &&
				(this.value ?? '').toString() == (optionName ?? '').toString()
			) {
				selectedOption = option;
			}

			option.haptics = option.haptics ?? this.config.haptics;
			option.label =
				option.label || option.icon ? option.label : option.option;
			dropdownOptions.push(html`
				<custom-feature-dropdown-option
					.hass=${this.hass}
					.config=${option}
					.stateObj=${this.stateObj}
					id=${optionName}
				/>
			`);
		}
		const dropdown = html`<div
			class="dropdown ${this.showDropdown ? '' : 'collapsed'}"
			@close-dropdown=${this.handleCloseDropdown}
		>
			${dropdownOptions}
		</div>`;

		const select = html`<div class="container">
			${this.buildBackground()}
			<div
				class="select"
				@mousedown=${this.onMouseDown}
				@mouseup=${this.onMouseUp}
				@mousemove=${this.onMouseMove}
				@touchstart=${this.onTouchStart}
				@touchend=${this.onTouchEnd}
				@touchmove=${this.onTouchMove}
				@contextmenu=${this.onContextMenu}
			>
				${selectedOption
					? html`${this.buildIcon(selectedOption)}${this.buildLabel(
							selectedOption,
						)}${this.buildStyles(selectedOption)}`
					: ''}
				${this.buildRipple()}
			</div>
			<ha-icon class="down-arrow" .icon=${'mdi:menu-down'}></ha-icon>
		</div>`;

		return html`${select}${dropdown}${this.buildDropdownStyles()}${this.buildStyles()}`;
	}

	updated() {
		const options = this.config.options ?? [];
		const optionElements = Array.from(
			this.shadowRoot?.querySelector('.dropdown')?.children ?? [],
		);
		for (const i in options) {
			optionElements[i].className = `option ${
				this.value != undefined &&
				(this.value ?? '').toString() ==
					(
						this.renderTemplate(options[i].option as string) ?? ''
					).toString()
					? 'selected'
					: ''
			}`;
		}
	}

	handleExternalClick = (e: MouseEvent) => {
		if (typeof e.composedPath && !e.composedPath().includes(this)) {
			this.showDropdown = false;
		}
	};

	connectedCallback() {
		super.connectedCallback();
		document.body.addEventListener('click', this.handleExternalClick);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.body.removeEventListener('click', this.handleExternalClick);
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					overflow: visible;
					cursor: pointer;
					-webkit-tap-highlight-color: transparent;
					-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
					--md-ripple-hover-opacity: var(
						--ha-ripple-hover-opacity,
						0.08
					);
					--md-ripple-pressed-opacity: var(
						--ha-ripple-pressed-opacity,
						0.12
					);
					--ha-ripple-color: var(--secondary-text-color);
					--md-ripple-hover-color: var(
						--ha-ripple-hover-color,
						var(--ha-ripple-color, var(--secondary-text-color))
					);
					--md-ripple-pressed-color: var(
						--ha-ripple-pressed-color,
						var(--ha-ripple-color, var(--secondary-text-color))
					);
				}
				.background {
					pointer-events: none;
				}
				.select {
					display: flex;
					flex-direction: row;
					align-items: center;
					gap: 10px;
					padding: 0 10px;
					height: 100%;
					width: 100%;
					box-sizing: border-box;
				}
				.down-arrow {
					position: absolute;
					right: 10px;
					pointer-events: none;
				}
				.label {
					justify-content: flex-start;
					font: inherit;
					opacity: 0.88;
				}
				.dropdown {
					position: fixed;
					z-index: 9;
					color: var(--mdc-theme-on-surface);
					background: var(--mdc-theme-surface);
					border-radius: var(--mdc-shape-medium, 4px);
					padding: 8px 0;
					height: min-content;
					will-change: transform, opacity;
					overflow-y: scroll;
					transform: scale(1);
					opacity: 1;
					transition:
						opacity 0.03s linear,
						transform 0.12s cubic-bezier(0, 0, 0.2, 1),
						height 250ms cubic-bezier(0, 0, 0.2, 1);
					box-shadow:
						0px 5px 5px -3px rgba(0, 0, 0, 0.2),
						0px 8px 10px 1px rgba(0, 0, 0, 0.14),
						0px 3px 14px 2px rgba(0, 0, 0, 0.12);
				}
				.collapsed {
					height: 0;
					opacity: 0;
					transform: scale(0);
				}
				.option {
					min-width: 100px;
					--md-ripple-pressed-opacity: 0.2;
				}
				.selected {
					color: var(--mdc-theme-primary, #6200ee);
					--ha-ripple-color: var(--mdc-theme-primary, #6200ee);
					--mdc-ripple-hover-color: var(--ha-ripple-color);
					--md-ripple-pressed-color: var(--ha-ripple-color);
					--background: var(--ha-ripple-color);
					--background-opacity: 0.26;
					--md-ripple-hover-opacity: 0;
					--md-ripple-pressed-opacity: 0.26;
				}
			`,
		];
	}
}

@customElement('custom-feature-dropdown-option')
export class CustomFeatureDropdownOption extends BaseCustomFeature {
	@property() config!: IOption;

	onStart(e: MouseEvent | TouchEvent) {
		clearTimeout(this.renderRippleOff);
		clearTimeout(this.renderRippleOn);
		this.renderRipple = true;
		this.swiping = false;
		if ('targetTouches' in e) {
			this.initialX = e.targetTouches[0].clientX;
			this.initialY = e.targetTouches[0].clientY;
		} else {
			this.initialX = e.clientX;
			this.initialY = e.clientY;
		}
		this.fireHapticEvent('light');
	}

	onEnd(_e: MouseEvent | TouchEvent) {
		if (!this.swiping) {
			this.toggleRipple();
			this.closeDropdown(
				this.renderTemplate(this.config.option as string) as string,
			);
			this.sendAction('tap_action');
			this.endAction();
		}
	}

	onMove(e: TouchEvent | MouseEvent) {
		let currentX: number;
		let currentY: number;
		if ('targetTouches' in e) {
			currentX = e.targetTouches[0].clientX;
			currentY = e.targetTouches[0].clientY;
		} else {
			currentX = e.clientX;
			currentY = e.clientY;
		}

		const diffX = (this.initialX ?? currentX) - currentX;
		const diffY = (this.initialY ?? currentY) - currentY;

		// Only consider significant enough movement
		const sensitivity = 8;
		if (Math.abs(Math.abs(diffX) - Math.abs(diffY)) > sensitivity) {
			this.endAction();
			this.swiping = true;
			this.toggleRipple();
		}
	}

	onTouchEnd(e: TouchEvent) {
		e.preventDefault();
		super.onTouchEnd(e);
	}

	onMouseLeave(_e: MouseEvent) {
		this.endAction();
		this.swiping = true;
		this.toggleRipple();
	}

	onTouchCancel(_e: TouchEvent) {
		this.toggleRipple();
		this.closeDropdown();
	}

	closeDropdown(value?: string) {
		const event = new Event('close-dropdown', {
			composed: true,
			bubbles: true,
		});
		event.detail = {
			value,
		};
		this.dispatchEvent(event);
	}

	render() {
		this.setValue();

		return html`${this.buildBackground()}
			<div
				class="content"
				@mousedown=${this.onMouseDown}
				@mouseup=${this.onMouseUp}
				@mousemove=${this.onMouseMove}
				@mouseleave=${this.onMouseLeave}
				@touchstart=${this.onTouchStart}
				@touchend=${this.onTouchEnd}
				@touchmove=${this.onTouchMove}
				@touchcancel=${this.onTouchCancel}
				@contextmenu=${this.onContextMenu}
			>
				${this.buildIcon()}${this.buildLabel()}${this.buildRipple()}
			</div>
			${this.buildStyles()}`;
	}

	static get styles() {
		return [
			super.styles as CSSResult,
			css`
				:host {
					height: var(--mdc-menu-item-height, 48px);
					width: 100%;
					overflow: visible;
					--color: rgb(0, 0, 0, 0);
				}
				.background {
					pointer-events: none;
				}
				.label {
					justify-content: flex-start;
					font: inherit;
				}
				.icon {
					color: var(
						--mdc-theme-text-icon-on-background,
						rgba(0, 0, 0, 0.38)
					);
				}
				.content {
					display: flex;
					flex-direction: row;
					align-items: center;
					padding-left: var(
						--mdc-list-side-padding-left,
						var(--mdc-list-side-padding, 20px)
					);
					padding-right: var(
						--mdc-list-side-padding-right,
						var(--mdc-list-side-padding, 20px)
					);
					gap: var(--mdc-list-item-graphic-margin, 24px);
					height: 100%;
					width: 100%;
					box-sizing: border-box;
				}
			`,
		];
	}
}
