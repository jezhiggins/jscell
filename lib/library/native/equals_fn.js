function equals_fn(env, lhs, rhs) {
  for (let i = 0; i !== lhs.length; ++i)
    if (lhs[i] !== rhs[i])
      return 0

  return 1
}

export { equals_fn }