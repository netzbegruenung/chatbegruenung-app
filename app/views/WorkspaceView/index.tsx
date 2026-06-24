import React, { useLayoutEffect } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type CompositeNavigationProp } from '@react-navigation/core';
import { shallowEqual } from 'react-redux';

import { type OutsideModalParamList, type OutsideParamList } from '../../stacks/types';
import I18n from '../../i18n';
import ActivityIndicator from '../../containers/ActivityIndicator';
import Button from '../../containers/Button';
import { useWorkspaceDomain } from '../../lib/hooks/useWorkspaceDomain';
import { useTheme } from '../../theme';
import FormContainer, { FormContainerInner } from '../../containers/FormContainer';
import { type IAssetsFavicon512 } from '../../definitions/IAssetsFavicon512';
import { type IServices } from '../../selectors/login';
import ServerAvatar from './ServerAvatar';
import styles from './styles';
import { useAppSelector } from '../../lib/hooks/useAppSelector';
import appConfig from '../../../app.json';
import * as ServiceLogin from '../../containers/LoginServices/serviceLogin';

type TNavigation = CompositeNavigationProp<
	NativeStackNavigationProp<OutsideParamList, 'WorkspaceView'>,
	NativeStackNavigationProp<OutsideModalParamList>
>;

const useWorkspaceViewSelector = () =>
	useAppSelector(state => ({
		Assets_favicon_512: state.settings.Assets_favicon_512 as IAssetsFavicon512,
		registrationForm: state.settings.Accounts_RegistrationForm as string,
		Accounts_iframe_enabled: state.settings.Accounts_iframe_enabled as boolean,
		inviteLinkToken: state.inviteLinks.token,
		// After SAML succeeds the webview pops back to WorkspaceView before `handleLoginSuccess` flips root to INSIDE.
		// `isFetching` covers the LOGIN.REQUEST → LOGIN.SUCCESS window; `isAuthenticated` covers the gap until root flips.
		isLoggingIn: state.login.isFetching || state.login.isAuthenticated
	}));

const WorkspaceView = () => {
	const navigation = useNavigation<TNavigation>();

	const { colors } = useTheme();

	const workspaceDomain = useWorkspaceDomain();

	const services = useAppSelector(state => state.login.services as IServices, shallowEqual);

	const { Accounts_iframe_enabled, Assets_favicon_512, inviteLinkToken, isLoggingIn, registrationForm } =
		useWorkspaceViewSelector();

	useLayoutEffect(() => {
		navigation.setOptions({
			// Use the app name instead of the server name as header title
			title: appConfig.name,
			// Hide the back button in the header
			headerLeft: () => <View />
		});
	}, [navigation, workspaceDomain]);

	const showRegistrationButton = !!(
		!Accounts_iframe_enabled &&
		(registrationForm === 'Public' || (registrationForm === 'Secret URL' && inviteLinkToken?.length))
	);

	// The login button stays visible from the first render; while login services are still loading we render it disabled
	const loginService = Object.values(services)[0];

	const login = () => {
		// Directly use the only configured login via saml to avoid the need for a second click on a login button
		ServiceLogin.onPressSaml({ loginService, server: appConfig.server });
	};

	const register = () => {
		navigation.navigate('RegisterView', { title: workspaceDomain });
	};

	return (
		<FormContainer testID='workspace-view'>
			{isLoggingIn ? (
				<ActivityIndicator size='large' />
			) : (
				<FormContainerInner>
					<View style={styles.alignItemsCenter}>
						<ServerAvatar url={appConfig.server} image={Assets_favicon_512?.url ?? Assets_favicon_512?.defaultUrl} />
						{/* Display the app name instead of the server name */}
						<Text style={[styles.serverName, { color: colors.fontTitlesLabels }]}>{appConfig.name}</Text>
						{/* Use the hardcoded server URL so it renders before settings load */}
						<Text style={[styles.serverUrl, { color: colors.fontSecondaryInfo }]}>{appConfig.server}</Text>
					</View>
					<Button title={I18n.t('Login')} type='primary' onPress={login} loading={!loginService} testID='workspace-view-login' />
					{/* Hide login via GrünesNetz hint as we directly open the login  */}
					{showRegistrationButton ? (
						<Button title={I18n.t('Create_account')} type='secondary' onPress={register} testID='workspace-view-register' />
					) : null}
				</FormContainerInner>
			)}
		</FormContainer>
	);
};

export default WorkspaceView;
