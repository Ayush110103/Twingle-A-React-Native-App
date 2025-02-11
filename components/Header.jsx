import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { hp } from '../helpers/common';
import { theme } from '../constants/theme';
import BackButton from './BackButton';

const Header = ({title, showBackButton = true, mb=10}) => {
    const router = useRouter();
  return (
    <View style={[styles.container, {marginBottom: mb}]}>
        {
            showBackButton && (
                <View style={styles.BackButton}>
                    <BackButton router={router} />
                </View>
            )
        }
        <Text style={styles.title}>{title || ""}</Text>
    </View> 
  )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        gap: 10,
    },
    title: {
        fontSize: hp(2.7),
        fontWeight: '600',
        color: theme.colors.textDark
    },
    BackButton: {
        position: 'absolute', 
        left: 0
    }
})

export default Header