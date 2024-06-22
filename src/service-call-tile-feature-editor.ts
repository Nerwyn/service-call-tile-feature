import { LitElement, TemplateResult, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';

import { dump, load } from 'js-yaml';

import {
	IConfig,
	IEntry,
	TileFeatureType,
	TileFeatureTypes,
	Actions,
} from './models/interfaces';

export class ServiceCallTileFeatureEditor extends LitElement {
	@property() hass!: HomeAssistant;
	@property() config!: IConfig;

	@state() entryEditorIndex: number = -1;
	@state() selectedActionsTabIndex: number = 0;

	@state() guiMode: boolean = true;
	@state() errors?: string[];
	@state() warnings?: string[];
	@state() entryYaml?: string;
	@state() styleYaml: Record<string, string> = {
		outer: '',
		background: '',
		icon: '',
		label: '',
		slider: '',
		tooltip: '',
	};

	static get properties() {
		return { hass: {}, config: {} };
	}

	setConfig(config: IConfig) {
		this.config = config;
	}

	entriesChanged(entries: IEntry[]) {
		const event = new Event('config-changed', {
			bubbles: true,
			composed: true,
		});
		event.detail = {
			config: {
				...this.config,
				entries: entries,
			},
		};
		this.dispatchEvent(event);
		this.requestUpdate();
	}

	entryChanged(entry: IEntry) {
		const entries = this.config.entries.concat();
		const updatedEntry = {
			...entries[this.entryEditorIndex],
			...entry,
		};
		entries[this.entryEditorIndex] = updatedEntry;
		this.entriesChanged(entries);
	}

	moveEntry(e: CustomEvent) {
		e.stopPropagation();
		const { oldIndex, newIndex } = e.detail;
		const entries = this.config.entries.concat();
		entries.splice(newIndex, 0, entries.splice(oldIndex, 1)[0]);
		this.entriesChanged(entries);
	}

	editEntry(e: CustomEvent) {
		const i = (
			e.currentTarget as unknown as CustomEvent & Record<'index', number>
		).index;
		this.entryEditorIndex = i;
	}

	removeEntry(e: CustomEvent) {
		const i = (
			e.currentTarget as unknown as CustomEvent & Record<'index', number>
		).index;
		const entries = this.config.entries.concat();
		entries.splice(i, 1);
		this.entriesChanged(entries);
	}

	addEntry(e: CustomEvent) {
		const i = e.detail.index as number;
		const entries = this.config.entries.concat();
		entries.push({
			type: TileFeatureTypes[i],
		});
		this.entriesChanged(entries);
	}

	exitEditEntry(_e: CustomEvent) {
		this.entryEditorIndex = -1;
		this.entryYaml = undefined;
	}

	toggleMode(_e: CustomEvent) {
		this.entryYaml = undefined;
		this.guiMode = !this.guiMode;
	}

	get yaml(): string {
		if (!this.entryYaml) {
			this.entryYaml = dump(this.config.entries[this.entryEditorIndex]);
		}
		return this.entryYaml || '';
	}

	set yaml(yaml: string) {
		this.entryYaml = yaml;
		const entries = this.config.entries.concat();
		try {
			entries[this.entryEditorIndex] = load(this.yaml) as IEntry;
			this.errors = undefined;
		} catch (e) {
			this.errors = [(e as Error).message];
		}
		this.entriesChanged(entries);
	}

	handleEntryYAMLChanged(e: CustomEvent) {
		e.stopPropagation();
		const yaml = e.detail.value;
		if (yaml != this.yaml) {
			this.yaml = yaml;
		}
	}

	handleTextChange(e: CustomEvent) {
		const key = (e.target as HTMLElement).id;
		const value = e.detail.value;
		this.entryChanged({
			[key]: value,
		});
	}

	handleActionsTabSelected(e: CustomEvent) {
		const i = e.detail.index;
		if (this.selectedActionsTabIndex == i) {
			return;
		}
		this.selectedActionsTabIndex = i;
	}

	buildEntryListItem(entry: IEntry, i: number) {
		return html`
			<div class="feature">
				<div class="handle">
					<ha-icon .icon="${'mdi:drag'}"></ha-icon>
				</div>
				<div class="feature-content">
					<div>
						<span>${entry.type ?? 'Button'}</span>
					</div>
				</div>
				<ha-icon-button
					class="edit-icon"
					.index=${i}
					@click=${this.editEntry}
				>
					<ha-icon .icon="${'mdi:pencil'}"></ha-icon>
				</ha-icon-button>
				<ha-icon-button
					class="remove-icon"
					.index=${i}
					@click=${this.removeEntry}
				>
					<ha-icon .icon="${'mdi:delete'}"></ha-icon>
				</ha-icon-button>
			</div>
		`;
	}

	buildAddEntryListItem(tileFeatureType: TileFeatureType) {
		return html`
			<ha-list-item .value=${tileFeatureType}>
				${tileFeatureType}
			</ha-list-item>
		`;
	}

	buildEntryList() {
		return html`
			<div class="content">
				<ha-sortable
					handle-selector=".handle"
					@item-moved=${this.moveEntry}
				>
					<div class="features">
						${this.config.entries.map((entry, i) =>
							this.buildEntryListItem(entry, i),
						)}
					</div>
				</ha-sortable>
				<ha-button-menu
					fixed
					@action=${this.addEntry}
					@closed=${(e: CustomEvent) => e.stopPropagation()}
				>
					<ha-button
						slot="trigger"
						outlined
						.label="${'ADD CUSTOM FEATURE'}"
					>
						<ha-icon .icon=${'mdi:plus'} slot="icon"></ha-icon>
					</ha-button>
					${TileFeatureTypes.map((tileFeatureType) =>
						this.buildAddEntryListItem(tileFeatureType),
					)}
				</ha-button-menu>
			</div>
		`;
	}

	buildEntryHeader(entry: IEntry) {
		return html`
			<div class="header">
				<div class="back-title">
					<ha-icon-button-prev
						.label=${this.hass.localize('ui.common.back')}
						@click=${this.exitEditEntry}
					></ha-icon-button-prev>
					<span slot="title"> ${entry.type ?? 'Button'} </span>
				</div>
				<ha-icon-button
					class="gui-mode-button"
					@click=${this.toggleMode}
					.label=${this.hass.localize(
						this.guiMode
							? 'ui.panel.lovelace.editor.edit_card.show_code_editor'
							: 'ui.panel.lovelace.editor.edit_card.show_visual_editor',
					)}
				>
					<ha-icon
						.icon="${this.guiMode
							? 'mdi:code-braces'
							: 'mdi:list-box-outline'}"
					></ha-icon>
				</ha-icon-button>
			</div>
		`;
	}

	buildSelector(
		entry: IEntry,
		label: string,
		key: keyof IEntry,
		selector: object,
	) {
		const hass = this.hass;
		hass.localize = (key, values, checkCustomActions = true) => {
			const customActions: Record<string, string> = {
				'ui.panel.lovelace.editor.action-editor.actions.repeat':
					'Repeat',
				'ui.panel.lovelace.editor.action-editor.actions.fire-dom-event':
					'Fire DOM Event',
			};
			if (
				checkCustomActions &&
				Object.keys(customActions).includes(key)
			) {
				return customActions[key];
			}
			return this.hass.localize(key, values, false);
		};

		return html` <ha-selector
			.hass=${hass}
			.selector=${selector}
			.value=${entry[key] ?? ''}
			.label="${label}"
			.name="${label}"
			.required=${false}
			id="${key}"
			@value-changed=${this.handleTextChange}
		></ha-selector>`;
	}

	buildButtonGuiEditor(entry: IEntry) {
		let actionSelectors: TemplateResult<1>;
		const actionsNoRepeat = Actions.concat();
		actionsNoRepeat.splice(Actions.indexOf('repeat'), 1);
		const defaultUiActions = {
			ui_action: {
				actions: actionsNoRepeat,
				default_action: 'none',
			},
		};

		switch (this.selectedActionsTabIndex) {
			case 1:
				actionSelectors = html`
					${this.buildSelector(
						entry,
						'Start action (optional)',
						'momentary_start_action',
						defaultUiActions,
					)}
					${this.buildSelector(
						entry,
						'End action (optional)',
						'momentary_end_action',
						defaultUiActions,
					)}
				`;
				break;
			case 0:
			default:
				actionSelectors = html`
					${this.buildSelector(
						entry,
						'Tap action (optional)',
						'tap_action',
						defaultUiActions,
					)}
					${this.buildSelector(
						entry,
						'Double tap action (optional)',
						'double_tap_action',
						defaultUiActions,
					)}
					${this.buildSelector(
						entry,
						'Hold action (optional)',
						'hold_action',
						{
							ui_action: {
								actions: Actions,
								default_action: 'none',
							},
						},
					)}
				`;
				break;
		}

		return html`<div class="gui-editor">
			${this.buildSelector(entry, 'Entity', 'entity_id', {
				entity: {},
			})}
			${this.buildSelector(entry, 'Attribute', 'value_attribute', {
				attribute: { entity_id: entry.entity_id ?? undefined },
			})}
			<ha-expansion-panel .header=${'Appearance'}>
				<div
					class="panel-header"
					slot="header"
					role="heading"
					aria-level="3"
				>
					<ha-icon .icon=${'mdi:palette'}></ha-icon>
					Appearance
				</div>
				<div class="content">
					${this.buildSelector(entry, 'Label', 'label', {
						text: { multiline: true },
					})}
					<div class="form">
						${this.buildSelector(entry, 'Icon', 'icon', {
							icon: {},
						})}${this.buildSelector(
							entry,
							'Units',
							'unit_of_measurement',
							{
								text: {},
							},
						)}
					</div>
				</div>
			</ha-expansion-panel>
			<ha-expansion-panel .header=${'Actions'}>
				<div
					class="panel-header"
					slot="header"
					role="heading"
					aria-level="3"
				>
					<ha-icon .icon=${'mdi:gesture-tap'}></ha-icon>
					Actions
				</div>
				<div class="content">
					<mwc-tab-bar
						class="tab-selector"
						.activeIndex=${this.selectedActionsTabIndex}
						@MDCTabBar:activated=${this.handleActionsTabSelected}
					>
						<mwc-tab
							.label=${'default'}
							dialogInitialFocus
						></mwc-tab>
						<mwc-tab .label=${'momentary'}></mwc-tab>
					</mwc-tab-bar>
					${actionSelectors}
				</div>
			</ha-expansion-panel>
		</div>`;
	}

	buildEntryYamlEditor() {
		return html`
			<div class="yaml-editor">
				<ha-code-editor
					mode="yaml"
					autofocus
					autocomplete-entities
					autocomplete-icons
					.hass=${this.hass}
					.value=${this.yaml}
					.error=${Boolean(this.errors)}
					@value-changed=${this.handleEntryYAMLChanged}
					@keydown=${(e: CustomEvent) => e.stopPropagation()}
					dir="ltr"
				></ha-code-editor>
			</div>
		`;
	}

	buildEntryEditor() {
		const entry = this.config.entries[this.entryEditorIndex];

		let entryGuiEditor: TemplateResult<1>;
		switch (entry.type) {
			case 'slider':
			case 'selector':
			case 'spinbox':
			case 'button':
			default:
				entryGuiEditor = this.buildButtonGuiEditor(entry);
		}
		return html`
			${this.buildEntryHeader(entry)}
			<div class="wrapper">
				${this.guiMode ? entryGuiEditor : this.buildEntryYamlEditor()}
				${this.errors && this.errors.length > 0
					? html`<div class="error">
							${this.hass.localize(
								'ui.errors.config.error_detected',
							)}:
							<br />
							<ul>
								${this.errors!.map(
									(error) => html`<li>${error}</li>`,
								)}
							</ul>
					  </div>`
					: html``}
				${this.warnings && this.warnings.length > 0
					? html` <ha-alert
							alert-type="warning"
							.title="${this.hass.localize(
								'ui.errors.config.editor_not_supported',
							)}:"
					  >
							<ul>
								${this.warnings!.map(
									(warning) => html`<li>${warning}</li>`,
								)}
							</ul>
							${this.hass.localize(
								'ui.errors.config.edit_in_yaml_supported',
							)}
					  </ha-alert>`
					: html``}
			</div>
		`;
	}

	render() {
		if (!this.hass) {
			return html``;
		}

		if (this.entryEditorIndex >= 0) {
			return this.buildEntryEditor();
		}

		return this.buildEntryList();
	}

	static get styles() {
		return css`
			:host {
				display: flex !important;
				flex-direction: column;
			}
			.content {
				padding: 12px;
				display: inline-flex;
				flex-direction: column;
				gap: 24px;
				box-sizing: border-box;
				width: 100%;
			}

			ha-expansion-panel {
				display: block;
				--expansion-panel-content-padding: 0;
				border-radius: 6px;
			}
			ha-icon {
				display: flex;
				color: var(--secondary-text-color);
			}
			ha-button-menu {
				margin-top: 8px;
				--mdc-icon-size: 100%;
			}
			ha-list-item {
				text-transform: capitalize;
			}

			.feature {
				display: flex;
				align-items: center;
				pointer-events: none;

				.handle {
					cursor: move;
					cursor: grab;
					padding-right: 8px;
					padding-inline-end: 8px;
					padding-inline-start: initial;
					direction: var(--direction);
					pointer-events: all;
				}
			}

			.feature-content {
				height: 60px;
				font-size: 16px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex-grow: 1;
			}
			span {
				text-transform: capitalize;
			}
			.feature-content div {
				display: flex;
				flex-direction: column;
			}
			.secondary {
				font-size: 12px;
				color: var(--secondary-text-color);
			}

			.edit-icon,
			.remove-icon {
				color: var(--secondary-text-color);
				pointer-events: all;
				--mdc-icon-button-size: 36px;
			}

			.header {
				display: inline-flex;
				justify-content: space-between;
				align-items: center;

				ha-icon {
					color: var(
						--mdc-dialog-content-ink-color,
						rgba(0, 0, 0, 0.6)
					);
				}
			}
			.back-title {
				display: flex;
				align-items: center;
				font-size: 18px;
			}

			.wrapper {
				width: 100%;
			}
			.gui-editor,
			.yaml-editor {
				display: inline-flex;
				flex-direction: column;
				gap: 24px;
				padding: 8px 0px;
				width: 100%;
			}
			ha-code-editor {
				--code-mirror-max-height: calc(100vh - 245px);
			}
			.error,
			.warning,
			.info {
				word-break: break-word;
				margin-top: 8px;
			}
			.error {
				color: var(--error-color);
			}
			.warning {
				color: var(--warning-color);
			}
			.warning ul,
			.error ul {
				margin: 4px 0;
			}
			.warning li,
			.error li {
				white-space: pre-wrap;
			}

			ha-expansion-panel {
				border: solid 1px var(--outline-color);
			}
			.panel-header {
				display: inline-flex;
				gap: 4px;
			}

			.tab-selector {
				color: var(--primary-text-color);
				text-transform: uppercase;
				border-bottom: 1px solid var(--divider-color);
				--paper-tabs-selection-bar-color: var(--primary-color);
				--paper-tab-ink: var(--primary-color);
			}

			.form {
				display: grid;
				grid-template-columns: repeat(
					var(--form-grid-column-count, auto-fit),
					minmax(var(--form-grid-min-width, 200px), 1fr)
				);
				gap: 24px 8px;
			}
		`;
	}
}
