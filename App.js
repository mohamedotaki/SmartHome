import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, Button ,TouchableOpacity , FlatList, Image, ImageButton
} from 'react-native'

import Amplify from 'aws-amplify'
import config from './src/aws-exports'
Amplify.configure(config)

import { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './src/graphql/mutations'
import { listTodos } from './src/graphql/queries'

import { withAuthenticator } from 'aws-amplify-react-native'

const initialState = { name: '', description: '' }

const App: () => React$Node =() =>{
  const [buttons , setButtons] = useState([
    {name: 'BedRoom', id: '1', imgSer:require('./light-on.jpg')},
    {name: 'LivingRoom', id: '2', imgSer:require('./light-on.jpg')},
    {name: 'BathRoom', id: '3', imgSer:require('./light-off.jpg')},
    {name: 'Outside', id: '4', imgSer:require('./light-off.jpg')},
    {name: 'BedRoom', id: '1', imgSer:require('./light-on.jpg')},
    {name: 'LivingRoom', id: '2', imgSer:require('./light-on.jpg')},
    {name: 'BathRoom', id: '3', imgSer:require('./light-off.jpg')},
    {name: 'Outside', id: '4', imgSer:require('./light-off.jpg')},
    {name: 'BedRoom', id: '1', imgSer:require('./light-on.jpg')},
    {name: 'LivingRoom', id: '2', imgSer:require('./light-on.jpg')},
    {name: 'BathRoom', id: '3', imgSer:require('./light-off.jpg')},
    {name: 'Outside', id: '4', imgSer:require('./light-off.jpg')},
  ]);
  return (
    <View style={styles.container}>
    <View style={styles.chartView}>
      <Text> Chart Here </Text>
          </View>
    <View style={styles.bottonView}>
    <Text style={styles.text}> Devices</Text>
    <Text style={styles.text1} onPress={()=>{alert("you clicked me")}}>
    Add Device
    </Text>
    <FlatList
    numColumns={2}
    keyExtractor={(item) => item.id}
    data={buttons}
    renderItem={({ item }) => (
      <Image style={styles.image} source={item.imgSer}/>
    )}
    />
    </View>
    </View>
);
};

export default withAuthenticator(App)
const styles = StyleSheet.create({
  container: {
    flex: 1,
      height:"100%",
        width:"100%",
    backgroundColor: '#b3b3b3',
    alignItems: 'center',
    justifyContent: 'center',

  },
  button:{
    backgroundColor: '#b3b3b3',
    fontSize:20,

  },

  image:{
    width:"50%",
    height:"100%",
    borderWidth:7,
    borderColor:'#b3b3b3',
    marginBottom:200,
  borderRadius: 40,

  },
  text:{
    backgroundColor: '#8f8f8f',
    height:30,
    width:"100%",
    fontSize:20,
    marginTop:100,
    fontWeight: "bold"

  },
  text1:{
    fontSize:20,
    textAlign: 'right',
    marginRight:10,
  },
  chartView:{
    height:"20%",
    marginTop:100,
  },
  bottonView:{
    height:"80%",
        width:"100%",
    marginBottom:100,
  },

});
