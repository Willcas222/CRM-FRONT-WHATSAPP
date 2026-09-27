"use client";

/** Vertical Restaurante (Fase 12, backend ARCHITECTURE.md 11.7): configuración ESTÁNDAR y
 * genérica — las mismas pantallas sirven para cualquier organización con `vertical = RESTAURANT`,
 * nunca a la medida de un restaurante concreto. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

export type CategoryOut = components["schemas"]["CategoryOut"];
export type ProductOut = components["schemas"]["ProductOut"];
export type ProductVariantOut = components["schemas"]["ProductVariantOut"];
export type ModifierOut = components["schemas"]["ModifierOut"];
export type ModifierOptionOut = components["schemas"]["ModifierOptionOut"];
export type OrderOut = components["schemas"]["OrderOut"];
export type OrderStatus = components["schemas"]["OrderStatus"];
export type PaymentMethod = components["schemas"]["PaymentMethod"];
export type PaymentStatus = components["schemas"]["PaymentStatus"];
export type DeliveryStatus = components["schemas"]["DeliveryStatus"];

type CreateCategoryRequest = components["schemas"]["CreateCategoryRequest"];
type UpdateCategoryRequest = components["schemas"]["UpdateCategoryRequest"];
type CreateProductRequest = components["schemas"]["CreateProductRequest"];
type UpdateProductRequest = components["schemas"]["UpdateProductRequest"];
type CreateProductVariantRequest = components["schemas"]["CreateProductVariantRequest"];
type UpdateProductVariantRequest = components["schemas"]["UpdateProductVariantRequest"];
type CreateModifierRequest = components["schemas"]["CreateModifierRequest"];
type UpdateModifierRequest = components["schemas"]["UpdateModifierRequest"];
type CreateModifierOptionRequest = components["schemas"]["CreateModifierOptionRequest"];
type UpdateModifierOptionRequest = components["schemas"]["UpdateModifierOptionRequest"];
type CreateOrderRequest = components["schemas"]["CreateOrderRequest"];

// ------------------------------------------------------------------ categorías

function useInvalidateMenu() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["menu"] });
}

export function useCategories() {
  return useQuery({
    queryKey: ["menu", "categories"],
    queryFn: () => callApi(() => client.GET("/api/v1/menu/categories")),
  });
}

export function useCreateCategory() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    meta: { success: "Categoría creada." },
    mutationFn: (body: CreateCategoryRequest) =>
      callApi(() => client.POST("/api/v1/menu/categories", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory(categoryId: string) {
  const invalidate = useInvalidateMenu();
  return useMutation({
    meta: { success: "Categoría guardada." },
    mutationFn: (body: UpdateCategoryRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/menu/categories/{category_id}", {
          params: { path: { category_id: categoryId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

// ------------------------------------------------------------------ productos

export function useProducts() {
  return useQuery({
    queryKey: ["menu", "products"],
    queryFn: () => callApi(() => client.GET("/api/v1/menu/products")),
  });
}

export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ["menu", "products", productId],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/menu/products/{product_id}", {
          params: { path: { product_id: productId! } },
        }),
      ),
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    meta: { success: "Producto creado." },
    mutationFn: (body: CreateProductRequest) =>
      callApi(() => client.POST("/api/v1/menu/products", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct(productId: string) {
  const invalidate = useInvalidateMenu();
  return useMutation({
    meta: { success: "Producto guardado." },
    mutationFn: (body: UpdateProductRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/menu/products/{product_id}", {
          params: { path: { product_id: productId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

// ------------------------------------------------------------------ variantes

export function useProductVariants(productId: string | undefined) {
  return useQuery({
    queryKey: ["menu", "products", productId, "variants"],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/menu/products/{product_id}/variants", {
          params: { path: { product_id: productId! } },
        }),
      ),
    enabled: !!productId,
  });
}

export function useCreateProductVariant(productId: string) {
  const invalidate = useInvalidateMenu();
  return useMutation({
    meta: { success: "Variante creada." },
    mutationFn: (body: CreateProductVariantRequest) =>
      callApi(() =>
        client.POST("/api/v1/menu/products/{product_id}/variants", {
          params: { path: { product_id: productId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateProductVariant(variantId: string) {
  const invalidate = useInvalidateMenu();
  return useMutation({
    meta: { success: "Variante guardada." },
    mutationFn: (body: UpdateProductVariantRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/menu/variants/{variant_id}", {
          params: { path: { variant_id: variantId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

// ------------------------------------------------------------------ modificadores

export function useModifiers(productId: string | undefined) {
  return useQuery({
    queryKey: ["menu", "products", productId, "modifiers"],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/menu/products/{product_id}/modifiers", {
          params: { path: { product_id: productId! } },
        }),
      ),
    enabled: !!productId,
  });
}

export function useCreateModifier(productId: string) {
  const invalidate = useInvalidateMenu();
  return useMutation({
    meta: { success: "Modificador creado." },
    mutationFn: (body: CreateModifierRequest) =>
      callApi(() =>
        client.POST("/api/v1/menu/products/{product_id}/modifiers", {
          params: { path: { product_id: productId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateModifier(modifierId: string) {
  const invalidate = useInvalidateMenu();
  return useMutation({
    meta: { success: "Modificador guardado." },
    mutationFn: (body: UpdateModifierRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/menu/modifiers/{modifier_id}", {
          params: { path: { modifier_id: modifierId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useModifierOptions(modifierId: string | undefined) {
  return useQuery({
    queryKey: ["menu", "modifiers", modifierId, "options"],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/menu/modifiers/{modifier_id}/options", {
          params: { path: { modifier_id: modifierId! } },
        }),
      ),
    enabled: !!modifierId,
  });
}

export function useCreateModifierOption(modifierId: string) {
  const invalidate = useInvalidateMenu();
  return useMutation({
    meta: { success: "Opción creada." },
    mutationFn: (body: CreateModifierOptionRequest) =>
      callApi(() =>
        client.POST("/api/v1/menu/modifiers/{modifier_id}/options", {
          params: { path: { modifier_id: modifierId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateModifierOption(optionId: string) {
  const invalidate = useInvalidateMenu();
  return useMutation({
    meta: { success: "Opción guardada." },
    mutationFn: (body: UpdateModifierOptionRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/menu/modifier-options/{option_id}", {
          params: { path: { option_id: optionId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

// ------------------------------------------------------------------ pedidos

function useInvalidateOrders() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["orders"] });
}

export function useOrders(filters: { status?: OrderStatus } = {}) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () =>
      callApi(() => client.GET("/api/v1/orders", { params: { query: filters } })),
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/orders/{order_id}", {
          params: { path: { order_id: orderId! } },
        }),
      ),
    enabled: !!orderId,
  });
}

export function useOrderHistory(orderId: string | undefined) {
  return useQuery({
    queryKey: ["orders", orderId, "history"],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/orders/{order_id}/history", {
          params: { path: { order_id: orderId! } },
        }),
      ),
    enabled: !!orderId,
  });
}

type CreateOrderInput = Pick<CreateOrderRequest, "contact_id" | "items"> &
  Partial<Omit<CreateOrderRequest, "contact_id" | "items">>;

export function useCreateOrder() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    meta: { success: "Pedido registrado." },
    mutationFn: (body: CreateOrderInput) =>
      callApi(() =>
        client.POST("/api/v1/orders", {
          body: { delivery_fee: "0", discount: "0", ...body },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useChangeOrderStatus(orderId: string) {
  const invalidate = useInvalidateOrders();
  return useMutation({
    meta: { success: "Estado actualizado." },
    mutationFn: (body: { status: OrderStatus; reason?: string }) =>
      callApi(() =>
        client.POST("/api/v1/orders/{order_id}/status", {
          params: { path: { order_id: orderId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useRecordOrderPayment(orderId: string) {
  const invalidate = useInvalidateOrders();
  return useMutation({
    meta: { success: "Pago registrado." },
    mutationFn: (body: { method: PaymentMethod; amount: string; status?: PaymentStatus }) =>
      callApi(() =>
        client.POST("/api/v1/orders/{order_id}/payments", {
          params: { path: { order_id: orderId } },
          body: { ...body, status: body.status ?? "PAID" },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useSetOrderDelivery(orderId: string) {
  const invalidate = useInvalidateOrders();
  return useMutation({
    meta: { success: "Domicilio guardado." },
    mutationFn: (body: {
      address: string;
      zone?: string | null;
      courier?: string | null;
      status?: DeliveryStatus;
    }) =>
      callApi(() =>
        client.PATCH("/api/v1/orders/{order_id}/delivery", {
          params: { path: { order_id: orderId } },
          body: { ...body, status: body.status ?? "PENDING" },
        }),
      ),
    onSuccess: invalidate,
  });
}
