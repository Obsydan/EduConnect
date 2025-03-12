export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Dashboard: undefined; // Ajouté
    Users: undefined;
    Courses: undefined;
    Resources: undefined;
    MainTab: undefined;
    // On ajoutera d'autres écrans plus tard
  };
  
  export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
  };

export type MainTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Courses: undefined;
  Resources: undefined;
};