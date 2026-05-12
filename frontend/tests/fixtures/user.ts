export function generateUser() {
  const id = crypto.randomUUID().slice(0, 23);

  return {
    email: `test-${id}@test.com`,
    password: "test1234",
    username: `user-${id}`,
  };
}

import { test as base } from "@playwright/test";

type TestUser = {
  id?: string;
  username: string;
  email: string;
  password: string;
};

export const testWithExistingUser = base.extend<{
  user: TestUser;
}>({
  user: async ({ request }, provide) => {
    const user = generateUser();

    const createdUser =await request.post("/api/users/register", {
      data: { ...user },
    });
    console.log("Created user:", await createdUser.json());

    // pass user into test
    await provide(user);

    //await request.delete(`/api/users/delete-user/${createdUser.id}`);
  },
});
