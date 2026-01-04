import {
  CustomerFavorites,
  Favorite,
  FavoriteItem,
} from "../../types/cart.types";

// Re-export من favorites.service.ts
export { favoritesService } from "./favorites.service";
export type { Favorite, FavoriteItem, CustomerFavorites };
