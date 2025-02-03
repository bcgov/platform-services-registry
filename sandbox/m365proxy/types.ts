export interface MockResponse {
  request: {
    url: string;
    method?: string;
  };
  response: {
    body?: any;
    statusCode?: string;
  };
}

export interface MockFile {
  $schema: string;
  mocks: MockResponse[];
}
