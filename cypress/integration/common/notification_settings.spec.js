import { loginUser } from "../../utils";

describe("Notification settings", () => {
  beforeEach(() => {
    loginUser({
      role: "student",
      identifier: "student",
    });
  });

  it("can sucsessfully enable web notifications", () => {
    // Click the profile icon
    // Click to enable web notifications
  });

  it("can sucsessfully enable text notifications", () => {
    // Click the profile icon
    // Click to enable text notifications
    // Input a phone number
  });
});
