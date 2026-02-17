import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/axiosClient";

interface ProductParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string | number;
  brand?: string ;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: string;
}

export const useAllProducts = (params: ProductParams = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
  );

  return useQuery({
    queryKey: ["products", cleanParams],
    queryFn: async () => {
      const { data } = await axiosClient.get("/products", { params: cleanParams });
      return data;
    },
  });
};