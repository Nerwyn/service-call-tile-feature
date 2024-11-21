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

	render() {
		this.setValue();

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
			option.label = option.label ?? option.option;
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

		return html`${select}${dropdown}${this.buildStyles()}`;
	}

	updated() {
		const options = this.config.options ?? [];
		const optionElements = Array.from(
			this.shadowRoot?.querySelector('.dropdown')?.children ?? [],
		);
		for (const i in options) {
			const optionName = this.renderTemplate(options[i].option as string);
			let optionClass = 'option';
			if (
				this.value != undefined &&
				(this.value ?? '').toString() == (optionName ?? '').toString()
			) {
				optionClass = 'selected-option';
			}

			optionElements[i].className = optionClass;
		}

		// Dropdown position and height
		const dropdown = this.shadowRoot?.querySelector(
			'.dropdown',
		) as HTMLElement;
		if (this.showDropdown) {
			const rect = this.getBoundingClientRect();
			const edgeOffset = 48;
			const height0 = dropdown.offsetHeight;

			let down = true;
			if (
				// If dropdown is too large
				height0 > window.innerHeight - edgeOffset - rect.bottom &&
				// If dropdown is on lower half of window
				rect.top + rect.bottom < window.innerHeight
			) {
				down = false;
			}

			dropdown.style.setProperty('left', `${rect.left}px`);
			dropdown.style.setProperty(
				down ? 'top' : 'bottom',
				`${down ? rect.bottom : rect.top}px`,
			);
			dropdown.style.setProperty(
				'max-height',
				`${window.innerHeight - rect.bottom - edgeOffset}px`,
			);
		} else {
			dropdown.style.removeProperty('left');
			dropdown.style.removeProperty('top');
			dropdown.style.removeProperty('bottom');
			dropdown.style.removeProperty('max-height');
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
					width: -webkit-fill-available;
					width: -moz-available;
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
					top: var(--feature-height, 42px);
					position: fixed;
					overflow-y: scroll;
					z-index: 9;
					color: var(--mdc-theme-on-surface);
					background: var(--mdc-theme-surface);
					border-radius: var(--mdc-shape-medium, 4px);
					padding: 8px 0;
					max-height: 100vh;
					will-change: transform, opacity;
					transform: scale(1);
					opacity: 1;
					transition:
						opacity 0.03s linear,
						transform 0.12s cubic-bezier(0, 0, 0.2, 1),
						max-height 250ms cubic-bezier(0, 0, 0.2, 1);
					box-shadow:
						0px 5px 5px -3px rgba(0, 0, 0, 0.2),
						0px 8px 10px 1px rgba(0, 0, 0, 0.14),
						0px 3px 14px 2px rgba(0, 0, 0, 0.12);
				}
				.collapsed {
					max-height: 0;
					opacity: 0;
					transform: scale(0);
				}
				.selected-option {
					color: var(--mdc-theme-primary, #6200ee);
					--ha-ripple-color: var(--mdc-theme-primary, #6200ee);
					--mdc-ripple-hover-color: var(--ha-ripple-color);
					--md-ripple-pressed-color: var(--ha-ripple-color);
					--background: var(--ha-ripple-color);
					--background-opacity: 0.12;
					--md-ripple-hover-opacity: 0.14;
					--md-ripple-pressed-opacity: 0.26;
				}
				.option {
					--md-ripple-pressed-opacity: 0.2;
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
			this.sendAction('tap_action');
			this.endAction();
			this.closeDropdown(
				this.renderTemplate(this.config.option as string) as string,
			);
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
				class="option"
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
					font: inherit;
				}
				.icon {
					color: var(
						--mdc-theme-text-icon-on-background,
						rgba(0, 0, 0, 0.38)
					);
				}
				.option {
					display: flex;
					flex-direction: row;
					align-items: center;
					min-width: 100px;
					padding: 0 20px;
					gap: 24px;
					height: 100%;
				}
			`,
		];
	}
}
