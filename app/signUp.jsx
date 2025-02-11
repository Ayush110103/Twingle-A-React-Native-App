import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import { Feather, FontAwesome, Ionicons, Octicons, SimpleLineIcons } from '@expo/vector-icons';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import Icon from '../assets/icons';
import Input from '../components/Input';

const SignUp = () => {

  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const onSubmit = async ()=>{
        if(!nameRef.current || !emailRef.current || !passwordRef.current){
            Alert.alert('Sign up', "Please fill all the fields!");
            return;
        }

        let name = nameRef.current.trim();
        let email = emailRef.current.trim();
        let password = passwordRef.current.trim();

        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name
                },
            },
        });

        // console.log('session: ', session);
        // console.log('error: ', error);
    
        if (error) Alert.alert('Sign up', error.message)
        setLoading(false)
    }

  return (
    <ScreenWrapper bg={'white'}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* back button */}
        <View>
          <BackButton router={router} />
        </View>

        {/* welcome */}
        <View>
          <Text style={styles.welcomeText}>Lets's </Text>
          <Text style={styles.welcomeText}>Get Started</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{fontSize: hp(1.5), color: theme.colors.text}}>
            Please fill the details to create an account
          </Text>
          <Input
            icon={<Icon name="user" size={26} strokeWidth={1.6} />}
            placeholder='Enter your name'
            placeholderTextColor={theme.colors.textLight}
            onChangeText={value=> nameRef.current=value}
          />
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder='Enter your email'
            placeholderTextColor={theme.colors.textLight}
            onChangeText={value=> emailRef.current=value}
          />
          <Input 
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            secureTextEntry
            placeholder='Enter your password'
            placeholderTextColor={theme.colors.textLight}
            onChangeText={value=> passwordRef.current=value}
          />

          {/* button */}
          <Button title="Sign up" loading={loading} onPress={onSubmit} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account!
          </Text>
          <Pressable onPress={()=> router.navigate('/login')}>
            <Text style={[styles.footerText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>Login</Text>
          </Pressable>
        </View>
        
      </View>
      
      
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText:{
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  input: {
    flexDirection: 'row',
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: 'continuous',
    padding: 18,
    paddingHorizontal: 20,
    gap: 15
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text
  },
  loginText: {
    fontSize: hp(2.1),
    color: 'white',
    fontWeight: theme.fonts.bold,
    letterSpacing: 0.5
  },
  footer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6)
  }
})

export default SignUp;