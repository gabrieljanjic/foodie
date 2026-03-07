import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { AuthStackParamList, ShortRecipe } from "../utils/types";
import axios from "axios";
import API_URL from "../data/api";
import * as SecureStore from "expo-secure-store";
import ListOfRecipes from "../components/ListOfRecipes";
import SearchRecipes from "../components/SearchRecipes";
import { useFocusEffect } from "@react-navigation/native";

type MyRecipesScreenProps = {
  navigation: BottomTabNavigationProp<AuthStackParamList, "Profile">;
};

const MyRecipesScreen = ({ navigation }: MyRecipesScreenProps) => {
  const { logoutUser } = useAuth();
  const [myRecipes, setMyRecipes] = useState<ShortRecipe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = myRecipes.filter((rec) =>
    rec.title.toLowerCase().includes(search.toLowerCase()),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={logoutUser} className="px-4">
          <Text className="text-red-500 font-semibold">Log out</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const getMyRecipes = async () => {
        const token = await SecureStore.getItemAsync("auth_token");
        try {
          setLoading(true);
          const res = await axios.get(`${API_URL}/recipes-by-me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMyRecipes(res.data.recipes);
        } catch (err) {
          setError("Something went wrong");
        } finally {
          setLoading(false);
        }
      };
      getMyRecipes();
    }, []),
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
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
