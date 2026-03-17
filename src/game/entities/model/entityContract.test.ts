import { createGenericMoverEntity, entityContract } from "./entityContract";

describe("entityContract", () => {
  it("creates a generic movable archetype by default", () => {
    const entity = createGenericMoverEntity();

    expect(entity.archetype).toBe(entityContract.defaultArchetype);
    expect(entity.id).toBe("entity:player:primary");
    expect(entity.state).toBe("idle");
  });

  it("includes world position, orientation, visual contract, footprint, and render layer", () => {
    const entity = createGenericMoverEntity();

    expect(entity.worldPosition).toEqual({ x: 0, y: 0 });
    expect(entity.orientation).toBe(0);
    expect(entity.visual.kind).toBe("ember-core");
    expect(entity.footprint.radius).toBeGreaterThan(0);
    expect(entity.renderLayer).toBe(entityContract.defaultRenderLayer);
  });

  it("allows overrides without changing the baseline contract shape", () => {
    const entity = createGenericMoverEntity({
      id: "entity:test",
      orientation: 1.57,
      renderLayer: 200,
      state: "moving",
      worldPosition: { x: 512, y: -256 }
    });

    expect(entity).toMatchObject({
      id: "entity:test",
      orientation: 1.57,
      renderLayer: 200,
      state: "moving",
      worldPosition: { x: 512, y: -256 }
    });
  });
});
