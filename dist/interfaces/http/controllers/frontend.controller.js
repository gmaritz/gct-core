"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPlaceholderPage = renderPlaceholderPage;
exports.renderNotFoundPage = renderNotFoundPage;
exports.renderJourneyDetailPage = renderJourneyDetailPage;
exports.selectJourney = selectJourney;
exports.renderAccommodationSelectionPage = renderAccommodationSelectionPage;
exports.selectAccommodation = selectAccommodation;
exports.renderJourneyQuotePage = renderJourneyQuotePage;
exports.renderGuestInformationPage = renderGuestInformationPage;
exports.submitGuestInformation = submitGuestInformation;
exports.renderReservationReviewPage = renderReservationReviewPage;
exports.confirmReservationReview = confirmReservationReview;
exports.renderPaymentPage = renderPaymentPage;
exports.initiatePayment = initiatePayment;
exports.renderPaymentReturn = renderPaymentReturn;
exports.renderBookingConfirmationPage = renderBookingConfirmationPage;
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const view_models_1 = require("../../view-models");
const merchandising_1 = require("../../../application/merchandising");
const payment_experience_factory_1 = require("../../../infrastructure/payments/payment-experience-factory");
const view_models_2 = require("../../view-models");
const reservation_confirmation_factory_1 = require("../../../infrastructure/persistence/reservation-confirmation-factory");
async function renderView(response, viewName, locals) {
    const viewsRoot = path_1.default.join(process.cwd(), "src/interfaces/views");
    const viewPath = path_1.default.join(viewsRoot, `${viewName}.ejs`);
    const markup = await ejs_1.default.renderFile(viewPath, locals, { filename: viewPath, root: viewsRoot });
    response.render("layouts/main", {
        ...locals,
        body: markup,
    });
}
async function renderPlaceholderPage(request, response) {
    const homepageShowcaseViewModel = await (0, view_models_1.getHomepageShowcaseViewModel)();
    await renderView(response, "pages/placeholder", {
        title: "GCT Core",
        pageTitle: "Frontend Architecture Foundation",
        currentPath: request.path,
        homepageShowcaseViewModel,
    });
}
async function renderNotFoundPage(_request, response) {
    await renderView(response, "errors/404", {
        title: "Not Found",
        pageTitle: "Page unavailable",
    });
}
async function renderJourneyDetailPage(request, response) {
    const resolution = await new merchandising_1.DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
    if (resolution.status === "INVALID" || resolution.status === "NOT_FOUND") {
        response.status(404);
        await renderNotFoundPage(request, response);
        return;
    }
    if (resolution.status === "UNAVAILABLE" || !resolution.journey) {
        response.status(410);
        await renderView(response, "errors/unavailable", {
            title: "Journey unavailable",
            pageTitle: "Journey unavailable",
            currentPath: request.path,
        });
        return;
    }
    const journeyDetailViewModel = new view_models_2.JourneyDetailViewModelProvider().provide(resolution.journey);
    await renderView(response, "pages/journey-detail", {
        title: journeyDetailViewModel.title,
        pageTitle: journeyDetailViewModel.title,
        currentPath: request.path,
        journeyDetailViewModel,
    });
}
async function selectJourney(request, response) {
    const result = await new merchandising_1.DefaultDynamicHomepageJourneySelector().selectJourney(request.params.journeyId);
    if (result.status === "INVALID" || result.status === "NOT_FOUND") {
        response.status(404);
        await renderNotFoundPage(request, response);
        return;
    }
    if (result.status === "UNAVAILABLE") {
        response.status(410);
        await renderView(response, "errors/unavailable", {
            title: "Journey unavailable",
            pageTitle: "Journey unavailable",
            currentPath: request.path,
        });
        return;
    }
    await renderView(response, "pages/journey-selected", {
        title: "Journey selected",
        pageTitle: "Journey selected",
        currentPath: request.path,
        selection: result,
        selectionHref: `/ui/journeys/${result.journeyId}/accommodation`,
    });
}
async function renderAccommodationSelectionPage(request, response) {
    const resolution = await new merchandising_1.DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
    if (resolution.status !== "RESOLVED" || !resolution.journey) {
        response.status(resolution.status === "UNAVAILABLE" ? 410 : 404);
        await renderNotFoundPage(request, response);
        return;
    }
    const accommodationSelectionViewModel = new view_models_2.AccommodationSelectionViewModelProvider().provide(resolution.journey);
    await renderView(response, "pages/accommodation-selection", {
        title: "Select accommodation",
        pageTitle: "Select accommodation",
        currentPath: request.path,
        accommodationSelectionViewModel,
    });
}
async function selectAccommodation(request, response) {
    const body = request.body;
    const selections = Array.isArray(body?.selections) ? body.selections : [];
    const result = await new merchandising_1.DefaultAccommodationSelectionService(new merchandising_1.DefaultDynamicHomepageJourneyResolver())
        .selectAccommodation(request.params.journeyId, selections);
    if (result.status === "INVALID" || result.status === "NOT_FOUND") {
        response.status(404);
        await renderNotFoundPage(request, response);
        return;
    }
    if (result.status === "UNAVAILABLE" || result.status === "STALE") {
        response.status(409);
        await renderView(response, "errors/unavailable", {
            title: "Accommodation unavailable",
            pageTitle: "Accommodation unavailable",
            currentPath: request.path,
        });
        return;
    }
    if (result.status !== "COMPLETE") {
        const resolution = await new merchandising_1.DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
        if (resolution.status !== "RESOLVED" || !resolution.journey) {
            response.status(404);
            await renderNotFoundPage(request, response);
            return;
        }
        const accommodationSelectionViewModel = new view_models_2.AccommodationSelectionViewModelProvider().provide(resolution.journey, "Select accommodation for every stop.");
        response.status(422);
        await renderView(response, "pages/accommodation-selection", {
            title: "Select accommodation",
            pageTitle: "Select accommodation",
            currentPath: request.path,
            accommodationSelectionViewModel,
        });
        return;
    }
    await renderView(response, "pages/accommodation-selected", {
        title: "Accommodation selected",
        pageTitle: "Accommodation selected",
        currentPath: request.path,
        selection: result,
        quoteHref: `/ui/journeys/${result.journeyId}/quote`,
    });
}
async function renderJourneyQuotePage(request, response) {
    const result = await new merchandising_1.DefaultJourneyQuoteService(new merchandising_1.DefaultDynamicHomepageJourneyResolver(), (0, merchandising_1.createDefaultPricingEngine)()).priceCurrentJourney(request.params.journeyId);
    const quoteViewModel = new view_models_2.JourneyQuoteViewModelProvider().provide(result);
    if (result.status === "INVALID" || result.status === "NOT_FOUND") {
        response.status(404);
        await renderNotFoundPage(request, response);
        return;
    }
    if (result.status === "RECHECK_REQUIRED" || result.status === "UNAVAILABLE") {
        response.status(409);
        await renderView(response, "pages/journey-quote", {
            title: "Quote unavailable",
            pageTitle: "Quote unavailable",
            currentPath: request.path,
            quoteViewModel,
        });
        return;
    }
    await renderView(response, "pages/journey-quote", {
        title: "Journey quote",
        pageTitle: "Journey quote",
        currentPath: request.path,
        quoteViewModel,
    });
}
function renderGuestInformation(request, response, viewModel, status = 200) {
    response.status(status);
    return renderView(response, "pages/guest-information", {
        title: "Guest information",
        pageTitle: "Guest information",
        currentPath: request.path,
        guestInformationViewModel: viewModel,
    });
}
async function renderGuestInformationPage(request, response) {
    const resolution = await new merchandising_1.DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
    if (resolution.status !== "RESOLVED" || !resolution.journey) {
        response.status(resolution.status === "UNAVAILABLE" ? 410 : 404);
        await renderNotFoundPage(request, response);
        return;
    }
    const viewModel = new view_models_2.GuestInformationViewModelProvider().provide({
        status: "INVALID",
        journeyId: request.params.journeyId,
        journey: resolution.journey,
        errors: [],
    });
    await renderGuestInformation(request, response, viewModel);
}
async function submitGuestInformation(request, response) {
    const input = toGuestInformationInput(request.body);
    const result = await new merchandising_1.DefaultGuestInformationService(new merchandising_1.DefaultDynamicHomepageJourneyResolver())
        .captureGuestInformation(request.params.journeyId, input);
    if (result.status === "INVALID") {
        await renderGuestInformation(request, response, new view_models_2.GuestInformationViewModelProvider().provide(result), 422);
        return;
    }
    if (result.status === "NOT_FOUND") {
        response.status(404);
        await renderNotFoundPage(request, response);
        return;
    }
    if (result.status === "UNAVAILABLE") {
        response.status(410);
        await renderView(response, "errors/unavailable", { title: "Journey unavailable", pageTitle: "Journey unavailable", currentPath: request.path });
        return;
    }
    const review = await new merchandising_1.DefaultReservationReviewService().review({
        journeyId: request.params.journeyId,
        guestInformation: input,
    });
    await renderReservationReview(request, response, new view_models_2.ReservationReviewViewModelProvider().provide(review), review.status === "READY" ? 200 : 409);
}
function toGuestInformationInput(body) {
    const submitted = body;
    return {
        contact: {
            email: submitted.contact?.email ?? "",
            phone: submitted.contact?.phone,
        },
        leadTravellerIndex: Number(submitted.leadTravellerIndex),
        travellers: Array.isArray(submitted.travellers) ? submitted.travellers : [],
    };
}
function renderReservationReview(request, response, viewModel, status = 200) {
    response.status(status);
    return renderView(response, "pages/reservation-review", {
        title: "Reservation review",
        pageTitle: "Reservation review",
        currentPath: request.path,
        reservationReviewViewModel: viewModel,
    });
}
async function renderReservationReviewPage(request, response) {
    const resolution = await new merchandising_1.DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
    if (resolution.status !== "RESOLVED" || !resolution.journey) {
        response.status(resolution.status === "UNAVAILABLE" ? 410 : 404);
        await renderNotFoundPage(request, response);
        return;
    }
    const review = new view_models_2.ReservationReviewViewModelProvider().provide({
        status: "INVALID",
        journeyId: request.params.journeyId,
        journey: resolution.journey,
        errors: ["Complete guest information before reviewing the reservation."],
        confirmed: false,
    });
    await renderReservationReview(request, response, review, 422);
}
async function confirmReservationReview(request, response) {
    const input = toGuestInformationInput(request.body);
    const review = await new merchandising_1.DefaultReservationReviewService().review({
        journeyId: request.params.journeyId,
        guestInformation: input,
        confirmed: request.body?.confirmed === "on" || request.body?.confirmed === true,
    });
    if (review.status !== "READY" || !review.confirmed) {
        const errors = review.status === "READY" && !review.confirmed
            ? ["Confirm the reviewed information before continuing to payment."]
            : review.errors;
        await renderReservationReview(request, response, new view_models_2.ReservationReviewViewModelProvider().provide({ ...review, status: review.status, errors }), review.status === "READY" ? 422 : 409);
        return;
    }
    await renderView(response, "pages/payment-handoff", {
        title: "Continue to payment",
        pageTitle: "Continue to payment",
        currentPath: request.path,
        journeyId: review.journeyId,
    });
}
function unavailablePaymentResult(journeyId) {
    return {
        status: "UNAVAILABLE",
        reservationId: journeyId,
        errors: ["Payment context is unavailable until a canonical reservation exists."],
    };
}
function createPaymentContextResolver() {
    return (0, payment_experience_factory_1.createCanonicalPaymentContextResolver)();
}
async function resolvePaymentContext(journeyId) {
    try {
        return await createPaymentContextResolver().resolveForJourney(journeyId);
    }
    catch {
        return null;
    }
}
function paymentStateResult(context) {
    const request = context.engineRequest.paymentRequest;
    const status = request.status === "COMPLETED"
        ? "COMPLETED"
        : request.status === "CANCELLED"
            ? "CANCELLED"
            : "PENDING";
    return {
        status,
        reservationId: context.reservationId,
        amount: request.paymentAmount ?? undefined,
        currency: request.currency ?? undefined,
        paymentStatus: request.status ?? undefined,
        errors: [],
    };
}
async function renderPaymentPage(request, response) {
    const context = await resolvePaymentContext(request.params.journeyId);
    const result = context ? paymentStateResult(context) : unavailablePaymentResult(request.params.journeyId);
    const paymentViewModel = new view_models_2.PaymentExperienceViewModelProvider().provide(result);
    await renderView(response, "pages/payment-experience", {
        title: "Payment",
        pageTitle: "Payment",
        currentPath: request.path,
        paymentViewModel,
    });
}
async function initiatePayment(request, response) {
    const context = await resolvePaymentContext(request.params.journeyId);
    let result;
    if (!context) {
        result = unavailablePaymentResult(request.params.journeyId);
    }
    else {
        try {
            result = await (0, payment_experience_factory_1.createDefaultPaymentInitiationService)().initiatePayment(context);
        }
        catch {
            result = unavailablePaymentResult(request.params.journeyId);
        }
    }
    const paymentViewModel = new view_models_2.PaymentExperienceViewModelProvider().provide(result);
    response.status(result.status === "UNAVAILABLE" ? 409 : 200);
    await renderView(response, "pages/payment-experience", {
        title: "Payment",
        pageTitle: "Payment",
        currentPath: request.path,
        paymentViewModel,
    });
}
async function renderPaymentReturn(request, response) {
    const context = await resolvePaymentContext(request.params.journeyId);
    const result = context ? paymentStateResult(context) : unavailablePaymentResult(request.params.journeyId);
    const paymentViewModel = new view_models_2.PaymentExperienceViewModelProvider().provide(result);
    await renderView(response, "pages/payment-experience", {
        title: "Payment status",
        pageTitle: "Payment status",
        currentPath: request.path,
        paymentViewModel,
    });
}
async function renderBookingConfirmationPage(request, response) {
    let result;
    try {
        result = await (0, reservation_confirmation_factory_1.createReservationConfirmationService)().resolve(request.params.journeyId);
    }
    catch {
        result = {
            status: "UNAVAILABLE",
            journeyId: request.params.journeyId,
            errors: ["Booking confirmation is currently unavailable."],
        };
    }
    const bookingConfirmationViewModel = new view_models_2.BookingConfirmationViewModelProvider().provide(result);
    if (result.status === "INVALID" || result.status === "NOT_FOUND") {
        response.status(404);
    }
    else if (result.status === "UNAVAILABLE") {
        response.status(410);
    }
    else if (result.status === "PENDING" || result.status === "FAILED" || result.status === "CANCELLED") {
        response.status(409);
    }
    await renderView(response, "pages/booking-confirmation", {
        title: result.status === "CONFIRMED" ? "Booking confirmed" : "Booking confirmation",
        pageTitle: result.status === "CONFIRMED" ? "Booking confirmed" : "Booking confirmation",
        currentPath: request.path,
        bookingConfirmationViewModel,
    });
}
//# sourceMappingURL=frontend.controller.js.map