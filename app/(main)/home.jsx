import { View, Text, Button, Alert, StyleSheet, Pressable, ScrollView, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import {Svg, Circle, Path} from 'react-native-svg';
import { theme } from '../../constants/theme'
import Icon from '../../assets/icons'
import { Image } from 'expo-image'
import { getUserImageSrc } from '../../services/imageService'
import { hp, wp } from '../../helpers/common'
import { useRouter } from 'expo-router'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import { getUserData } from '../../services/userService'
import Avatar from '../../components/Avatar'
var limit = 0;
const HomeScreen = () => {
    const {user, setAuth} = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);

    // const onLogout = async () => {
    //     setAuth(null);
    //     const {error} = await supabase.auth.signOut();
    //     if (error) {
    //       Alert.alert("Error Signing Out User", error.message);
    //     }
    // }

    const handlePostEvent = async (payload)=>{
      console.log('got post event: ', payload);
      if(payload.eventType == 'INSERT' && payload?.new?.id){
        let newPost = {...payload.new};
        let res = await getUserData(newPost.userId);
        newPost.user = res.success? res.data: {};
        newPost.postLikes = []; // while adding likes
        newPost.comments = [{count: 0}] // while adding comments
        setPosts(prevPosts=> [newPost, ...prevPosts]);
      }

      if(payload.eventType == 'DELETE' && payload?.old?.id){
        setPosts(prevPosts=> {
          let updatedPosts = prevPosts.filter(post=> post.id!=payload.old.id);
          return updatedPosts;
        })
      }

      if(payload.eventType == 'UPDATE' && payload?.new?.id){
        setPosts(prevPosts=> {
          let updatedPosts = prevPosts.map(post=> {
            if(post.id==payload.new.id){
              post.body = payload.new.body;
              post.file = payload.new.file;
            }
            return post;
          });
          return updatedPosts;
        })
      }
    }

    const handleNewNotification = payload=>{
      console.log('got new notification : ', payload);
      if(payload.eventType=='INSERT' && payload?.new?.id){
        setNotificationCount(prev=> prev+1);
      }
    }

    useEffect(()=>{
      
      // // if you want to listen to single event on a table
      // let postsChannel = supabase
      // .channel('posts')
      // .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, handlePostEvent)
      // .subscribe();


      // listen all events on a table
      let postChannel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, handlePostEvent)
      .subscribe();

      let notificationChannel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiverId=eq.${user.id}`, }, handleNewNotification)
      .subscribe();

      // getPosts();

      return ()=>{
        supabase.removeChannel(postChannel);
        supabase.removeChannel(notificationChannel);
      }

    },[]);
    
    const getPosts = async ()=>{

      if(!hasMore) return null; // if no more posts then don't call the api
      limit = limit+10; // get 10 more posts everytime
      console.log('fetching posts: ', limit);
      let res = await fetchPosts(limit);
      if(res.success){
        if(posts.length==res.data.length) setHasMore(false);
        setPosts(res.data);
      }
    }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Pressable>
            <Text style={styles.title}>Twingle</Text>
          </Pressable>
          <View style={styles.icons}>
            <Pressable onPress={()=> {
              setNotificationCount(0);
              router.push('notifications');
            }}>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text}  />
              {
                notificationCount>0 && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{notificationCount}</Text>
                  </View>
                )
              }
            </Pressable>
            <Pressable onPress={()=> router.push('newPost')}>
              <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text}  />
            </Pressable>
            <Pressable onPress={()=> router.push('profile')}>
              <Avatar 
                uri={user?.image} 
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{borderWidth: 2}}
              />
            </Pressable>
          </View>
        </View>

        {/* posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item, index) => item.id.toString()}
          renderItem={({ item }) => <PostCard 
            item={item} 
            currentUser={user}
            router={router} 
          />}
          onEndReached={() => {
            getPosts();
            console.log('got to the end');
          }}
          onEndReachedThreshold={0} //  Specifies how close to the bottom the user must scroll before, 0 -> 1
          ListFooterComponent={hasMore? (
              <View style={{marginVertical: posts.length==0? 200: 30}}>
                <Loading />
              </View>
            ):(
              <View style={{marginVertical: 30}}>
                <Text style={styles.noPosts}>No more posts</Text>
              </View>
            )
          }
        />

        {/* <Button onPress={onLogout} title="Logout" /> */}
      </View>
      
      

</ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: wp(4)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(4)
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
    borderWidth: 3
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4)
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text
  },
  pill: {
    position: 'absolute',
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight
  },
  pillText: {
    color: 'white',
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold
  }
})

export default HomeScreen