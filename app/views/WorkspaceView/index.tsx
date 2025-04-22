import { useLayoutEffect } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type CompositeNavigationProp } from '@react-navigation/core';
import { shallowEqual } from 'react-redux';

import { type OutsideModalParamList, type OutsideParamList } from '../../stacks/types';
import I18n from '../../i18n';
import Button from '../../containers/Button';
import { useWorkspaceDomain } from '../../lib/hooks/useWorkspaceDomain';
import { useTheme } from '../../theme';
import FormContainer, { FormContainerInner } from '../../containers/FormContainer';
import { type IAssetsFavicon512 } from '../../definitions/IAssetsFavicon512';
import { getShowLoginButton, type IServices } from '../../selectors/login';
import ServerAvatar from './ServerAvatar';
import styles from './styles';
import { useAppSelector } from '../../lib/hooks/useAppSelector';
import * as ServiceLogin from '../../containers/LoginServices/serviceLogin';

type TNavigation = CompositeNavigationProp<
	NativeStackNavigationProp<OutsideParamList, 'WorkspaceView'>,
	NativeStackNavigationProp<OutsideModalParamList>
>;

const useWorkspaceViewSelector = () =>
	useAppSelector(state => ({
		server: state.server.server,
		Site_Name: state.settings.Site_Name as string,
		Site_Url: state.settings.Site_Url as string,
		Assets_favicon_512: state.settings.Assets_favicon_512 as IAssetsFavicon512,
		registrationForm: state.settings.Accounts_RegistrationForm as string,
		Accounts_iframe_enabled: state.settings.Accounts_iframe_enabled as boolean,
		showLoginButton: getShowLoginButton(state),
		inviteLinkToken: state.inviteLinks.token
	}));

const WorkspaceView = () => {
	const navigation = useNavigation<TNavigation>();

	const { colors } = useTheme();

	const workspaceDomain = useWorkspaceDomain();

	const services = useAppSelector(state => state.login.services as IServices, shallowEqual);

	const {
		Accounts_iframe_enabled,
		Assets_favicon_512,
		Site_Name,
		Site_Url,
		inviteLinkToken,
		registrationForm,
		server,
		showLoginButton
	} = useWorkspaceViewSelector();

	useLayoutEffect(() => {
		navigation.setOptions({
			title: workspaceDomain
		});
	}, [navigation, workspaceDomain]);

	const showRegistrationButton = !!(
		!Accounts_iframe_enabled &&
		(registrationForm === 'Public' || (registrationForm === 'Secret URL' && inviteLinkToken?.length))
	);

	const login = () => {
		// Directly use the only configured login via saml to avoid the need for a second click on a login button
		ServiceLogin.onPressSaml({ loginService: Object.values(services)[0], server });
	};

	const register = () => {
		navigation.navigate('RegisterView', { title: workspaceDomain });
	};

	return (
		<FormContainer testID='workspace-view'>
			<FormContainerInner>
				<View style={styles.alignItemsCenter}>
					<ServerAvatar url={server} image={Assets_favicon_512?.url ?? Assets_favicon_512?.defaultUrl} />
					<Text style={[styles.serverName, { color: colors.fontTitlesLabels }]}>{Site_Name}</Text>
					<Text style={[styles.serverUrl, { color: colors.fontSecondaryInfo }]}>{Site_Url}</Text>
				</View>
				{showLoginButton ? <Button title={I18n.t('Login')} type='primary' onPress={login} testID='workspace-view-login' /> : null}
				{/* Hide login via GrünesNetz hint as we directly open the login  */}
				{showRegistrationButton ? (
					<Button title={I18n.t('Create_account')} type='secondary' onPress={register} testID='workspace-view-register' />
				) : null}
			</FormContainerInner>
		</FormContainer>
	);
};

export default WorkspaceView;
