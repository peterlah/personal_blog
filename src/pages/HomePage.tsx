import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// API로부터 받는 게시글의 타입 형태를 정의합니다.
interface Post {
  slug: string;
  title: string;
}

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 글 목록을 가져옵니다.
    fetch('/api/posts')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch posts from the server.');
        }
        return res.json();
      })
      .then(data => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch posts:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []); // 빈 배열을 전달하여 최초 1회만 실행되도록 합니다.

  if (isLoading) {
    return <div>Loading posts...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Posts</h1>
      <div className="list-group">
        {posts.length > 0 ? (
          posts.map(post => (
            <Link key={post.slug} to={`/view/${post.slug}`} className="list-group-item list-group-item-action">
              {post.title}
            </Link>
          ))
        ) : (
          <p>No posts found. <Link to="/create">Create one!</Link></p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
