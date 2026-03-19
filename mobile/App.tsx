import React from "react";
import { AuthProvider, useAuth } from "./contexts/authContext";
import "./global.css";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import AddRecipe from "./screens/AddRecipe";
import AllRecipes from "./screens/AllRecipes";
import ExactRecipe from "./screens/ExactRecipe";
import {
  AuthStackParamList,
  CategoryStackParamList,
  RootStackParamList,
} from "./utils/types";
import Category from "./screens/Categories";
import RecipesByCategory from "./screens/RecipesByCategory";
import Ionicons from "@react-native-vector-icons/ionicons";
import MyRecipesScreen from "./screens/MyRecipesScreen";
import EditRecipe from "./screens/EditRecipe";
import ExactUserRecipes from "./screens/ExactUserRecipes";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const AuthStackNav = createStackNavigator<AuthStackParamList>();
function AuthStack() {
  return (
    <AuthStackNav.Navigator>
      <AuthStackNav.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <AuthStackNav.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animation: "slide_from_bottom",
        }}
      />
      <AuthStackNav.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animation: "slide_from_bottom",
        }}
      />
    </AuthStackNav.Navigator>
  );
}

const Tab = createBottomTabNavigator();
function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="AllRecipes"
        component={AllRecipes}
        options={{
          title: "All Recipes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="restaurant-outline" size={18} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Categories"
        component={AppCategoryStacks}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={18} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyRecipes"
        component={MyRecipesScreen}
        options={{
          title: "My recipes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={18} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const CategoryStack = createStackNavigator<CategoryStackParamList>();
function AppCategoryStacks() {
  return (
    <CategoryStack.Navigator>
      <CategoryStack.Screen name="CategoriesScreen" component={Category} />
      <CategoryStack.Screen
        name="RecipesByCategory"
        component={RecipesByCategory}
        options={{ title: "" }}
      />
    </CategoryStack.Navigator>
  );
}

const Stack = createStackNavigator<RootStackParamList>();
function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={AppTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddRecipe"
        component={AddRecipe}
        options={{ title: "Add Recipe" }}
      />
      <Stack.Screen
        name="ExactRecipe"
        component={ExactRecipe}
        options={{ title: "", animation: "fade" }}
      />
      <Stack.Screen
        name="EditRecipe"
        component={EditRecipe}
        options={{ title: "Edit Recipe" }}
      />
      <Stack.Screen
        name="ExactUserRecipes"
        component={ExactUserRecipes}
        options={{ title: "" }}
      />
    </Stack.Navigator>
  );
}

const queryClient = new QueryClient();

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;

function RootNavigator() {
  const { user, initialLoading } = useAuth();
  if (initialLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return user ? <AppStack /> : <AuthStack />;
}
