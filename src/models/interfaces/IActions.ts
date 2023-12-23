export type Action = 'call-service' | 'navigate' | 'url' | 'assist' | 'none';

export interface IData {
	[key: string]: string | string[] | number | number[] | boolean;
}

export interface ITarget {
	entity_id?: string | string[];
	device_id?: string | string[];
	area_id?: string | string[];
}

export interface IConfirmation {
	text?: string;
	exemptions?: [{ user: string }];
}

export interface IAction {
	action: Action;

	service?: string;
	data?: IData;
	target?: ITarget;

	navigation_path?: string;
	navigation_replace?: boolean;
	url_path?: string;

	confirmation?: boolean | IConfirmation;

	pipeline_id?: string;
	start_listening?: boolean;
}

export interface IActions {
	tap_action?: IAction;
	hold_action?: IAction;
	double_tap_action?: IAction;
}

export type ActionType = 'tap_action' | 'hold_action' | 'double_tap_action';
