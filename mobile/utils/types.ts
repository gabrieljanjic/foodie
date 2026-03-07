export type RootStackParamList = {
  Tabs: { screen: string } | undefined;
  AddRecipe: undefined;
  ExactRecipe: { id: number };
  EditRecipe: { id: number };
  ExactUserRecipes: { userId: number };
};

export type AuthStackParamList = {
  Profile: undefined;
  Home: undefined;
  Login: undefined;
  Register: undefined;
};

export type ShortRecipe = {
  id: number;
  title: string;
  description: string;
  cook_time: number;
  image_url: string;
};

export type LongRecipe = {
  id: number;
  category_name: string;
  title: string;
  description: string;
  instructions?: string;
  servings?: number;
  ingredients?: string[];
  cook_time: number;
  image_url?: string;
  isPrivate: boolean;
  created_at: string;
  username: string;
  user_id: number;
};

export type Category = {
  id: number;
  name: string;
};

export type CategoryStackParamList = {
  CategoriesScreen: undefined;
  RecipesByCategory: { categoryId: number; name: string };
};
