import { Colors } from "@/constants/Colors";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import DailyQuiz from "@/assets/svgs/dailyQuiz.svg";
import WeeklyChallange from "@/assets/svgs/weeklyEvent.svg";
import Championship from "@/assets/svgs/championship.svg";
import { router } from "expo-router";
import type { Href } from "expo-router";
import { useTranslation } from "react-i18next";

export default function Events() {
  const { t } = useTranslation();
  const events = [
    {
      name: t("dailyQuiz"),
      icon: DailyQuiz,
      path: "/(tabs)/(events)/dailyQuiz",
    },
    {
      name: "Weekly Challenge",
      icon: WeeklyChallange,
      path: "/(tabs)/(events)/weeklyEvent",
    },
    {
      name: "Championship",
      icon: Championship,
      path: "/(tabs)/(evetns)/championship",
    },
  ];

  return (
    <View style={{ alignItems: "center", height: "100%" }}>
      <Text
        style={[{ color: Colors.dark.text }, { fontSize: 27, fontWeight: 700 }]}
      >
        {t("events")}
      </Text>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingVertical: 20,
          gap: 20,
        }}
        style={{ width: "100%" }}
      >
        {events.map((event) => {
          const EventIcon = event.icon;
          return (
            <TouchableOpacity
              key={event.name}
              onPress={() => router.push(event.path as Href)}
              style={{
                width: "90%",
                height: 100,
                backgroundColor: Colors.dark.bg_light,
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                gap: 20,
              }}
            >
              <EventIcon width={100} height={100} />
              <Text
                style={{
                  color: Colors.dark.text,
                  fontSize: 16,
                  fontWeight: "500",
                }}
              >
                {event.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
