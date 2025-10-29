
import { Octokit } from "@octokit/rest"
import { GitHubRepo, GitHubFile } from "./types"

const octokit = new Octokit()

export async function getRepository(repoUrl: string): Promise<GitHubRepo | null> {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) return null
    
    const [, owner, repo] = match
    const { data } = await octokit.repos.get({ owner, repo })
    
    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      url: data.html_url,
      defaultBranch: data.default_branch,
    }
  } catch (error) {
    console.error('Error fetching repository:', error)
    return null
  }
}

export async function getRepositoryContents(
  repoUrl: string,
  path: string = ""
): Promise<GitHubFile[]> {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) return []
    
    const [, owner, repo] = match
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    })
    
    if (Array.isArray(data)) {
      return data.map((item) => ({
        name: item.name,
        path: item.path,
        type: item.type as 'file' | 'dir',
        size: item.size,
        sha: item.sha,
        downloadUrl: item.download_url,
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error fetching repository contents:', error)
    return []
  }
}

export async function getFileContent(
  repoUrl: string,
  filePath: string
): Promise<string | null> {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) return null
    
    const [, owner, repo] = match
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    })
    
    if ('content' in data && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8')
    }
    
    return null
  } catch (error) {
    console.error('Error fetching file content:', error)
    return null
  }
}
