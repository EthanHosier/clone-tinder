import { View, Text,Button, ImageBackground, TouchableOpacity } from 'react-native'
import React from 'react'
import useAuth from '../hooks/useAuth'
import { useNavigation } from '@react-navigation/native'

const LoginScreen = () => {
    //google sign in
    const {signInWithGoogle, loading} = useAuth();
    const navigation = useNavigation();
    /*
    useLayoutEffect
      navigation.SetOptions({
        headerShown: false,
      })
    */

    return (
    <View className="flex-1">
        <ImageBackground className="flex-1"
        resizeMode='cover'
        
        source={{uri: "https://tinder.com/static/tinder.png"}}
        >
          <TouchableOpacity className="absolute bottom-40 w-52 bg-white rounded-2xl p-4" 
          style={{marginHorizontal: '25%'}}
          onPress={signInWithGoogle}
          >
            <Text className="text-center font-semibold">Sign in & get swiping</Text>
          </TouchableOpacity>
        </ImageBackground>
    </View>
  )
}

export default LoginScreen