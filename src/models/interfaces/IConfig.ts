export interface IConfig {
	type: string;
	buttons: [
		{
			service: string;
			data?: {
				entity_id?: string;
				[key: string]: string | number | boolean | undefined;
			};
			icon?: string;
			color?: string;
			opacity?: number;
			icon_color?: string;
			label?: string;
			label_color?: string;
		},
	];
}
