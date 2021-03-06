/**
 * Derived types are types that make sense only when their base type exists
 *
 * Take this node for example:
 * {
 *   internal: { type: 'Foo' },
 *   fields: {
 *     bar: "string",
 *   }
 * }
 *
 * It will produce following types:
 * Foo
 * FooFields
 *
 * FooInputFilter
 * FooSortInput
 *
 * FooFieldsInputFilter
 * FooFieldsSortFilter
 * etc
 *
 * Derived types:
 *   Foo: FooFields, FooInputFilter, FooSortInput
 *   FooFields: FooFieldsInputFilter, FooFieldsSortFilter
 *
 * Caveats:
 *   Only types created via inference are marked as derived. So if in the example above
 *   user explicitly defines `FooFields` type (via `createTypes` call) it won't be considered
 *   a derived type
 */
import {
  ObjectTypeComposer,
  InterfaceTypeComposer,
  ScalarTypeComposer,
  SchemaComposer,
  InputTypeComposer,
  EnumTypeComposer,
  UnionTypeComposer,
} from "graphql-compose"

type AllTypeComposer =
  | ObjectTypeComposer
  | InputTypeComposer
  | EnumTypeComposer
  | InterfaceTypeComposer
  | UnionTypeComposer
  | ScalarTypeComposer

const getDerivedTypes = ({
  typeComposer,
}: {
  typeComposer: AllTypeComposer
}): Set<string> => typeComposer.getExtension(`derivedTypes`) || new Set()

export const clearDerivedTypes = ({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<any>
  typeComposer: AllTypeComposer
}): void => {
  const derivedTypes = getDerivedTypes({ typeComposer })

  for (const typeName of derivedTypes.values()) {
    const derivedTypeComposer = schemaComposer.getAnyTC(typeName)
    clearDerivedTypes({ schemaComposer, typeComposer: derivedTypeComposer })
    schemaComposer.delete(typeName)
  }

  if (
    typeComposer instanceof ObjectTypeComposer ||
    typeComposer instanceof InterfaceTypeComposer
  ) {
    typeComposer.removeInputTypeComposer()
  }

  typeComposer.setExtension(`derivedTypes`, new Set())
}

export const addDerivedType = ({
  typeComposer,
  derivedTypeName,
}: {
  typeComposer: AllTypeComposer
  derivedTypeName: string
}): void => {
  const derivedTypes = getDerivedTypes({ typeComposer })
  typeComposer.setExtension(`derivedTypes`, derivedTypes.add(derivedTypeName))
}
