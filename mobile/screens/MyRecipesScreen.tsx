import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useLayoutEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { AuthStackParamList, ShortRecipe } from "../utils/types";
import axios from "axios";
import API_URL from "../data/api";
import * as SecureStore from "expo-secure-store";
import ListOfRecipes from "../components/ListOfRecipes";
import SearchRecipes from "../components/SearchRecipes";
import { useQuery } from "@tanstack/react-query";

type MyRecipesScreenProps = {
  navigation: BottomTabNavigationProp<AuthStackParamList, "Profile">;
};

const MyRecipesScreen = ({ navigation }: MyRecipesScreenProps) => {
  const { logoutUser } = useAuth();
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={logoutUser} className="px-4">
          <Text className="text-red-500 font-semibold">Log out</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const fetchRecipes = async () => {
    const token = await SecureStore.getItemAsync("auth_token");

    const res = await axios.get(`${API_URL}/recipes-by-me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.recipes;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["myRecipes"],
    queryFn: fetchRecipes,
  });
  const filtered = (data ?? []).filter((rec: ShortRecipe) =>
    rec.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error.message}</Text>
      </View>
    );
  }

  return (
    <View className="px-4 pt-4 flex-1">
      <SearchRecipes search={search} setSearch={setSearch} />
      {filtered.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400">No recipes found</Text>
        </View>
      ) : (
        <ListOfRecipes
          navigation={navigation}
          allRecipes={filtered}
          navigationRecipe="EditRecipe"
        />
      )}
    </View>
  );
};

export default MyRecipesScreen;
