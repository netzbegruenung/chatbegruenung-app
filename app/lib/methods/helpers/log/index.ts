import events from './events';

export { events };

const reportCrashErrors = false;
const reportAnalyticsEvents = false;

export const getReportCrashErrorsValue = (): boolean => reportCrashErrors;
export const getReportAnalyticsEventsValue = (): boolean => reportAnalyticsEvents;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let metadata = {};

export const logServerVersion = (serverVersion: string): void => {
	metadata = {
		serverVersion
	};
};

export const logEvent = (_: string, __?: { [key: string]: any }): void => {
	try {
		// Do nothing
	} catch {
		// Do nothing
	}
};

export const setCurrentScreen = (_: string): void => {
	// Do nothing
};

export const toggleCrashErrorsReport = (_: boolean): boolean => false;

export const toggleAnalyticsEventsReport = (_: boolean): boolean => false;

const log = (e: any): void => {
	if (e instanceof Error && e.message !== 'Aborted' && !__DEV__) {
		// Do nothing
	} else {
		console.error(e);
	}
};
export default log;
