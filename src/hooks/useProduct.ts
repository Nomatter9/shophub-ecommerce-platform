// hooks/useProduct.ts
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/axiosClient";

export const useProduct = (id?: string | number) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      // If we got here, id is guaranteed to exist because of 'enabled'
      const { data } = await axiosClient.get(`/products/${id}`);
      return data.product;
    },
    enabled: !!id, // Only run the query if id is truthy
    retry: false,  // Don't spam the server if the product doesn't exist
  });
};