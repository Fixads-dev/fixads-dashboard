import { describe, expect, it } from "vitest";
import {
  getAttributionModelLabel,
  getCategoryLabel,
  getConversionTypeLabel,
  getStatusVariant,
} from "@/features/conversions/types";

describe("Conversions Type Helpers", () => {
  describe("getConversionTypeLabel", () => {
    it("returns Website for WEBPAGE", () => {
      expect(getConversionTypeLabel("WEBPAGE")).toBe("Website");
    });

    it("returns Click to Call for CLICK_TO_CALL", () => {
      expect(getConversionTypeLabel("CLICK_TO_CALL")).toBe("Click to Call");
    });

    it("returns Imported for UPLOAD", () => {
      expect(getConversionTypeLabel("UPLOAD")).toBe("Imported");
    });

    it("returns Call Import for UPLOAD_CALLS", () => {
      expect(getConversionTypeLabel("UPLOAD_CALLS")).toBe("Call Import");
    });

    it("returns App Download for GOOGLE_PLAY_DOWNLOAD", () => {
      expect(getConversionTypeLabel("GOOGLE_PLAY_DOWNLOAD")).toBe("App Download");
    });

    it("returns In-App Purchase for GOOGLE_PLAY_IN_APP_PURCHASE", () => {
      expect(getConversionTypeLabel("GOOGLE_PLAY_IN_APP_PURCHASE")).toBe("In-App Purchase");
    });

    it("returns Android App Open for FIREBASE_ANDROID_FIRST_OPEN", () => {
      expect(getConversionTypeLabel("FIREBASE_ANDROID_FIRST_OPEN")).toBe("Android App Open");
    });

    it("returns Android Purchase for FIREBASE_ANDROID_IN_APP_PURCHASE", () => {
      expect(getConversionTypeLabel("FIREBASE_ANDROID_IN_APP_PURCHASE")).toBe("Android Purchase");
    });

    it("returns iOS App Open for FIREBASE_IOS_FIRST_OPEN", () => {
      expect(getConversionTypeLabel("FIREBASE_IOS_FIRST_OPEN")).toBe("iOS App Open");
    });

    it("returns iOS Purchase for FIREBASE_IOS_IN_APP_PURCHASE", () => {
      expect(getConversionTypeLabel("FIREBASE_IOS_IN_APP_PURCHASE")).toBe("iOS Purchase");
    });

    it("returns Store Sales for STORE_SALES", () => {
      expect(getConversionTypeLabel("STORE_SALES")).toBe("Store Sales");
    });

    it("returns Store Visits for STORE_VISITS", () => {
      expect(getConversionTypeLabel("STORE_VISITS")).toBe("Store Visits");
    });

    it("returns Call from Ad for AD_CALL", () => {
      expect(getConversionTypeLabel("AD_CALL")).toBe("Call from Ad");
    });

    it("returns Call from Website for WEBSITE_CALL", () => {
      expect(getConversionTypeLabel("WEBSITE_CALL")).toBe("Call from Website");
    });

    it("returns Unknown for UNSPECIFIED", () => {
      expect(getConversionTypeLabel("UNSPECIFIED")).toBe("Unknown");
    });

    it("returns Unknown for UNKNOWN", () => {
      expect(getConversionTypeLabel("UNKNOWN")).toBe("Unknown");
    });
  });

  describe("getCategoryLabel", () => {
    it("returns Default for DEFAULT", () => {
      expect(getCategoryLabel("DEFAULT")).toBe("Default");
    });

    it("returns Page View for PAGE_VIEW", () => {
      expect(getCategoryLabel("PAGE_VIEW")).toBe("Page View");
    });

    it("returns Purchase for PURCHASE", () => {
      expect(getCategoryLabel("PURCHASE")).toBe("Purchase");
    });

    it("returns Sign Up for SIGNUP", () => {
      expect(getCategoryLabel("SIGNUP")).toBe("Sign Up");
    });

    it("returns Lead for LEAD", () => {
      expect(getCategoryLabel("LEAD")).toBe("Lead");
    });

    it("returns Download for DOWNLOAD", () => {
      expect(getCategoryLabel("DOWNLOAD")).toBe("Download");
    });

    it("returns Add to Cart for ADD_TO_CART", () => {
      expect(getCategoryLabel("ADD_TO_CART")).toBe("Add to Cart");
    });

    it("returns Begin Checkout for BEGIN_CHECKOUT", () => {
      expect(getCategoryLabel("BEGIN_CHECKOUT")).toBe("Begin Checkout");
    });

    it("returns Subscription for SUBSCRIBE_PAID", () => {
      expect(getCategoryLabel("SUBSCRIBE_PAID")).toBe("Subscription");
    });

    it("returns Phone Lead for PHONE_CALL_LEAD", () => {
      expect(getCategoryLabel("PHONE_CALL_LEAD")).toBe("Phone Lead");
    });

    it("returns Imported Lead for IMPORTED_LEAD", () => {
      expect(getCategoryLabel("IMPORTED_LEAD")).toBe("Imported Lead");
    });

    it("returns Form Submit for SUBMIT_LEAD_FORM", () => {
      expect(getCategoryLabel("SUBMIT_LEAD_FORM")).toBe("Form Submit");
    });

    it("returns Appointment for BOOK_APPOINTMENT", () => {
      expect(getCategoryLabel("BOOK_APPOINTMENT")).toBe("Appointment");
    });

    it("returns Quote Request for REQUEST_QUOTE", () => {
      expect(getCategoryLabel("REQUEST_QUOTE")).toBe("Quote Request");
    });

    it("returns Directions for GET_DIRECTIONS", () => {
      expect(getCategoryLabel("GET_DIRECTIONS")).toBe("Directions");
    });

    it("returns Outbound Click for OUTBOUND_CLICK", () => {
      expect(getCategoryLabel("OUTBOUND_CLICK")).toBe("Outbound Click");
    });

    it("returns Contact for CONTACT", () => {
      expect(getCategoryLabel("CONTACT")).toBe("Contact");
    });

    it("returns Engagement for ENGAGEMENT", () => {
      expect(getCategoryLabel("ENGAGEMENT")).toBe("Engagement");
    });

    it("returns Store Visit for STORE_VISIT", () => {
      expect(getCategoryLabel("STORE_VISIT")).toBe("Store Visit");
    });

    it("returns Store Sale for STORE_SALE", () => {
      expect(getCategoryLabel("STORE_SALE")).toBe("Store Sale");
    });

    it("returns Qualified Lead for QUALIFIED_LEAD", () => {
      expect(getCategoryLabel("QUALIFIED_LEAD")).toBe("Qualified Lead");
    });

    it("returns Converted Lead for CONVERTED_LEAD", () => {
      expect(getCategoryLabel("CONVERTED_LEAD")).toBe("Converted Lead");
    });

    it("returns Unknown for UNSPECIFIED", () => {
      expect(getCategoryLabel("UNSPECIFIED")).toBe("Unknown");
    });

    it("returns Unknown for UNKNOWN", () => {
      expect(getCategoryLabel("UNKNOWN")).toBe("Unknown");
    });
  });

  describe("getStatusVariant", () => {
    it("returns default for ENABLED", () => {
      expect(getStatusVariant("ENABLED")).toBe("default");
    });

    it("returns secondary for PAUSED", () => {
      expect(getStatusVariant("PAUSED")).toBe("secondary");
    });

    it("returns outline for HIDDEN", () => {
      expect(getStatusVariant("HIDDEN")).toBe("outline");
    });

    it("returns destructive for REMOVED", () => {
      expect(getStatusVariant("REMOVED")).toBe("destructive");
    });

    it("returns outline for UNSPECIFIED", () => {
      expect(getStatusVariant("UNSPECIFIED")).toBe("outline");
    });
  });

  describe("getAttributionModelLabel", () => {
    it("returns Not set for null", () => {
      expect(getAttributionModelLabel(null)).toBe("Not set");
    });

    it("returns External for EXTERNAL", () => {
      expect(getAttributionModelLabel("EXTERNAL")).toBe("External");
    });

    it("returns Last Click for GOOGLE_ADS_LAST_CLICK", () => {
      expect(getAttributionModelLabel("GOOGLE_ADS_LAST_CLICK")).toBe("Last Click");
    });

    it("returns First Click for GOOGLE_SEARCH_ATTRIBUTION_FIRST_CLICK", () => {
      expect(getAttributionModelLabel("GOOGLE_SEARCH_ATTRIBUTION_FIRST_CLICK")).toBe("First Click");
    });

    it("returns Linear for GOOGLE_SEARCH_ATTRIBUTION_LINEAR", () => {
      expect(getAttributionModelLabel("GOOGLE_SEARCH_ATTRIBUTION_LINEAR")).toBe("Linear");
    });

    it("returns Time Decay for GOOGLE_SEARCH_ATTRIBUTION_TIME_DECAY", () => {
      expect(getAttributionModelLabel("GOOGLE_SEARCH_ATTRIBUTION_TIME_DECAY")).toBe("Time Decay");
    });

    it("returns Position Based for GOOGLE_SEARCH_ATTRIBUTION_POSITION_BASED", () => {
      expect(getAttributionModelLabel("GOOGLE_SEARCH_ATTRIBUTION_POSITION_BASED")).toBe(
        "Position Based",
      );
    });

    it("returns Data-Driven for GOOGLE_SEARCH_ATTRIBUTION_DATA_DRIVEN", () => {
      expect(getAttributionModelLabel("GOOGLE_SEARCH_ATTRIBUTION_DATA_DRIVEN")).toBe("Data-Driven");
    });

    it("returns Unknown for UNSPECIFIED", () => {
      expect(getAttributionModelLabel("UNSPECIFIED")).toBe("Unknown");
    });

    it("returns Unknown for UNKNOWN", () => {
      expect(getAttributionModelLabel("UNKNOWN")).toBe("Unknown");
    });
  });
});
