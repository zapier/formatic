export function createRenderWith(_meta) {
  return function renderWith(_tag, _key) {
    return {
      _tag,
      _key,
      _meta,
    };
  };
}
