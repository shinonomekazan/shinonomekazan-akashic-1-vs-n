export class Localization {
	public static language: "vi" | "en" = "vi";

	private static strings: { [key: string]: { vi: string; en: string } } = {
		wait_opp_action: {
			vi: "...",
			en: "...",
		},
		
	};

	public static getText(key: string, ...args: any[]): string {
		const entry = this.strings[key];
		if (!entry) return key;
		let text = entry[this.language];
		args.forEach((arg, index) => {
			text = text.replace(`{${index}}`, arg);
		});
		return text;
	}
}
