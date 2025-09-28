import { describe, it, expect } from "vitest";
import onetime from "./index";

describe("onetime", () => {
  it("should call function only once", () => {
    let i = 0;
    const fixture = onetime(() => ++i);

    expect(fixture()).toBe(1);
    expect(fixture()).toBe(1);
    expect(fixture()).toBe(1);
  });

  it("should throw when called more than once with throw option", () => {
    const fixture = onetime(() => {}, { throw: true });
    fixture();

    expect(() => fixture()).toThrow(/Function .* can only be called once/);
  });

  it("should track call count correctly", () => {
    const fixture = onetime(() => {});

    expect(onetime.callCount(fixture)).toBe(0);
    fixture();
    fixture();
    fixture();
    expect(onetime.callCount(fixture)).toBe(3);
  });

  it("should throw on non-onetime-wrapped functions", () => {
    const fixture = () => {};

    expect(() => {
      onetime.callCount(fixture);
    }).toThrow(/not wrapped/);
  });

  it("should preserve function name and properties", () => {
    function namedFunction() {
      return "test";
    }
    namedFunction.customProperty = "custom";

    const wrapped = onetime(namedFunction);

    expect(wrapped.name).toBe("namedFunction");
    expect((wrapped as any).customProperty).toBe("custom");
  });

  it("should handle generic functions correctly", () => {
    const stringFunction = onetime((x: string) => x.toUpperCase());
    const numberFunction = onetime((x: number, y: number) => x + y);

    expect(stringFunction("hello")).toBe("HELLO");
    expect(numberFunction(1, 2)).toBe(3);

    // Second calls should return same values
    expect(stringFunction("world")).toBe("HELLO");
    expect(numberFunction(5, 6)).toBe(3);
  });

  it("should work correctly within class methods", () => {
    class TestClass {
      private counter = 0;
      private initializationData = "initial-data";

      // Store onetime-wrapped functions as instance properties to ensure they're reused
      public expensiveOperation = onetime(() => {
        this.counter++;
        return `${this.initializationData}-processed-${Date.now()}`;
      });

      public computeOperation = onetime((factor: number) => {
        this.counter += 10;
        return factor * 42;
      });

      // Method using onetime to ensure expensive initialization happens only once
      public getExpensiveData() {
        return this.expensiveOperation();
      }

      // Another method that also uses onetime
      public getComputedValue(multiplier: number) {
        return this.computeOperation(multiplier);
      }

      public getCounter() {
        return this.counter;
      }
    }

    const instance = new TestClass();

    // Test first method - should only execute once despite multiple calls
    const firstResult = instance.getExpensiveData();
    const secondResult = instance.getExpensiveData();
    const thirdResult = instance.getExpensiveData();

    expect(firstResult).toBe(secondResult);
    expect(secondResult).toBe(thirdResult);
    expect(typeof firstResult).toBe("string");
    expect(firstResult).toContain("initial-data-processed-");

    // Counter should only increment once for the expensive operation
    expect(instance.getCounter()).toBe(1);

    // Test second method with parameters
    const computedResult1 = instance.getComputedValue(5);
    const computedResult2 = instance.getComputedValue(10); // Different parameter, but should return same result

    expect(computedResult1).toBe(210); // 5 * 42
    expect(computedResult2).toBe(210); // Same result despite different parameter
    expect(instance.getCounter()).toBe(11); // 1 + 10 from the second method

    // Test with multiple instances to ensure onetime is per-instance
    const instance2 = new TestClass();
    const instance2Result = instance2.getExpensiveData();

    expect(instance2.getCounter()).toBe(1); // Should increment for new instance
    expect(instance2Result).toContain("initial-data-processed-"); // Should contain the expected format

    // Verify that each instance has its own onetime functions by checking call counts
    expect(onetime.callCount(instance.expensiveOperation)).toBe(3); // Called 3 times on first instance
    expect(onetime.callCount(instance2.expensiveOperation)).toBe(1); // Called 1 time on second instance
  });

  it("should preserve this context in class methods", () => {
    class ContextTest {
      private value = "class-value";

      // Store the onetime-wrapped function as an instance property
      private getterFunction = onetime(() => {
        return this.value;
      });

      public getValue() {
        return this.getterFunction();
      }

      public setValue(newValue: string) {
        this.value = newValue;
      }
    }

    const instance = new ContextTest();

    expect(instance.getValue()).toBe("class-value");

    // Change the value and call again - should still return original value
    instance.setValue("new-value");
    expect(instance.getValue()).toBe("class-value"); // Still original value due to onetime
  });
});
