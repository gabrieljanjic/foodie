import { useLayoutEffect, useState } from "react";
import { View, Pressable, ActivityIndicator, Text } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import API_URL from "../data/api";
import { RootStackParamList, ShortRecipe } from "../utils/types";
import ListOfRecipes from "../components/ListOfRecipes";
import { TextInput } from "react-native-gesture-handler";
import SearchRecipes from "../components/SearchRecipes";
import { useQuery } from "@tanstack/react-query";

type RecipeProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Tabs">;
};

const AllRecipes = ({ navigation }: RecipeProps) => {
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          className="mr-4"
          onPress={() => navigation.navigate("AddRecipe")}
        >
          <Ionicons name="add" size={20} />
        </Pressable>
      ),
    });
  }, [navigation]);

  const fetchRecipes = async () => {
    const res = await axios.get(`${API_URL}/recipes`);
    if (res.data.success) {
      return res.data.allRecipes;
    }
    throw new Error("Failed to fetch recipes");
  };

  const { data, isLoading, error } = useQuery<ShortRecipe[]>({
    queryKey: ["allRecipes"],
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
          allRecipes={filtered}
          navigation={navigation}
          navigationRecipe="ExactRecipe"
        />
      )}
    </View>
  );
};

export default AllRecipes;
