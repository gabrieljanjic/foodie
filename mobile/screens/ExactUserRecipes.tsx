import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, ActivityIndicator } from "react-native";
import { RootStackParamList, ShortRecipe } from "../utils/types";
import { useState } from "react";
import axios from "axios";
import API_URL from "../data/api";
import ListOfRecipes from "../components/ListOfRecipes";
import SearchRecipes from "../components/SearchRecipes";
import { useQuery } from "@tanstack/react-query";

type Props = NativeStackScreenProps<RootStackParamList, "ExactUserRecipes">;

const ExactUserRecipes = ({ route, navigation }: Props) => {
  const { userId } = route.params;
  const [search, setSearch] = useState("");

  const fetchRecipes = async () => {
    const res = await axios.get(`${API_URL}/recipes-by-user/${userId}`);
    if (res.data.success) {
      navigation.setOptions({ title: res.data.recipes[0].username });
      return res.data.recipes;
    }
    throw new Error("Failed to fetch recipes");
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["usersRecipes"],
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
          navigationRecipe="ExactRecipe"
        />
      )}
    </View>
  );
};

export default ExactUserRecipes;
