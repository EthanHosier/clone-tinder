import { SafeAreaView, Text, TextInput, View, Button, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, FlatList} from 'react-native'
import React, {useEffect, useState} from 'react'
import Header from '../components/Header'
import getMatchedUserInfo from '../lib/getMatchedUserInfo';
import useAuth from '../hooks/useAuth';
import { useRoute } from '@react-navigation/native';
import SenderMessage from '../components/SenderMessage'
import ReceiverMessage from '../components/ReceiverMessage'
import { addDoc, collection, onSnapshot, orderBy, serverTimestamp, query, doc } from 'firebase/firestore';
import { db } from '../firebase';

const MessageScreen = () => {
    const {user}= useAuth();
    const {params} = useRoute();
    const {matchDetails} = params;

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(()=> 
        onSnapshot(
            query(
                collection(db, "matches", matchDetails.id, "messages"), orderBy("timestamp","desc")
            )
        , snapshot => setMessages(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),

        }
        ))))
    , [matchDetails, db])

    const sendMessage = () =>{
        addDoc(collection(db, "matches", matchDetails.id, "messages"), {
            timestamp: serverTimestamp(),
            userId: user.uid,
            displayName: user.displayName,
            photoURL: matchDetails.users[user.uid].photoURL,
            message: input,
        })

        setInput("");
    }

    //if this isnt working, set the className="flex-1" to style{{flex 1 etc}} instead
    return (
     <SafeAreaView className="flex-1">
        <Header callEnabled title={getMatchedUserInfo(matchDetails?.users, user.uid).displayName} />

        <KeyboardAvoidingView
            behavior={Platform.OS === "ios"? "padding":"height"}
            className="flex-1"
            keyboardVerticalOffset={10}
        >

                <FlatList
                    data={messages}
                    inverted
                    className="pl-4"
                    keyExtractor={item => item.id}
                    renderItem={({item:message}) => 
                
                    message.userId === user.uid ? (
                        <SenderMessage key={message.id} message={message} />
                    ):(
                        <ReceiverMessage key={message.id} message={message} />
                    )
                }
                />
       
            <View className= "flex-row justify-between items-center border-t border-gray-200 px-5 py-2 ">
                <TextInput
                    className="h-10 text-lg"
                    placeholder="Send Message"
                    onChangeText={setInput}
                    onSubmitEditing={sendMessage}
                    value={input}
                
                /> 
                <Button title="Send" color="#FF5864" onPress={sendMessage}/>
            </View>

       
        </KeyboardAvoidingView>

       
     </SafeAreaView>
  )
}

export default MessageScreen