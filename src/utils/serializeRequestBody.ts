function describeBinary(value: any): string | undefined {
  const constructorName = value?.constructor?.name;

  if (constructorName === 'Blob' || constructorName === 'File') {
    const name = value.name ? ` ${value.name}` : '';
    const type = value.type ? ` (${value.type})` : '';
    return `[${constructorName}${name}${type}, ${value.size ?? 0} bytes]`;
  }

  if (constructorName === 'ArrayBuffer' || ArrayBuffer.isView?.(value)) {
    return `[${constructorName}, ${value.byteLength ?? 0} bytes]`;
  }

  return undefined;
}

/** Convert React Native request bodies into a stable, readable payload string. */
export default function serializeRequestBody(body: any): string {
  if (body === null || body === undefined) return '';
  if (typeof body === 'string') return body;

  const binaryDescription = describeBinary(body);
  if (binaryDescription) return binaryDescription;

  if (Array.isArray(body?._parts)) {
    const parts: Record<string, any> = {};
    for (const [key, value] of body._parts) {
      const serializedValue = describeBinary(value) ?? value;
      if (Object.prototype.hasOwnProperty.call(parts, key)) {
        parts[key] = Array.isArray(parts[key])
          ? [...parts[key], serializedValue]
          : [parts[key], serializedValue];
      } else {
        parts[key] = serializedValue;
      }
    }
    try {
      return JSON.stringify(parts);
    } catch {
      return String(body);
    }
  }

  if (body?.constructor?.name === 'URLSearchParams') return body.toString();

  if (typeof body === 'object') {
    const seen = new WeakSet<object>();
    try {
      return JSON.stringify(body, (_key, value) => {
        const description = describeBinary(value);
        if (description) return description;
        if (value && typeof value === 'object') {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }
        return value;
      });
    } catch {
      return String(body);
    }
  }

  return String(body);
}
