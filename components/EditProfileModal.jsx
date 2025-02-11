import { View, Text, Modal, Pressable, StyleSheet, Image } from 'react-native'
import React from 'react'
import { hp, wp } from '../helpers/common';
import { useAuth } from '../contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const EditProfileModal = ({open, toggle}) => {
    const {user} = useAuth();
    let imageSource = user.image? {uri: user.image}: require('../assets/images/defaultUser.png');
  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={open}
        onRequestClose={() => {
          toggle(!open);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.form}>
                <View style={styles.avatar}>
                    <Image source={imageSource} style={{width: '100%', height: '100%', borderRadius: 100}} />
                    <Pressable style={styles.editIcon} onPress={()=> toggleProfileModal(true)}>
                        <Feather name="edit-3" size={20} color={theme.colors.textLight} />
                    </Pressable>
                </View>
            </View>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => toggle(!open)}>
              <Text style={styles.textStyle}>Hide Modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      height: hp(75),
      width: wp(90),
      backgroundColor: 'white',
      borderRadius: 30,
      borderCurve: 'continuous',
      padding: wp(4),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.30,
      shadowRadius: 10,
      elevation: 4,
    },
    avatar: {
        height: hp(10),
        width: hp(10),
        alignSelf: 'center'
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        padding: 7,
        borderRadius: 50,
        backgroundColor: theme.colors.darkLight,
        shadowColor: theme.colors.textLight,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.7,
        shadowRadius: 5
    },

    ////
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
    },
    buttonOpen: {
      backgroundColor: '#F194FF',
    },
    buttonClose: {
      backgroundColor: '#2196F3',
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
    },
  });
  

export default EditProfileModal