import { css, CSSResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { IDialog } from '../../models/interfaces';
import { BaseDialog } from './base-dialog';

@customElement('custom-feature-confirmation-dialog')
export class ConfirmationDialog extends BaseDialog {
	@property() config!: IDialog;

	closeDialog() {
		this.dispatchEvent(
			new Event('dialog-close', {
				composed: true,
				bubbles: true,
			}),
		);
	}

	onCancel() {
		this.fireConfirmationEvent(false);
	}

	onOk() {
		this.fireConfirmationEvent(true);
	}

	fireConfirmationEvent(result: boolean) {
		const event = new Event('confirmation-result', {
			bubbles: true,
			composed: true,
		});
		event.detail = result;

		const row = (
			this.getRootNode() as ShadowRoot
		).host.getRootNode() as ShadowRoot;
		let targets: Element[] = [];

		// TODO clean up this querying with classes on children, parents, and childless

		// No children
		targets.push(
			...Array.from(
				row.querySelectorAll(
					'custom-feature-button, custom-feature-slider',
				),
			),
		);

		// Selector and spinbox buttons
		const featureWithChildren =
			row.querySelectorAll(
				'custom-feature-selector, custom-feature-spinbox',
			) ?? [];
		for (const feature of featureWithChildren) {
			const subfeatures =
				feature.shadowRoot?.querySelectorAll(
					'custom-feature-button, custom-feature-spinbox-operator',
				) ?? [];
			targets.push(...Array.from(subfeatures));
		}

		// Dropdown options
		const dropdowns = row.querySelectorAll('custom-feature-dropdown') ?? [];
		for (const dropdown of dropdowns) {
			const options =
				dropdown.shadowRoot?.querySelector('.dropdown')?.children ?? [];
			targets.push(...Array.from(options));
		}

		for (const target of targets) {
			(target as HTMLElement).dispatchEvent(event);
		}

		this.closeDialog();
	}

	render() {
		return html`
			<div class="title">
				${this.hass.localize(
					'ui.dialogs.generic.default_confirmation_title',
				)}
			</div>
			<div class="message">${this.config.text}</div>
			<div class="buttons">
				${this.buildDialogButton(
					this.hass.localize('ui.dialogs.generic.cancel'),
					this.onCancel,
				)}
				${this.buildDialogButton(
					this.hass.localize('ui.dialogs.generic.ok'),
					this.onOk,
				)}
			</div>
		`;
	}

	static get styles(): CSSResult | CSSResult[] {
		return [
			super.styles as CSSResult,
			css`
				.title {
					font-size: 1.5em;
					font-weight: 400;
				}
				.message {
					font-size: 1rem;
					font-weight: var(
						--md-dialog-supporting-text-weight,
						var(
							--md-sys-typescale-body-medium-weight,
							var(--md-ref-typeface-weight-regular, 400)
						)
					);
					line-height: 1.5rem;
					padding: var(--dialog-content-padding, 24px) 0;
					padding-bottom: 8px;
					box-sizing: border-box;
				}
				.buttons {
					justify-content: flex-end;
					padding-top: 16px;
				}
			`,
		];
	}
}
