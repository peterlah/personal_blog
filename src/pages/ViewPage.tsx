import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

// slug를 일반적인 제목 형태로 변환하는 함수
function slugToTitle(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const ViewPage = () => {
    // 라우터의 :title 파라미터는 이제 slug 역할을 합니다.
    const { title: slug } = useParams<{ title: string }>(); 
    const [content, setContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!slug) {
            setError("Post slug not provided.");
            setIsLoading(false);
            return;
        };

        fetch(`/api/post?slug=${slug}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                setContent(data.content);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [slug]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                Could not load post. {error} <Link to="/" className="alert-link">Go to Home Page</Link>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-3">
                <h1>{slugToTitle(slug || '')}</h1>
            </div>
            <div className="card">
                <div className="card-body">
                    {/* ReactMarkdown이 content가 null이 아닐 때만 렌더링되도록 합니다. */}
                    {content !== null && <ReactMarkdown>{content}</ReactMarkdown>}
                </div>
            </div>
        </div>
    );
};

export default ViewPage;
