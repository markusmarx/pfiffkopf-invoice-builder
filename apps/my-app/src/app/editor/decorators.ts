import "reflect-metadata";

export function inspectableString() {
  return Reflect.metadata("inspector::inspectorType", "String");
}

export function inspectableFloat() {
  return Reflect.metadata("inspector::inspectorType", "Float");
}
export function inspectableBool() {
  return Reflect.metadata("inspector::inspectorType", "Bool");
}
