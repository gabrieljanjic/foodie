import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CategoryStackParamList, ShortRecipe } from "../utils/types";
import { View, Text, ActivityIndicator } from "react-native";
import { useLayoutEffect, useState } from "react";
import axios from "axios";
import API_URL from "../data/api";
import ListOfRecipes from "../components/ListOfRecipes";
import SearchRecipes from "../components/SearchRecipes";
import { useQuery } from "@tanstack/react-query";

type Props = NativeStackScreenProps<
  CategoryStackParamList,
  "RecipesByCategory"
>;

const RecipesByCategory = ({ route, navigation }: Props) => {
  const { categoryId, name } = route.params;
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: name });
  }, []);

  const fetchRecipes = async () => {
    const res = await axios.get(`${API_URL}/recipe-by-category/${categoryId}`);
    return res.data.recipes;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["categoryRecipes", categoryId],
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

  if (error)
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error.message}</Text>
      </View>
    );

  return (
    <View className="px-4 pt-4 flex-1">
      <SearchRecipes search={search} setSearch={setSearch} />
      {filtered.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400">No recipes found</Text>
        </View>
      ) : (
        <ListOfRecipes
          allRecipes={filtered}
          navigation={navigation}
          navigationRecipe="ExactRecipe"
        />
      )}
    </View>
  );
};

export default RecipesByCategory;
