import React from "react";
import { describe, expect, it, vi } from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => {
  const picker = await vi.importActual("@openimis/fe-core/components/generics/ConstantBasedPicker");
  return { ConstantBasedPicker: picker.default };
});

const { default: HealthFacilityLevelPicker } = await import("./HealthFacilityLevelPicker");
const { default: HealthFacilityStatusPicker } = await import("./HealthFacilityStatusPicker");
const { default: LocationTypePicker } = await import("./LocationTypePicker");
const { default: messages } = await import("../translations/en.json");
const { renderWithProviders, screen, userEvent } = await import("@openimis/fe-core/testing");

const openOptions = async () => {
  await userEvent.click(screen.getByRole("combobox"));
  return screen.getAllByRole("option").map((option) => option.textContent);
};

// The status picker's own label has no translations; both callers pass this one.
const STATUS_LABEL = { label: "HealthFacilityForm.status" };

const renderPicker = (Picker, props = {}) =>
  renderWithProviders(<Picker onChange={() => {}} {...props} />, { messages });

describe.each([
  ["HealthFacilityLevelPicker", HealthFacilityLevelPicker, {}, "Any", ["Health Center", "Dispensary", "Hospital"]],
  ["HealthFacilityStatusPicker", HealthFacilityStatusPicker, STATUS_LABEL, "Any", ["Active", "Inactive", "Delisted", "Idle"]],
  ["LocationTypePicker", LocationTypePicker, {}, "None", ["Region", "District", "Municipality", "Village"]],
])("%s", (_name, Picker, props, empty, choices) => {
  it("offers every constant, translated, with an empty choice first", async () => {
    renderPicker(Picker, props);

    expect(await openOptions()).toEqual([empty, ...choices]);
  });
});

describe("HealthFacilityStatusPicker", () => {
  it("drops the empty choice when a value must be given", async () => {
    renderPicker(HealthFacilityStatusPicker, { ...STATUS_LABEL, withNull: false });

    expect(await openOptions()).toEqual(["Active", "Inactive", "Delisted", "Idle"]);
  });

  it("reports the constant picked with its label", async () => {
    const onChange = vi.fn();
    renderPicker(HealthFacilityStatusPicker, { ...STATUS_LABEL, onChange });

    await openOptions();
    await userEvent.click(screen.getByRole("option", { name: "Inactive" }));

    expect(onChange).toHaveBeenCalledWith("IN", "Inactive");
  });
});
