import { githubOrgURL } from "@/shared/config";

export function getRepoURL(repo: string) {
  return `${githubOrgURL}/${repo}`;
}

export function getBuildInfo() {
  return window.__BUILD_INFO__;
}
