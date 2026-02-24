// slug는 URL의 일부로 사용되며, 파일 이름이 됩니다.
// 예: "My First Post" -> "my-first-post"
function stringToSlug(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/[^\w\-]+/g, ''); // 특수문자 제거
}

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST or PUT requests allowed' });
  }

  // Vercel 환경 변수에서 GitHub 정보를 가져옵니다.
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const repo = process.env.VERCEL_GIT_REPO_SLUG;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    return res.status(500).json({ message: 'GitHub repository information or token is not configured in Vercel environment variables.' });
  }

  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    // 1. 파일 내용 구성 (Frontmatter + Markdown)
    const fileContent = `---
title: "${title}"
date: ${new Date().toISOString()}
---

${content}`;

    // 2. GitHub API는 파일 내용을 Base64로 인코딩해서 받아야 합니다.
    const encodedContent = Buffer.from(fileContent).toString('base64');
    
    // 3. 파일명 및 API 경로 설정
    const slug = stringToSlug(title);
    const fileName = `${slug}.md`;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/_posts/${fileName}`;

    // 4. GitHub API 요청 데이터 구성
    const data = {
      message: `docs: add new post "${title}"`,
      content: encodedContent,
      committer: {
        name: 'Gemini Assistant',
        email: 'assistant@example.com',
      },
    };

    // 5. GitHub API에 파일 생성 요청 보내기
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (response.status === 201 || response.status === 200) {
      res.status(201).json({ message: 'Post created successfully!', fileName });
    } else {
      // GitHub API가 에러를 반환한 경우
      res.status(response.status).json({ message: `GitHub API Error: ${responseData.message}` });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the post.', error: error instanceof Error ? error.message : String(error) });
  }
}
