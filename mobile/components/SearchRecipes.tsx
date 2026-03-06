import Ionicons from "@react-native-vector-icons/ionicons";
import { View, TextInput, Pressable } from "react-native";

type Props = {
  search: string;
  setSearch: (text: string) => void;
};

const SearchRecipes = ({ search, setSearch }: Props) => {
  return (
    <View
      className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 mb-4"
      style={{ elevation: 1 }}
    >
      <Ionicons name="search-outline" size={18} color="#9ca3af" />
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search recipes..."
        placeholderTextColor="#9ca3af"
        className="flex-1 p-2 text-gray-800"
      />
      {search.length > 0 && (
        <Pressable onPress={() => setSearch("")}>
          <Ionicons name="close-outline" size={18} color="#9ca3af" />
        </Pressable>
      )}
    </View>
  );
};

export default SearchRecipes;
