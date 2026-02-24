import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface Page {
    title: string;
    content: string;
}

const ViewPage = () => {
    const { title } = useParams<{ title: string }>();
    const [page, setPage] = useState<Page | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (!title) return;

        fetch(`http://localhost:3001/api/pages/${title}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Page not found');
                }
                return res.json();
            })
            .then(data => setPage(data))
            .catch(err => {
                setError(err.message);
            });
    }, [title]);

    if (error) {
        return (
            <div className="alert alert-danger">
                {error} <Link to="/" className="alert-link">Go to Home Page</Link>
            </div>
        );
    }

    if (!page) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>{page.title}</h1>
                <Link to={`/edit/${page.title}`} className="btn btn-primary">
                    Edit Page
                </Link>
            </div>
            <div className="card">
                <div className="card-body">
                    <ReactMarkdown>{page.content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default ViewPage;
