
import React, { createContext, useContext, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Post, PostSection } from '../types';

interface PostContextType {
  posts: Post[];
  getPostsBySection: (section: PostSection) => Post[];
  addPost: (post: Post) => void;
  updatePost: (post: Post) => void;
  deletePost: (id: string) => void;
  getPost: (id: string) => Post | undefined;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Fetch from DB sorted by date/id usually
  const posts = useLiveQuery(() => db.posts.toArray(), []) || [];

  const getPostsBySection = (section: PostSection) => {
    return posts.filter(post => post.section === section);
  };

  const addPost = async (post: Post) => {
    await db.posts.add(post);
  };

  const updatePost = async (updatedPost: Post) => {
    await db.posts.put(updatedPost);
  };

  const deletePost = async (id: string) => {
    await db.posts.delete(id);
  };

  const getPost = (id: string) => {
    return posts.find(p => p.id === id);
  };

  return (
    <PostContext.Provider value={{ posts, getPostsBySection, addPost, updatePost, deletePost, getPost }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
