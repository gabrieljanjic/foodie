import axios from "axios";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import API_URL from "../data/api";
import { FlatList } from "react-native-gesture-handler";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CategoryStackParamList } from "../utils/types";
import { useQuery } from "@tanstack/react-query";

type Props = {
  navigation: NativeStackNavigationProp<
    CategoryStackParamList,
    "CategoriesScreen"
  >;
};

const Categories = ({ navigation }: Props) => {
  const fetchCategories = async () => {
    const res = await axios.get(`${API_URL}/categories`);
    return res.data;
  };

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) {
    return (
      <View className="mt-40">
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
