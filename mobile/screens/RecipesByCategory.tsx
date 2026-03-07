import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CategoryStackParamList, ShortRecipe } from "../utils/types";
import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";
import API_URL from "../data/api";
import ListOfRecipes from "../components/ListOfRecipes";
import SearchRecipes from "../components/SearchRecipes";

type Props = NativeStackScreenProps<
  CategoryStackParamList,
  "RecipesByCategory"
>;

const RecipesByCategory = ({ route, navigation }: Props) => {
  const { categoryId, name } = route.params;
  const [allRecipes, setAllRecipes] = useState<ShortRecipe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = allRecipes.filter((rec) =>
    rec.title.toLowerCase().includes(search.toLowerCase()),
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: name });
  }, []);

  useEffect(() => {
    const getRecipesByCategory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/recipe-by-category/${categoryId}`,
        );
        setAllRecipes(res.data.recipes);
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    getRecipesByCategory();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error)
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
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
