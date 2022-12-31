import { SafeAreaView, Text, Button, View, TouchableOpacity,Image } from 'react-native'
import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react'
import { useNavigation } from '@react-navigation/native'
import useAuth from '../hooks/useAuth';
import {AntDesign, Entypo, Ionicons} from "@expo/vector-icons"
import TinderCard from 'react-tinder-card'
import { Dimensions } from 'react-native';
import { collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { async } from '@firebase/util';
import generateId from '../lib/generateId';

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const CARD_HEIGHT= windowHeight * 0.65;
const CARD_WIDTH = windowWidth * 0.8;
const DUMMY_DATA =
[
  {
    id:123,
    firstname: "Elon",
    lastname: "Musk",
    job: "Billionaire",
    photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/800px-Elon_Musk_Royal_Society_%28crop2%29.jpg",
    age: 50
  },
  {
    id:456,
    firstname: "Bob",
    lastname: "Smith",
    job: "Teacher",
    photoURL: "https://c0.wallpaperflare.com/preview/192/66/526/front-view-of-man-s-face.jpg",
    age: 22
  },
  {
    id:789,
    firstname: "Ellie",
    lastname: "Hosier",
    job:"Builder",
    photoURL: "https://img.buzzfeed.com/buzzfeed-static/static/2015-09/29/12/enhanced/webdr03/original-8789-1443543100-3.jpg",
    age: 32
  }
]

const alreadyRemoved = []

const HomeScreen = () => {
  const [profiles,setProfiles] = useState([]);
  const navigation = useNavigation();
  const {logout,user} = useAuth();

  const swipeRefs = useMemo(() => Array(3).fill(0).map(i => React.createRef()), [])

  const outOfFrame = (id) => {
    let newProfiles = profiles.filter(person => person.id !== id)
    setProfiles(newProfiles)
  }

  const swipe = (dir) => {
    const cardsLeft = profiles.filter(person => !alreadyRemoved.includes(person.id))
    if (cardsLeft.length) {
      const toBeRemoved = cardsLeft[cardsLeft.length - 1].id // Find the card object to be removed
      const index =profiles.map(person => person.id).indexOf(toBeRemoved) // Find the index of which to make the reference to
      alreadyRemoved.push(toBeRemoved) // Make sure the next card gets removed next time if this card do not have time to exit the screen
      swipeRefs[index].current.swipe(dir) // Swipe the card!
    }
  }

  const swipeLeft = (passedUser) =>{
    setDoc(/* location, payload */)
    setDoc(doc(db, "users", user.uid, "passes", passedUser.id),passedUser)
  }

  const swipeRight= async(userSwiped) =>{
    
    //TODO: MOVE THIS OUT OF THIS FUNCTION (so only have to make this call once, and not every time swiped???) - use onSnapshot so then updates if needed
    const loggedInProfile = (await getDoc(doc(db, "users", user.uid))).data();

    //in production, implement this logic on the actual server: (so that no user can directly see other person's data)


    getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
      async documentSnapshot => {

        if(documentSnapshot.exists()){
          //user has already matched with you before you matched with them...

          //Create a MATCH:
          await setDoc(doc(db, 'matches', generateId(user.uid, userSwiped.id)),{

            //used to 'tell which user is which' w/o having to do secondary fetch (HOWEVER, NOW THE DATA IS NOT UP TO DATE)
            users: {
              [user.uid] : loggedInProfile,
              [userSwiped.id] : userSwiped,
            },
            //used for string comparison:
            usersMatched: [user.uid, userSwiped.id],
            timestamp: serverTimestamp(),
          })


          await setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),userSwiped
          )

          navigation.navigate("Match", {
            //props
            loggedInProfile,
            userSwiped
          })

        }else{
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),userSwiped
          )
        }

      
      }
    )

    
  }


  //TODO: revise unsubbing listeners
  //if user doesn't have account, forces open modal
  useLayoutEffect(
    ()=>
    onSnapshot(doc(db, "users", user.uid), snapshot => {
      //snapshot is what the document is NOW - updated if changes
      if(!snapshot.exists()){
        navigation.navigate("Modal")
      }
    }) 
  ,[])

  //fetching the profiles
  useEffect(()=>{
    let unsub;
    const fetchCards = async() =>{

      //not real-time snapshot as getDocs() so doesn't update
      const passes= await getDocs(collection(db,"users",user.uid,"passes")).then(
        snapshot => snapshot.docs.map(doc => doc.id)
      )

      const swipes= await getDocs(collection(db, "users",user.uid,"swipes")).then(
        snapshot => snapshot.docs.map(doc => doc.id)
      )

      //as cant pass empty array as query
      const passedUserIds = passes.length > 0? passes : ['test'];
      const swipedUserIds = swipes.length > 0? swipes : ['test'];

      //doesn't fetch users already passed on
      unsub = onSnapshot(query(collection(db, 'users'), where("id","not-in",[...passedUserIds, ...swipedUserIds])), snapshot =>{
        setProfiles( //reshape doc
          snapshot.docs.filter(doc => doc.id !== user.uid).map(doc => ({
            id: doc.id,
            ...doc.data(),
          }) )
        )
      }) 
    }

    fetchCards();
    return unsub;
  },[db, ])


  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
        <View className="items-center relative px-5 flex-row justify-between">
          <TouchableOpacity onPress={logout}>
            <Image className="h-10 w-10 rounded-full" source={{uri: user.photoURL}}/>
          </TouchableOpacity>
        
          <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
            <Image className="h-14 w-14" source={require("../logo.png")}/>
          </TouchableOpacity>
        
          <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
            <Ionicons name='chatbubbles-sharp' size={30} color="#FF5864"/>
          </TouchableOpacity>

        </View>
      {/* End of Header */}

      {/* Cards */}

      <View className=" mt-10 relative">
        <View style={{width: CARD_WIDTH, height: CARD_HEIGHT, marginLeft: (windowWidth - CARD_WIDTH) / 2, position: 'absolute'}}>
          <View className="relative bg-white rounded-xl justify-center items-center h-full">
            <Text className="font-bold pb-5">No more profiles</Text>
            <Image
            className="h-20 w-20"
            height={20}
            width={20}
            source={{uri: "https://links.papareact.com/6gb"}}
            />
          </View>
        </View>
        {
        profiles.map((e,i)=>{
          /*Using absolute positionging as I can't workout how to center the tinder cards on top of each other |TODO: fix this */
          return(
          <TinderCard ref={swipeRefs[i]} key={i} preventSwipe={['up','down']} swipeThreshold={0.5} 
          onSwipe={(direction) => {
            alreadyRemoved.push(e.id)
            direction === 'left'?
            swipeLeft(e) : swipeRight(e);
          }} 
          onCardLeftScreen={() => outOfFrame(e.id)}>
            <View style={{width: CARD_WIDTH, height: CARD_HEIGHT, marginLeft: (windowWidth - CARD_WIDTH) / 2, position: 'absolute'}}>
              <View className="relative bg-white rounded-xl">
                <Image className="h-full rounded-xl" source={{uri:e.photoURL}}/>
                <View className = "bg-white w-full h-20 absolute bottom-0 rounded-b-xl justify-between items-between flex-row px-6 py-2 shadow-xl">
                  <View>
                    <Text className="text-xl font-bold">{e.displayName}</Text>
                    <Text>{e.job}</Text>
                  </View>
                  <Text className="text-xl font-bold">{e.age}</Text>
                </View>
              </View>
    
            </View>
          </TinderCard>
          )
          })
        

        }
          
        
      </View>

      {/*
      <Text>HomeScreen</Text>
      <Button title="Go to chat screen" onPress={() =>navigation.navigate("Chat")}/>    
      <Button title='Logout' onPress={logout}/>
       */}

       <View className="flex flex-row justify-evenly bottom-10 absolute" style={{width:CARD_WIDTH, marginLeft: (windowWidth - CARD_WIDTH) / 2}}>
        <TouchableOpacity className="items-center justify-center rounded-full w-16 h-16 bg-red-200" onPress={() => swipe("left")}>
          <Entypo name='cross' color="red" size={24}/>
        </TouchableOpacity>
        <TouchableOpacity className="items-center justify-center rounded-full w-16 h-16 bg-green-200" onPress={() => swipe("right")}>
          <Entypo name='heart' color="green" size={24}/>
        </TouchableOpacity>
       </View>

    </SafeAreaView>
  )
}

export default HomeScreen