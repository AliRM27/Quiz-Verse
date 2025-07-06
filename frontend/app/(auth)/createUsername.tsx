import {Text, View, TextInput, StyleSheet} from "react-native";
import {defaultStyles} from "@/constants/Styles";
import {BackgroundGradient} from "@/components/ui/gradients/background";
import NextButton from "@/components/ui/NextButton";
import {Colors} from "@/constants/Colors";
import {Auth} from "@/constants/Dimensions";
import {router} from "expo-router";

export default function createUsername(){
    return (
        <BackgroundGradient style={[defaultStyles.page, {justifyContent: 'space-between'}]}>
            <Text style={[defaultStyles.title, {textAlign:'center'}] }>Now let’s create your Username</Text>
            <TextInput style={styles.input} placeholder={"Type your username"} placeholderTextColor={Colors.dark.text_muted}/>
            <NextButton onPress={()=>router.replace('/(tabs)')} />
        </BackgroundGradient>
    )
}

const styles = StyleSheet.create({
    input: {
        width: Auth.width.button,
        borderWidth: 1,
        // borderColor: Colors.dark.border_muted,
        // backgroundColor: Colors.dark.bg_light,
        padding: 20,
        borderRadius: 20,
        color: Colors.dark.text
    }
})