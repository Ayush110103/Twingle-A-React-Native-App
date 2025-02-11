import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import Loading from '../components/Loading';

const StartPage = () => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Loading />
    </View>
  )
}

export default StartPage