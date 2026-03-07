import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LongRecipe, RootStackParamList } from "../utils/types";
import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../data/api";
import Ionicons from "@react-native-vector-icons/ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "ExactRecipe">;

const ExactRecipe = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const [recipe, setRecipe] = useState<LongRecipe>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getExactRecipe = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/recipe/${id}`);
        if (res.data.success) {
          setRecipe(res.data.recipe);
          navigation.setOptions({ title: res.data.recipe.title });
        }
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    getExactRecipe();
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
        <Text className="text-center text-red-500">{error}</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400">No recipe found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <ScrollView className="bg-gray-50">
        {recipe.image_url ? (
          <Image
            source={{ uri: recipe.image_url }}
            className="w-full h-72"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-64 bg-gray-200 items-center justify-center">
            <Text className="text-gray-400 text-lg">No image</Text>
          </View>
        )}
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            {recipe.title}
          </Text>
          <Text className="text-sm text-red-400 mb-2">
            {recipe.category_name}
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-row gap-4 mb-4">
              <View className="gap-1 flex-row items-center">
                <Ionicons name="time-outline" />
                <Text className="text-sm text-gray-400">
                  {recipe.cook_time} min
                </Text>
              </View>
              {recipe.servings && (
                <View className="gap-1 flex-row items-center">
                  <Ionicons name="fast-food-outline" />
                  <Text className="text-sm text-gray-400">
                    {recipe.servings}
                    {recipe.servings > 1 ? " servings" : " serving"}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Pressable
                onPress={() =>
                  navigation.navigate("ExactUserRecipes", {
                    userId: recipe.user_id,
                  })
                }
              >
                <View className="flex-row justify-center items-center gap-1">
                  <Ionicons name="person-outline" size={14} color="#374151" />
                  <Text className="text-sm text-gray-700">
                    {recipe.username}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
          <View className="h-px bg-gray-200 mb-4" />
          <Text className="text-base font-semibold text-gray-700 mb-1">
            Description
          </Text>
          <Text className="text-sm text-gray-500 leading-5 mb-4">
            {recipe.description}
          </Text>
          {recipe.ingredients &&
            recipe.ingredients.filter((ing) => ing.trim() !== "").length >
              0 && (
              <>
                <View className="h-px bg-gray-200 mb-4" />
                <Text className="text-base font-semibold text-gray-700 mb-2">
                  Ingredients
                </Text>
                {recipe.ingredients.map((ing, index) => (
                  <View
                    key={index}
                    className="flex-row items-center gap-2 mb-2"
                  >
                    <View className="w-2 h-2 rounded-full bg-red-400" />
                    <Text className="text-sm text-gray-500">{ing}</Text>
                  </View>
                ))}
              </>
            )}
          {recipe.instructions && (
            <>
              <View className="h-px bg-gray-200 mb-4" />
              <Text className="text-base font-semibold text-gray-700 mb-1">
                Instructions
              </Text>
              <Text className="text-sm text-gray-500 leading-6">
                {recipe.instructions}
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExactRecipe;
