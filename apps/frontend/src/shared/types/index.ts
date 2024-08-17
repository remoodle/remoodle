export enum RouteName {
  Home = "home",
  Dashboard = "dashboard",
  Login = "login",
  SignUp = "sign-up",
  Token = "token",
  NotFound = "404",
  Account = "account",
  AccountProfile = "profile",
  AccountNotifications = "notifications",
  Course = "course",
  Grades = "course-grades",
  Assignment = "assignment",
  Terms = "terms",
  Privacy = "privacy",
}

export type Provider = {
  name: string;
  api: string;
  description?: string;
  privacy?: string;
  moodle: {
    requiresTokenGeneration: boolean;
  };
  services?: {
    [key: string]: {
      name: string;
      description: string;
      url: string;
    };
  };
};

export type Providers = Record<string, Provider>;
