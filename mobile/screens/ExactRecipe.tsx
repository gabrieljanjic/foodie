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
import axios from "axios";
import API_URL from "../data/api";
import Ionicons from "@react-native-vector-icons/ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

type Props = NativeStackScreenProps<RootStackParamList, "ExactRecipe">;

const ExactRecipe = ({ route, navigation }: Props) => {
  const { id } = route.params;

  const fetchRecipe = async () => {
    const res = await axios.get(`${API_URL}/recipe/${id}`);
    if (res.data.success) {
      navigation.setOptions({ title: res.data.recipe.title });
      return res.data.recipe;
    }
    throw new Error("Failed to fetch recipe");
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["exactRecipe", id],
    queryFn: fetchRecipe,
  });

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
        <Text className="text-center text-red-500">{error.message}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400">No recipe found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <ScrollView className="bg-gray-50">
        {data.image_url ? (
          <Image
            source={{ uri: data.image_url }}
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
            {data.title}
          </Text>
          <Text className="text-sm text-red-400 mb-2">
            {data.category_name}
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-row gap-4 mb-4">
              <View className="gap-1 flex-row items-center">
                <Ionicons name="time-outline" />
                <Text className="text-sm text-gray-400">
                  {data.cook_time} min
                </Text>
              </View>
              {data.servings && (
                <View className="gap-1 flex-row items-center">
                  <Ionicons name="fast-food-outline" />
                  <Text className="text-sm text-gray-400">
                    {data.servings}
                    {data.servings > 1 ? " servings" : " serving"}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Pressable
                onPress={() =>
                  navigation.navigate("ExactUserRecipes", {
                    userId: data.user_id,
                  })
                }
              >
                <View className="flex-row justify-center items-center gap-1">
                  <Ionicons name="person-outline" size={14} color="#374151" />
                  <Text className="text-sm text-gray-700">{data.username}</Text>
                </View>
              </Pressable>
            </View>
          </View>
          <View className="h-px bg-gray-200 mb-4" />
          <Text className="text-base font-semibold text-gray-700 mb-1">
            Description
          </Text>
          <Text className="text-sm text-gray-500 leading-5 mb-4">
            {data.description}
          </Text>
          {data.ingredients &&
            data.ingredients.filter((ing: string) => ing.trim() !== "").length >
              0 && (
              <>
                <View className="h-px bg-gray-200 mb-4" />
                <Text className="text-base font-semibold text-gray-700 mb-2">
                  Ingredients
                </Text>
                {data.ingredients.map((ing: string, index: number) => (
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
          {data.instructions && (
            <>
              <View className="h-px bg-gray-200 mb-4" />
              <Text className="text-base font-semibold text-gray-700 mb-1">
                Instructions
              </Text>
              <Text className="text-sm text-gray-500 leading-6">
                {data.instructions}
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExactRecipe;
