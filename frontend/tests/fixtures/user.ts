export function generateUser() {
  const id = crypto.randomUUID().slice(0, 23);

  return {
    email: `test-${id}@test.com`,
    password: "Password123!",
    username: `user-${id}`,
  };
}
