import { LitElement, TemplateResult, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';

import { dump, load } from 'js-yaml';

import {
	IConfig,
	IEntry,
	TileFeatures,
	TileFeatureType,
} from './models/interfaces';

export class ServiceCallTileFeatureEditor extends LitElement {
	@property() hass!: HomeAssistant;
	@property() private config!: IConfig;

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

	configChanged(config: IConfig) {
		const event = new Event('config-changed', {
			bubbles: true,
			composed: true,
		});
		event.detail = { config: config };
		this.dispatchEvent(event);
		this.requestUpdate();
	}

	entriesChanged(entries: IEntry[]) {
		const config = {
			...this.config,
			entries: entries,
		};
		this.configChanged(config);
	}

	/**
	 * Handle reordering entries
	 */
	moveEntry(e: CustomEvent) {
		e.stopPropagation();
		const { oldIndex, newIndex } = e.detail;
		const entries = this.config.entries.concat();
		entries.splice(newIndex, 0, entries.splice(oldIndex, 1)[0]);
		this.entriesChanged(entries);
	}

	/**
	 * Open edit window for an individual entry
	 */
	editEntry(e: CustomEvent) {
		const i = (
			e.currentTarget as unknown as CustomEvent & Record<'index', number>
		).index;
		this.entryEditorIndex = i;
	}

	/**
	 * Remove an individual entry
	 */
	removeEntry(e: CustomEvent) {
		const i = (
			e.currentTarget as unknown as CustomEvent & Record<'index', number>
		).index;
		const entries = this.config.entries.concat();
		entries.splice(i, 1);
		this.entriesChanged(entries);
	}

	/**
	 * Add a new entry, opening the custom tile feature dropdown list
	 */
	addEntry(e: CustomEvent) {
		const i = e.detail.index as number;
		const entries = this.config.entries.concat();
		entries.push({
			type: TileFeatures[i],
		});
		this.entriesChanged(entries);
	}

	/**
	 * Return to the entries list
	 */
	exitEditEntry(_e: CustomEvent) {
		this.entryEditorIndex = -1;
	}

	/**
	 * Switch between GUI and YAML mode
	 */
	toggleMode(_e: CustomEvent) {
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
			entries[this.entryEditorIndex] = load(this.yaml) as any;
			this.errors = undefined;
		} catch (err: any) {
			this.errors = [err.message];
		}
		this.entriesChanged(entries);
	}

	handleGUIChanged(e: CustomEvent) {
		e.stopPropagation();
		const entry = e.detail.entry;
		Object.keys(entry).forEach((key) => {
			if (entry[key] === undefined) {
				delete entry[key];
			}
		});
		const entries = this.config.entries.concat();
		entries[this.entryEditorIndex] = entry;
		this.entriesChanged(entries);
	}

	handleYAMLChanged(e: CustomEvent) {
		e.stopPropagation();
		const newYaml = e.detail.value;
		if (newYaml != this.yaml) {
			this.yaml = newYaml;
		}
	}

	/**
	 * Build custom tile features entries list
	 */
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

	/**
	 * Build list of custom tile feature types to display after clicking add custom feature
	 */
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
			switch (entry.type) {
				case 'slider':
				case 'selector':
				case 'spinbox':
				case 'button':
				default:
					entryGuiEditor = html`<div class="gui-editor"></div>`;
			}
			const entryYamlEditor = html`
				<div class="yaml-editor">
					<ha-code-editor>
						mode="yaml" autofocus autocomplete-entities
						autocomplete-icons .hass=${this.hass}
						.value=${this.yaml} .error=${Boolean(this.errors)}
						@value-changed=${this.handleYAMLChanged}
						@keydown=${(e: CustomEvent) => e.stopPropagation()}
						dir="ltr"
					</ha-code-editor>
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
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
			.back-title {
				display: flex;
				align-items: center;
				font-size: 18px;
			}

			.wrapper {
				display: flex;
				width: 100%;
			}
			.gui-editor,
			.yaml-editor {
				padding: 8px 0px;
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
			ha-circular-progress {
				display: block;
				margin: auto;
			}
		`;
	}
}
