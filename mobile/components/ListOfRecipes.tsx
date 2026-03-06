import Ionicons from "@react-native-vector-icons/ionicons";
import { View, Text, FlatList, Pressable, Image } from "react-native";
import { ShortRecipe } from "../utils/types";

type Props = {
  allRecipes: ShortRecipe[];
  navigation: any;
  navigationRecipe: string;
};

const ListOfRecipes = ({ allRecipes, navigation, navigationRecipe }: Props) => {
  return (
    <FlatList
      data={allRecipes}
      keyExtractor={(item) => item.id.toString()}
      renderItem={(itemData) => {
        const { id, title, description, cook_time, image_url } = itemData.item;
        return (
          <Pressable
            onPress={() =>
              navigation.navigate(navigationRecipe, {
                id: id,
              })
            }
            style={{ elevation: 2 }}
            className="flex-row bg-white rounded-xl mb-3 overflow-hidden border border-gray-200"
          >
            <Image
              source={{ uri: image_url }}
              className="w-32 h-32"
              resizeMode="cover"
            />

            <View className="flex-1 p-3 justify-between">
              <Text
                className="text-base font-semibold text-gray-800"
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
                {description}
              </Text>
              <View className="mt-1 gap-1 items-center flex-row">
                <Ionicons name="time-outline" color={"#9ca3af"} />
                <Text className="text-xs text-gray-400 ">{cook_time} min</Text>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );
};

export default ListOfRecipes;
