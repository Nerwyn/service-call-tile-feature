import { LitElement, TemplateResult, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';

import { dump, load } from 'js-yaml';

import {
	IConfig,
	IEntry,
	IAction,
	TileFeatures,
	TileFeatureType,
} from './models/interfaces';

export class ServiceCallTileFeatureEditor extends LitElement {
	@property() hass!: HomeAssistant;
	@property() config!: IConfig;

	@state() entryEditorIndex: number = -1;
	@state() guiMode: boolean = true;
	@state() yamlConfig?: string;
	@state() errors?: string[];
	@state() warnings?: string[];

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
			type: TileFeatures[i],
		});
		this.entriesChanged(entries);
	}

	exitEditEntry(_e: CustomEvent) {
		this.entryEditorIndex = -1;
		this.yamlConfig = undefined;
	}

	toggleMode(_e: CustomEvent) {
		this.yamlConfig = undefined;
		this.guiMode = !this.guiMode;
	}

	get yaml(): string {
		if (!this.yamlConfig) {
			this.yamlConfig = dump(this.config.entries[this.entryEditorIndex]);
		}
		return this.yamlConfig || '';
	}

	set yaml(yamlConfig: string) {
		this.yamlConfig = yamlConfig;
		const entries = this.config.entries.concat();
		try {
			entries[this.entryEditorIndex] = load(this.yaml) as IEntry;
			this.errors = undefined;
		} catch (e) {
			this.errors = [(e as Error).message];
		}
		this.entriesChanged(entries);
	}

	handleYAMLChanged(e: CustomEvent) {
		e.stopPropagation();
		const newYaml = e.detail.value;
		if (newYaml != this.yaml) {
			this.yaml = newYaml;
		}
	}

	handleEntityChange(e: CustomEvent) {
		const entries = this.config.entries.concat();
		const entry = {
			...entries[this.entryEditorIndex],
			entity_id: (e.target as HTMLTextAreaElement)?.value,
		};
		entries[this.entryEditorIndex] = entry;
		this.entriesChanged(entries);
	}

	handleActionChange(e: CustomEvent) {
		const label = (
			e.currentTarget as unknown as CustomEvent & Record<'label', string>
		).label;
		const actionType = label.toLowerCase().replace('(optional)', '').trim();

		console.log(actionType);
		console.log((e as CustomEvent & Record<'value', IAction>).value);
	}

	buildListEntry(entry: IEntry, i: number) {
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

	render() {
		if (!this.hass) {
			return html``;
		}

		if (this.entryEditorIndex >= 0) {
			const entry = this.config.entries[this.entryEditorIndex];
			const header = html`
				<div class="header">
					<div class="back-title">
						<ha-icon-button-prev
							.label=${this.hass!.localize('ui.common.back')}
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
			let entryGuiEditor: TemplateResult<1>;
			const uiActionSelector = {
				uiaction: {},
			};
			switch (entry.type) {
				case 'slider':
				case 'selector':
				case 'spinbox':
				case 'button':
				default:
					entryGuiEditor = html`<div class="gui-editor">
						<ha-entity-picker
							.hass=${this.hass}
							.label=${'Entity'}
							.value=${entry.entity_id ?? ''}
							allow-custom-entity
							@change=${this.handleEntityChange}
						>
						</ha-entity-picker>
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
							<div class="content"></div>
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
								<ha-selector-ui_action
									.hass=${this.hass}
									.selector=${uiActionSelector}
									.value=${entry.tap_action ?? {}}
									.label=${'Tap action (optional)'}
									@change=${this.handleActionChange}
								>
								</ha-selector-ui_action>
							</div>
						</ha-expansion-panel>
					</div>`;
			}
			const entryYamlEditor = html`
				<div class="yaml-editor">
					<ha-code-editor
						mode="yaml"
						autofocus
						autocomplete-entities
						autocomplete-icons
						.hass=${this.hass}
						.value=${this.yaml}
						.error=${Boolean(this.errors)}
						@value-changed=${this.handleYAMLChanged}
						@keydown=${(e: CustomEvent) => e.stopPropagation()}
						dir="ltr"
					></ha-code-editor>
				</div>
			`;
			return html`
				${header}
				<div class="wrapper">
					${this.guiMode ? entryGuiEditor : entryYamlEditor}
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

		return html`
			<div class="content">
				<ha-sortable
					handle-selector=".handle"
					@item-moved=${this.moveEntry}
				>
					<div class="features">
						${this.config.entries.map((entry, i) =>
							this.buildListEntry(entry, i),
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
					${TileFeatures.map((tileFeatureType) =>
						this.buildAddEntryListItem(tileFeatureType),
					)}
				</ha-button-menu>
			</div>
		`;
	}

	static get styles() {
		return css`
			:host {
				display: flex !important;
				flex-direction: column;
			}
			.content {
				padding: 12px;
			}

			ha-expansion-panel {
				display: block;
				--expansion-panel-content-padding: 0;
				border-radius: 6px;
			}
			h3 {
				margin: 0;
				font-size: inherit;
				font-weight: inherit;
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
		`;
	}
}
