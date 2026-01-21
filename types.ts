export interface Header {
  name: string;
  value: string;
}

export interface PostData {
  mimeType: string;
  text?: string;
  params?: Array<{ name: string; value?: string }>;
}

export interface Request {
  method: string;
  url: string;
  httpVersion: string;
  headers: Header[];
  queryString: Array<{ name: string; value: string }>;
  cookies: Array<{ name: string; value: string }>;
  headersSize: number;
  bodySize: number;
  postData?: PostData;
}

export interface Content {
  size: number;
  mimeType: string;
  text?: string;
  encoding?: string;
}

export interface Response {
  status: number;
  statusText: string;
  httpVersion: string;
  headers: Header[];
  cookies: Array<any>;
  content: Content;
  redirectURL: string;
  headersSize: number;
  bodySize: number;
}

export interface Timings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send: number;
  wait: number;
  receive: number;
  ssl?: number;
}

export interface HarEntry {
  startedDateTime: string;
  time: number;
  request: Request;
  response: Response;
  cache: any;
  timings: Timings;
  serverIPAddress?: string;
  connection?: string;
  _securityState?: string;
}

export interface HarLog {
  version: string;
  creator: { name: string; version: string };
  entries: HarEntry[];
}

export interface HarRoot {
  log: HarLog;
}

export interface AnalysisResult {
  summary: string;
  errorAnalysis?: string;
  pythonCode: string;
  typescriptCode: string;
  goCode: string;
  rustCode: string;
  phpCode: string;
}
