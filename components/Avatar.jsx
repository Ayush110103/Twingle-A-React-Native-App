import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { hp } from '../helpers/common'
import { theme } from '../constants/theme'
import { getUserImageSrc } from '../services/imageService'
import { Image } from 'expo-image'

const Avatar = ({
    uri, 
    size=hp(4.5), 
    rounded=theme.radius.md,
    style={}
}) => {
  return (
    <Image 
        source={getUserImageSrc(uri)} 
        transition={100}
        style={[styles.avatar, {height: size, width: size, borderRadius: rounded}, style]}
    />
  )
}
const styles = StyleSheet.create({
    avatar: {
        borderCurve: 'continuous',
        borderColor: theme.colors.darkLight,
        borderWidth: 1
    }
})
export default Avatar