require('dotenv').config();
const Post = require('../../models/Post');
const checkAuth = require('../../utils/check-auth');
const {PubSub} = require('graphql-subscriptions');
const { default: axios } = require("axios");

const {API_SERVICE_PORT_ENDPOINT} = process.env;

const pubsub = new PubSub();

module.exports = {
    Query:{
        getPosts: async()=>{
            try{
                const posts = await Post.find().sort({createdAt:-1});
                return posts;
            }catch(err){
                throw new Error(err);
            }
        },
        getPost: async (_,{postId},context,info)=>{
            try{
                const post = await Post.findById(postId);
                if(post){
                    return post
                }else{
                    throw new Error ('Post not found');
                }
            } catch(err) {
                throw new Error(err);
            }
         }
    },
    Mutation:{
        createPost: async (_,{body},context,info)=>{
            const user = checkAuth(context);
            const newPost = new Post({
                body,
                user: user.index,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            const post = await newPost.save();

            await axios.post(`${API_SERVICE_PORT_ENDPOINT}/createPost`,{post});

            pubsub.publish('NEW_POST', {
                newPost: post
              });

            return post;
        },
        deletePost: async (_, { postId }, context)=>{
            const user = checkAuth(context);
            try {
                const post = await Post.findById(postId);
                if (user.username === post.username) {
                await post.delete();
                return 'Post deleted successfully';
                } else {
                throw new AuthenticationError('Action not allowed');
                }
            } catch (err) {
                throw new Error(err);
            }
        },
        likePost: async(_,{postId}, context)=>{
            const {username} = checkAuth(context);
            const post = await Post.findById(postId);
            if (post) {
                if (post.likes.find((like) => like.username === username)) {
                // Post already likes, unlike it
                post.likes = post.likes.filter((like) => like.username !== username);
                } else {
                // Not liked, like post
                post.likes.push({
                    username,
                    createdAt: new Date().toISOString()
                });
                }
                await post.save();
                return post;
                } else throw new UserInputError('Post not found');
        }
    },
    Subscription: {
        newPost: {
          subscribe: () => pubsub.asyncIterator('NEW_POST')
        }
      }
};