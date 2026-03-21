export type VersionedStorageDomainContract = {
  domainId: string;
  storageBackend: "localStorage";
  storageKey: string;
  storageVersion: number;
};

type PersistedStorageEnvelope<TPayload, TKey extends string> = {
  version: number;
} & Record<TKey, TPayload>;

export const readVersionedStorageDomain = <TPayload, TKey extends string>({
  contract,
  fallbackValue,
  merge,
  payloadKey
}: {
  contract: VersionedStorageDomainContract;
  fallbackValue: TPayload;
  merge: (fallbackValue: TPayload, persistedValue: Partial<TPayload>) => TPayload;
  payloadKey: TKey;
}): TPayload => {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  const rawValue = window.localStorage.getItem(contract.storageKey);
  if (!rawValue) {
    return fallbackValue;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<PersistedStorageEnvelope<
      TPayload,
      TKey
    >>;
    const persistedValue = parsedValue[payloadKey];

    if (parsedValue.version !== contract.storageVersion || !persistedValue) {
      return fallbackValue;
    }

    return merge(fallbackValue, persistedValue);
  } catch {
    return fallbackValue;
  }
};

export const writeVersionedStorageDomain = <TPayload, TKey extends string>({
  contract,
  payload,
  payloadKey
}: {
  contract: VersionedStorageDomainContract;
  payload: TPayload;
  payloadKey: TKey;
}) => {
  if (typeof window === "undefined") {
    return;
  }

  const envelope = {
    version: contract.storageVersion,
    [payloadKey]: payload
  } as PersistedStorageEnvelope<TPayload, TKey>;

  window.localStorage.setItem(
    contract.storageKey,
    JSON.stringify(envelope)
  );
};
