import { View, Text, StyleSheet } from 'react-native'
import React, { useRef } from 'react'
import { useVideoPlayer, VideoView } from 'expo-video';

const Video = ({_source}) => {
    const source = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const ref = useRef(null);
    const player = useVideoPlayer(source);
  return (
    <View style={styles.container}>
        {
            player && (
                <VideoView
            ref={ref}
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
        />
            )
        }
      
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    video: {
        width: 350,
        height: 275,
    },
})

export default Video