import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, Button ,TouchableOpacity , FlatList, Image, Picker,
  ToastAndroid, Platform, AlertIOS,
} from 'react-native'
import config from './src/aws-exports'
Amplify.configure(config)
import Amplify, { API, graphqlOperation, PubSub, Auth } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react-native'
import { AWSIoTProvider } from '@aws-amplify/pubsub';
import {listDevices} from './src/graphql/queries';
import * as mutations from './src/graphql/mutations';
import Modal from 'react-native-modal';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MqttOverWSProvider } from "@aws-amplify/pubsub/lib/Providers";
import { LineChart, Grid } from 'react-native-svg-charts'

var values  =[];

Amplify.addPluggable(new AWSIoTProvider({
     aws_pubsub_region: 'eu-west-1',
     aws_pubsub_endpoint: 'wss://ax9yefk1q1t71-ats.iot.eu-west-1.amazonaws.com/mqtt',
   }));

var SUB_TOPIC = "CloudESP32/sub";
var PUB_TOPIC = "CloudESP32/pub";
var TEMP_TOPIC = "CloudESP32/Temp";
var RES_TOPIC = "CloudESP32/res";

const Stack = createStackNavigator();






const logout =() =>{
  Auth.signOut();
}
PubSub.subscribe(TEMP_TOPIC).subscribe({
  next: data => values.push(data.value),
  error: error => console.error(error),
  close: () => console.log('Done'),
});

  PubSub.subscribe(RES_TOPIC).subscribe({
    next: data => ProcessMessage(data),
    error: error => console.error(error),
    close: () => console.log('Done'),
  });

async function ProcessMessage(payload) {
  notifyMessage(payload.value.status)
}

function notifyMessage(msg: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT)
  } else if(Platform.OS === 'ios'){
    AlertIOS.alert(msg);
  }else{
      alert(msg);
  }
}

const sendToIot =(pinNo) =>{
   PubSub.publish(PUB_TOPIC, { msg: pinNo });
}

// Database Methods
function UpdateDeviceInDatabase(deviceId,deviceName,pinNo,navigation)
{
   if( deviceName == "" || deviceName == null) {
    notifyMessage("Please Enter Device Name");
  }
  else if(pinNo == "No Other Pins" || pinNo == null) {
    notifyMessage("Please Select Pin Number To Delete");
  }
  else{
    const deviceToUpdate ={
      pinNo: pinNo,
      title: deviceName,
      id: deviceId,
    };
      const updateDevice = async () => {
        try{
            const updateResult = await API.graphql(graphqlOperation(mutations.updateDevice, {input: deviceToUpdate}));
            if(updateResult.data.updateDevice != null) {
              notifyMessage("Device Was Updated");
              navigation.goBack();
            }
            else {
              notifyMessage("Error");
            }
          }
      catch(e){
            console.log(e);
          }

      }
      updateDevice();
    }
}

function DeleteDeviceFromDatabase(item,navigation)
{
    const deviceToDelete ={
      id: item.id,
    };
      const deleteDevice = async () => {
        try{
            const deleteResult = await API.graphql(graphqlOperation(mutations.deleteDevice, {input: deviceToDelete}));
            if(deleteResult.data.deleteDevice != null){
              notifyMessage(item.title + " Was Deleted");
              navigation.goBack();
            }
            else{
              notifyMessage("Failed To Delete "+ item.title);
            }
            }
      catch(e){
            console.log(e);
          }
      }
      deleteDevice();
}

function AddDeviceToDatabase(deviceName , pinNo,navigation)
{
  const email =  Auth.user.attributes.email;
  const device = { pinNo: pinNo, title: deviceName, id:email+pinNo };
  if(deviceName == null || deviceName ==""){
    notifyMessage("Please Enter Device Name");
  }
  else if(pinNo == "-----Please Select Pin Number-----" || pinNo == "No Available Pins"){
    notifyMessage("Please Select Pin Number");
  }
  else{
      const addDevice = async () => {
        try{
            const deviceResult = await API.graphql(graphqlOperation(mutations.createDevice, {input: device}));
            if(deviceResult.data.createDevice != null){
              notifyMessage("Device Was Added");
              navigation.goBack();
            }
            }
      catch(e){
            console.log(e);
          }
      }
      addDevice();
    }
}


function AddDeviceScreen({route, navigation})
{
  const { buttons} = route.params;
  var availablePins =["-----Please Select Pin Number-----","No Available Pins","15","2","4","5","18","13","23"];
  const [text, onChangeText] = React.useState("");
  const [selectedValue, setSelectedValue] = useState("-----Please Select Pin Number-----");
if(buttons != null || buttons.length !=0 ){
  //get available Pins
  for(let i = 0; i < buttons.length; i++){
      for(let x = 0; x < availablePins.length; x++){
          if(buttons[i].pinNo == parseInt(availablePins[x])){
            availablePins.splice(x, 1);
          }
      }
  }
}
  if(availablePins.length > 2){
    availablePins.splice(1, 1);
  }

  return (
        <View style={styles.container}>
        <TextInput
       style={styles.input}
       placeholder="Device Name"
       onChangeText={onChangeText}
       value={text}
     />
     <Picker style={styles.picker}
        selectedValue={selectedValue}
        onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}>
        {availablePins.map((l, i) => {return <Picker.Item label={availablePins[i]} value={availablePins[i]} key={availablePins[i]} /> })}
      </Picker>
      <Button
        onPress={() =>AddDeviceToDatabase(text,selectedValue,navigation)}
        title="Add Device"
        />

        </View>
  );
}

