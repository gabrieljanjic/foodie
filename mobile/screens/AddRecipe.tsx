import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import API_URL from "../data/api";
import * as SecureStore from "expo-secure-store";
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import { Category, RootStackParamList } from "../utils/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AddRecipeProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AddRecipe">;
};

const AddRecipe = ({ navigation }: AddRecipeProps) => {
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("1.");
  const [servings, setServings] = useState<string>("1");
  const [time, setTime] = useState<string>("");
  const [privateCheck, setPrivateCheck] = useState<boolean>(false);
  const [ingredients, setIngredients] = useState<string[]>([""]);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
    };
    loadCategories();
  }, []);

  const updateIngredient = (index: number, value: string) => {
    setIngredients((prev) => {
      const newIngredients = [...prev];
      newIngredients[index] = value;
      return newIngredients;
    });
  };

  const addIngredient = () => {
    setIngredients((prev) => {
      return [...prev, ""];
    });
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync("auth_token");
      if (token) {
        if (!title || !description || !selectedCategory || !time || !image) {
          Alert.alert(
            "Required fields",
            "Title, description, category, time and image are required.",
            [
              {
                text: "Okay",
                style: "destructive",
              },
            ],
          );
          return;
        }

        let imageUrl = null;
        if (image) {
          const formData = new FormData();
          formData.append("image", {
            uri: image,
            type: "image/jpeg",
            name: "recipe.jpg",
          } as any);

          const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
          imageUrl = uploadRes.data.url;
        }

        const res = await axios.post(
          `${API_URL}/recipe`,
          {
            categoryId: selectedCategory,
            title,
            description,
            instructions,
            servings: Number(servings),
            time: Number(time),
            private: privateCheck,
            ingredients,
            imageUrl,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.data.success) {
          navigation.navigate("Tabs", { screen: "AllRecipes" });
          setSelectedCategory(null);
          setTitle("");
          setDescription("");
          setInstructions("1.");
          setServings("1");
          setTime("");
          setPrivateCheck(false);
          setIngredients([""]);
          setImage(null);
        }
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const pickFromCamera = async () => {
    setShowImagePicker(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("You have to give access to camera");
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    setShowImagePicker(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("You have to give the permission");
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  if (error) {
    return (
      <View className="items-center justify-center">
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={100}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-1">Title</Text>
        <TextInput
          className="p-2 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
          value={title}
          onChangeText={setTitle}
        />
        <Text className="mb-1 mt-3">Upload picture</Text>
        <Modal
          visible={showImagePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImagePicker(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
            onPress={() => setShowImagePicker(false)}
          >
            <View
              style={{
                position: "absolute",
                bottom: "50%",
                left: 24,
                right: 24,
                backgroundColor: "white",
                borderRadius: 16,
                padding: 20,
                gap: 12,
              }}
            >
              <View className="flex-row justify-between px-8 py-2">
                <Pressable className="items-center" onPress={pickFromCamera}>
                  <Image
                    source={require("../assets/images/camera.png")}
                    className="w-10 h-10"
                  />
                  <Text>Camera</Text>
                </Pressable>
                <Pressable className="items-center" onPress={pickFromGallery}>
                  <Image
                    source={require("../assets/images/gallery.png")}
                    className="w-10 h-10"
                  />
                  <Text>Gallery</Text>
                </Pressable>
                <Pressable
                  className="items-center"
                  onPress={() => {
                    setImage(null);
                    setShowImagePicker(false);
                  }}
                >
                  <Image
                    source={require("../assets/images/delete.png")}
                    className="w-10 h-10"
                  />
                  <Text>Delete</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>
        <View className="bg-white border border-gray-300 rounded-md p-5">
          <Pressable onPress={() => setShowImagePicker(true)}>
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-20 h-20"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-center text-gray-400  text-3xl">+</Text>
            )}
          </Pressable>
        </View>

        <Text className="mt-3 mb-1">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline={true}
          className="p-2 pb-8 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
        />
        <Text className="mt-3 mb-1">Instructions</Text>
        <TextInput
          multiline={true}
          value={instructions}
          onChangeText={setInstructions}
          className="p-2 pb-8 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
        />
        <View className="flex-row gap-3 mt-3">
          <View className="w-4/12">
            <Text className="mb-1">Servings</Text>
            <TextInput
              value={servings}
              onChangeText={setServings}
              className="p-2 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
              keyboardType="number-pad"
            />
          </View>
          <View className="w-5/12">
            <Text className="mb-1">Time in mins</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              className="p-2 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
              keyboardType="number-pad"
            />
          </View>
          <View>
            <Text className="mb-1">Private</Text>
            <Checkbox
              value={privateCheck}
              onValueChange={setPrivateCheck}
              style={{
                width: 28,
                height: 28,
                borderWidth: 1,
                backgroundColor: "#fff",
                borderColor: "#d1d5db",
                borderRadius: 6,
              }}
              color={privateCheck ? "red" : undefined}
            />
          </View>
        </View>
        <Text className="mt-3 mb-1">Ingredients</Text>
        {ingredients.map((ing, index) => (
          <View key={index} className="flex-row items-center mb-2">
            <TextInput
              value={ing}
              onChangeText={(text) => updateIngredient(index, text)}
              placeholder={`Ingredient ${index + 1}`}
              className="flex-1 p-2 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
            />
            {ingredients.length > 1 && (
              <Pressable
                className="ml-2"
                onPress={() => removeIngredient(index)}
              >
                <Text className="text-red-500 text-lg">X</Text>
              </Pressable>
            )}
          </View>
        ))}
        <Pressable
          className="bg-green-500 rounded-lg py-1 w-20 mb-3"
          onPress={addIngredient}
        >
          <Text className="text-white text-center">Add</Text>
        </Pressable>
        <Text className="my-1">Category</Text>
        <View className="bg-white rounded-lg border border-gray-300">
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <Picker.Item
              label="-"
              style={{ color: "#777" }}
              value={null}
              enabled={false}
            />
            {categories.map((cat) => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
            ))}
          </Picker>
        </View>
        <View className="w-20 self-end mt-3 mb-12">
          <Pressable
            className={`rounded-lg p-2 ${loading ? "bg-red-300" : "bg-red-500"}`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg">Create</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddRecipe;
