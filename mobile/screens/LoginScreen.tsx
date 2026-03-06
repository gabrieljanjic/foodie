import { useState } from "react";
import { View, Text, TextInput, Button, Pressable, Alert } from "react-native";
import { useAuth } from "../contexts/authContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { AuthStackParamList } from "../utils/types";

type LoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, "Login">;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser, error, loading } = useAuth();
  const loginUserHandler = async () => {
    if (password.length < 8) {
      Alert.alert(
        "Invalid input",
        "Password has to be at least 8 characters long",
        [
          {
            text: "Okay",
            style: "destructive",
            onPress: () => setPassword(""),
          },
        ],
      );
      return;
    }
    if (username.length < 6) {
      Alert.alert(
        "Invalid input",
        "Username has to be at least 6 characters long",
        [
          {
            text: "Okay",
            style: "destructive",
            onPress: () => setUsername(""),
          },
        ],
      );
      return;
    }
    if (username.length > 20 || password.length > 20) {
      Alert.alert(
        "Invalid input",
        "Username and password can not be at longer than 20 characters",
        [
          {
            text: "Okay",
            style: "destructive",
            onPress: () => {
              setUsername("");
              setPassword("");
            },
          },
        ],
      );
      return;
    }
    await loginUser(username, password);
    setUsername("");
    setPassword("");
  };

  return (
    <View className="flex-1 bg-slate-50 items-center pt-10">
      <StatusBar style="dark" />
      <View className="margin-auto w-4/5 gap-2">
        <Text className="p-1 text-4xl font-bold text-center">Login</Text>
        <Text className="p-2 text-gray-700 text-center mb-6">
          Enter valid user name & password to continue
        </Text>
        <Text className="text-gray-900">Username:</Text>
        <TextInput
          className="p-2 px-3 border border-gray-600 rounded-md"
          value={username}
          autoCapitalize="none"
          onChangeText={(text) => setUsername(text)}
        />
        <Text className="text-gray-900">Password:</Text>
        <TextInput
          className="p-2 px-3 border border-gray-600 rounded-md"
          value={password}
          autoCapitalize="none"
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
        />
        {error && <Text>{error}</Text>}
        <View className="mt-2">
          <Pressable
            onPress={loginUserHandler}
            className="bg-red-500 py-2 rounded-lg "
          >
            <Text className="text-white text-center text-lg">
              {loading ? "Loading" : "Log in"}
            </Text>
          </Pressable>
        </View>
        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text className="p-2 text-center">You do not have an account?</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default LoginScreen;
