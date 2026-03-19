import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, Category } from "../utils/types";
import { useEffect, useLayoutEffect, useState } from "react";
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
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Props = NativeStackScreenProps<RootStackParamList, "EditRecipe">;

const EditRecipe = ({ navigation, route }: Props) => {
  const keysToInvalidate = [
    "allRecipes",
    "exactRecipes",
    "usersRecipes",
    "myRecipes",
    "categoryRecipes",
  ];
  const { id } = route.params;
  const queryClient = useQueryClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [image, setImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [servings, setServings] = useState("1");
  const [time, setTime] = useState("");
  const [privateCheck, setPrivateCheck] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>([""]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => deleteMutation.mutate()} className="px-4">
          <Text className="text-red-500 font-semibold">Delete</Text>
        </Pressable>
      ),
    });
  }, []);

  const fetchData = async () => {
    const [recipeRes, categoriesRes] = await Promise.all([
      axios.get(`${API_URL}/recipe/${id}`),
      axios.get(`${API_URL}/categories`),
    ]);

    if (!recipeRes.data.success) throw new Error("Failed to fetch recipe");

    return {
      recipe: recipeRes.data.recipe,
      categories: categoriesRes.data,
    };
  };

  const { data, isLoading } = useQuery({
    queryKey: ["editRecipe", id],
    queryFn: fetchData,
  });

  useEffect(() => {
    if (data) {
      const r = data.recipe;
      navigation.setOptions({ title: r.title });
      setTitle(r.title);
      setDescription(r.description);
      setInstructions(r.instructions ?? "");
      setServings(String(r.servings ?? "1"));
      setTime(String(r.cook_time));
      setPrivateCheck(r.is_private);
      setSelectedCategory(r.category_id);
      setImage(r.image_url ?? null);
      setIngredients(r.ingredients?.length ? r.ingredients : [""]);
      setCategories(data.categories);
    }
  }, [data]);

  const updateIngredient = (index: number, value: string) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const addIngredient = () => setIngredients((prev) => [...prev, ""]);
  const removeIngredient = (index: number) =>
    setIngredients((prev) => prev.filter((_, i) => i !== index));

  const pickFromCamera = async () => {
    setShowImagePicker(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permission needed", "Camera access required");

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
      return Alert.alert("Permission needed", "Gallery access required");

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) throw new Error("No token");

      let imageUrl = image;

      if (image && !image.startsWith("http")) {
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

      const res = await axios.put(
        `${API_URL}/recipe/${id}`,
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
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!res.data.success) throw new Error("Update failed");
    },
    onSuccess: () => {
      keysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      navigation.goBack();
    },
    onError: () => Alert.alert("Error", "Something went wrong"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync("auth_token");
      const res = await axios.put(
        `${API_URL}/delete-recipe/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.data.success) throw new Error("Delete failed");
    },
    onSuccess: () => {
      keysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      navigation.goBack();
    },
    onError: () => Alert.alert("Error", "Something went wrong"),
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text className="mb-1">Title</Text>
          <TextInput
            className="p-2 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
            value={title}
            onChangeText={setTitle}
          />

          <Text className="mb-1 mt-3">Upload picture</Text>
          <Modal
            visible={showImagePicker}
            transparent
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
                  className="w-full h-40"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-center text-gray-400 text-3xl">+</Text>
              )}
            </Pressable>
          </View>

          <Text className="mt-3 mb-1">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            className="p-2 pb-8 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
          />

          <Text className="mt-3 mb-1">Instructions</Text>
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            multiline
            className="p-2 pb-8 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
          />

          <Text className="mt-3 mb-1">Servings</Text>
          <TextInput
            value={servings}
            onChangeText={setServings}
            className="p-2 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
            keyboardType="number-pad"
          />

          <Text className="mt-3 mb-1">Time in mins</Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            className="p-2 rounded-lg bg-white text-lg border border-gray-300 text-gray-800"
            keyboardType="number-pad"
          />

          <Text className="mt-3 mb-1">Private</Text>
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

          <Text className="mt-1">Category</Text>
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

          <Pressable
            className={`rounded-lg py-1 ${updateMutation.isPending ? "bg-red-300" : "bg-red-500"} mt-3 mb-12`}
            onPress={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg">Save</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditRecipe;
