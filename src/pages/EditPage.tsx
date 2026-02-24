import React, { useState } from 'react';
import './EditPage.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

const EditPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Title cannot be empty.');
            return;
        }

        setStatus('loading');
        setMessage('저장 중입니다...');

        try {
            const response = await fetch('/api/write', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(`성공! 파일이름: ${data.fileName}`);
                setTitle('');
                setContent('');
            } else {
                setStatus('error');
                setMessage(`오류: ${data.message || '알 수 없는 오류가 발생했습니다.'}`);
            }
        } catch (error) {
            setStatus('error');
            setMessage(`네트워크 오류: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    return (
        <div className="edit-page-container">
            <h1>새 글 작성하기</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">제목</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="글 제목을 입력하세요"
                        disabled={status === 'loading'}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">내용 (Markdown)</label>
                    <textarea
                        id="content"
                        rows={18}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="마크다운 형식으로 내용을 작성하세요."
                        disabled={status === 'loading'}
                    ></textarea>
                </div>
                <button type="submit" className="save-button" disabled={status === 'loading'}>
                    {status === 'loading' ? '저장 중...' : '저장하기'}
                </button>
            </form>
            {status !== 'idle' && (
                <div className={`status-message ${status}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default EditPage;
