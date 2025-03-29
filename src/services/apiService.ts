import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

export interface Category {
  id: string;
  name: string;
  postCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  postCount?: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author?: {
    id: string;
    name: string;
  };
  category: Category;
  tags: Tag[];
  readingTime?: number;
  createdAt: string;
  updatedAt: string;
  status?: PostStatus;
}

export interface Role {
  id: string;
  name: string;
}
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  roles: Role[];
  createdAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  status: PostStatus;
}

export interface UpdatePostRequest extends CreatePostRequest {
  id: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  roleIds: string[];
}

export interface UpdateUserRequest extends CreateUserRequest {
  id: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  private constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL + "/api/v1",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = import.meta.env.BASE_URL;
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      return error.response.data as ApiError;
    }
    return {
      status: 500,
      message: "An unexpected error occurred",
    };
  }

  // Auth endpoints
  public async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/login",
      credentials
    );
    localStorage.setItem("token", response.data.token);
    return response.data;
  }

  public async signup(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/signup",
      data
    );
    return response.data;
  }

  // ApiService.ts
  public async getUserProfile(): Promise<AuthUser> {
    const response: AxiosResponse<AuthUser> = await this.api.get("/auth/me");
    return response.data;
  }

  public logout(): void {
    localStorage.removeItem("token");
  }

  // Posts endpoints
  public async getPosts(params: {
    categoryId?: string;
    tagId?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PaginatedResponse<Post>> {
    const response = await this.api.get<PaginatedResponse<Post>>("/posts", {
      params: {
        ...params,
        page: params.page ? params.page - 1 : 0, // Spring usa 0-based index
        size: params.size || 10,
      },
    });
    return response.data;
  }

  public async getPost(id: string): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.get(`/posts/${id}`);
    return response.data;
  }

  public async searchPostsByTitle(
    title: string,
    page: number,
    size: number
  ): Promise<PaginatedResponse<Post>> {
    const response: AxiosResponse<PaginatedResponse<Post>> = await this.api.get(
      "/posts/search",
      {
        params: {
          title: title,
          page: page - 1,
          size: size,
        },
      }
    );
    return response.data;
  }

  public async createPost(post: CreatePostRequest): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.post("/posts", post);
    return response.data;
  }

  public async updatePost(id: string, post: UpdatePostRequest): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.put(
      `/posts/${id}`,
      post
    );
    return response.data;
  }

  public async deletePost(id: string): Promise<void> {
    await this.api.delete(`/posts/${id}`);
  }

  public async getDrafts(params: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PaginatedResponse<Post>> {
    const response = await this.api.get<PaginatedResponse<Post>>(
      "/posts/drafts",
      {
        params: {
          ...params,
          page: params.page ? params.page - 1 : 0, // Spring usa 0-based index
          size: params.size || 10,
        },
      }
    );
    return response.data;
  }

  // Categories endpoints
  public async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<Category[]> = await this.api.get(
      "/categories"
    );
    return response.data;
  }

  public async createCategory(name: string): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.post(
      "/categories",
      { name }
    );
    return response.data;
  }

  public async updateCategory(id: string, name: string): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.put(
      `/categories/${id}`,
      { id, name }
    );
    return response.data;
  }

  public async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // Tags endpoints
  public async getTags(): Promise<Tag[]> {
    const response: AxiosResponse<Tag[]> = await this.api.get("/tags");
    return response.data;
  }

  public async createTags(names: string[]): Promise<Tag[]> {
    const response: AxiosResponse<Tag[]> = await this.api.post("/tags", {
      names,
    });
    return response.data;
  }

  public async deleteTag(id: string): Promise<void> {
    await this.api.delete(`/tags/${id}`);
  }

  public async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get("/users");
    return response.data;
  }

  public async getUser(id: string): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/users/${id}`);
    return response.data;
  }

  public async createUser(post: CreateUserRequest): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post("/users", post);
    return response.data;
  }

  public async updateUser(id: string, user: UpdateUserRequest): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(
      `/users/${id}`,
      user
    );
    return response.data;
  }

  public async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  public async getRoles(): Promise<Role[]> {
    const response: AxiosResponse<Role[]> = await this.api.get("/roles");
    return response.data;
  }
}

// Export a singleton instance
export const apiService = ApiService.getInstance();
