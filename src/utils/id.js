/** Tiny id generator (no crypto dependency needed). */
let counter = 0
export function uid(prefix = 'p') {
  counter = (counter + 1) % 1296
  return (
    prefix +
    Date.now().toString(36) +
    counter.toString(36).padStart(2, '0') +
    Math.random().toString(36).slice(2, 6)
  )
}
