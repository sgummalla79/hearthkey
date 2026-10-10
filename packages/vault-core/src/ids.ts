declare const brand: unique symbol;

/** Nominal typing so ids of different entities cannot be mixed up. */
export type Brand<T, Name extends string> = T & { readonly [brand]: Name };

export type VaultId = Brand<string, 'VaultId'>;
export type ItemId = Brand<string, 'ItemId'>;

export const asVaultId = (value: string): VaultId => value as VaultId;
export const asItemId = (value: string): ItemId => value as ItemId;
