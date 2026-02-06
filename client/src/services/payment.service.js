import { apiRequest } from "./api";

export function createOrder(payload) {
  return apiRequest("/payments/order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyPayment(payload) {
  return apiRequest("/payments/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
