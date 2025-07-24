// src/screens/tabs/RecipesScreen.tsx - Final Fix
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Recipe } from "../../types";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../contexts/AuthContext";

// Create a flexible interface for recipes from database
interface RecipeFromDB {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  category: string;
  difficulty: number;
  total_time_minutes: number;
  servings: number;
  hydration_percentage?: number | null;
  is_featured: boolean | null;
  is_public: boolean | null;
  photos?: string[] | null;
  created_at: string;
  updated_at: string;
  ingredients?: Recipe["ingredients"];
  process_steps?: Recipe["process_steps"];
}

const RecipesScreen: React.FC = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<RecipeFromDB[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<RecipeFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "saved">("my");

  useEffect(() => {
    if (user) {
      fetchMyRecipes();
      fetchSavedRecipes();
    }
  }, [user]);

  const fetchMyRecipes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedRecipes: RecipeFromDB[] = (data || []).map((recipe) => ({
        ...recipe,
        ingredients: undefined,
        process_steps: undefined,
      }));

      setRecipes(transformedRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedRecipes = async () => {
    if (!user) return;

    try {
      // First get saved recipe IDs
      const { data: savedData, error: savedError } = await supabase
        .from("saved_recipes")
        .select("recipe_id")
        .eq("user_id", user.id);

      if (savedError) throw savedError;

      if (savedData && savedData.length > 0) {
        // Then get the actual recipes
        const recipeIds = savedData.map((item) => item.recipe_id);
        const { data: recipes, error: recipesError } = await supabase
          .from("recipes")
          .select("*")
          .in("id", recipeIds);

        if (recipesError) throw recipesError;

        // Transform the data to match our interface
        const transformedRecipes: RecipeFromDB[] = (recipes || []).map(
          (recipe) => ({
            ...recipe,
            ingredients: undefined,
            process_steps: undefined,
          })
        );

        setSavedRecipes(transformedRecipes);
      } else {
        setSavedRecipes([]);
      }
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      setSavedRecipes([]);
    }
  };

  const renderRecipe = ({ item }: { item: RecipeFromDB }) => (
    <TouchableOpacity style={styles.recipeCard}>
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeCategory}>
          {item.category.replace("_", " ")}
        </Text>
        <View style={styles.recipeStats}>
          <Text style={styles.difficulty}>
            {"★".repeat(item.difficulty)}
            {"☆".repeat(5 - item.difficulty)}
          </Text>
          <Text style={styles.time}>{item.total_time_minutes} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const currentRecipes = activeTab === "my" ? recipes : savedRecipes;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "my" && styles.activeTab]}
            onPress={() => setActiveTab("my")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "my" && styles.activeTabText,
              ]}
            >
              My Recipes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "saved" && styles.activeTab]}
            onPress={() => setActiveTab("saved")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "saved" && styles.activeTabText,
              ]}
            >
              Saved
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.createButtonText}>Create Recipe</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={activeTab === "my" ? fetchMyRecipes : fetchSavedRecipes}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === "my"
                ? "No recipes yet. Create your first recipe!"
                : "No saved recipes yet."}
            </Text>
          </View>
        }
      />
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
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#FFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#8B4513",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4A574",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  recipeStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficulty: {
    fontSize: 16,
    color: "#FFD700",
  },
  time: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default RecipesScreen;
