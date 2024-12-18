export interface SignInResponse {
    message: string,
    user: {
      user_id: number;
      user_name: string;
      user_email: string;
    };
    accessToken: string;
  }
  