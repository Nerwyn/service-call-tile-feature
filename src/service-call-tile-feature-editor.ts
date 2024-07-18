import { LitElement, TemplateResult, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { renderTemplate } from 'ha-nunjucks';

import { HomeAssistant } from 'custom-card-helpers';
import { dump, load } from 'js-yaml';

import {
	IConfig,
	IEntry,
	IOption,
	IAction,
	IActions,
	IData,
	ITarget,
	TileFeatureType,
	TileFeatureTypes,
	Actions,
	ActionType,
	ActionTypes,
	ThumbTypes,
} from './models/interfaces';
import { deepGet, deepSet } from './utils';

export class ServiceCallTileFeatureEditor extends LitElement {
	@property() hass!: HomeAssistant;
	@property() config!: IConfig;
	@property() context!: Record<'entity_id', string>;

	@state() entryIndex: number = -1;
	@state() actionsTabIndex: number = 0;
	@state() optionIndex: number = -1;
	@state() spinboxTabIndex: number = 1;

	@state() guiMode: boolean = true;
	@state() errors?: string[];

	yamlString?: string;
	activeEntryType: 'entry' | 'option' | 'decrement' | 'increment' = 'entry';
	autofillCooldown = false;
	codeEditorDelay?: ReturnType<typeof setTimeout>;
	people: Record<string, string>[] = [];

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
		event.detail = {
			config: config,
		};
		this.dispatchEvent(event);
		this.requestUpdate();
	}

	entriesChanged(entries: IEntry[]) {
		this.configChanged({
			...this.config,
			entries: entries,
		} as IConfig);
	}

	entryChanged(entry: IEntry) {
		const entries = structuredClone(this.config.entries);
		const oldEntry = entries[this.entryIndex];
		let updatedEntry: IEntry | IOption;
		switch (this.activeEntryType) {
			case 'option': {
				const options = oldEntry.options ?? [];
				const oldOption = options[this.optionIndex];
				options[this.optionIndex] = {
					...oldOption,
					...entry,
				};
				updatedEntry = {
					...oldEntry,
					options: options,
				};
				break;
			}
			case 'decrement':
				updatedEntry = {
					...oldEntry,
					decrement: {
						...oldEntry.decrement,
						...entry,
					},
				};
				break;
			case 'increment':
				updatedEntry = {
					...oldEntry,
					increment: {
						...oldEntry.increment,
						...entry,
					},
				};
				break;
			case 'entry':
			default:
				updatedEntry = {
					...oldEntry,
					...entry,
				};
		}
		entries[this.entryIndex] = updatedEntry;
		this.entriesChanged(entries);
	}

	moveEntry(e: CustomEvent) {
		e.stopPropagation();
		const { oldIndex, newIndex } = e.detail;
		const entries = structuredClone(this.config.entries);
		entries.splice(newIndex, 0, entries.splice(oldIndex, 1)[0]);
		this.entriesChanged(entries);
	}

	moveOption(e: CustomEvent) {
		e.stopPropagation();
		const { oldIndex, newIndex } = e.detail;
		const entry = structuredClone(this.activeEntry) as IOption;
		const options = entry.options ?? [];
		options.splice(newIndex, 0, options.splice(oldIndex, 1)[0]);
		entry.options = options;
		this.entryChanged(entry);
	}

	editEntry(e: CustomEvent) {
		this.yamlString = undefined;
		const i = (
			e.currentTarget as unknown as CustomEvent & Record<'index', number>
		).index;
		this.activeEntryType = 'entry';
		this.actionsTabIndex =
			i > -1 &&
			(this.renderTemplate(
				this.config.entries[i].momentary_start_action?.action ?? 'none',
				this.getEntryContext(this.config.entries[i]),
			) != 'none' ||
				this.renderTemplate(
					this.config.entries[i].momentary_end_action?.action ??
						'none',
					this.getEntryContext(this.config.entries[i]),
				) != 'none')
				? 1
				: 0;
		this.optionIndex = -1;
		this.spinboxTabIndex = 1;
		this.entryIndex = i;
	}

	editOption(e: CustomEvent) {
		this.yamlString = undefined;
		const i = (
			e.currentTarget as unknown as CustomEvent & Record<'index', number>
		).index;
		this.activeEntryType = 'option';
		this.actionsTabIndex =
			i > -1 &&
			(this.renderTemplate(
				this.config.entries[this.entryIndex].options?.[i]
					?.momentary_start_action?.action ?? 'none',
				this.getEntryContext(
					this.config.entries[this.entryIndex].options?.[i] as IEntry,
				),
			) != 'none' ||
				this.renderTemplate(
					this.config.entries[this.entryIndex].options?.[i]
						?.momentary_end_action?.action ?? 'none',
					this.getEntryContext(
						this.config.entries[this.entryIndex].options?.[
							i
						] as IEntry,
					),
				) != 'none')
				? 1
				: 0;
		this.optionIndex = i;
	}

	removeEntry(e: CustomEvent) {
		const i = (
			e.currentTarget as unknown as CustomEvent & Record<'index', number>
		).index;
		const entries = structuredClone(this.config.entries);
		entries.splice(i, 1);
		this.entriesChanged(entries);
	}

	removeOption(e: CustomEvent) {
		const i = (
			e.currentTarget as unknown as CustomEvent & Record<'index', number>
		).index;
		const entry = structuredClone(this.activeEntry) as IOption;
		const options = entry.options ?? [];
		options.splice(i, 1);
		entry.options = options;
		this.entryChanged(entry);
	}

	addEntry(e: CustomEvent) {
		const i = e.detail.index as number;
		const entries = structuredClone(this.config.entries);
		entries.push({
			type: TileFeatureTypes[i],
		});
		this.entriesChanged(entries);
	}

	addOption(_e: CustomEvent) {
		const entry = structuredClone(this.activeEntry) as IOption;
		const options = entry.options ?? [];
		options.push({});
		entry.options = options;
		this.entryChanged(entry);
	}

	exitEditEntry(_e: CustomEvent) {
		this.activeEntryType = 'entry';
		this.yamlString = undefined;
		this.entryIndex = -1;
	}

	exitEditOption(_e: CustomEvent) {
		this.activeEntryType = 'entry';
		this.yamlString = undefined;
		this.optionIndex = -1;
	}

	toggleGuiMode(_e: CustomEvent) {
		this.yamlString = undefined;
		this.guiMode = !this.guiMode;
	}

	get activeEntry() {
		if (this.entryIndex < 0) {
			return undefined;
		}
		const entry = this.config.entries[this.entryIndex];
		switch (this.activeEntryType) {
			case 'decrement':
				return entry.decrement ?? {};
			case 'increment':
				return entry.increment ?? {};
			case 'option':
				return entry.options?.[this.optionIndex] ?? {};
			case 'entry':
			default:
				return this.config.entries[this.entryIndex] ?? {};
		}
	}

	get yaml(): string {
		if (this.yamlString == undefined && this.entryIndex > -1) {
			const yaml = dump(this.activeEntry);
			this.yamlString = yaml.trim() == '{}' ? '' : yaml;
		}
		return this.yamlString || '';
	}

	set yaml(yaml: string | undefined) {
		this.yamlString = yaml;
		try {
			this.entryChanged(load(this.yaml) as IEntry);
			this.errors = undefined;
		} catch (e) {
			this.errors = [(e as Error).message];
		}
	}

	handleYamlCodeChanged(e: CustomEvent) {
		e.stopPropagation();
		clearTimeout(this.codeEditorDelay);
		this.codeEditorDelay = undefined;
		this.codeEditorDelay = setTimeout(() => {
			const yaml = e.detail.value;
			if (yaml != this.yaml) {
				this.yaml = yaml;
			}
		}, 1000);
	}

	handleStyleCodeChanged(e: CustomEvent) {
		e.stopPropagation();
		const css = e.detail.value;
		if (this.entryIndex > -1) {
			if (css != this.activeEntry?.styles) {
				this.entryChanged({ styles: css });
			}
		} else {
			if (css != this.config.styles) {
				this.configChanged({
					...this.config,
					styles: css,
				});
			}
		}
	}

	handleActionCodeChanged(e: CustomEvent) {
		const actionType = (e.target as HTMLElement).id as ActionType;
		const actionYaml = e.detail.value;
		e.stopPropagation();
		clearTimeout(this.codeEditorDelay);
		this.codeEditorDelay = undefined;
		this.codeEditorDelay = setTimeout(() => {
			if (this.activeEntry) {
				try {
					const actionObj = load(actionYaml) as IData;
					if (JSON.stringify(actionObj ?? {}).includes('null')) {
						return;
					}
					this.entryChanged({ [actionType]: actionObj });
					this.errors = undefined;
				} catch (e) {
					this.errors = [(e as Error).message];
				}
			}
		}, 1000);
	}

	handleSpinboxTabSelected(e: CustomEvent) {
		this.yamlString = undefined;
		const i = e.detail.value;
		switch (i) {
			case 0:
				this.activeEntryType = 'decrement';
				break;
			case 2:
				this.activeEntryType = 'increment';
				break;
			case 1:
			default:
				this.activeEntryType = 'entry';
				break;
		}
		if (i == this.spinboxTabIndex) {
			return;
		}
		this.spinboxTabIndex = i;
	}

	handleActionsTabSelected(e: CustomEvent) {
		const i = e.detail.value;
		if (this.actionsTabIndex == i) {
			return;
		}
		this.actionsTabIndex = i;
	}

	handleSelectorChange(e: CustomEvent) {
		const key = (e.target as HTMLElement).id;
		let value = e.detail.value;
		if (key.endsWith('.confirmation.exemptions')) {
			value = ((value as string[]) ?? []).map((v) => {
				return {
					user: v,
				};
			});
		}
		this.entryChanged(
			deepSet(structuredClone(this.activeEntry) as object, key, value),
		);
	}

	buildEntryList(field: 'entry' | 'option' = 'entry') {
		let entries: IEntry[] | IOption[];
		let handlers: Record<string, (e: CustomEvent) => void>;
		let listHeader: string;
		let backupType: string;
		switch (field) {
			case 'option':
				entries = this.activeEntry?.options ?? [];
				handlers = {
					move: this.moveOption,
					edit: this.editOption,
					remove: this.removeOption,
				};
				listHeader = 'Selector Options';
				backupType = 'Option';
				break;
			case 'entry':
			default:
				entries = this.config.entries;
				handlers = {
					move: this.moveEntry,
					edit: this.editEntry,
					remove: this.removeEntry,
				};
				listHeader = 'Custom Features';
				backupType = 'Button';
				break;
		}
		return html`
			<div class="content">
				<div class="entry-list-header">${listHeader}</div>
				<ha-sortable
					handle-selector=".handle"
					@item-moved=${handlers.move}
				>
					<div class="features">
						${entries.map((entry, i) => {
							const context = this.getEntryContext(entry);
							const icon = this.renderTemplate(
								entry.icon as string,
								context,
							);
							const label = this.renderTemplate(
								entry.label as string,
								context,
							);
							const option = this.renderTemplate(
								(entry as IOption).option as string,
								context,
							);
							const entryType = this.renderTemplate(
								entry.type as string,
								context,
							);
							return html`
								<div class="feature-list-item">
									<div class="handle">
										<ha-icon
											.icon="${'mdi:drag'}"
										></ha-icon>
									</div>
									<div class="feature-list-item-content">
										${icon
											? html`<ha-icon
													.icon="${icon}"
											  ></ha-icon>`
											: ''}
										<div class="feature-list-item-label">
											<span class="primary"
												>${option ??
												entryType ??
												backupType}${label
													? ` ⸱ ${label}`
													: ''}</span
											>
											${context.config.entity
												? html`<span class="secondary"
														>${context.config
															.entity_id}${context
															.config.attribute
															? ` ⸱ ${context.config.attribute}`
															: ''}</span
												  >`
												: ''}
										</div>
									</div>
									<ha-icon-button
										class="edit-icon"
										.index=${i}
										@click=${handlers.edit}
									>
										<ha-icon
											.icon="${'mdi:pencil'}"
										></ha-icon>
									</ha-icon-button>
									<ha-icon-button
										class="remove-icon"
										.index=${i}
										@click=${handlers.remove}
									>
										<ha-icon
											.icon="${'mdi:delete'}"
										></ha-icon>
									</ha-icon-button>
								</div>
							`;
						})}
					</div>
				</ha-sortable>
			</div>
		`;
	}

	buildAddEntryButton() {
		return html`
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
				${TileFeatureTypes.map(
					(tileFeatureType) => html`
						<ha-list-item .value=${tileFeatureType}>
							${tileFeatureType}
						</ha-list-item>
					`,
				)}
			</ha-button-menu>
		`;
	}

	buildAddOptionButton() {
		return html`
			<ha-button
				slot="trigger"
				outlined
				.label="${'ADD OPTION'}"
				@click=${this.addOption}
			>
				<ha-icon .icon=${'mdi:plus'} slot="icon"></ha-icon>
			</ha-button>
		`;
	}

	buildEntryHeader() {
		let title: string;
		let exitHandler: (e: CustomEvent) => void;
		switch (this.activeEntryType) {
			case 'option':
				title = 'Selector Option';
				exitHandler = this.exitEditOption;
				break;
			case 'decrement':
				title = 'Spinbox (Decrement)';
				exitHandler = this.exitEditEntry;
				break;
			case 'increment':
				title = 'Spinbox (Increment)';
				exitHandler = this.exitEditEntry;
				break;
			case 'entry':
			default:
				title = this.config.entries[this.entryIndex].type ?? 'Button';
				exitHandler = this.exitEditEntry;
				break;
		}
		return html`
			<div class="header">
				<div class="back-title">
					<ha-icon-button-prev
						.label=${this.hass.localize('ui.common.back')}
						@click=${exitHandler}
					></ha-icon-button-prev>
					<span class="primary" slot="title">${title}</span>
				</div>
				<ha-icon-button
					class="gui-mode-button"
					@click=${this.toggleGuiMode}
					.label=${this.hass.localize(
						this.guiMode
							? 'ui.panel.lovelace.editor.edit_card.show_code_editor'
							: 'ui.panel.lovelace.editor.edit_card.show_visual_editor',
					)}
				>
					<ha-icon
						class="header-icon"
						.icon="${this.guiMode
							? 'mdi:code-braces'
							: 'mdi:list-box-outline'}"
					></ha-icon>
				</ha-icon-button>
			</div>
		`;
	}

	buildSelector(
		label: string,
		key: string,
		selector: object,
		backupValue: string | number | boolean | object = '',
	) {
		const hass: HomeAssistant = {
			...this.hass,
			localize: (key, values) => {
				const value = {
					'ui.panel.lovelace.editor.action-editor.actions.repeat':
						'Repeat',
					'ui.panel.lovelace.editor.action-editor.actions.fire-dom-event':
						'Fire DOM Event',
				}[key];
				return value ?? this.hass.localize(key, values);
			},
		};

		let value = deepGet(this.activeEntry as object, key);
		if (key.endsWith('.confirmation.exemptions')) {
			value = ((value as Record<string, { user: string }>[]) ?? []).map(
				(v) => v.user,
			);
		}

		return html`<ha-selector
			.hass=${hass}
			.selector=${selector}
			.value=${value ?? backupValue}
			.label="${label}"
			.name="${label}"
			.required=${false}
			id="${key}"
			@value-changed=${this.handleSelectorChange}
		></ha-selector>`;
	}

	buildMainFeatureOptions(
		additionalOptions: TemplateResult<1> = html``,
		additionalFormOptions: TemplateResult<1> = html``,
	) {
		return html`
			${this.buildSelector('Entity', 'entity_id', {
				entity: {},
			})}
			${
				this.activeEntry?.entity_id
					? this.buildSelector('Attribute', 'value_attribute', {
							attribute: {
								entity_id: this.activeEntry.entity_id,
							},
					  })
					: ''
			}
			${additionalOptions}
			<div class="form">
				${additionalFormOptions}
				${this.buildSelector(
					'Autofill Entity',
					'autofill_entity_id',
					{
						boolean: {},
					},
					true,
				)}
				${this.buildSelector(
					'Haptics',
					'haptics',
					{
						boolean: {},
					},
					false,
				)}
			</div>
		</div> `;
	}

	buildAppearancePanel(appearanceOptions: TemplateResult<1> = html``) {
		return html`
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
					${this.buildAlertBox(
						"Change the feature appearance based on its value using a template like '{{ value | float }}'.",
					)}
					${appearanceOptions}${this.buildCodeEditor('jinja2')}
				</div>
			</ha-expansion-panel>
		`;
	}

	buildCommonAppearanceOptions() {
		return html`${this.buildSelector('Label', 'label', {
				text: { multiline: true },
			})}
			<div class="form">
				${this.buildSelector('Icon', 'icon', {
					icon: {},
				})}${this.buildSelector('Units', 'unit_of_measurement', {
					text: {},
				})}
			</div>`;
	}

	buildActionsPanel(actionSelectors: TemplateResult<1>) {
		return html`
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
				<div class="content">${actionSelectors}</div>
			</ha-expansion-panel>
		`;
	}

	buildActionOption(
		label: string,
		actionType: ActionType,
		selector: object,
		buildCodeEditor: boolean = false,
	) {
		const context = this.getEntryContext(this.activeEntry as IEntry);
		const action = this.renderTemplate(
			this.activeEntry?.[actionType]?.action ?? 'none',
			context,
		);
		return html`<div class="action-options">
			${this.buildSelector(label, actionType, selector)}
			${action != 'none' && actionType == 'double_tap_action'
				? this.buildSelector(
						'Double Tap Window',
						'double_tap_action.double_tap_window',
						{
							number: {
								min: 0,
								step: 0,
								mode: 'box',
								unit_of_measurement: 'ms',
							},
						},
						200,
				  )
				: action != 'none' && actionType == 'hold_action'
				  ? html`<div class="form">
							${this.buildSelector(
								'Hold Time',
								'hold_action.hold_time',
								{
									number: {
										min: 0,
										step: 0,
										mode: 'box',
										unit_of_measurement: 'ms',
									},
								},
								500,
							)}
							${this.renderTemplate(
								this.activeEntry?.hold_action?.action as string,
								context,
							) == 'repeat'
								? this.buildSelector(
										'Repeat Delay',
										'hold_action.repeat_delay',
										{
											number: {
												min: 0,
												step: 0,
												mode: 'box',
												unit_of_measurement: 'ms',
											},
										},
										100,
								  )
								: ''}
				    </div>`
				  : ''}
			${action == 'more-info'
				? this.buildSelector(
						'Entity',
						`${actionType}.target.entity_id`,
						{
							entity: {},
						},
				  )
				: ''}
			${buildCodeEditor || action == 'fire-dom-event'
				? this.buildCodeEditor('action', actionType)
				: ''}
			${action != 'none'
				? html`${this.buildSelector(
						'Confirmation',
						`${actionType}.confirmation`,
						{
							boolean: {},
						},
						false,
				  )}
				  ${this.activeEntry?.[actionType]?.confirmation
						? html`${this.buildSelector(
								'Text',
								`${actionType}.confirmation.text`,
								{
									text: {},
								},
						  )}
						  ${this.buildSelector(
								'Exemptions',
								`${actionType}.confirmation.exemptions`,
								{
									select: {
										multiple: true,
										mode: 'list',
										options: this.people,
										reorder: false,
									},
								},
						  )}`
						: ''}`
				: ''}
		</div>`;
	}

	buildButtonGuiEditor() {
		const actionsTabBar = html`
			<paper-tabs
				scrollable
				hide-scroll-buttons
				.selected=${this.actionsTabIndex}
				@selected-changed=${this.handleActionsTabSelected}
			>
				<paper-tab>Default</paper-tab>
				<paper-tab>Momentary</paper-tab>
			</paper-tabs>
		`;
		let actionSelectors: TemplateResult<1>;
		const actionsNoRepeat = Actions.concat();
		actionsNoRepeat.splice(Actions.indexOf('repeat'), 1);
		const defaultUiActions = {
			ui_action: {
				actions: actionsNoRepeat,
				default_action: 'none',
			},
		};
		switch (this.actionsTabIndex) {
			case 1: {
				actionSelectors = html`
					${actionsTabBar}
					${this.buildActionOption(
						'Start Action (optional)',
						'momentary_start_action',
						defaultUiActions,
					)}
					${this.buildAlertBox(
						"Set the action below, and then use the code editor to set a data field to the seconds the feature was held down using a template like '{{ hold_secs | float }}'.",
					)}
					${this.buildActionOption(
						'End Action (optional)',
						'momentary_end_action',
						defaultUiActions,
						true,
					)}
				`;
				break;
			}
			case 0:
			default: {
				actionSelectors = html`
					${actionsTabBar}
					${this.buildActionOption(
						'Tap action (optional)',
						'tap_action',
						defaultUiActions,
					)}
					${this.buildActionOption(
						'Double tap action (optional)',
						'double_tap_action',
						defaultUiActions,
					)}
					${this.buildActionOption(
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
		}

		return html`
			${this.buildMainFeatureOptions()}
			${this.buildAppearancePanel(html`
				${this.buildCommonAppearanceOptions()}
			`)}
			${this.buildActionsPanel(actionSelectors)}
		`;
	}

	buildSliderGuiEditor() {
		const actionsNoRepeat = Actions.concat();
		actionsNoRepeat.splice(Actions.indexOf('repeat'), 1);

		const context = this.getEntryContext(this.activeEntry as IEntry);
		const rangeMin = this.renderTemplate(
			this.activeEntry?.range?.[0] as number,
			context,
		);
		const rangeMax = this.renderTemplate(
			this.activeEntry?.range?.[0] as number,
			context,
		);
		const step =
			this.renderTemplate(this.activeEntry?.step as number, context) ?? 1;
		const unit = this.renderTemplate(
			this.activeEntry?.unit_of_measurement as string,
			context,
		);

		return html`
			${this.buildMainFeatureOptions(
				undefined,
				html`
					${this.buildSelector('Min', 'range.0', {
						number: {
							max: rangeMax ?? undefined,
							step: step,
							mode: 'box',
							unit_of_measurement: unit,
						},
					})}
					${this.buildSelector('Max', 'range.1', {
						number: {
							min: rangeMin ?? undefined,
							step: step,
							mode: 'box',
							unit_of_measurement: unit,
						},
					})}
					${this.buildSelector('Step', 'step', {
						number: {
							min: 0,
							step:
								step ??
								Math.min(
									1,
									((this.activeEntry?.range?.[1] ?? 1) -
										(this.activeEntry?.range?.[0] ?? 0)) /
										100,
								),
							mode: 'box',
							unit_of_measurement: unit,
						},
					})}
					${this.buildSelector(
						'Update After Action Delay',
						'value_from_hass_delay',
						{
							number: {
								min: 0,
								step: 0,
								mode: 'box',
								unit_of_measurement: 'ms',
							},
						},
						1000,
					)}
				`,
			)}
			${this.buildAppearancePanel(html`
				${this.buildCommonAppearanceOptions()}
				${this.buildSelector(
					'Thumb Type',
					'thumb',
					{
						select: {
							mode: 'dropdown',
							options: ThumbTypes,
							reorder: false,
						},
					},
					'default',
				)}
			`)}
			${this.buildActionsPanel(html`
				${this.buildAlertBox()}
				${this.buildActionOption(
					'Action',
					'tap_action',
					{
						ui_action: {
							actions: actionsNoRepeat,
							default_action: 'call-service',
						},
					},
					true,
				)}
			`)}
		`;
	}

	buildSelectorGuiEditor() {
		let selectorGuiEditor: TemplateResult<1>;
		switch (this.optionIndex) {
			case -1:
				selectorGuiEditor = html`${this.buildMainFeatureOptions()}
				${this.buildEntryList('option')}${this.buildAddOptionButton()}
				${this.buildCodeEditor('jinja2')}`;
				break;
			default:
				selectorGuiEditor = html`
					${this.buildSelector('Option', 'option', {
						text: {},
					})}
					${this.buildButtonGuiEditor()}
				`;
				break;
		}

		return selectorGuiEditor;
	}

	buildSpinboxGuiEditor() {
		const actionsNoRepeat = Actions.concat();
		actionsNoRepeat.splice(Actions.indexOf('repeat'), 1);
		const defaultTapActions = {
			ui_action: {
				actions: actionsNoRepeat,
				default_action: 'call-service',
			},
		};
		const defaultHoldActions = {
			ui_action: {
				actions: ['repeat', 'none'],
				default_action: 'none',
			},
		};
		const actionSelectors = html`
			${this.buildAlertBox()}
			${this.buildActionOption(
				'Tap action',
				'tap_action',
				defaultTapActions,
				true,
			)}
			${this.buildActionOption(
				'Hold action (optional)',
				'hold_action',
				defaultHoldActions,
			)}
		`;
		const spinboxTabBar = html`
			<paper-tabs
				scrollable
				hide-scroll-buttons
				.selected=${this.spinboxTabIndex}
				@selected-changed=${this.handleSpinboxTabSelected}
			>
				<paper-tab>Decrement</paper-tab>
				<paper-tab>Center</paper-tab>
				<paper-tab>Increment</paper-tab>
			</paper-tabs>
		`;

		let spinboxGuiEditor: TemplateResult<1>;
		switch (this.spinboxTabIndex) {
			case 0:
			// falls through
			case 2:
				spinboxGuiEditor = this.buildButtonGuiEditor();
				break;
			case 1:
			default: {
				const context = this.getEntryContext(
					this.activeEntry as IEntry,
				);
				const rangeMin = this.renderTemplate(
					this.activeEntry?.range?.[0] as number,
					context,
				);
				const rangeMax = this.renderTemplate(
					this.activeEntry?.range?.[0] as number,
					context,
				);
				const step =
					this.renderTemplate(
						this.activeEntry?.step as number,
						context,
					) ?? 1;
				const unit = this.renderTemplate(
					this.activeEntry?.unit_of_measurement as string,
					context,
				);

				spinboxGuiEditor = html`
					${this.buildMainFeatureOptions(
						this.buildSelector('Step', 'step', {
							number: {
								min: 0,
								step: step,
								mode: 'box',
								unit_of_measurement: unit,
							},
						}),
						html`
							${this.buildSelector('Min', 'range.0', {
								number: {
									max: rangeMax,
									step: step,
									mode: 'box',
									unit_of_measurement: unit,
								},
							})}
							${this.buildSelector('Max', 'range.1', {
								number: {
									min: rangeMin,
									step: step,
									mode: 'box',
									unit_of_measurement: unit,
								},
							})}
							${this.buildSelector(
								'Update After Action Delay',
								'value_from_hass_delay',
								{
									number: {
										min: 0,
										step: 1,
										mode: 'box',
										unit_of_measurement: 'ms',
									},
								},
								1000,
							)}
							${this.buildSelector(
								'Debounce Time',
								'debounce_time',
								{
									number: {
										min: 0,
										step: 1,
										mode: 'box',
										unit_of_measurement: 'ms',
									},
								},
								1000,
							)}
						`,
					)}
					${this.buildAppearancePanel(
						this.buildCommonAppearanceOptions(),
					)}
					${this.buildActionsPanel(actionSelectors)}
				`;
				break;
			}
		}

		return html`${spinboxTabBar}${spinboxGuiEditor}`;
	}

	buildEntryGuiEditor() {
		let entryGuiEditor: TemplateResult<1>;
		switch (this.config.entries[this.entryIndex].type) {
			case 'slider':
				entryGuiEditor = this.buildSliderGuiEditor();
				break;
			case 'selector':
				entryGuiEditor = this.buildSelectorGuiEditor();
				break;
			case 'spinbox':
				entryGuiEditor = this.buildSpinboxGuiEditor();
				break;
			case 'button':
			default:
				entryGuiEditor = this.buildButtonGuiEditor();
				break;
		}
		return html`<div class="gui-editor">${entryGuiEditor}</div>`;
	}

	buildCodeEditor(mode: string, id?: string) {
		let title: string | undefined;
		let value: string;
		let handler: (e: CustomEvent) => void;
		switch (mode) {
			case 'jinja2':
				value =
					(this.entryIndex > -1
						? this.activeEntry?.styles
						: this.config.styles) ?? '';
				handler = this.handleStyleCodeChanged;
				title = 'CSS Styles';
				break;
			case 'action':
				mode = 'yaml';
				handler = this.handleActionCodeChanged;
				value = dump(
					(this.activeEntry?.[
						(id ?? 'tap_action') as keyof IEntry
					] as IAction) ?? {},
				);
				value = value.trim() == '{}' ? '' : value;
				break;
			case 'yaml':
			default:
				value = this.yaml;
				handler = this.handleYamlCodeChanged;
				break;
		}
		return html`
			<div class="yaml-editor">
				${title ? html`<div class="style-header">${title}</div>` : ''}
				<ha-code-editor
					mode="${mode}"
					id="${id}"
					autofocus
					autocomplete-entities
					autocomplete-icons
					.hass=${this.hass}
					.value=${value}
					.error=${Boolean(this.errors)}
					@value-changed=${handler}
					@keydown=${(e: CustomEvent) => e.stopPropagation()}
					dir="ltr"
				></ha-code-editor>
			</div>
		`;
	}

	buildEntryEditor() {
		let editor: TemplateResult<1>;
		if (this.guiMode) {
			editor = this.buildEntryGuiEditor();
		} else {
			editor = this.buildCodeEditor('yaml');
		}

		return html`
			${this.buildEntryHeader()}
			<div class="wrapper">${editor}</div>
		`;
	}

	buildErrorPanel() {
		return html`
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
				: ''}
		`;
	}

	buildAlertBox(
		title = "Set the action below, and then use the code editor to set a data field to the feature's new value using a template like '{{ value | float }}'.",
		type: 'info' | 'warning' | 'error' | 'success' = 'info',
	) {
		return html`<ha-alert
			.title="${title}"
			.alertType="${type}"
		></ha-alert>`;
	}

	buildPeopleList() {
		this.people = [];
		const peopleEntities = Object.keys(this.hass.states).filter((entity) =>
			entity.startsWith('person.'),
		);
		for (const person of peopleEntities) {
			this.people.push({
				value: this.hass.states[person].attributes.user_id,
				label:
					this.hass.states[person].attributes.friendly_name ??
					this.hass.states[person].attributes.id ??
					person,
			});
		}
	}

	render() {
		if (!this.hass) {
			return html``;
		}

		if (!this.autofillCooldown) {
			this.autofillCooldown = true;
			let config = this.updateDeprecatedFields(this.config);
			config = this.autofillDefaultFields(config);
			this.configChanged(config);
			setTimeout(() => (this.autofillCooldown = false), 2000);
		}

		this.buildPeopleList();

		let editor: TemplateResult<1>;
		switch (this.entryIndex) {
			case -1:
				editor = html`
					${this.buildEntryList()}${this.buildAddEntryButton()}
					${this.buildCodeEditor('jinja2')}${this.buildErrorPanel()}
				`;
				break;
			default:
				editor = html`${this.buildEntryEditor()}${this.buildErrorPanel()}`;
				break;
		}
		return editor;
	}

	renderTemplate(str: string | number | boolean, context: object) {
		context = {
			render: (str2: string) => this.renderTemplate(str2, context),
			...context,
		};

		const res = renderTemplate(this.hass, str as string, context);
		if (res != str) {
			return res;
		}

		// Legacy string interpolation
		if (typeof str == 'string') {
			for (const key of ['VALUE', 'HOLD_SECS', 'UNIT']) {
				if (str == key) {
					return context[key as keyof object] as string;
				} else if (str.includes(key)) {
					str = str.replace(
						new RegExp(key, 'g'),
						(context[key as keyof object] ?? '') as string,
					);
				}
			}
		}

		return str;
	}

	getEntryContext(entry: IEntry) {
		const context = {
			VALUE: 0,
			HOLD_SECS: 0,
			UNIT: '',
			value: 0,
			hold_secs: 0,
			unit: '',
			config: {
				...entry,
				entity: '',
				attribute: '',
			},
		};
		context.config.attribute = this.renderTemplate(
			entry.value_attribute ?? '',
			context,
		) as string;
		context.config.entity = this.renderTemplate(
			entry.entity_id ?? '',
			context,
		) as string;
		const unit = this.renderTemplate(
			entry.unit_of_measurement as string,
			context,
		) as string;
		(context.UNIT = unit), (context.unit = unit);
		const value = this.getFeatureValue(
			context.config.entity,
			context.config.attribute,
		);
		context.VALUE = value;
		context.value = value;
		return context;
	}

	getFeatureValue(entityId: string, valueAttribute: string) {
		if (!this.hass.states[entityId]) {
			return '';
		} else if (valueAttribute == 'state' || !valueAttribute) {
			return this.hass.states[entityId].state;
		} else {
			let value;
			const indexMatch = valueAttribute.match(/\[\d+\]$/);
			if (indexMatch) {
				const index = parseInt(indexMatch[0].replace(/\[|\]/g, ''));
				valueAttribute = valueAttribute.replace(indexMatch[0], '');
				value = this.hass.states[entityId].attributes[valueAttribute];
				if (value && Array.isArray(value) && value.length) {
					return value[index];
				} else {
					return undefined;
				}
			} else {
				value = this.hass.states[entityId].attributes[valueAttribute];
			}
			if (value != undefined || valueAttribute == 'elapsed') {
				switch (valueAttribute) {
					case 'brightness':
						return Math.round(
							(100 * parseInt((value as string) ?? 0)) / 255,
						);
					case 'elapsed':
						if (entityId.startsWith('timer.')) {
							const durationHMS =
								this.hass.states[
									entityId
								].attributes.duration.split(':');
							const durationSeconds =
								parseInt(durationHMS[0]) * 3600 +
								parseInt(durationHMS[1]) * 60 +
								parseInt(durationHMS[2]);
							if (this.hass.states[entityId].state == 'idle') {
								return 0;
							} else if (
								this.hass.states[entityId].state == 'active'
							) {
								const endSeconds = Date.parse(
									this.hass.states[entityId].attributes
										.finishes_at,
								);
								const remainingSeconds =
									(endSeconds - Date.now()) / 1000;
								const value = Math.floor(
									durationSeconds - remainingSeconds,
								);
								return Math.min(value, durationSeconds);
							} else {
								const remainingHMS =
									this.hass.states[
										entityId
									].attributes.remaining.split(':');
								const remainingSeconds =
									parseInt(remainingHMS[0]) * 3600 +
									parseInt(remainingHMS[1]) * 60 +
									parseInt(remainingHMS[2]);
								return Math.floor(
									durationSeconds - remainingSeconds,
								);
							}
						}
					// falls through
					default:
						return value;
				}
			}
			return value;
		}
	}

	populateMissingEntityId(entry: IEntry, parentEntityId: string) {
		for (const actionType of ActionTypes) {
			if (actionType in entry) {
				const action =
					entry[actionType as unknown as keyof IActions] ??
					({} as IAction);
				if (['call-service', 'more-info'].includes(action.action)) {
					const data = action.data ?? ({} as IData);
					const target = action.target ?? ({} as ITarget);
					for (const targetId of [
						'entity_id',
						'device_id',
						'area_id',
						'label_id',
					]) {
						if (data[targetId]) {
							target[targetId as keyof ITarget] = data[
								targetId
							] as string | string[];
							delete data[targetId];
						}
					}
					if (
						!target.entity_id &&
						!target.device_id &&
						!target.area_id &&
						!target.label_id
					) {
						target.entity_id = entry.entity_id ?? parentEntityId;
						action.target = target;
						entry[actionType as keyof IActions] = action;
					}
				}
			}
		}

		if (!('entity_id' in entry)) {
			let entity_id =
				entry.tap_action?.target?.entity_id ??
				entry.tap_action?.data?.entity_id ??
				parentEntityId;
			if (Array.isArray(entity_id)) {
				entity_id = entity_id[0];
			}
			entry.entity_id = entity_id as string;
		}

		return entry;
	}

	autofillDefaultFields(config: IConfig) {
		const updatedConfig = structuredClone(config);
		const updatedEntries: IEntry[] = [];
		for (let entry of updatedConfig.entries ?? []) {
			if (
				this.renderTemplate(
					(entry.autofill_entity_id ?? true) as unknown as string,
					this.getEntryContext(entry),
				)
			) {
				// Feature entity ID
				entry = this.populateMissingEntityId(
					entry,
					this.context.entity_id,
				);
				const entryEntityId = this.renderTemplate(
					entry.entity_id as string,
					this.getEntryContext(entry),
				) as string;

				switch (
					this.renderTemplate(
						entry.type as string,
						this.getEntryContext(entry),
					)
				) {
					case 'selector': {
						// Get option names from attributes if it exists
						const options = entry.options ?? [];
						let optionNames: string[] = [];
						if (entryEntityId) {
							optionNames =
								(this.hass.states[entryEntityId]?.attributes
									?.options as string[]) ??
								new Array<string>(options.length);
						}
						if (optionNames.length < options.length) {
							optionNames = Object.assign(
								new Array(options.length),
								optionNames,
							);
						}
						for (const i in options) {
							if (
								this.renderTemplate(
									(options[i].autofill_entity_id ??
										true) as unknown as string,
									this.getEntryContext(options[i]),
								)
							) {
								options[i] = this.populateMissingEntityId(
									options[i],
									entry.entity_id as string,
								);

								// Default option
								if (!options[i].option) {
									options[i].option = optionNames[i];
								}

								// Default select action
								if (
									!options[i].tap_action &&
									!options[i].double_tap_action &&
									!options[i].hold_action
								) {
									const [domain, _service] = (
										entryEntityId ?? ''
									).split('.');
									const tap_action = {} as IAction;
									tap_action.action = 'call-service';
									switch (domain) {
										case 'select':
											tap_action.service =
												'select.select_option';
											break;
										case 'input_select':
										default:
											tap_action.service =
												'input_select.select_option';
											break;
									}

									// Set option name using options attribute if it is not set
									const data = tap_action.data ?? {};
									if (!data.option) {
										data.option = optionNames[i];
										tap_action.data = data;
									}
									const target = tap_action.target ?? {};
									if (!target.entity_id) {
										target.entity_id =
											entryEntityId as string;
										tap_action.target = target;
									}
									options[i].tap_action = tap_action;
								}
							}
						}
						entry.options = options;
						break;
					}
					case 'spinbox':
						// Increment and decrement fields
						if (
							entry.increment &&
							this.renderTemplate(
								(entry.increment?.autofill_entity_id ??
									true) as unknown as string,
								this.getEntryContext(entry.increment),
							)
						) {
							entry.increment = this.populateMissingEntityId(
								entry.increment as IEntry,
								entry.entity_id as string,
							);
						}
						if (
							entry.decrement &&
							this.renderTemplate(
								(entry.decrement?.autofill_entity_id ??
									true) as unknown as string,
								this.getEntryContext(entry.decrement),
							)
						) {
							entry.decrement = this.populateMissingEntityId(
								entry.decrement as IEntry,
								entry.entity_id as string,
							);
						}
					// falls through
					case 'slider': {
						const [domain, _service] = (entryEntityId ?? '').split(
							'.',
						);

						let rangeMin = entry.range?.[0];
						let rangeMax = entry.range?.[1];
						if (rangeMin == undefined) {
							rangeMin =
								this.hass.states[entryEntityId]?.attributes
									?.min ?? 0;
						}
						if (rangeMax == undefined) {
							rangeMax =
								this.hass.states[entryEntityId]?.attributes
									?.max ?? 100;
						}
						entry.range = [rangeMin as number, rangeMax as number];

						if (!entry.tap_action) {
							const tap_action = {} as IAction;
							const data = tap_action.data ?? {};
							tap_action.action = 'call-service';
							switch (domain) {
								case 'number':
									tap_action.service = 'number.set_value';
									if (!data.value) {
										data.value = '{{ value | float }}';
										tap_action.data = data;
									}
									break;
								case 'input_number':
									tap_action.service =
										'input_number.set_value';
									if (!data.value) {
										data.value = '{{ value | float }}';
										tap_action.data = data;
									}
									break;
								default:
									break;
							}

							const target = tap_action.target ?? {};
							if (!target.entity_id) {
								target.entity_id = entryEntityId as string;
								tap_action.target = target;
							}
							entry.tap_action = tap_action;
						}

						if (!entry.step) {
							const defaultStep =
								this.hass.states[entryEntityId as string]
									?.attributes?.step;
							if (defaultStep) {
								entry.step = defaultStep;
							} else {
								const entryContext =
									this.getEntryContext(entry);
								entry.step =
									((this.renderTemplate(
										entry.range[1],
										entryContext,
									) as unknown as number) -
										(this.renderTemplate(
											entry.range[0],
											entryContext,
										) as unknown as number)) /
									100;
							}
						}
						break;
					}
					case 'button':
					case 'default':
						break;
				}
			}
			updatedEntries.push(entry);
		}
		updatedConfig.entries = updatedEntries;
		return updatedConfig;
	}

	updateDeprecatedFields(config: IConfig = this.config): IConfig {
		const updatedConfig = structuredClone(config);
		for (let entry of updatedConfig.entries) {
			entry = this.updateDeprecatedEntryFields(entry);
			for (let option of entry.options ?? []) {
				option = this.updateDeprecatedEntryFields(option);
			}
			if (entry.increment) {
				entry.increment = this.updateDeprecatedEntryFields(
					entry.increment,
				);
			}
			if (entry.decrement) {
				entry.decrement = this.updateDeprecatedEntryFields(
					entry.decrement,
				);
			}
		}

		if (updatedConfig['style' as keyof IConfig]) {
			let styles = ':host {';
			const style = updatedConfig[
				'style' as keyof IConfig
			] as unknown as Record<string, string>;
			for (const field in style) {
				styles += `\n  ${field}: ${style[field]} !important;`;
			}
			styles += `\n}`;
			updatedConfig.styles = styles + (updatedConfig.styles ?? '');
			delete updatedConfig['style' as keyof IConfig];
		}
		if (updatedConfig['hide' as keyof IConfig]) {
			let styles = `\n{% if ${(
				updatedConfig['hide' as keyof IConfig] as string
			)
				.replace('{{', '')
				.replace('}}', '')} %}`;
			styles += '\n:host {\n  display: none !important;\n}';
			styles += '\n{% endif %};';
			updatedConfig.styles = styles + (updatedConfig.styles ?? '');
			delete updatedConfig['hide' as keyof IConfig];
		}
		if (updatedConfig['show' as keyof IConfig]) {
			let styles = `\n{% if not ${(
				updatedConfig['show' as keyof IConfig] as string
			)
				.replace('{{', '')
				.replace('}}', '')} %}`;
			styles += '\n:host {\n  display: none !important;\n}';
			styles += '\n{% endif %}';
			updatedConfig.styles = styles + (updatedConfig.styles ?? '');
			delete updatedConfig['show' as keyof IConfig];
		}
		return updatedConfig;
	}

	updateDeprecatedEntryFields(entry: IEntry) {
		// Copy action fields to tap_action
		const actionKeys = [
			'service',
			'service_data',
			'data',
			'target',
			'navigation_path',
			'navigation_replace',
			'url_path',
			'confirmation',
			'pipeline_id',
			'start_listening',
		];
		const tapAction = entry.tap_action ?? ({} as IAction);
		let updateTapAction = false;
		for (const actionKey of actionKeys) {
			if (actionKey in entry) {
				updateTapAction = true;
				(tapAction as unknown as Record<string, string>)[actionKey] =
					entry[actionKey as keyof IEntry] as string;
				delete (entry as unknown as Record<string, string>)[actionKey];
			}
		}
		if (updateTapAction) {
			entry.tap_action = tapAction as IAction;
		}

		// For each type of action
		for (const actionType of ActionTypes) {
			if (actionType in entry) {
				const action = entry[actionType as keyof IActions] as IAction;
				if (action) {
					// Populate action field
					if (!action.action) {
						if (action.service) {
							action.action = 'call-service';
						} else if (action.navigation_path) {
							action.action = 'navigate';
						} else if (action.url_path) {
							action.action = 'url';
						} else if (action.browser_mod) {
							action.action = 'fire-dom-event';
						} else if (
							action.pipeline_id ||
							action.start_listening
						) {
							action.action = 'assist';
						} else {
							action.action = 'none';
						}
					}

					if (action['service_data' as keyof IAction]) {
						action.data = {
							...(action[
								'service_data' as keyof IAction
							] as IData),
							...action.data,
						};
						delete action['service_data' as keyof IAction];
					}
				}
			}
		}

		// Set entry type to button if not present
		entry.type = (entry.type ?? 'button').toLowerCase() as TileFeatureType;

		// Move style keys to style object
		let deprecatedStyleKeyPresent = false;
		const deprecatedStyleKeys: Record<string, string> = {
			color: '--color',
			opacity: '--opacity',
			icon_color: '--icon-color',
			label_color: '--label-color',
			background_color: '--background',
			background_opacity: '--background-opacity',
			flex_basis: 'flex-basis',
		};
		let styles = ':host {';
		for (const field in deprecatedStyleKeys) {
			if (entry[field as keyof IEntry]) {
				deprecatedStyleKeyPresent = true;
				styles += `\n${deprecatedStyleKeys[field]}: ${
					entry[field as keyof IEntry]
				} !important;`;
				delete entry[field as keyof IEntry];
			}
		}
		styles += '\n';
		if (deprecatedStyleKeyPresent) {
			entry.styles = styles + (entry.styles ?? '');
		}

		if (entry['style' as keyof IEntry]) {
			let styles = ':host {';
			const style = entry['style' as keyof IEntry] as Record<
				string,
				string
			>;
			for (const field in style) {
				styles += `\n  ${field}: ${style[field]} !important;`;
			}
			styles += '\n}';
			entry.styles = styles + (entry.styles ?? '');
			delete entry['style' as keyof IEntry];
		}

		const deprecatedStyles: Record<string, string> = {
			background_style: '.background',
			icon_style: '.icon',
			label_style: '.label',
			slider_style: '.slider',
			tooltip_style: '.tooltip',
		};
		for (const field in deprecatedStyles) {
			if (entry[field as keyof IEntry]) {
				const style = entry[field as keyof IEntry] as Record<
					string,
					string
				>;
				let styles = `\n${deprecatedStyles[field]} {`;
				for (const key in style) {
					styles += `\n  ${key}: ${style[key]} !important;`;
				}
				if (
					field == 'tooltip_style' &&
					entry['tooltip' as keyof IEntry]
				) {
					styles += `  display: ${
						entry['tooltip' as keyof IEntry] ? 'initial' : 'none'
					} !important;`;
					delete entry['tooltip' as keyof IEntry];
				}
				styles += '\n}';
				entry.styles = (entry.styles ?? '') + styles;
				delete entry[field as keyof IEntry];
			}
		}
		return entry;
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
			.action-options {
				display: inline-flex;
				flex-direction: column;
				gap: 8px;
				box-sizing: border-box;
				width: 100%;
			}

			ha-expansion-panel {
				display: block;
				border-radius: 6px;
				border: solid 1px var(--outline-color);
				--ha-card-border-radius: 6px;
				--expansion-panel-content-padding: 0;
			}
			ha-icon {
				display: flex;
				color: var(--secondary-text-color);
			}
			ha-button-menu {
				margin: 0 18px 12px;
			}
			ha-button {
				width: fit-content;
				--mdc-icon-size: 100%;
			}
			ha-list-item {
				text-transform: capitalize;
			}

			.feature-list-item {
				display: flex;
				align-items: center;
				pointer-events: none;
			}

			.handle {
				display: flex;
				align-items: center;
				cursor: move;
				cursor: grab;
				padding-right: 8px;
				padding-inline-end: 8px;
				padding-inline-start: initial;
				direction: var(--direction);
				pointer-events: all;
			}

			.feature-list-item-content {
				height: 60px;
				font-size: 16px;
				display: flex;
				align-items: center;
				justify-content: flex-start;
				flex-grow: 1;
				gap: 8px;
			}
			.primary:first-letter {
				text-transform: capitalize;
			}
			.feature-list-item-label {
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
			}
			.header-icon {
				color: var(--mdc-dialog-content-ink-color, rgba(0, 0, 0, 0.6));
			}
			.back-title {
				display: flex;
				align-items: center;
				font-size: 18px;
			}

			.wrapper {
				width: 100%;
			}
			.gui-editor {
				display: inline-flex;
				flex-direction: column;
				gap: 24px;
				padding: 8px 0px;
				width: 100%;
			}
			.yaml-editor {
				display: inline-flex;
				flex-direction: column;
				padding: 8px 0px;
				width: 100%;
			}
			ha-code-editor {
				--code-mirror-max-height: calc(100vh - 245px);
			}
			.error,
			.info {
				word-break: break-word;
				margin-top: 8px;
			}
			.error {
				color: var(--error-color);
			}
			.error ul {
				margin: 4px 0;
			}
			.warning li,
			.error li {
				white-space: pre-wrap;
			}

			.entry-list-header {
				font-size: 20px;
				font-weight: 500;
			}
			.panel-header {
				display: inline-flex;
				gap: 4px;
			}
			.style-header {
				font-size: var(--mdc-typography-body1-font-size, 1rem);
				font-weight: 500;
				padding: 8px;
			}

			paper-tabs {
				color: var(--primary-text-color);
				text-transform: uppercase;
				border-bottom: 1px solid var(--divider-color);
				--paper-tabs-selection-bar-color: var(--primary-color);
			}
			paper-tab.iron-selected {
				box-shadow: inset 0 -2px 0 0 var(--primary-color);
				transition: box-shadow 1s;
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