function EditDeviceScreen({route, navigation})
{
  const {item} = route.params;
  const { buttons} = route.params;
  const [text, onChangeText] = React.useState(item.title);
  const [selectedValue, setSelectedValue] = useState(item.pinNo.toString());
  var availablePins =["No Other Pins","15","2","4","5","18","13","23"];
  for(let i = 0; i < buttons.length; i++) {
      for(let x = 0; x < availablePins.length; x++) {
          if(buttons[i].pinNo == parseInt(availablePins[x])) {
              console.log(buttons[i].pinNo +" "+ parseInt(availablePins[x]));
            if(item.pinNo == buttons[i].pinNo) {
              break;
            }
            availablePins.splice(x, 1);
          }
      }
  }
  if(availablePins.length > 2){
    availablePins.splice(0, 1);
  }
  return (
        <View style={styles.container}>
        <TextInput
       style={styles.input}
       placeholder="Device Name"
       onChangeText={onChangeText}
       value={text}
     />
     <Picker style={styles.picker}
        selectedValue={selectedValue}
        onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}>
        {availablePins.map((l, i) => {return <Picker.Item label={availablePins[i]} value={availablePins[i]} key={availablePins[i]} /> })}
      </Picker>
      <View style={styles.updateButtonView}>
      <Button
        onPress={() =>UpdateDeviceInDatabase(item.id,text,selectedValue,navigation)}
        title="Update Device"
        />
        </View>
        <Button
          onPress={() =>DeleteDeviceFromDatabase(item,navigation)}
          title="Delete Device"
          color="#b51616"/>
        </View>
  );
}


function HomeScreen({navigation}) {
  const [list, setList] = React.useState([1,2,3,4,5,6,7,6,5,4,35,8,9,45,22,1,5,7,4]);
  const email =  Auth.user.attributes.email;
//get data from database
  const [buttons , setButtons] = useState([]);
  const [device , setDevice] = useState([]);

  var intervalId = window.setInterval(function(){
      //  const newList = values;
      //  console.log(newList)
      //  setList(values);

}, 5000);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        const getDevices = async () => {
          try{
            const devicesResult = await API.graphql(graphqlOperation(listDevices,{filter: {id: {beginsWith: email}}}))
            console.log(devicesResult);
            setButtons(devicesResult.data.listDevices.items);
          }catch (e){
            console.log(e);
          }
        }
        getDevices();
    });
    return unsubscribe;
  }, [navigation]);

  return (

        <View style={styles.container}>
        <View style={styles.chartView}>
        <LineChart
                        style={{ height: "100%", width:"90%" }}
                        data={list}
                        svg={{ stroke: 'rgb(134, 65, 244)' }}
                        contentInset={{ top: 20, bottom: 20 }}
                    >
                        <Grid />
                    </LineChart>
        </View>
    <View style={styles.bottonView}>
          <Text style={styles.text}> Devices</Text>
        <View style={styles.addDeviceButton}>
        <Button
        transparent
        onPress={() => navigation.navigate('Add Device',{buttons})}
        title="Add Device"
        />
        </View>
        <FlatList
        numColumns={2}
        keyExtractor={(item) => item.id}
        data={buttons}
        renderItem={({ item }) => (
          <View style={styles.view2}>

          <TouchableOpacity style={styles.lightButton}
                            onLongPress={() =>navigation.navigate('Edit Device',{item,buttons})}
                            onPress={() => sendToIot(item.pinNo)}>
          <Text style={styles.buttonText}>{item.title}</Text>
          <Image style={styles.image} source={require('./light-off.jpg')}/>
          </TouchableOpacity>
          </View>
        )}
        />
        </View>
        </View>
  );
}


function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen}
        options={{
          headerRight: () => (
            <Button
            style={styles.logout}
              onPress={logout}
              title="Logout"
              color="#b51616"/>),
        }}
         />
        <Stack.Screen name="Add Device" component={AddDeviceScreen} />
        <Stack.Screen name="Edit Device" component={EditDeviceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default withAuthenticator(App);



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
  updateButtonView:{
    marginBottom:10,

  },

  image:{
    width:"100%",
    height:"100%",
    borderWidth:2,
    borderColor:'#b3b3b3',
    borderRadius: 40,

  },
  lightButton:{
    width:"50%",
    height:"100%",
    position: 'absolute',
    left: '25%',

  },
  text:{
    backgroundColor: '#8f8f8f',
    height:30,
    width:"100%",
    fontSize:20,
    marginTop:100,
    fontWeight: "bold",
    textAlign: 'center',

  },
  text1:{
    height:30,
    width:"10%",
  },
  chartView:{
    height:"20%",
    width:"80%",
    marginTop:100,
  },
  bottonView:{
    height:"80%",
        width:"100%",
    marginBottom:100,
  },
  view2:{
    height:200,
    width:"50%",
marginBottom:30,
  },
  buttonText:{
    textAlign: 'center',
    fontSize: 20,
  },
  input: {
  height: "5%",
  width:"50%",
  borderWidth: 1,
  borderRadius: 30,
      textAlign: 'center',
},

picker: {
height: "5%",
width:"50%",
backgroundColor: "#e6e6e6",
borderWidth: 1,
borderRadius: 30,
margin:30,

},

logout: {
  position: 'absolute',
  right:0,
borderWidth: 1,
borderRadius: 30,
},
addDeviceButton: {
  width:"100%",
  flexDirection: 'row',
justifyContent: 'flex-end'
},

});
