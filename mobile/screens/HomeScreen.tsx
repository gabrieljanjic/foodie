import { View, Text, Pressable, Image, ImageBackground } from "react-native";
import { StatusBar } from "expo-status-bar";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { AuthStackParamList } from "../utils/types";

type HomeScreenProps = {
  navigation: BottomTabNavigationProp<AuthStackParamList, "Home">;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  return (
    <>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../assets/images/a.jpg")}
        className="flex-1 w-full h-full"
        resizeMode="cover"
      >
        <View className="flex-1 bg-black/30 items-start justify-center px-8">
          <Text className="text-4xl font-bold text-white">Hello 👋</Text>
          <Text className="text-xl text-white/90 mt-2">Welcome to Foodie</Text>
          <Text className="text-md text-white/80 mt-2 w-3/5">
            A place to save your recipes and share them with others
          </Text>

          <Pressable
            onPress={() => navigation.navigate("Login")}
            className="w-3/5 mt-6 rounded-2xl bg-red-500 py-2 items-center"
          >
            <Text className="text-xl font-semibold text-white">Login</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Register")}
            className="w-3/5 mt-4 rounded-2xl border border-red-500 py-2 items-center"
          >
            <Text className="text-xl font-semibold text-red-500">Register</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </>
  );
};

export default HomeScreen;
