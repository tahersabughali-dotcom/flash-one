export { ACCOUNT_PATHS } from "@/modules/account";

export function senderLabel(
  senderKind: "customer" | "staff" | "developer",
  isSelf: boolean,
): string {
  if (isSelf) {
    return "You";
  }
  if (senderKind === "staff") {
    return "Flash One";
  }
  if (senderKind === "developer") {
    return "Project Developer";
  }
  return "Customer";
}
