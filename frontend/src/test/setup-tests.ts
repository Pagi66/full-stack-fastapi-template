import "@testing-library/jest-dom/vitest";

// Silence React Router navigation attempts during tests.
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useRouter: () => ({ navigate: () => Promise.resolve() }),
  };
});
