import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { theme } from '../constants/theme';
import { Image } from 'expo-image';
import { downloadFile, getSupabaseFileUrl, getUserImageSrc } from '../services/imageService';
import { hp, stripHtmlTags, wp } from '../helpers/common';
import moment from 'moment';
import RenderHtml from 'react-native-render-html';
import Icon from '../assets/icons';
import { Video } from 'expo-av';
import { createPostLike, removePostLike } from '../services/postService';
import { Share } from 'react-native';
import Loading from './Loading';
import Avatar from './Avatar';

const textStyle = {
  color: theme.colors.dark,
  fontSize: hp(1.75)
}

const tagsStyles = {
  div: textStyle,
  p: textStyle,
  ol: textStyle,
  h1: {
    color: theme.colors.dark
  },
  h4: {
    color: theme.colors.dark
  },
};

const PostCard = ({
  item,
  currentUser,
  router,
  showMoreIcon=true,
  hasShadow=true,
  showDelete=false,
  onDelete=()=>{},
  onEdit=()=>{}
}) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);

  const liked = likes.filter(like=> like.userId==currentUser?.id)[0]? true: false;
  const createdAt = moment(item?.created_at).format('MMM D');
  const htmlBody = { html: item?.body };
  const shadowStyles = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  }
  // console.log('item: ', item.comments);

  useEffect(()=>{
    setLikes(item?.postLikes);
  },[]);


  
  const onLike = async ()=>{

    if(liked){
      let updatedLikes = likes.filter(like=> like.userId!=currentUser?.id);
      setLikes([...updatedLikes]);

      let res = await removePostLike(item?.id, currentUser?.id);
      console.log('res: ', res);
      if(!res.success){
        Alert.alert('Post', 'Something went wrong!')
      }
    }else{
      let data = {
        userId: currentUser?.id,
        postId: item?.id,
      }

      setLikes([...likes, data]);
      let res = await createPostLike(data);
      console.log('res: ', res);
      if(!res.success){
        Alert.alert('Post', 'Something went wrong!')
      }
    }
    
  }

  const onShare = async ()=>{
    let content = {message: stripHtmlTags(item?.body)};
    if(item?.file){
      setLoading(true);
      let uri = await downloadFile(getSupabaseFileUrl(item.file).uri);
      content.url = uri;
      setLoading(false);
    }
    Share.share(content);
      
  }

  const handlePostDelete = ()=>{
    Alert.alert('Confirm', 'Are you sure you want to do this?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel delete'),
          style: 'cancel',
        },
        {
            text: 'Delete', 
            onPress: () => onDelete(item),
            style: 'destructive'
        },
    ]);
  }

  const openPostDetails = ()=>{
    router.push({pathname: 'postDetails', params: {postId: item?.id}})
  }
  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        {/* user info and post time */}
        <View style={styles.userInfo}>
          <Avatar 
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.md}
          />
          <View style={{gap: 2}}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </View>

        {/* actions */}
        {
          showMoreIcon && (
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name="threeDotsHorizontal" size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
            </TouchableOpacity>
          )
        }
        {
          showDelete && currentUser.id==item.userId && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={()=> onEdit(item)}>
                <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePostDelete}>
                <Icon name="delete" size={hp(2.5)} color={theme.colors.rose} />
              </TouchableOpacity>
            </View>
          )
        }
      </View>

      {/* post image & body */}
      <View style={styles.content}>
        <View style={styles.postBody}>
          {
            item?.body && (
              <RenderHtml
                contentWidth={wp(100)}
                source={htmlBody}
                tagsStyles={tagsStyles}
                render
              />
            )
          }
        </View>
        
        {/* post image */}
        {
          item?.file && item?.file?.includes('postImages') && (
            <Image 
              source={getSupabaseFileUrl(item?.file)}
              transition={100}
              style={styles.postMedia}
              contentFit='cover'
            />
          )
        }

        {/* post video */}
        {
          item?.file && item?.file?.includes('postVideos') && (
            <Video
              style={[styles.postMedia, {height: hp(30)}]}
              source={getSupabaseFileUrl(item?.file)}
              useNativeControls
              resizeMode="cover"
              isLooping
            />
          )
        }
      </View>

      {/* like & comment */}
      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Icon name="heart" fill={liked? theme.colors.rose: 'transparent'} size={24} color={liked? theme.colors.rose: theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>
            {
              likes?.length
            }
          </Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="comment" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>
            {/* implement after adding post details modal */}
            {/* 0 */}
            {
              item?.comments[0]?.count
            }

          </Text>
        </View>
        <View style={styles.footerButton}>
          {
            loading? (
              <Loading size="small" />
            ):(
              <TouchableOpacity onPress={onShare}>
                <Icon name="share" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            )
          }
          
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl*1.1,
    borderCurve: 'continuous',
    padding: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: '#000'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },  
  username: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
    // marginBottom: 10,
  },
  postMedia: {
    height: hp(40),
    width: '100%',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous'
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 15
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center', 
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8)
  }

})

export default PostCard