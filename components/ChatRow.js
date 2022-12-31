import { View, Text, TouchableOpacity,Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import useAuth from '../hooks/useAuth';
import getMatchedUserInfo from '../lib/getMatchedUserInfo';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const ChatRow = ({matchDetails}) => {

    const navigation = useNavigation();
    const {user}= useAuth()
    const [matchedUserInfo ,setMatchedUserInfo] = useState(null);
    const [lastMessage, setLastMessage] = useState("")

    useEffect(()=>{
        setMatchedUserInfo(getMatchedUserInfo(matchDetails.users, user.uid))
    }, [matchDetails, user]);


    //this isn't very efficient way of getting the last message (as then have to get all the messages again once inside the actual chat screen) SO DON'T DO THIS IN ACTUAL APP (use local storage to store last message? - then only have to query database once)
    useEffect(() => 
        onSnapshot(query(collection(db,"matches",matchDetails.id, "messages"), orderBy("timestamp","desc")),
        snapshot => setLastMessage(snapshot.docs[0]?.data().message) //USE 'limit to 1' HERE INSTEAD!!!
        )

    ,[matchDetails,db])

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate("Message", {
                matchDetails,
            })}
            className="flex-row items-center py-3 px-5 bg-white mx-3 my-1 rounded-lg shadow-sm"
        >
            <Image 
                style={{height:64, width:64}}
                className="rounded-full mr-4"
                source={{uri: matchedUserInfo?.photoURL}}
            />

            <View>
                <Text className="text-lg font-semibold">
                    {matchedUserInfo?.displayName}
                </Text>
                <Text>{lastMessage || "Say Hi!"}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default ChatRow