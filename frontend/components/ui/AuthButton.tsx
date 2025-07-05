import {TouchableOpacity, Text, StyleSheet} from "react-native";
import React from "react";
import {ButtonProps} from "@/types"
import {Auth} from "@/constants/Dimensions";


export const AuthButton = ({title, Logo, onPress}: ButtonProps) => (
    <TouchableOpacity activeOpacity={0.8} style={styles.container} onPress={onPress}>
        <Logo />
        <Text style={{fontSize:15}}>{title}</Text>
    </TouchableOpacity>
)

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: 'white',
        width: Auth.width.button,
        borderRadius: 20,
        gap: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center"
    }
})