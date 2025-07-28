// src/screens/tabs/ProfileScreen.tsx - Final Fix
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { User, AchievementProgress } from "../../types";
import { supabase } from "../../services/supabase";
import { getUserAchievements } from "../../services/achievementService";
import { AchievementGrid } from "../../components/achievements";

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [stats, setStats] = useState({
    pizzeriasVisited: 0,
    savedCount: 0,
    ratingsCount: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchAchievements();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Transform the data to match our User interface (keeping null values)
      const transformedProfile: User = {
        ...data,
        use_manual_location: data.use_manual_location ?? false, // Ensure boolean, not null
        role:
          data.role === "user" ||
          data.role === "admin" ||
          data.role === "moderator"
            ? data.role
            : "user", // Default to "user" if null or invalid
        // All fields are already compatible since we updated the User interface
      };

      setProfile(transformedProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [savedRes, ratingsRes, uniquePizzeriasRes] = await Promise.all([
        supabase
          .from("saved_pizzerias")
          .select("pizzeria_id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("pizzeria_ratings")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("pizzeria_ratings")
          .select("pizzeria_id")
          .eq("user_id", user.id),
      ]);

      // Count unique pizzerias visited
      const pizzeriaIds = uniquePizzeriasRes.data
        ? uniquePizzeriasRes.data.map((r) => r.pizzeria_id)
        : [];
      const uniquePizzeriaIds: string[] = [];
      for (const id of pizzeriaIds) {
        if (uniquePizzeriaIds.indexOf(id) === -1) {
          uniquePizzeriaIds.push(id);
        }
      }
      const uniquePizzerias = uniquePizzeriaIds.length;

      setStats({
        pizzeriasVisited: uniquePizzerias,
        savedCount: savedRes.count || 0,
        ratingsCount: ratingsRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const result = await getUserAchievements(user.id);
      if (result.success && result.achievements) {
        setAchievements(result.achievements);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#666" />
              </View>
            )}
          </View>

          <Text style={styles.fullName}>
            {profile.full_name || profile.username}
          </Text>
          <Text style={styles.username}>@{profile.username}</Text>

          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          {profile.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.location}>{profile.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.pizzeriasVisited}</Text>
            <Text style={styles.statLabel}>Places Visited</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.savedCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.ratingsCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pizza Passport</Text>
            <Text style={styles.sectionSubtitle}>
              {achievements.filter((a) => a.is_earned).length} of{" "}
              {achievements.length} achievements earned
            </Text>
          </View>
          <View style={styles.achievementsContainer}>
            <AchievementGrid
              achievements={achievements}
              size="small"
              columns={4}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="create-outline" size={24} color="#666" />
            <Text style={styles.menuText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#666" />
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={[styles.menuText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B4513",
  },
  scrollContainer: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#FFF",
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  fullName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
  },
  statsSection: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  achievementsSection: {
    backgroundColor: "#FFF",
    marginBottom: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  achievementsContainer: {
    height: 200,
  },
  menuSection: {
    backgroundColor: "#FFF",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  signOutText: {
    color: "#FF3B30",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});

export default ProfileScreen;
