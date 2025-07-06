import {  Text, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/Colors";
import ProfilePic from "@/assets/svgs/profilePic.svg"
import {defaultStyles} from "@/constants/Styles";
import DbhLogo from "@/assets/svgs/dbhLogo3.svg"
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import CircularProgress from "react-native-circular-progress-indicator";

export default function HomeScreen() {
  return (
    <View style={{gap: 30}}>
      <View style={[defaultStyles.containerRow, {gap: 20}] }>
          <View style={[defaultStyles.containerRowBackground, {flex: 2, gap: 10, alignItems: 'center'}]}>
              <ProfilePic width={60} height={60} />
              <Text style={styles.txt} numberOfLines={2}>AliEllie</Text>
          </View>
          <View style={[defaultStyles.containerRowBackgroundCenter, {flex: 1}]}>
            <Text style={styles.txt}>30 ⭐️</Text>
          </View>
      </View>
        <View style={[defaultStyles.containerBackground, {gap: 10}]}>
            <View style={[defaultStyles.containerRow, {justifyContent: 'space-between'}]}>
                <Text style={[styles.txt, {fontSize: 20}]}>Daily Quiz</Text>
                <View >
                    <Text style={[styles.txt_muted, styles.starCont]}>+ 10 ⭐️</Text>
                </View>
            </View>
            <View>
                <Text style={styles.txt_muted}>LAosdioej  sadkhasld ajklsdhfla skjdfashldjkfsdjkhf  </Text>
            </View>
        </View>
        <View style={[defaultStyles.containerRow, {gap: 10}]}>
            <View style={[defaultStyles.containerBackground, {flex: 1}]}>
                <Text style={styles.txt}>Weekly Event</Text>
            </View>
            <View style={[defaultStyles.containerBackground, {flex: 1, gap: 10}]}>
                <Text style={styles.txt}>Stats</Text>
                {/*<AnimatedCircularProgress*/}
                {/*    size={80}*/}
                {/*    width={10}*/}
                {/*    fill={25} // <- percentage*/}
                {/*    tintColor={Colors.dark.text}*/}
                {/*    backgroundColor={Colors.dark.border_muted}*/}
                {/*    rotation={0}*/}
                {/*/>*/}
                <CircularProgress
                    value={25}
                    maxValue={100}
                    radius={40}
                    progressValueColor={Colors.dark.text_muted}
                    activeStrokeColor={Colors.dark.success}
                    inActiveStrokeColor={Colors.dark.border_muted}
                    inActiveStrokeOpacity={0.8}
                    valueSuffix="%"
                    progressValueStyle={{fontSize: 20}}
                    valueSuffixStyle={{fontSize: 12}}
                    duration={1000}
                />

            </View>

        </View>
        <View style={{gap: 10}}>
            <Text style={styles.txt}>Last played</Text>
            <View style={[defaultStyles.containerRowBackground, {gap: 20}]}>
                <DbhLogo width={130} height={130} style={{ borderWidth: 1, borderColor: Colors.dark.border_muted, borderRadius: 20, overflow: "hidden"}} />
                <View style={{justifyContent: 'center', gap: 20}}>
                    <Text style={[styles.txt, {textAlign: 'center', maxWidth: 140}]}>Detroit: Become Human</Text>
                    <View style={{gap: 10}}>
                        <Text style={[styles.txt_muted, {fontSize: 12}]}>Progress</Text>
                        <View style={[defaultStyles.containerRow,{ width: 150, gap: 5}]}>
                            <View style={{width: '70%', height: 10,  backgroundColor: Colors.dark.border_muted, borderRadius: 10}}>
                                <View style={{height: 10, width: '33%', backgroundColor: Colors.dark.text, borderRadius: 10}}/>
                            </View>
                            <Text style={styles.txt_muted}>33%</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    txt: {
        color: Colors.dark.text,
        fontSize: 18,
    },
    txt_muted: {
        color: Colors.dark.text_muted,
        fontSize: 15
    },
    starCont: {
        borderWidth: 1,
        borderColor: Colors.dark.border,
        backgroundColor: Colors.dark.bg_light,
        padding: 10,
        borderRadius: 5,
    }
});
