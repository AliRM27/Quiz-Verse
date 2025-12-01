import { Colors } from "@/constants/Colors";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import DailyQuiz from "@/assets/svgs/dailyQuiz.svg";
import WeeklyChallange from "@/assets/svgs/weeklyEvent.svg";
import Championship from "@/assets/svgs/championship.svg";
import { router } from "expo-router";
import type { Href } from "expo-router";

export default function Events() {
  const events = [
    { name: "Daily Quiz", icon: DailyQuiz, path: "/(events)/dailyQuiz" },
    {
      name: "Weekly Challenge",
      icon: WeeklyChallange,
      path: "/(events)/weeklyEvent",
    },
    {
      name: "Championship",
      icon: Championship,
      path: "/(evetns)/championship",
    },
  ];
  return (
    <View style={{ alignItems: "center", height: "100%" }}>
      <Text style={{ color: Colors.dark.text }}>Events</Text>
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
              <EventIcon width={80} height={80} />
              <Text
                style={{
                  color: Colors.dark.text,
                  fontSize: 18,
                  fontWeight: "600",
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
