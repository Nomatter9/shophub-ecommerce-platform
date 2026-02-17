import axiosClient from "@/axiosClient";
import { useQuery } from "@tanstack/react-query";


export const useAllCategories = (includeSubcategories = false) => {
  return useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const response = await axiosClient.get(`/categories?includeSubcategories=${includeSubcategories}`);
  return response.data.categories ||  response.data
    },
   enabled : true,
  });
};

