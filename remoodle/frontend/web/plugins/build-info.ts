import type { Plugin, IndexHtmlTransformResult } from "vite";

interface BuildInfoOptions {
  sha?: string;
  packageJson: {
    version: string;
  };
}

export const getBuildInfo = (options: BuildInfoOptions) => {
  const { sha, packageJson } = options;

  const version = packageJson.version;

  return {
    version: `${version}${sha ? "." + sha.slice(0, 8) : ""}`,
  };
};

const createBuildInfoPlugin = (buildInfo: { version: string }): Plugin => {
  return {
    name: "build-info",
    apply: "build",
    enforce: "pre",
    transformIndexHtml() {
      const els: IndexHtmlTransformResult = [];

      els.push({
        tag: "script",
        injectTo: "head",
        children: `window.__BUILD_INFO__ = ${JSON.stringify(buildInfo)}`,
      });

      return els;
    },
  };
};

export default createBuildInfoPlugin;
