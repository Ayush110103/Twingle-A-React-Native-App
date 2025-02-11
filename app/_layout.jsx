import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack, useRouter } from 'expo-router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserData } from '../services/userService'
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer', 'Warning: MemoizedTNodeRenderer', 'Warning: TRenderEngineProvider']); // Ignore log notification by message
const _layout = () => {
    
  return (
    <AuthProvider>
        <MainLayout />
    </AuthProvider>
    
  )
}

const MainLayout = ()=>{
    const {setAuth, setUserData} = useAuth();
    const router = useRouter();

    useEffect(() => {
        // triggers automatically when auth state changes
        supabase.auth.onAuthStateChange((_event, session) => {
        console.log('session: ', session?.user?.id);
        if (session) {
            setAuth(session?.user);
            updateUserData(session?.user); // update user like image, phone, bio
            router.replace("/home");
        } else {
            setAuth(null);
            router.replace('/welcome')
        }
        })
    }, []);

    const updateUserData = async (user)=>{
        let res = await getUserData(user.id);
        if(res.success) setUserData(res.data);
    }

    return (
        <Stack 
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen
                name="(main)/postDetails"
                options={{
                    presentation: 'modal'
                }}
            />
        </Stack>
    )
}

export default _layout