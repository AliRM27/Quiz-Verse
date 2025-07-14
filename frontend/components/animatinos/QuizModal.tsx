import { View, Text, StyleSheet, Modal, Button } from "react-native";
import React, { useState } from "react";
// import Modal from "react-native-modal";
import { Colors } from "@/constants/Colors";

const QuizModal = ({ isVisible, setIsVisible }: any) => {
  return (
    // <Modal
    //   style={{
    //     width: "100%",
    //     alignSelf: "center",
    //     justifyContent: "flex-end",
    //   }}
    //   isVisible={isVisible}
    //   swipeDirection={"down"}
    //   onSwipeComplete={() => {
    //     setIsVisible((p: boolean) => !p);
    //   }}
    // >
    //   <View style={styles.container}>
    //     <Text style={{ color: Colors.dark.text }}>Welcome</Text>
    //   </View>
    // </Modal>
    <Modal
      animationType="slide" // or "fade", "none"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)} // for Android back button
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text>This is a modal!</Text>
          <Button title="Close" onPress={() => setIsVisible(false)} />
        </View>
      </View>
    </Modal>
  );
};

export default QuizModal;

const styles = StyleSheet.create({
  modalBackground: {
    height: "100%",
    justifyContent: "flex-end",
  },
  modalContainer: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    elevation: 5,
    height: "90%",
  },
});
