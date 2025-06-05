import bugsnag from '@bugsnag/react-native';

import events from './events';

export { events };

const reportCrashErrors = false;
const reportAnalyticsEvents = false;

export const getReportCrashErrorsValue = (): boolean => reportCrashErrors;
export const getReportAnalyticsEventsValue = (): boolean => reportAnalyticsEvents;

bugsnag.start({
	onBreadcrumb() {
		return reportAnalyticsEvents;
	},
	onError(event) {
		if (!reportAnalyticsEvents) {
			event.breadcrumbs = [];
		}
		return reportCrashErrors;
	}
});

let metadata = {};

export const logServerVersion = (serverVersion: string): void => {
	metadata = {
		serverVersion
	};
};

export const logEvent = (eventName: string, payload?: { [key: string]: any }): void => {
	try {
		bugsnag.leaveBreadcrumb(eventName, payload);
	} catch {
		// Do nothing
	}
};

export const setCurrentScreen = (currentScreen: string): void => {
	bugsnag.leaveBreadcrumb(currentScreen, { type: 'navigation' });
};

export const toggleCrashErrorsReport = (_: boolean): boolean => false;

export const toggleAnalyticsEventsReport = (_: boolean): boolean => false;

const log = (e: any): void => {
	if (e instanceof Error && bugsnag && e.message !== 'Aborted' && !__DEV__) {
		bugsnag.notify(e, (event: { addMetadata: (arg0: string, arg1: {}) => void }) => {
			event.addMetadata('details', { ...metadata });
		});
	} else {
		console.error(e);
	}
};
export default log;
