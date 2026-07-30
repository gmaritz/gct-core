import { createTestApplication } from "../../helpers/application.helper";
import { createRequest, expectProblemDetailsResponse } from "../../helpers/request.helper";
import { TEST_REQUEST_ID } from "../../fixtures";
import { NotFoundError } from "../../../src/interfaces/http/errors";

async function createErrorApp() {
	return createTestApplication((application) => {
		application.get("/boom", () => {
			throw new Error("Unexpected failure");
		});
		application.get("/missing", () => {
			throw new NotFoundError("The requested resource was not found");
		});
	});
}

describe("Platform error handling", () => {
	it("returns Problem Details for unknown errors", async () => {
		const app = await createErrorApp();
		const requestTo = createRequest(app, "get");
		const response = await requestTo("/boom", {
			"x-request-id": TEST_REQUEST_ID,
		});

		expectProblemDetailsResponse(response, 500);
		expect(response.body).toEqual(
			expect.objectContaining({
				status: 500,
				title: "Internal Server Error",
				detail: "An unexpected error occurred",
			}),
		);
	});

	it("returns Problem Details for ApiError instances", async () => {
		const app = await createErrorApp();
		const requestTo = createRequest(app, "get");
		const response = await requestTo("/missing", {
			"x-request-id": TEST_REQUEST_ID,
		});

		expectProblemDetailsResponse(response, 404);
		expect(response.body).toEqual(
			expect.objectContaining({
				status: 404,
				title: "Not Found",
				detail: "The requested resource was not found",
			}),
		);
	});

	it("returns Problem Details for 404 routes", async () => {
		const app = await createTestApplication();
		const requestTo = createRequest(app, "get");
		const response = await requestTo("/does-not-exist", {
			"x-request-id": TEST_REQUEST_ID,
		});

		expectProblemDetailsResponse(response, 404);
		expect(response.body).toEqual(
			expect.objectContaining({
				status: 404,
				title: "Not Found",
				detail: "The requested resource was not found",
			}),
		);
	});
});
