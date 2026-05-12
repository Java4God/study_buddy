import { APIRequestContext, test as base, Page } from "@playwright/test";

export function generateUser() {
  const id = crypto.randomUUID().slice(0, 23);

  return {
    email: `test-${id}@test.com`,
    password: "test1234",
    username: `user-${id}`,
  };
}

type TestUser = {
  id?: string;
  username: string;
  email: string;
  password: string;
};

type RegisterResponse = {
  refresh_token?: string;
  access_token?: string;
};

export const testWithExistingUser = base.extend<{
  user: TestUser;
}>({
  user: async ({ request }, provide) => {
    const user = generateUser();

    const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
    const apiDomain = process.env.API_DOMAIN || "http://localhost:8080/";

    const createdResp = await request.post(`${base}/api/auth/register`, {
      data: { ...user },
    });

    let accessToken: string | undefined;
    try {
      const body = await createdResp.json();
      accessToken = (body as RegisterResponse).access_token;
      //console.log("Register response:", body);
    } catch (e) {
      console.error("Register response: (no json body)");
    }

    let createdUserId: string | undefined;
    if (accessToken) {
      try {
        const meResp = await request.get(`${apiDomain}users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (meResp.ok()) {
          const meJson = await meResp.json();
          createdUserId = meJson?.uuid ?? meJson?.id ?? undefined;
          //console.log("Fetched current user:", meJson);
        } else {
          console.error("Failed to fetch current user, status:", meResp.status);
        }
      } catch (e) {
        console.error("Error fetching current user:", e);
      }
    }

    // provide the test user (include id if found)
    await provide({ ...user, id: createdUserId });

    // teardown: delete the created user on the backend
    if (createdUserId) {
      try {
        await request.delete(`${apiDomain}users/delete-user/${createdUserId}`, {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        });
        //console.log("Deleted test user id:", createdUserId);
      } catch (e) {
        console.error("Failed to delete test user:", e);
      }
    }
  },
});

export async function login({
  request,
  page,
  user,
}: {
  request: APIRequestContext;
  page: Page;
  user: TestUser;
}) {
  const res = await request.post("http://localhost:8080/users/login", {
    data: {
      username: user.username,
      password: user.password,
    },
  });

  const { access_token } = await res.json();

  await page.context().addCookies([
    {
      name: "auth_token",
      value: access_token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);
}
