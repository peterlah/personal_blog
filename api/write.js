
import { simpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs/promises';

// Vercel 환경에서는 /tmp 디렉토리에만 파일 쓰기가 가능합니다.
// Git 저장소를 /tmp/repo 에 복제(clone)하여 사용합니다.
const REPO_DIR = path.join('/tmp', 'repo');

// slug는 URL의 일부로 사용되며, 파일 이름이 됩니다.
// 예: "My First Post" -> "my-first-post"
function stringToSlug(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/[^\w\-]+/g, ''); // 특수문자 제거
}

async function cloneRepo() {
  const repoUrl = `https://${process.env.GITHUB_TOKEN}@github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}.git`;
  
  // /tmp/repo 디렉토리가 이미 있는지 확인하고, 있다면 삭제합니다.
  try {
    await fs.rm(REPO_DIR, { recursive: true, force: true });
  } catch (error) {
    // 디렉토리가 없어서 나는 오류는 무시합니다.
    if (error.code !== 'ENOENT') throw error;
  }

  const git = simpleGit();
  await git.clone(repoUrl, REPO_DIR);
  
  // Git 사용자 정보를 설정해야 커밋이 가능합니다.
  const gitRepo = simpleGit(REPO_DIR);
  await gitRepo.addConfig('user.name', 'Gemini Assistant');
  await gitRepo.addConfig('user.email', 'assistant@example.com');

  return gitRepo;
}


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  // Vercel 환경 변수에서 GitHub 정보를 가져옵니다.
  // 이 변수들은 Vercel 프로젝트 설정에 자동으로 주입됩니다.
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const repoName = process.env.VERCEL_GIT_REPO_SLUG;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repoName || !token) {
    return res.status(500).json({ message: 'GitHub repository information or token is not configured in Vercel environment variables.' });
  }

  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    // --- Git 작업 수행 ---
    const git = await cloneRepo();
    
    // 1. 파일 생성
    const slug = stringToSlug(title);
    const fileName = `${slug}.md`;
    const filePath = path.join(REPO_DIR, '_posts', fileName);

    const fileContent = `---
title: "${title}"
date: ${new Date().toISOString()}
---

${content}`;

    await fs.writeFile(filePath, fileContent);

    // 2. Git Add, Commit, Push
    await git.add(path.join('_posts', fileName));
    await git.commit(`docs: add new post "${title}"`);
    await git.push('origin', 'main'); // 'main' 브랜치에 푸시. 'master'를 사용한다면 변경 필요.

    res.status(200).json({ message: 'Post created successfully!', fileName });

  } catch (error) {
    console.error(error);
    // error.message에 더 자세한 정보가 있을 수 있습니다.
    res.status(500).json({ message: 'An error occurred while creating the post.', error: error.message });
  }
}
