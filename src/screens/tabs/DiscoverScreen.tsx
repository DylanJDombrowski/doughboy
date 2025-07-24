// src/screens/tabs/DiscoverScreen.tsx - Final Fix
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Recipe } from "../../types";
import { supabase } from "../../services/supabase";

// Create a more flexible interface for recipes from the database
interface RecipeWithRating {
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
  average_overall_rating?: number;
  recipe_ratings?: { overall_rating: number; crust_rating: number }[];
  ingredients?: Recipe["ingredients"];
  process_steps?: Recipe["process_steps"];
}

const DiscoverScreen: React.FC = () => {
  const [recipes, setRecipes] = useState<RecipeWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "featured" | "trending">(
    "featured"
  );

  useEffect(() => {
    fetchRecipes();
  }, [filter]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);

      let query = supabase.from("recipes").select("*").eq("is_public", true);

      if (filter === "featured") {
        query = query.eq("is_featured", true);
      }

      const { data: recipes, error } = await query
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get ratings separately if recipes exist
      if (recipes && recipes.length > 0) {
        const recipeIds = recipes.map((r) => r.id);
        const { data: ratings } = await supabase
          .from("recipe_ratings")
          .select("recipe_id, overall_rating, crust_rating")
          .in("recipe_id", recipeIds);

        // Calculate average ratings
        const recipesWithRatings: RecipeWithRating[] = recipes.map((recipe) => {
          const recipeRatings =
            ratings?.filter((r) => r.recipe_id === recipe.id) || [];
          const average_overall_rating =
            recipeRatings.length > 0
              ? recipeRatings.reduce(
                  (sum: number, r: { overall_rating: number }) =>
                    sum + r.overall_rating,
                  0
                ) / recipeRatings.length
              : 0;

          return {
            ...recipe,
            average_overall_rating,
            ingredients: undefined,
            process_steps: undefined,
          } as RecipeWithRating;
        });

        setRecipes(recipesWithRatings);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const renderRecipe = ({ item }: { item: RecipeWithRating }) => (
    <TouchableOpacity style={styles.recipeCard}>
      {item.photos && item.photos.length > 0 && (
        <Image source={{ uri: item.photos[0] }} style={styles.recipeImage} />
      )}
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
        {item.average_overall_rating && item.average_overall_rating > 0 && (
          <Text style={styles.rating}>
            ⭐ {item.average_overall_rating.toFixed(1)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.filterContainer}>
          {(["featured", "all", "trending"] as const).map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterOption)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === filterOption && styles.filterTextActive,
                ]}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchRecipes}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share a recipe!
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
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  filterButtonActive: {
    backgroundColor: "#D4A574",
  },
  filterText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFF",
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
  recipeImage: {
    width: "100%",
    height: 200,
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
  rating: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default DiscoverScreen;
