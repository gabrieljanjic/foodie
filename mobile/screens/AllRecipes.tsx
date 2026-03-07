import { useEffect, useLayoutEffect, useState } from "react";
import { View, Pressable, ActivityIndicator, Text } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import API_URL from "../data/api";
import { RootStackParamList, ShortRecipe } from "../utils/types";
import ListOfRecipes from "../components/ListOfRecipes";
import { TextInput } from "react-native-gesture-handler";
import SearchRecipes from "../components/SearchRecipes";

type RecipeProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Tabs">;
};

const AllRecipes = ({ navigation }: RecipeProps) => {
  const [allRecipes, setAllRecipes] = useState<ShortRecipe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = allRecipes.filter((rec) =>
    rec.title.toLowerCase().includes(search.toLowerCase()),
  );

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

  useEffect(() => {
    const getAllRecipes = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/recipes`);
        if (res.data.success) {
          setAllRecipes(res.data.allRecipes);
        }
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    getAllRecipes();
  }, []);

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
          allRecipes={filtered}
          navigation={navigation}
          navigationRecipe="ExactRecipe"
        />
      )}
    </View>
  );
};

export default AllRecipes;
