import axios from "axios";
import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import API_URL from "../data/api";
import { Category } from "../utils/types";
import { FlatList } from "react-native-gesture-handler";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CategoryStackParamList } from "../utils/types";

type Props = {
  navigation: NativeStackNavigationProp<
    CategoryStackParamList,
    "CategoriesScreen"
  >;
};

const Categories = ({ navigation }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/categories`);
        setCategories(res.data);
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <View className="mt-40">
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
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={(itemData) => {
        return (
          <Pressable
            onPress={() =>
              navigation.navigate("RecipesByCategory", {
                categoryId: itemData.item.id,
                name: itemData.item.name,
              })
            }
            className="flex-1 bg-white rounded-2xl p-5 border border-gray-100"
            style={{ elevation: 2 }}
          >
            <Text className="text-base font-semibold text-gray-800">
              {itemData.item.name}
            </Text>
          </Pressable>
        );
      }}
    />
  );
};

export default Categories;
