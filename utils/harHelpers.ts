import { HarEntry, Request } from "../types";

export const generateCurl = (request: Request): string => {
  let curl = `curl -X ${request.method} "${request.url}"`;

  // Headers
  request.headers.forEach((header) => {
    // Skip unsafe headers or those automatically handled by curl typically
    if (!['content-length', 'host'].includes(header.name.toLowerCase())) {
        curl += ` \\\n  -H "${header.name}: ${header.value.replace(/"/g, '\\"')}"`;
    }
  });

  // Body
  if (request.postData && request.postData.text) {
    curl += ` \\\n  -d '${request.postData.text.replace(/'/g, "'\\''")}'`;
  }

  return curl;
};

export const filterIrrelevantEntries = (entries: HarEntry[]): HarEntry[] => {
  return entries.filter((entry) => {
    const url = entry.request.url.toLowerCase();
    const isAsset = /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ico|ttf|eot)(\?.*)?$/.test(url);
    const isMethodRelevant = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(entry.request.method);
    // We primarily want API calls, often XHR or Fetch, or document loads that aren't assets
    return !isAsset && isMethodRelevant;
  });
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case 'GET': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'POST': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'PUT': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'PATCH': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'DELETE': return 'text-red-400 bg-red-400/10 border-red-400/20';
    default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
  }
};

export const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-500';
    if (status >= 300 && status < 400) return 'text-blue-500';
    if (status >= 400 && status < 500) return 'text-amber-500';
    if (status >= 500) return 'text-red-500';
    return 'text-zinc-500';
};
