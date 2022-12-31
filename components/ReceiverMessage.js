import { View, Text, Image } from 'react-native'
import React from 'react'

const ReceiverMessage = ({message}) => {
  return (
    <View
    className="bg-red-400 rounded-lg rounded-tl-none px-5 py-3 mx-3 my-2 ml-14"
    style={{alignSelf:"flex-start"}}
    >
    
      <Image 
      style={{height:48, width:48}}
      className="rounded-full absolute top-0 -left-14"
      source={{uri: message.photoURL}}
      />

      <Text
      className="text-white"
      >{message.message}</Text>
    </View>
  )
}

export default ReceiverMessage