export interface IConfig {
	type: string;
	buttons: [
		{
			service: string;
			data?: {
				entity_id?: string;
				[key: string]: string | number | boolean | undefined;
			};
			color?: string;
			opacity?: number;
			icon?: string;
			icon_color?: string;
			label?: string;
			label_color?: string;
		},
	];
}
