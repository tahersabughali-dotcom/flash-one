import { logoutAction } from "@/app/(auth)/actions";

export function NotAuthorized() {
  return (
    <main>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Not authorized
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        This area is only available to platform administrators.
      </p>
      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
