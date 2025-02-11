import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import PostCard from '../../components/PostCard'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Icon from '../../assets/icons';
import Loading from '../../components/Loading';
import { createComment, fetchPostDetails, removeComment, removePost } from '../../services/postService';
import { supabase } from '../../lib/supabase';
import CommentItem from '../../components/CommentItem';
import { getUserData } from '../../services/userService';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { createNotification } from '../../services/notificationService';

const PostDetails = () => {
    const {postId, commentId} = useLocalSearchParams();

    /// later we need to update the comments, thats why we used a sate for item
    // const [item, setItem] = useState(JSON.parse(params.data)); 
    const [post, setPost] = useState(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const {user} = useAuth();  
    const commentRef = useRef("");
    const inputRef = useRef(null);
    const [startLoading, setStartLoading] = useState(true);
    // console.log('got item: ', item);

    const handleNewComment = async payload=>{
        console.log('got new comment: ', payload.new)
        if(payload.new){
            let newComment = {...payload.new};
            let res = await getUserData(newComment.userId);
            newComment.user = res.success? res.data: {};
            setPost(prev=> {
                return {
                    ...prev,
                    comments: [newComment, ...prev.comments]
                }
            });
        }
    }

    useEffect(()=>{

        getPostDetails();

        let channel = supabase
        .channel('comments')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'comments',
            filter: `postId=eq.${postId}`,
        }, handleNewComment)
        .subscribe();

        // getPosts();

        return ()=>{
            supabase.removeChannel(channel)
        }
    },[]);

    const getPostDetails = async ()=>{
        let res = await fetchPostDetails(postId);
        // console.log('res: ', res);
        setStartLoading(false);
        if(res.success) setPost(res.data);
    }


    const onNewComment = async ()=>{
        if(!commentRef.current) return null;
        let data = {
            userId: user?.id,
            postId: post?.id,
            text: commentRef.current,
        };

        setLoading(true);
        let res = await createComment(data);
        setLoading(false);
        // console.log('result: ', res);
        if(res.success){
            if(user.id!=post.userId){
                // send notification
                let notify = {
                    senderId: user.id,
                    receiverId: post.userId,
                    title: 'commented on your post',
                    data: JSON.stringify({postId: post.id, commentId: res?.data?.id})
                }
                createNotification(notify);
            }

            inputRef?.current?.clear();
            commentRef.current="";
        }else{
            Alert.alert('Comment', res.msg);
        }
    }

    const onDeleteComment = async (comment)=>{
        let res = await removeComment(comment.id);
        if(res.success){
            setPost(prevPost=>{
                let updatedPost = {...prevPost};
                updatedPost.comments = updatedPost.comments.filter(c=> c.id != comment.id);
                return updatedPost;
            })
        }else{
            Alert.alert('Comment', res.msg);
        }
    }

    const onDeletePost = async ()=>{
        let res = await removePost(post.id);
        if(res.success){
            router.back();
        }else{
            Alert.alert('Post', res.msg);
        }
    }
    const onEditPost = async ()=>{
        router.back();
        router.push({pathname: 'newPost', params: {...post}});
        
    }

    if(startLoading){
        return (
            <View style={styles.center}>
                <Loading />
            </View>
        )
    }

    if(!post){
        return (
            <View style={[styles.center, {justifyContent: 'flex-start', marginTop: 100}]}>
                <Text style={styles.notFound}>Post not found !</Text>
            </View>     
        )
        
    }
    
  return (
    <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            <PostCard
                item={{...post, comments: [{count: post.comments.length}]}} 
                currentUser={user}
                router={router} 
                showMoreIcon={false}
                hasShadow={false}
                showDelete={true}
                onDelete={onDeletePost}
                onEdit={onEditPost}
            />

            {/* comment input */}
            <View style={styles.inputContainer}>
                <Input
                    inputRef={inputRef}
                    placeholder='Type comment...'
                    placeholderTextColor={theme.colors.textLight}
                    onChangeText={value=> commentRef.current=value}
                    containerStyle={{flex: 1, height: hp(6.2), borderRadius: theme.radius.xl}}
                />

                {
                    loading? (
                        <View style={styles.loading}>
                            <Loading size="small" />
                        </View>
                    ):(
                        <TouchableOpacity onPress={onNewComment} style={styles.sendIcon}>
                            <Icon name="send" color={theme.colors.primaryDark} />
                        </TouchableOpacity>
                    )
                }
                
            </View>
            


            {/* comment list */}
            
            <View style={{marginVertical: 15, gap: 17}}>
                {
                    post?.comments?.map(comment=> 
                        <CommentItem 
                                item={comment} 
                                canDelete={user.id==comment.userId || user.id==post.userId}
                                onDelete={onDeleteComment}
                                key={comment.id.toString()} 
                                highlight={comment.id==commentId}
                        />
                    )
                }
                {
                    post?.comments?.length==0 && (
                        <Text style={{color: theme.colors.text, marginLeft: 5,}}>Be first to comment!</Text>
                    )
                }
            </View>
            
        </ScrollView>
      
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: wp(7),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    list: {
        paddingHorizontal: wp(4),
    },
    sendIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        height: hp(5.8),
        width: hp(5.8)
    },
    center: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    notFound: {
        fontSize: hp(2.5),
        color: theme.colors.text,
        fontWeight: theme.fonts.medium,
    },
    loading: {
        height: hp(5.8), 
        width: hp(5.8), 
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{scale: 1.3}]
    }
})

export default PostDetails