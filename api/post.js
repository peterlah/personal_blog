// api/post.js

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Only GET requests allowed' });
    }

    const { slug } = req.query;

    if (!slug) {
        return res.status(400).json({ message: 'Post slug is required.' });
    }

    const owner = process.env.VERCEL_GIT_REPO_OWNER;
    const repo = process.env.VERCEL_GIT_REPO_SLUG;
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
        return res.status(500).json({ message: 'GitHub repository information or token is not configured.' });
    }

    try {
        // 파일 이름에 '.md' 확장자를 붙여줍니다.
        const fileName = `${slug}.md`;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/_posts/${fileName}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
             // Not Found 에러는 좀 더 친절하게 처리합니다.
            if (response.status === 404) {
                 return res.status(404).json({ message: `Post '${slug}' not found.` });
            }
            return res.status(response.status).json({ message: `GitHub API Error: ${errorData.message}` });
        }

        const fileData = await response.json();
        
        // GitHub API는 파일 내용을 Base64로 인코딩해서 전달합니다.
        // 이것을 다시 원래의 텍스트(UTF-8)로 디코딩합니다.
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');

        res.status(200).json({ content });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An internal error occurred.', error: error instanceof Error ? error.message : String(error) });
    }
}
