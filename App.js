import StackNavigator from './StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './hooks/useAuth';

//https://www.nativewind.dev/quick-starts/expo (NATIVE WIND USED FOR CSS)

//vid: 10:11:10, match not currently working - need to debug
export default function App() {
  return (
      <NavigationContainer>
        <AuthProvider>
          <StackNavigator/>
        </AuthProvider>
      </NavigationContainer>
  );
}

