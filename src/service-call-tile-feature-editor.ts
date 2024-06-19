import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

import {
	IConfig,
	IEntry,
	TileFeatures,
	TileFeatureType,
} from './models/interfaces';

interface EntryEditorConfig {
	index: number;
	entry: IEntry;
}

export class ServiceCallTileFeatureEditor extends LitElement {
	@property({ attribute: false }) hass!: HomeAssistant;
	@property({ attribute: false }) private config!: IConfig;
	@property({ attribute: false }) private stateObj!: HassEntity;

	@state() entryEditorConfig?: EntryEditorConfig;
	@state() guiMode: boolean = true;

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
		const event = new Event('edit-entry', {
			bubbles: true,
			composed: true,
		});
		event.detail = {
			entryConfig: {
				index: i,
				entry: this.config.entries[i],
			},
		};
		this.dispatchEvent(event);
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
		console.log(entries);
		this.entriesChanged(entries);
	}

	openEntryEditor(e: CustomEvent) {
		this.entryEditorConfig = e.detail.entryConfig;
	}

	exitEntryEditor(_e: CustomEvent) {
		this.entryEditorConfig = undefined;
	}

	toggleMode(_e: CustomEvent) {
		this.guiMode = !this.guiMode;
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

		if (this.entryEditorConfig) {
			return html`
				<div class="header">
					<div class="back-title">
						<ha-icon-button-prev
							.label=${this.hass!.localize('ui.common.back')}
							@click=${this.exitEntryEditor}
						></ha-icon-button-prev>
						<span slot="title">
							${this.entryEditorConfig.entry.type ?? 'Button'}
						</span>
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

		return html`
			<div class="content" @edit-entry=${this.openEntryEditor}>
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
		`;
	}
}
