import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, ActivityIndicator } from "react-native";
import { RootStackParamList, ShortRecipe } from "../utils/types";
import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../data/api";
import ListOfRecipes from "../components/ListOfRecipes";
import SearchRecipes from "../components/SearchRecipes";

type Props = NativeStackScreenProps<RootStackParamList, "ExactUserRecipes">;

const ExactUserRecipes = ({ route, navigation }: Props) => {
  const { userId } = route.params;
  const [allRecipes, setAllRecipes] = useState<ShortRecipe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = allRecipes.filter((rec) =>
    rec.title.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const getUsersId = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/recipes-by-user/${userId}`);
        if (res.data.success) {
          setAllRecipes(res.data.recipes);
          navigation.setOptions({ title: res.data.recipes[0].username });
        }
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    getUsersId();
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
          navigation={navigation}
          allRecipes={filtered}
          navigationRecipe="ExactRecipe"
        />
      )}
    </View>
  );
};

export default ExactUserRecipes;
