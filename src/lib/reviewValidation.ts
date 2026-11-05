export const MAX_REVIEW_NAME_LENGTH = 60;
export const MAX_REVIEW_MESSAGE_LENGTH = 300;

export function validateReview(name: string, message: string, requireName = false) {
  if (requireName && !name.trim()) return "Ingresá el nombre del cliente.";
  if (name.trim().length > MAX_REVIEW_NAME_LENGTH) {
    return `El nombre no puede superar los ${MAX_REVIEW_NAME_LENGTH} caracteres.`;
  }
  if (!message.trim()) return "Escribí una reseña antes de enviarla.";
  if (message.trim().length > MAX_REVIEW_MESSAGE_LENGTH) {
    return `La reseña no puede superar los ${MAX_REVIEW_MESSAGE_LENGTH} caracteres.`;
  }
  return "";
}
