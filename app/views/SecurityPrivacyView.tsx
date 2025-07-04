import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';

import * as List from '../containers/List';
import SafeAreaView from '../containers/SafeAreaView';
import I18n from '../i18n';
import { useAppSelector } from '../lib/hooks';
import useServer from '../lib/methods/useServer';
import { SettingsStackParamList } from '../stacks/types';
import { handleLocalAuthentication } from '../lib/methods/helpers/localAuthentication';
import { events, logEvent } from '../lib/methods/helpers/log';

interface ISecurityPrivacyViewProps {
	navigation: NativeStackNavigationProp<SettingsStackParamList, 'SecurityPrivacyView'>;
}

const SecurityPrivacyView = ({ navigation }: ISecurityPrivacyViewProps): JSX.Element => {
	const [server] = useServer();

	const e2eEnabled = useAppSelector(state => state.settings.E2E_Enable);

	useEffect(() => {
		navigation.setOptions({
			title: I18n.t('Security_and_privacy')
		});
	}, [navigation]);

	const navigateToScreen = (screen: 'E2EEncryptionSecurityView' | 'ScreenLockConfigView') => {
		// @ts-ignore
		logEvent(events[`SP_GO_${screen.replace('View', '').toUpperCase()}`]);
		navigation.navigate(screen);
	};

	const navigateToScreenLockConfigView = async () => {
		if (server?.autoLock) {
			await handleLocalAuthentication(true);
		}
		navigateToScreen('ScreenLockConfigView');
	};

	return (
		<SafeAreaView testID='security-privacy-view'>
			<List.Container testID='security-privacy-view-list'>
				<List.Section>
					<List.Separator />
					{e2eEnabled ? (
						<>
							<List.Item
								title='E2E_Encryption'
								showActionIndicator
								onPress={() => navigateToScreen('E2EEncryptionSecurityView')}
								testID='security-privacy-view-e2e-encryption'
							/>
							<List.Separator />
						</>
					) : null}
					<List.Item
						title='Screen_lock'
						showActionIndicator
						onPress={navigateToScreenLockConfigView}
						testID='security-privacy-view-screen-lock'
					/>
					<List.Separator />
				</List.Section>
			</List.Container>
		</SafeAreaView>
	);
};

export default SecurityPrivacyView;
