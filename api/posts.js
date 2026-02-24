// api/posts.js

// GitHub의 파일 이름에서 '.md'를 제거하고, 하이픈(-)을 공백( )으로 바꿔 제목처럼 보이게 합니다.
function fileNameToTitle(fileName) {
    return fileName
        .replace(/\.md$/, '')
        .replace(/-/g, ' ');
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Only GET requests allowed' });
    }

    const owner = process.env.VERCEL_GIT_REPO_OWNER;
    const repo = process.env.VERCEL_GIT_REPO_SLUG;
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
        return res.status(500).json({ message: 'GitHub repository information or token is not configured.' });
    }

    try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/_posts`;

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ message: `GitHub API Error: ${errorData.message}` });
        }

        const files = await response.json();

        // GitHub API 응답이 배열인지 확인합니다. 폴더가 비어있으면 에러가 날 수 있습니다.
        if (!Array.isArray(files)) {
            // _posts 폴더가 없거나 비어있는 경우, 빈 배열을 반환합니다.
            if (files.message === 'Not Found') {
                return res.status(200).json([]);
            }
            return res.status(500).json({ message: 'Unexpected response from GitHub API.' });
        }
        
        // 프론트엔드에 필요한 정보만 추출하여 가공합니다.
        const posts = files.map(file => ({
            slug: file.name.replace(/\.md$/, ''), // 'my-first-post'
            title: fileNameToTitle(file.name),    // 'my first post'
        }));

        res.status(200).json(posts);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An internal error occurred.', error: error instanceof Error ? error.message : String(error) });
    }
}
